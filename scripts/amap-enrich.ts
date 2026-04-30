import fs from 'node:fs';
import path from 'node:path';
import Airtable from 'airtable';

type EnvMap = Record<string, string>;

type AirtableSpotRecord = {
  id: string;
  fields: {
    Name?: string;
    'Chinese Name'?: string;
    Address?: string;
    Neighborhood?: string;
    Latitude?: number;
    Longitude?: number;
    Rating?: number;
    Hours?: string;
    Description?: string;
    'Local Tip'?: string;
    Images?: { url: string }[];
    'Average spend per person'?: string;
    'Amap POI ID'?: string;
  };
};

type AmapPoi = {
  id?: string;
  location?: string;
  address?: string;
  adname?: string;
  cityname?: string | string[];
  pname?: string;
  adcode?: string;
  photos?: Array<{ url?: string }>;
  biz_ext?: {
    rating?: string | number;
    open_time?: string | string[];
    cost?: string | number;
    feature?: string;
    tag?: string;
  };
  deep_info?: {
    description?: string;
    featured_reviews?: Array<{ text?: string }>;
  };
  recommend?: string[] | string;
};

type AmapTextSearchResponse = {
  status?: string;
  info?: string;
  count?: string;
  pois?: AmapPoi[];
};

const AMAP_TEXT_SEARCH_URL = 'https://restapi.amap.com/v3/place/text';
const REQUEST_DELAY_MS = 300;
const AMAP_CALL_DELAY_MS = 350;
const AMAP_LIMIT_RETRY_DELAY_MS = 2000;
const AMAP_LIMIT_MAX_RETRIES = 3;

