
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

  console.log('[apiGet]', action, url.toString().substring(0, 120));

  const resp = await fetch(url.toString(), { redirect: 'follow' });
  const text = await resp.text();

  console.log('[apiGet response]', action, 'status:', resp.status, 'body:', text.substring(0, 300));

  if (!text) throw new Error('תגובה ריקה מהשרת (GET ' + action + ')');

  try { return JSON.parse(text); }
  catch (e) { throw new Error('תגובה לא תקינה מהשרת: ' + text.substring(0, 150)); }
}

/**
 * Admin requests — sent as GET with encoded payload
 * (workaround for Apps Script POST redirect issue)
 */
async function apiPost(action, body = {}) {
  const payload = JSON.stringify({ action, ...body });

  // If payload is small enough for URL (<7000 chars), use GET
  // Otherwise fall back to POST
  if (payload.length < 7000) {
    const url = new URL(API_URL);
    url.searchParams.set('action', '__post__');
    url.searchParams.set('payload', payload);

    console.log('[apiPost via GET]', action, 'payload size:', payload.length);

    const resp = await fetch(url.toString(), { redirect: 'follow' });
    const text = await resp.text();

    console.log('[apiPost response]', action, 'status:', resp.status, 'body:', text.substring(0, 300));

    if (!text) throw new Error('תגובה ריקה מהשרת (POST ' + action + ')');

    try { return JSON.parse(text); }
    catch (e) { throw new Error('תגובה לא תקינה: ' + text.substring(0, 150)); }

  } else {
    // Large payload (file upload) — use actual POST
    console.log('[apiPost via POST]', action, 'payload size:', payload.length);

    const resp = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain' },
      body: payload,
    });
    const text = await resp.text();

    console.log('[apiPost POST response]', action, 'status:', resp.status, 'body:', text.substring(0, 300));

    if (!text) throw new Error('תגובה ריקה מהשרת (POST ' + action + ')');

    try { return JSON.parse(text); }
    catch (e) { throw new Error('תגובה לא תקינה: ' + text.substring(0, 150)); }
  }
}
