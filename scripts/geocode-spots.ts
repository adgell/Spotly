import fs from 'node:fs';
import path from 'node:path';
import Airtable from 'airtable';

type AirtableSpotRecord = {
  id: string;
  fields: {
    Name?: string;
    ChineseName?: string;
    Address?: string;
    Neighborhood?: string;
    Latitude?: number;
    Longitude?: number;
    Hours?: string;
  };
};

type EnvMap = Record<string, string>;

type GooglePlacesTextSearchResult = {
  place_id?: string;
  formatted_address?: string;
  geometry?: {
    location?: {
      lat?: number;
      lng?: number;
    };
  };
  plus_code?: {
    compound_code?: string;
  };
  opening_hours?: {
    open_now?: boolean;
  };
};

type GooglePlacesTextSearchResponse = {
  status: string;
  error_message?: string;
  results?: GooglePlacesTextSearchResult[];
};

type GooglePlaceDetailsResponse = {
  status: string;
  error_message?: string;
  result?: {
    opening_hours?: {
      weekday_text?: string[];
    };
  };
};

const GOOGLE_TEXT_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
const GOOGLE_PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';
const REQUEST_DELAY_MS = 200;

const DISTRICT_TO_NEIGHBORHOOD: Record<string, string> = {
  'xuhui district': 'Xuhui',
  'huangpu district': 'The Bund',
  "jing'an district": "Jing'an",
  'hongkou district': 'North Bund',
  'pudong new district': 'Pudong',
  'changning district': 'French Concession',
  'luwan district': 'Xintiandi',
  'putuo district': "Jing'an",
  'yangpu district': 'North Bund',
  'minhang district': 'Xuhui',
  'baoshan district': 'North Bund',
  'qingpu district': 'French Concession',
  'songjiang district': 'Xuhui',
  'jiading district': "Jing'an",
  'fengxian district': 'Pudong',
  'chongming district': 'Pudong',
  'jinshan district': 'Xuhui',
  'west bund': 'West Bund',
};

function loadDotEnvLocal(): EnvMap {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return {};

  const text = fs.readFileSync(envPath, 'utf8');
  const out: EnvMap = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) out[key] = value;
  }
  return out;
}

function getEnv(name: string, dotenv: EnvMap): string {
  return process.env[name] ?? dotenv[name] ?? '';
}

function hasLatitude(record: AirtableSpotRecord): boolean {
  return Number.isFinite(record.fields.Latitude);
}

