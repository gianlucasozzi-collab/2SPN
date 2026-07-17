// js/config.js
(function () {
  // Se per errore lo includi due volte, non esplode: sovrascrive in modo controllato
  window.SPN_CONFIG = {
    STRIPE_PAYMENT_LINK_STANDARD: "https://buy.stripe.com/eVqaEY0719wfgOX4qE8Zq07",
    STRIPE_PAYMENT_LINK_OBPLV: "https://buy.stripe.com/28EcN69HBcIr56f3mA8Zq09",
    YT_VIDEO_ID: "l-Sph0nKnLQ",
    EARLY_BIRD_DEADLINE: "2026-09-01T23:59:59",   // chiusura Early Bird -10% (stesso importo del link OBPLV)
    VIDEO_ENABLED: true,                // se vuoi disattivare il popup video, metti false
    VIDEO_SKIP_KEY: "spn_skip_video",    // localStorage key
    COOKIE_KEY: "cookieConsent"
  };
})();
