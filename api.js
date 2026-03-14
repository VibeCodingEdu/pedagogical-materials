
const API_URL = 'https://script.google.com/macros/s/AKfycbwDUcOzwL7OYdHH31_h-mnyg6glXK_NixcnREZS5HeUPjPzPKx6efxYW8KbB8SSRePZ/exec';


// Admin panel URL — same base URL with ?page=admin
const ADMIN_URL = API_URL + (API_URL.includes('?') ? '&' : '?') + 'page=admin';

async function apiGet(action, params = {}) {
  const url = new URL(API_URL);
  url.searchParams.set('action', action);
  Object.keys(params).forEach(k => {
    if (params[k]) url.searchParams.set(k, params[k]);
  });
  const resp = await fetch(url.toString());
  const text = await resp.text();
  if (!text) throw new Error('Empty response');
  try { return JSON.parse(text); }
  catch (e) { throw new Error('Invalid response'); }
}

function openAdmin() {
  window.open(ADMIN_URL, '_blank');
}