function isBlank(value: string | undefined): boolean {
  return !value || value.trim().length === 0;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractDistrict(compoundCode?: string): string | null {
  if (!compoundCode) return null;
  // Example: "6F44+64 Xuhui District, Shanghai, China"
  // -> split by comma, then take index 0 after plus code
  const firstSegment = compoundCode.split(',')[0]?.trim() ?? '';
  const districtCandidate = firstSegment.replace(/^[^ ]+\s+/, '').trim();
  return districtCandidate || null;
}

function mapDistrictToNeighborhood(district: string | null): string | null {
  if (!district) return null;
  const normalized = district.toLowerCase();
  const exact = DISTRICT_TO_NEIGHBORHOOD[normalized];
  if (exact) return exact;

  if (normalized.includes('huangpu')) return 'The Bund';
  if (normalized.includes("jing'an") || normalized.includes('jingan')) return "Jing'an";
  if (normalized.includes('xuhui')) return 'Xuhui';
  if (normalized.includes('pudong')) return 'Pudong';
  if (normalized.includes('hongkou')) return 'North Bund';
  if (normalized.includes('changning')) return 'French Concession';
  if (normalized.includes('putuo')) return "Jing'an";

  if (district.includes('黄浦')) return 'The Bund';
  if (district.includes('静安')) return "Jing'an";
  if (district.includes('徐汇')) return 'Xuhui';
  if (district.includes('浦东')) return 'Pudong';
  if (district.includes('虹口')) return 'North Bund';
  if (district.includes('长宁')) return 'French Concession';
  if (district.includes('普陀')) return "Jing'an";

  return null;
}

function buildQuery(record: AirtableSpotRecord): string {
  const name = record.fields.Name?.trim() ?? '';
  const chineseName = record.fields.ChineseName?.trim() ?? '';
  return `${name} ${chineseName} Shanghai`.trim();
}

function buildNameOnlyQuery(record: AirtableSpotRecord): string {
  const name = record.fields.Name?.trim() ?? '';
  return `${name} Shanghai`.trim();
}

async function geocodeWithGooglePlaces(
  query: string,
  apiKey: string
): Promise<GooglePlacesTextSearchResult> {
  const url = new URL(GOOGLE_TEXT_SEARCH_URL);
  url.searchParams.set('query', query);
  url.searchParams.set('key', apiKey);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  const payload = (await response.json()) as GooglePlacesTextSearchResponse;
  if (payload.status !== 'OK') {
    if (payload.status === 'ZERO_RESULTS') throw new Error('No results');
    throw new Error(`API error ${payload.status}${payload.error_message ? `: ${payload.error_message}` : ''}`);
  }

  const top = payload.results?.[0];
  if (!top) throw new Error('No results');
  return top;
}

async function getPlaceWeeklyHours(placeId: string, apiKey: string): Promise<string | null> {
  const url = new URL(GOOGLE_PLACE_DETAILS_URL);
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', 'opening_hours');
  url.searchParams.set('key', apiKey);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  const payload = (await response.json()) as GooglePlaceDetailsResponse;
  if (payload.status !== 'OK') {
    if (payload.status === 'ZERO_RESULTS') return null;
    throw new Error(`API error ${payload.status}${payload.error_message ? `: ${payload.error_message}` : ''}`);
  }

  const weekdayText = payload.result?.opening_hours?.weekday_text;
  if (!weekdayText || weekdayText.length === 0) return null;
  return weekdayText.join('\n');
}

async function run(): Promise<void> {
  const dotenv = loadDotEnvLocal();
  const airtableApiKey = getEnv('AIRTABLE_API_KEY', dotenv);
  const airtableBaseId = getEnv('AIRTABLE_BASE_ID', dotenv);
  const googlePlacesApiKey = getEnv('GOOGLE_PLACES_API_KEY', dotenv);
  const dryRun = process.argv.includes('--dry-run');

  if (!airtableApiKey || !airtableBaseId || !googlePlacesApiKey) {
    throw new Error(
      'Missing env vars. Required: AIRTABLE_API_KEY, AIRTABLE_BASE_ID, GOOGLE_PLACES_API_KEY'
    );
  }

  const base = new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId);
  const allRecords = (await base('Spots').select({ view: 'Grid view' }).all()) as unknown as AirtableSpotRecord[];
  const missingCoords = allRecords.filter((record) => !hasLatitude(record));

  console.log(`Found ${allRecords.length} spots total.`);
  console.log(`${missingCoords.length} spots are missing coordinates (Latitude empty).`);
  if (dryRun) {
    console.log('Running in dry-run mode. No Airtable updates will be written.');
  }

  let updatedCount = 0;
  let unresolvedCount = 0;
  let updatedNeighborhoodBlankCount = 0;
  const unresolvedSpots: Array<{ name: string; reason: string }> = [];

  for (const record of missingCoords) {
    const name = record.fields.Name?.trim() || '(unnamed)';
    const query = buildQuery(record);

    if (!query || query === 'Shanghai') {
      unresolvedCount += 1;
      console.log(`Unresolved ${name}: Missing query fields`);
      continue;
    }

    try {
      let result: GooglePlacesTextSearchResult;
      let usedNameFallback = false;
      try {
        result = await geocodeWithGooglePlaces(query, googlePlacesApiKey);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message !== 'No results') throw error;

        const fallbackQuery = buildNameOnlyQuery(record);
        if (!fallbackQuery || fallbackQuery === 'Shanghai') {
          throw new Error('No results');
        }
        result = await geocodeWithGooglePlaces(fallbackQuery, googlePlacesApiKey);
        usedNameFallback = true;
      }

      const lat = result.geometry?.location?.lat;
      const lng = result.geometry?.location?.lng;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        unresolvedCount += 1;
        unresolvedSpots.push({ name, reason: 'Missing geometry' });
        console.log(`Unresolved ${name}: Missing geometry`);
        await sleep(REQUEST_DELAY_MS);
        continue;
      }

      const district = extractDistrict(result.plus_code?.compound_code);
      const neighborhood = mapDistrictToNeighborhood(district);
      let hours: string | null = null;
      if (isBlank(record.fields.Hours) && result.place_id) {
        hours = await getPlaceWeeklyHours(result.place_id, googlePlacesApiKey);
      }
      console.log(`District parsed: "${district ?? 'Unknown district'}" -> mapped to: "${neighborhood ?? '(blank)'}"`);

      const updates: Record<string, unknown> = {
        Latitude: lat,
        Longitude: lng,
      };
      if (result.formatted_address) {
        updates.Address = result.formatted_address;
      }
      if (isBlank(record.fields.Hours) && hours) {
        updates.Hours = hours;
      }
      updates.Neighborhood = neighborhood ?? '';

      if (!neighborhood) {
        updatedNeighborhoodBlankCount += 1;
        console.log(
          `Neighborhood unmapped ${name}: district was "${district ?? 'Unknown district'}" (not in mapping)`
        );
      }

      if (!dryRun) {
        await base('Spots').update(record.id, updates);
      }

      updatedCount += 1;
      if (usedNameFallback) {
        console.log(
          `Updated (name fallback) ${name}: lat, lng, ${district ?? 'Unknown district'} -> ${neighborhood ?? '(blank)'}`
        );
      } else {
        console.log(`Updated ${name}: lat, lng, ${district ?? 'Unknown district'} -> ${neighborhood ?? '(blank)'}`);
      }
    } catch (error) {
      unresolvedCount += 1;
      const message = error instanceof Error ? error.message : String(error);
      unresolvedSpots.push({ name, reason: message });
      console.log(`Unresolved ${name}: ${message}`);
    }

    await sleep(REQUEST_DELAY_MS);
  }

  console.log('\nGeocoding complete.');
  console.log(
    `Summary: total spots=${allRecords.length}, updated count=${updatedCount}, updated with coords, neighborhood blank=${updatedNeighborhoodBlankCount}, unresolved count=${unresolvedCount}`
  );
  if (unresolvedSpots.length > 0) {
    console.log('Remaining unresolved spots:');
    for (const unresolved of unresolvedSpots) {
      console.log(`- ${unresolved.name}: ${unresolved.reason}`);
    }
  }
}

run().catch((error) => {
  console.error('Geocoding script failed:', error);
  process.exit(1);
});
