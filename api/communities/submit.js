export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  const payload = await request.json();
  const errors = [];

  if (!payload.title || payload.title.trim().length < 3) errors.push('Title must be at least 3 characters.');
  if (!payload.description || payload.description.trim().length < 10) errors.push('Description must be at least 10 characters.');
  if (!payload.url) errors.push('URL is required.');

  try {
    new URL(payload.url);
  } catch {
    errors.push('Please enter a valid URL.');
  }

  if (errors.length) {
    return response.status(400).json({ error: errors[0] });
  }

  return response.status(200).json({ success: true, submitted: payload });
}