const DISTRICT_TO_NEIGHBORHOOD: Record<string, string> = {
  '徐汇区': 'Xuhui',
  '黄浦区': 'The Bund',
  '静安区': "Jing'an",
  '虹口区': 'North Bund',
  '浦东新区': 'Pudong',
  '长宁区': 'French Concession',
  '普陀区': "Jing'an",
  '杨浦区': 'North Bund',
  '闵行区': 'Xuhui',
  '青浦区': 'Old Town',
  '松江区': 'Xuhui',
  '嘉定区': "Jing'an",
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isBlank(value: string | undefined): boolean {
  return !value || value.trim().length === 0;
}

function toTrimmedString(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function hasImages(images: { url: string }[] | undefined): boolean {
  return Array.isArray(images) && images.length > 0;
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return `${text.slice(0, Math.max(0, maxLen - 1)).trimEnd()}…`;
}

function parseLocation(location?: string): { lng: number; lat: number } | null {
  if (!location) return null;
  const [lngRaw, latRaw] = location.split(',');
  const lng = Number.parseFloat((lngRaw ?? '').trim());
  const lat = Number.parseFloat((latRaw ?? '').trim());
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  return { lng, lat };
}

function getDescription(poi: AmapPoi): string | null {
  const deepDescription = poi.deep_info?.description?.trim();
  if (deepDescription) return deepDescription;

  const feature = poi.biz_ext?.feature?.trim();
  if (feature) return feature;

  const recommend = poi.recommend;
  if (Array.isArray(recommend)) {
    const joined = recommend.map((r) => r.trim()).filter(Boolean).join(', ');
    return joined || null;
  }
  if (typeof recommend === 'string' && recommend.trim()) {
    return recommend.trim();
  }
  return null;
}

function getLocalTip(poi: AmapPoi): string | null {
  const tag = poi.biz_ext?.tag?.trim();
  if (tag) return tag;

  const review = poi.deep_info?.featured_reviews?.[0]?.text?.trim();
  if (review) return truncate(review, 120);
  return null;
}

function parseRating(rating?: string | number): number | null {
  const normalized = toTrimmedString(rating);
  if (!normalized) return null;
  const num = Number.parseFloat(normalized);
  return Number.isFinite(num) ? num : null;
}

function parseAverageSpend(cost?: string | number): string | null {
  const trimmed = toTrimmedString(cost);
  if (!trimmed) return null;
  return `${trimmed} yuan`;
}

function parseHours(openTime?: string | string[]): string | null {
  if (Array.isArray(openTime)) {
    const joined = openTime.map((item) => toTrimmedString(item)).filter(Boolean).join('\n');
    return joined || null;
  }
  const text = toTrimmedString(openTime);
  return text || null;
}

function isShanghaiPoi(poi: AmapPoi): boolean {
  const province = toTrimmedString(poi.pname);
  const adcode = toTrimmedString(poi.adcode);
  const cityRaw = poi.cityname;
  const cityList = Array.isArray(cityRaw) ? cityRaw.map((c) => toTrimmedString(c)) : [toTrimmedString(cityRaw)];

  const provinceOk = province.includes('上海');
  const cityOk = cityList.some((city) => city.includes('上海'));
  const adcodeOk = adcode.startsWith('310');

  return provinceOk || cityOk || adcodeOk;
}

function gcj02ToWgs84(lng: number, lat: number): [number, number] {
  const a = 6378245.0;
  const ee = 0.00669342162296594323;
  const PI = Math.PI;

  function transformLat(x: number, y: number) {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * PI) + 320 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;
    return ret;
  }

  function transformLng(x: number, y: number) {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;
    return ret;
  }

  const dLat = transformLat(lng - 105.0, lat - 35.0);
  const dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * PI;
  let magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  const finalDLat = (dLat * 180.0) / (((a * (1 - ee)) / (magic * sqrtMagic)) * PI);
  const finalDLng = (dLng * 180.0) / ((a / sqrtMagic) * Math.cos(radLat) * PI);
  return [lng - finalDLng, lat - finalDLat];
}

async function searchAmapPois(keywords: string, amapApiKey: string): Promise<AmapPoi[]> {
  await sleep(AMAP_CALL_DELAY_MS);

  const url = new URL(AMAP_TEXT_SEARCH_URL);
  url.searchParams.set('keywords', keywords);
  url.searchParams.set('city', 'shanghai');
  url.searchParams.set('citylimit', 'true');
  url.searchParams.set('output', 'json');
  url.searchParams.set('extensions', 'all');
  url.searchParams.set('key', amapApiKey);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Amap API error ${response.status}`);
  }

  const payload = (await response.json()) as AmapTextSearchResponse;
  if (payload.status !== '1') {
    if (payload.info?.includes('CUQPS_HAS_EXCEEDED_THE_LIMIT')) {
      throw new Error('Amap API rate limit');
    }
    throw new Error(payload.info ? `Amap API error: ${payload.info}` : 'Amap API returned failure');
  }

  const count = Number.parseInt(payload.count ?? '0', 10);
  if (!Number.isFinite(count) || count <= 0 || !payload.pois || payload.pois.length === 0) {
    return [];
  }
  return payload.pois;
}

function uniqueQueries(queries: string[]): string[] {
  return Array.from(new Set(queries.map((q) => q.trim()).filter(Boolean)));
}

async function searchBestAmapPoi(
  name: string,
  chineseName: string,
  amapApiKey: string
): Promise<AmapPoi | null> {
  const queries = uniqueQueries([
    chineseName ? `${chineseName} 上海` : '',
    chineseName ? `${name} ${chineseName} 上海` : `${name} 上海`,
    `${name} 上海`,
    chineseName,
    name,
  ]);

  for (const query of queries) {
    let pois: AmapPoi[] = [];
    let attempts = 0;
    while (attempts <= AMAP_LIMIT_MAX_RETRIES) {
      try {
        pois = await searchAmapPois(query, amapApiKey);
        break;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message !== 'Amap API rate limit' || attempts === AMAP_LIMIT_MAX_RETRIES) {
          throw error;
        }
        attempts += 1;
        await sleep(AMAP_LIMIT_RETRY_DELAY_MS);
      }
    }

    if (pois.length === 0) continue;

    const shanghaiPoi = pois.find((poi) => isShanghaiPoi(poi));
    if (shanghaiPoi) return shanghaiPoi;
  }

  return null;
}

async function run(): Promise<void> {
  const dotenv = loadDotEnvLocal();
  const airtableApiKey = getEnv('AIRTABLE_API_KEY', dotenv);
  const airtableBaseId = getEnv('AIRTABLE_BASE_ID', dotenv);
  const amapApiKey = getEnv('AMAP_API_KEY', dotenv);
  const dryRun = process.argv.includes('--dry-run');

  if (!airtableApiKey || !airtableBaseId || !amapApiKey) {
    throw new Error('Missing env vars. Required: AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AMAP_API_KEY');
  }

  const base = new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId);
  const records = (await base('Spots').select({ view: 'Grid view' }).all()) as unknown as AirtableSpotRecord[];

  let matched = 0;
  let unmatched = 0;
  let neighborhoodsUnmapped = 0;
  let descriptionsFilled = 0;
  let tipsFilled = 0;
  let ratingSum = 0;
  let ratingCount = 0;

  for (const record of records) {
    const name = record.fields.Name?.trim() ?? '(unnamed)';
    const chineseName = record.fields['Chinese Name']?.trim() ?? '';
    const query = chineseName ? `${name} ${chineseName}`.trim() : name;

    try {
      const poi = await searchBestAmapPoi(name, chineseName, amapApiKey);
      if (!poi) {
        unmatched += 1;
        console.log(`✗ ${name}: no results`);
        await sleep(REQUEST_DELAY_MS);
        continue;
      }

      const location = parseLocation(poi.location);
      if (!location) {
        unmatched += 1;
        console.log(`✗ ${name}: no results`);
        await sleep(REQUEST_DELAY_MS);
        continue;
      }

      const [wgsLng, wgsLat] = gcj02ToWgs84(location.lng, location.lat);
      const district = poi.adname?.trim() ?? '';
      const neighborhood = DISTRICT_TO_NEIGHBORHOOD[district] ?? '';
      if (!neighborhood) {
        neighborhoodsUnmapped += 1;
        console.log(`⚠ ${name}: district "${district || 'Unknown'}" not in mapping`);
      }

      const rating = parseRating(poi.biz_ext?.rating);
      const hours = parseHours(poi.biz_ext?.open_time);
      const avgSpend = parseAverageSpend(poi.biz_ext?.cost);
      const description = getDescription(poi);
      const localTip = getLocalTip(poi);
      const photoUrl = poi.photos?.[0]?.url?.trim() || null;

      const updates: Record<string, unknown> = {
        Latitude: wgsLat,
        Longitude: wgsLng,
        Neighborhood: neighborhood,
        Rating: rating ?? null,
        'Amap POI ID': poi.id?.trim() ?? '',
      };

      if (isBlank(record.fields.Address) && poi.address?.trim()) {
        updates.Address = poi.address.trim();
      }
      if (isBlank(record.fields.Hours) && hours) {
        updates.Hours = hours;
      }
      if (isBlank(record.fields['Average spend per person']) && avgSpend) {
        updates['Average spend per person'] = avgSpend;
      }
      if (isBlank(record.fields.Description) && description) {
        updates.Description = description;
        descriptionsFilled += 1;
      }
      if (isBlank(record.fields['Local Tip']) && localTip) {
        updates['Local Tip'] = localTip;
        tipsFilled += 1;
      }
      if (!hasImages(record.fields.Images) && photoUrl) {
        updates.Images = [{ url: photoUrl }];
      }

      if (!dryRun) {
        await base('Spots').update(record.id, updates);
      }

      matched += 1;
      if (rating !== null) {
        ratingSum += rating;
        ratingCount += 1;
      }

      const hasDesc = isBlank(record.fields.Description) && Boolean(description) ? 'yes' : 'no';
      const hasTip = isBlank(record.fields['Local Tip']) && Boolean(localTip) ? 'yes' : 'no';
      const ratingLabel = rating !== null ? rating.toFixed(1) : 'N/A';
      console.log(
        `✓ ${name}: ${wgsLng.toFixed(6)}, ${wgsLat.toFixed(6)}, ${district || 'Unknown'} → ${neighborhood || '(blank)'}, ⭐ ${ratingLabel}, desc: ${hasDesc}, tip: ${hasTip}`
      );
    } catch (error) {
      unmatched += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.log(`✗ ${name}: ${message}`);
    }

    await sleep(REQUEST_DELAY_MS);
  }

  const avgRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(2) : 'N/A';

  console.log('\nSummary');
  console.log(`total spots: ${records.length}`);
  console.log(`matched: ${matched}`);
  console.log(`unmatched: ${unmatched}`);
  console.log(`neighborhoods unmapped: ${neighborhoodsUnmapped}`);
  console.log(`descriptions filled: ${descriptionsFilled}`);
  console.log(`tips filled: ${tipsFilled}`);
  console.log(`average rating across matched: ${avgRating}`);
}

run().catch((error) => {
  console.error('Amap enrichment failed:', error);
  process.exit(1);
});
