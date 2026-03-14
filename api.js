
 */
const API_URL = 'https://script.google.com/macros/s/AKfycbxvclddcpQYRD0N8bZ3nW1AQzB1qA2QUigKDiQaLKRKn6vsBchRcSVkWKUrSOaH-Hv2/exec';


/**
 * ALL requests go via GET — this is the only method that
 * works reliably with Apps Script from cross-origin sites.
 * 
 * For admin actions, we encode the JSON payload in a 'p' parameter.
 * For file uploads (large payloads), we split into chunks if needed.
 */

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
  catch (e) { throw new Error('Invalid JSON: ' + text.substring(0, 80)); }
}

async function apiPost(action, body = {}) {
  const url = new URL(API_URL);
  url.searchParams.set('action', '__admin__');
  url.searchParams.set('p', JSON.stringify({ action, ...body }));

  const fullUrl = url.toString();

  // URL length limit is ~8000 chars for most browsers
  // For file uploads, the base64 data will exceed this — use POST in that case
  if (fullUrl.length > 7500) {
    // Large payload — must use POST
    // We use a different approach: send to /dev URL which doesn't redirect
    // Actually, let's try fetching with a form-data workaround
    return await apiPostLarge(action, body);
  }

  const resp = await fetch(fullUrl);
  const text = await resp.text();
  if (!text) throw new Error('Empty response');
  try { return JSON.parse(text); }
  catch (e) { throw new Error('Invalid JSON: ' + text.substring(0, 80)); }
}

/**
 * Large POST (file uploads) — uses XMLHttpRequest which handles
 * redirects differently than fetch and works with Apps Script CORS
 */
function apiPostLarge(action, body) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', API_URL);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.onload = function() {
      if (xhr.status === 200) {
        try { resolve(JSON.parse(xhr.responseText)); }
        catch(e) { reject(new Error('Invalid JSON: ' + xhr.responseText.substring(0, 80))); }
      } else {
        reject(new Error('HTTP ' + xhr.status));
      }
    };
    xhr.onerror = function() { reject(new Error('Network error')); };
    xhr.send(JSON.stringify({ action, ...body }));
  });
}
