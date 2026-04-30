import fs from 'node:fs';
import path from 'node:path';
import Airtable from 'airtable';

type EnvMap = Record<string, string>;

type AirtableSpotRecord = {
  id: string;
  fields: {
    Name?: string;
    Address?: string;
    Latitude?: number;
    Longitude?: number;
  };
};

type GoogleGeocodeResult = {
  formatted_address?: string;
};

type GoogleGeocodeResponse = {
  status: string;
  error_message?: string;
  results?: GoogleGeocodeResult[];
};

const GOOGLE_GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const REQUEST_DELAY_MS = 200;
const CJK_REGEX = /[\u4E00-\u9FFF]/;

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

function containsChinese(text: string | undefined): boolean {
  if (!text) return false;
  return CJK_REGEX.test(text);
}

async function reverseGeocodeEnglishAddress(
  lat: number,
  lng: number,
  apiKey: string
): Promise<string> {
  const url = new URL(GOOGLE_GEOCODE_URL);
  url.searchParams.set('latlng', `${lat},${lng}`);
  url.searchParams.set('language', 'en');
  url.searchParams.set('key', apiKey);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  const payload = (await response.json()) as GoogleGeocodeResponse;
  if (payload.status !== 'OK') {
    throw new Error(`API error ${payload.status}${payload.error_message ? `: ${payload.error_message}` : ''}`);
  }

  const address = payload.results?.[0]?.formatted_address?.trim();
  if (!address) {
    throw new Error('No formatted_address in response');
  }
  return address;
}

async function run(): Promise<void> {
  const dotenv = loadDotEnvLocal();
  const airtableApiKey = getEnv('AIRTABLE_API_KEY', dotenv);
  const airtableBaseId = getEnv('AIRTABLE_BASE_ID', dotenv);
  const googleApiKey = getEnv('GOOGLE_PLACES_API_KEY', dotenv);
  const dryRun = process.argv.includes('--dry-run');

  if (!airtableApiKey || !airtableBaseId || !googleApiKey) {
    throw new Error(
      'Missing env vars. Required: AIRTABLE_API_KEY, AIRTABLE_BASE_ID, GOOGLE_PLACES_API_KEY'
    );
  }

  const base = new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId);
  const records = (await base('Spots').select({ view: 'Grid view' }).all()) as unknown as AirtableSpotRecord[];

  let translatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const record of records) {
    const name = record.fields.Name?.trim() ?? '(unnamed)';
    const oldAddress = record.fields.Address?.trim() ?? '';

    if (!containsChinese(oldAddress)) {
      skippedCount += 1;
      continue;
    }

    const lat = record.fields.Latitude;
    const lng = record.fields.Longitude;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      failedCount += 1;
      console.log(`✗ ${name}: missing latitude/longitude`);
      await sleep(REQUEST_DELAY_MS);
      continue;
    }

    try {
      const englishAddress = await reverseGeocodeEnglishAddress(lat, lng, googleApiKey);
      if (!dryRun) {
        await base('Spots').update(record.id, { Address: englishAddress });
      }

      translatedCount += 1;
      console.log(`✓ ${name}: ${oldAddress} → ${englishAddress}`);
    } catch (error) {
      failedCount += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.log(`✗ ${name}: ${message}`);
    }

    await sleep(REQUEST_DELAY_MS);
  }

  console.log('\nSummary');
  console.log(`translated count: ${translatedCount}`);
  console.log(`skipped (already English): ${skippedCount}`);
  console.log(`failed: ${failedCount}`);
}

run().catch((error) => {
  console.error('Address translation failed:', error);
  process.exit(1);
});

