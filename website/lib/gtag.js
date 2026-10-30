// lib/gtag.js
export const GA_MEASUREMENT_ID = "G-LF7XKHQLQH";

export const pageview = (url) => {
  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
};
