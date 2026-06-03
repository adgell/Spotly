import Airtable from 'airtable';
import { normalizeStringList } from '@/lib/spots';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID!);

export async function GET() {
  try {
    let records = await base('Spots')
      .select({
        filterByFormula: "{Status} = 'Published'",
        view: 'Grid view',
      })
      .all();

    if (records.length === 0) {
      records = await base('Spots').select({ view: 'Grid view' }).all();
    }

    const spots = records.map((r) => {
      const category = normalizeStringList(r.get('Category'));
      const neighborhood = normalizeStringList(r.get('Neighborhood'));

      // Images — Airtable attachment field returns array of objects with url
      const attachmentImages = (r.get('Images') as { url: string }[] | undefined) ?? [];

      // Image URLs — fallback long-text field with newline-separated URLs
      const imageUrlsRaw = (r.get('Image URLs') as string) ?? '';
      const fallbackUrls = imageUrlsRaw
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean)
        .map((url) => ({ url }));

      // Combine — prefer Airtable attachments first
      const images = attachmentImages.length > 0 ? attachmentImages : fallbackUrls;

      return {
        id:           r.id,
        name:         r.get('Name') as string,
        chineseName:  r.get('Chinese Name') as string,
        category,
        neighborhood,
        address:      r.get('Address') as string,
        price:        r.get('Budget') as string,
        averageSpend: r.get('Average spend per person') as string,
        hours:        r.get('Hours') as string,
        vibes:        (r.get('Vibes') as string[]) ?? [],
        description:  r.get('Description') as string,
        localTip:     r.get('Local Tip') as string,
        lat:          r.get('Latitude') as number,
        lng:          r.get('Longitude') as number,
        rating:       r.get('Rating') as number,
        amapUrl:      r.get('Amap URL') as string,
        images,
      };
    });

    return Response.json(spots);
  } catch (error) {
    console.error('Failed to fetch spots from Airtable:', error);
    return Response.json({ error: 'Failed to fetch spots' }, { status: 500 });
  }
}