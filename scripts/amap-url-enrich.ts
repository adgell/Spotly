import fs from 'node:fs';
import path from 'node:path';
import Airtable from 'airtable';

type EnvMap = Record<string, string>;

type AirtableSpotRecord = {
  id: string;
  fields: {
    Name?: string;
    Address?: string;
    Neighborhood?: string;
    Latitude?: number;
    Longitude?: number;
    Rating?: number;
    Hours?: string;
    Images?: { url: string }[];
    'Image URLs'?: string;
    'Average spend per person'?: string;
    'Amap POI ID'?: string;
    'Amap URL'?: string;
  };
};

type AmapDetailPoi = {
  adname?: string;
  photos?: Array<{ url?: string }>;
  biz_ext?: {
    rating?: string | number;
    open_time?: string | string[];
    cost?: string | number;
  };
};

type AmapDetailResponse = {
  status?: string;
  info?: string;
  pois?: AmapDetailPoi[];
};

const AMAP_DETAIL_URL = 'https://restapi.amap.com/v3/place/detail';
const REQUEST_DELAY_MS = 500;
const MAX_REDIRECT_HOPS = 10;

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

function uniquePhotoUrls(urls: string[]): string[] {
  return Array.from(new Set(urls.map((u) => u.trim()).filter(Boolean)));
}

