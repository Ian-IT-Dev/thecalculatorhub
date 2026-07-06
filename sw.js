const CACHE = 'calc-hub-v1';
const ASSETS = [
  './','./index.html',
  './compound-interest-calculator.html','./savings-goal-calculator.html',
  './retirement-calculator.html','./roi-calculator.html','./loan-payoff-calculator.html',
  './mortgage-calculator.html','./credit-card-payoff-calculator.html',
  './hourly-to-salary.html','./sales-tax-calculator.html','./tip-calculator.html',
  './percentage-calculator.html','./bmi-calculator.html','./calorie-calculator.html',
  './unit-converter.html',
  './css/style.css','./js/main.js','./manifest.webmanifest','./icon.svg'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k!==CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});