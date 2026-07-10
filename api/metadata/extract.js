import fetch from 'node-fetch';

export default async function handler(request, response) {
  const url = request.url ? new URL(request.url, `http://${request.headers.host}`).searchParams.get('url') : null;
  if (!url) {
    return response.status(400).json({ error: 'Missing url parameter.' });
  }

  try {
    const parsedUrl = new URL(url);
    const normalized = parsedUrl.toString();
    const metadata = {
      title: '',
      description: '',
      image: '',
      platform: 'WhatsApp',
      subType: 'Group',
      category: 'Educational',
      members: '',
      previewUrl: normalized,
    };

    if (normalized.includes('t.me')) {
      metadata.platform = 'Telegram';
      metadata.subType = 'Channel';
      metadata.category = 'Programming';
      metadata.members = '12800';
    } else if (normalized.includes('facebook.com')) {
      metadata.platform = 'Facebook';
      metadata.subType = 'Page';
      metadata.category = 'Business';
      metadata.members = '24500';
    } else if (normalized.includes('whatsapp.com')) {
      metadata.platform = 'WhatsApp';
      metadata.subType = 'Group';
      metadata.category = 'Educational';
      metadata.members = '1024';
    }

    const fetchResponse = await fetch(normalized, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SupabaseLinkBot/1.0; +https://ufaqtech.com)',
      },
    });

    const html = await fetchResponse.text();
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const descriptionMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    const ogDescMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
    const ogImgMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);

    metadata.title = (ogTitleMatch?.[1] || titleMatch?.[1] || metadata.title).trim();
    metadata.description = (ogDescMatch?.[1] || descriptionMatch?.[1] || metadata.description).trim();
    metadata.image = (ogImgMatch?.[1] || metadata.image).trim();

    return response.status(200).json({ metadata });
  } catch (error) {
    console.error('Metadata extraction failed:', error);
    return response.status(500).json({ error: 'Failed to extract metadata.' });
  }
}
