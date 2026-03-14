/**
 * ═══════════════════════════════════════════
 *  API Configuration
 *  ← הגדירו כאן את כתובת ה-Apps Script שלכם
 * ═══════════════════════════════════════════
 */
const API_URL = 'https://script.google.com/macros/s/AKfycbylNinJ-ALiWtulmRFYHrI9YJxge6lyVSyBx4pKexTGulHX_THZDr_eZr3mMvGghXQ6/exec';


/**
 * Public GET request (for reading data)
 */
async function apiGet(action, params = {}) {
  const url = new URL(API_URL);
  url.searchParams.set('action', action);
  Object.keys(params).forEach(k => {
    if (params[k]) url.searchParams.set(k, params[k]);
  });

  const resp = await fetch(url.toString());
  if (!resp.ok) throw new Error('Network error: ' + resp.status);
  return await resp.json();
}

/**
 * Admin POST request (for writing data)
 */
async function apiPost(action, body = {}) {
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    // Note: text/plain avoids CORS preflight with Apps Script
    body: JSON.stringify({ action, ...body }),
  });
  if (!resp.ok) throw new Error('Network error: ' + resp.status);
  return await resp.json();
}