function toTrimmedString(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function parseRating(rating?: string | number): number | null {
  const normalized = toTrimmedString(rating);
  if (!normalized) return null;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseHours(openTime?: string | string[]): string | null {
  if (Array.isArray(openTime)) {
    const joined = openTime.map((s) => toTrimmedString(s)).filter(Boolean).join('\n');
    return joined || null;
  }
  const text = toTrimmedString(openTime);
  return text || null;
}

function parseCost(cost?: string | number): string | null {
  const text = toTrimmedString(cost);
  return text ? `${text} yuan` : null;
}

function gcj02ToWgs84(lng: number, lat: number): [number, number] {
  const a = 6378245.0;
  const ee = 0.00669342162296594323;
  const PI = Math.PI;

  function transformLat(x: number, y: number) {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin((y / 3.0) * PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin((y / 12.0) * PI) + 320 * Math.sin((y * PI) / 30.0)) * 2.0 / 3.0;
    return ret;
  }

  function transformLng(x: number, y: number) {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin((x / 3.0) * PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin((x / 12.0) * PI) + 300.0 * Math.sin((x / 30.0) * PI)) * 2.0 / 3.0;
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

async function resolveRedirectChain(startUrl: string): Promise<string[]> {
  const chain: string[] = [startUrl];
  let current = startUrl;

  for (let i = 0; i < MAX_REDIRECT_HOPS; i += 1) {
    const response = await fetch(current, { redirect: 'manual' });
    const location = response.headers.get('location');
    if (!location) break;

    const next = new URL(location, current).toString();
    chain.push(next);
    current = next;

    if (response.status < 300 || response.status >= 400) break;
  }

  return chain;
}

type ParsedPParam = {
  poiId: string;
  gcjLat: number;
  gcjLng: number;
  nameCn?: string;
  addressCn?: string;
};

function parsePParamFromUrls(urls: string[]): ParsedPParam | null {
  for (const raw of urls) {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(raw);
    } catch {
      continue;
    }
    const pRaw = parsedUrl.searchParams.get('p');
    if (!pRaw) continue;

    const decoded = decodeURIComponent(pRaw);
    const parts = decoded.split(',');
    if (parts.length < 3) continue;

    const poiId = (parts[0] ?? '').trim();
    const gcjLat = Number.parseFloat((parts[1] ?? '').trim());
    const gcjLng = Number.parseFloat((parts[2] ?? '').trim());
    const nameCn = (parts[3] ?? '').trim() || undefined;
    const addressCn = parts.length >= 5 ? parts.slice(4).join(',').trim() || undefined : undefined;

    if (!poiId || !Number.isFinite(gcjLat) || !Number.isFinite(gcjLng)) continue;

    return { poiId, gcjLat, gcjLng, nameCn, addressCn };
  }

  return null;
}

async function fetchAmapDetail(poiId: string, amapApiKey: string): Promise<AmapDetailPoi | null> {
  const url = new URL(AMAP_DETAIL_URL);
  url.searchParams.set('id', poiId);
  url.searchParams.set('output', 'json');
  url.searchParams.set('extensions', 'all');
  url.searchParams.set('key', amapApiKey);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`detail API error ${response.status}`);
  }

  const payload = (await response.json()) as AmapDetailResponse;
  if (payload.status !== '1') {
    throw new Error(payload.info ? `detail API error: ${payload.info}` : 'detail API returned failure');
  }

  if (!payload.pois || payload.pois.length === 0) return null;
  return payload.pois[0];
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

  let withAmapUrl = 0;
  let withoutAmapUrl = 0;
  let successful = 0;
  let failed = 0;

  for (const record of records) {
    const name = record.fields.Name?.trim() ?? '(unnamed)';
    const amapUrl = record.fields['Amap URL']?.trim() ?? '';

    if (!amapUrl) {
      withoutAmapUrl += 1;
      console.log(`⚠ ${name}: no Amap URL in Airtable (skipped)`);
      continue;
    }
    withAmapUrl += 1;

    try {
      const chain = await resolveRedirectChain(amapUrl);
      const parsed = parsePParamFromUrls(chain);
      if (!parsed) {
        failed += 1;
        console.log(`✗ ${name}: failed to parse p parameter from redirect chain`);
        await sleep(REQUEST_DELAY_MS);
        continue;
      }

      const [wgsLng, wgsLat] = gcj02ToWgs84(parsed.gcjLng, parsed.gcjLat);
      const detail = await fetchAmapDetail(parsed.poiId, amapApiKey);

      const district = detail?.adname?.trim() ?? '';
      const neighborhood = DISTRICT_TO_NEIGHBORHOOD[district] ?? '';
      const rating = parseRating(detail?.biz_ext?.rating);
      const hours = parseHours(detail?.biz_ext?.open_time);
      const cost = parseCost(detail?.biz_ext?.cost);
      const photoUrls = uniquePhotoUrls((detail?.photos ?? []).map((photo) => photo.url ?? '')).slice(0, 5);

      const updates: Record<string, unknown> = {
        Latitude: wgsLat,
        Longitude: wgsLng,
        'Amap POI ID': parsed.poiId,
        Neighborhood: neighborhood ? [neighborhood] : undefined,
        Rating: rating ?? null,
      };

      const addressFromUrl = parsed.addressCn?.trim() ?? '';
      const existingAddress = record.fields.Address?.trim() ?? '';
      if (addressFromUrl && (isBlank(existingAddress) || existingAddress !== addressFromUrl)) {
        updates.Address = addressFromUrl;
      }
      if (isBlank(record.fields.Hours) && hours) {
        updates.Hours = hours;
      }
      if (isBlank(record.fields['Average spend per person']) && cost) {
        updates['Average spend per person'] = cost;
      }
      if (photoUrls.length > 0) {
        updates['Image URLs'] = photoUrls.join('\n');
      }
      if (photoUrls.length > 0) {
        updates.Images = photoUrls.map((url) => ({ url }));
      }

      if (!dryRun) {
        try {
          await base('Spots').update(record.id, updates);
        } catch (error) {
          // Fallback: if attachment write fails, keep backup URLs in long text.
          if (photoUrls.length > 0) {
            const fallbackUpdates = { ...updates };
            delete fallbackUpdates.Images;
            await base('Spots').update(record.id, fallbackUpdates);
          } else {
            throw error;
          }
        }
      }

      successful += 1;
      const ratingLabel = rating !== null ? rating.toFixed(1) : 'N/A';
      const costLabel = cost ? cost.replace(' yuan', '') : 'N/A';
      console.log(`✓ ${name}: POI=${parsed.poiId}, ${wgsLng.toFixed(6)}, ${wgsLat.toFixed(6)}, ⭐ ${ratingLabel}, ¥${costLabel}`);
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.log(`✗ ${name}: ${message}`);
    }

    await sleep(REQUEST_DELAY_MS);
  }

  console.log('\nSummary');
  console.log(`spots with Amap URL (processed): ${withAmapUrl}`);
  console.log(`spots without Amap URL (skipped): ${withoutAmapUrl}`);
  console.log(`successful: ${successful}`);
  console.log(`failed (URL parse errors): ${failed}`);
}

run().catch((error) => {
  console.error('Amap URL enrichment failed:', error);
  process.exit(1);
});

