function loadLocalEnvConfig() {
  if (window.UFAQTECH_SUPABASE_URL && window.UFAQTECH_SUPABASE_ANON_KEY) {
    return;
  }

  try {
    const request = new XMLHttpRequest();
    request.open('GET', '/.env', false);
    request.send(null);
    if (request.status !== 200) {
      return;
    }

    request.responseText.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return;
      const [key, ...rest] = trimmed.split('=');
      const value = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
      if (key && value && !window[key]) {
        window[key] = value;
      }
    });
  } catch (error) {
    console.warn('Unable to load .env from root:', error?.message || error);
  }
}

loadLocalEnvConfig();
