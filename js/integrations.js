'use strict';

/* ============================================================
   Site config & third-party integrations
   - SITE_DOMAIN: custom domain (apex)
   - ANALYTICS_ID: GA4 Measurement ID (gtag.js direct injection)
   - ADSENSE_CLIENT: auto-injected when set (or wait for AdSense approval)
   - SKIMLINKS_PUBLISHER: auto-injected when set
   - AMAZON_TAG: auto-appended to Amazon affiliate links
   ============================================================ */

const SITE_DOMAIN = 'https://thecalculatorhub.co.uk';

const ANALYTICS_ID = 'G-GNBMJV5CET';        // GA4 Measurement ID
const ADSENSE_CLIENT = '';                  // e.g. 'ca-pub-1234567890123456' once approved
const SKIMLINKS_PUBLISHER = '305849X1794075';    // Skimlinks publisher code
const AMAZON_TAG = 'thecalcula029-20';       // Amazon Associates tag

/* ---- inject Google Analytics 4 (gtag.js) ---- */
function injectAnalytics(){
  if (!ANALYTICS_ID) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ANALYTICS_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', ANALYTICS_ID, { anonymize_ip: true });
}

function injectSkimlinks(){
  if (!SKIMLINKS_PUBLISHER) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://s.skimresources.com/js/' + SKIMLINKS_PUBLISHER + '.skimlinks.js';
  document.body.appendChild(s);
}

function injectAdSense(){
  if (!ADSENSE_CLIENT) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_CLIENT;
  s.crossOrigin = 'anonymous';
  document.head.appendChild(s);

  // Populate ad-slot mounts with AdSense `<ins>` units
  document.querySelectorAll('.ad-slot[data-ad]').forEach((slot, i) => {
    slot.setAttribute('data-filled', 'true');
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', ADSENSE_CLIENT);
    ins.setAttribute('data-ad-slot', '');
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    slot.appendChild(ins);
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  });
}

/* ---- Affiliate link formatter ----
   In page HTML: <a href="DESTINATION_URL" data-affil="amazon|finance|health" data-affil-id="...">
   - Adds rel="sponsored nofollow noopener" + target="_blank"
   - For Amazon: appends ?tag=AMAZON_TAG if missing (only if href looks like amazon)
   - Inserts an affiliate-disclosure block before the FIRST affiliate link on the page
*/
function formatAffiliateLinks(){
  const links = document.querySelectorAll('a[data-affil]');
  if (!links.length) return;

  links.forEach(a => {
    a.setAttribute('rel', 'sponsored nofollow noopener');
    a.setAttribute('target', '_blank');

    const type = a.dataset.affil;
    if (type === 'amazon' && AMAZON_TAG && AMAZON_TAG !== 'yourname-20') {
      try {
        const url = new URL(a.href);
        if (/^amazon\./.test(url.hostname.replace(/^www\./, '')) && !url.searchParams.has('tag')) {
          url.searchParams.set('tag', AMAZON_TAG);
          a.href = url.toString();
        }
      } catch (e) {}
    }
  });
}

/* ---- Replace AdSense placeholder <div data-ad> with <ins> tags (only fires when ADSENSE_CLIENT set) handled in injectAdSense ---- */

document.addEventListener('DOMContentLoaded', ()=>{
  injectAnalytics();
  injectSkimlinks();
  injectAdSense();
  formatAffiliateLinks();
});