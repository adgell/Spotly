import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const rawFields: Record<string, unknown> = {
      'Spot Name': body.spotName,
      'Chinese Name': body.chineseName,
      Category: body.category,
      Neighborhood: body.neighborhood,
      Address: body.address,
      Budget: body.budget,
      Description: body.description,
      'Why Recommend': body.whyRecommend,
      'Local Tip': body.localTip,
      'Submitter Name': body.submitterName,
      'Submitter Email': body.submitterEmail,
      Status: 'Pending',
    };
    const submissionFields = Object.fromEntries(
      Object.entries(rawFields).filter(([, value]) => {
        if (typeof value !== 'string') return true;
        return value.trim().length > 0;
      })
    ) as Record<string, unknown>;

    // Some Airtable bases use slightly different field names.
    // If a field does not exist, remove it and retry instead of failing.
    while (true) {
      try {
        await base('Submissions').create([{ fields: submissionFields }]);
        break;
      } catch (err) {
        const airtableErr = err as { error?: string; message?: string };
        const unknownFieldMatch = airtableErr.message?.match(/Unknown field name: "(.+?)"/);

        if (airtableErr.error === 'INVALID_MULTIPLE_CHOICE_OPTIONS') {
          // Remove select-like fields that may not match option sets in this base.
          const fallbackSelectFields = ['Budget', 'Category', 'Neighborhood', 'Status'];
          const removable = fallbackSelectFields.find((name) => name in submissionFields);
          if (!removable) throw err;
          delete submissionFields[removable];
          continue;
        }

        if (airtableErr.error !== 'UNKNOWN_FIELD_NAME' || !unknownFieldMatch) {
          throw err;
        }

        const badField = unknownFieldMatch[1];
        if (!(badField in submissionFields)) {
          throw err;
        }
        delete submissionFields[badField];
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Submission error:', error);
    return Response.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
