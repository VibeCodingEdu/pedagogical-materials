/**
 * ═══════════════════════════════════════════
 *  API — JSONP (zero CORS issues)
 * ═══════════════════════════════════════════
 */
const API_URL = 'https://script.google.com/macros/s/AKfycbwFqyIMJB_DVhrY4CeVa7wIV_pVlTbBS7GGuwy62E5rtZnsXuVHKd3JI1XY6xPVMU9B/exec';

const ADMIN_URL = API_URL + (API_URL.includes('?') ? '&' : '?') + 'page=admin';

/**
 * JSONP request — creates a <script> tag that loads the response
 * as JavaScript. Completely bypasses CORS because script tags
 * are not subject to same-origin policy.
 */
var _jsonpCounter = 0;

function apiGet(action, params) {
  params = params || {};
  return new Promise(function(resolve, reject) {
    var cbName = '_jsonp_' + (++_jsonpCounter) + '_' + Date.now();
    var timeout = setTimeout(function() {
      cleanup();
      reject(new Error('Request timeout'));
    }, 15000);

    // Register global callback
    window[cbName] = function(data) {
      cleanup();
      resolve(data);
    };

    function cleanup() {
      clearTimeout(timeout);
      delete window[cbName];
      var el = document.getElementById(cbName);
      if (el) el.remove();
    }

    // Build URL
    var url = API_URL + '?action=' + encodeURIComponent(action) + '&callback=' + cbName;
    Object.keys(params).forEach(function(k) {
      if (params[k]) url += '&' + encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
    });

    // Create script tag
    var script = document.createElement('script');
    script.id = cbName;
    script.src = url;
    script.onerror = function() {
      cleanup();
      reject(new Error('Network error'));
    };
    document.head.appendChild(script);
  });
}

function openAdmin() {
  window.open(ADMIN_URL, '_blank');
}
