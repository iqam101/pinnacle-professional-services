// Split deployment configuration for static Hostinger front-end.
// When hosting the static front-end on Hostinger and Admin + D1 database on Cloudflare Workers,
// set apiBaseUrl to your Cloudflare Worker URL (e.g. "https://pinnacle-professional-services.yourname.workers.dev").
// Leave blank ("") for same-origin local/unified hosting.
window.__PINNACLE_CONFIG__ = window.__PINNACLE_CONFIG__ || {
  apiBaseUrl: "",
  adminPortalUrl: "",
};
