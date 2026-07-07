'use strict';

/* ============================================================
   Calculator Hub — engine
   - Generic registry: each page declares <form data-calc="x">
   - Live recalculation on input, persisted inputs (localStorage)
   - Shareable URLs (inputs encoded in query string)
   - CSV export of schedules
   - Hand-rolled SVG charts (no dependencies)
   - Currency detection + switching (persisted)
   - Dark mode (system + manual, persisted)
   ============================================================ */

/* ---------- currency ---------- */
const CURRENCIES = ['USD','EUR','GBP','CAD','AUD','NZD','JPY','CNY','INR','ZAR','MXN','BRL','CHF','SGD','HKD','NGN','KES','AED','SAR','SEK','NOK','PLN','TRY','THB','IDR','PHP'];
const CURRENCY_LABELS = {USD:'US Dollar',EUR:'Euro',GBP:'British Pound',CAD:'Canadian Dollar',AUD:'Australian Dollar',NZD:'NZ Dollar',JPY:'Japanese Yen',CNY:'Chinese Yuan',INR:'Indian Rupee',ZAR:'South African Rand',MXN:'Mexican Peso',BRL:'Brazilian Real',CHF:'Swiss Franc',SGD:'Singapore Dollar',HKD:'Hong Kong Dollar',NGN:'Nigerian Naira',KES:'Kenyan Shilling',AED:'UAE Dirham',SAR:'Saudi Riyal',SEK:'Swedish Krona',NOK:'Norwegian Krone',PLN:'Polish Zloty',TRY:'Turkish Lira',THB:'Thai Baht',IDR:'Indonesian Rupiah',PHP:'Philippine Peso'};
const LOCALE_CURRENCY = {'en-US':'USD','en-GB':'GBP','en-CA':'CAD','en-AU':'AUD','en-NZ':'NZD','de-DE':'EUR','de-AT':'EUR','fr-FR':'EUR','es-ES':'EUR','it-IT':'EUR','nl-NL':'EUR','pt-PT':'EUR','en-IE':'EUR','en-IN':'INR','ja-JP':'JPY','zh-CN':'CNY','zh-HK':'HKD','en-HK':'HKD','en-ZA':'ZAR','es-MX':'MXN','pt-BR':'BRL','de-CH':'CHF','fr-CH':'CHF','en-SG':'SGD','en-NG':'NGN','sw-KE':'KES','en-KE':'KES','ar-AE':'AED','ar-SA':'SAR','sv-SE':'SEK','nb-NO':'NOK','pl-PL':'PLN','tr-TR':'TRY','th-TH':'THB','id-ID':'IDR','fil-PH':'PHP','en-PH':'PHP'};

let currentCurrency = 'GBP';
function detectCurrency(){
  const langs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || 'en-US'];
  for (const l of langs){ if (LOCALE_CURRENCY[l]) return LOCALE_CURRENCY[l]; const base=l.split('-')[0]; if (base==='en') continue; const m=Object.keys(LOCALE_CURRENCY).find(k=>k.startsWith(base)); if (m) return LOCALE_CURRENCY[m]; }
  return 'GBP';
}
function localeForNum(){ try { return navigator.language || 'en-US'; } catch(e){ return 'en-US'; } }
function money(n){
  if (!isFinite(n)) return '—';
  try { return new Intl.NumberFormat(localeForNum(), { style:'currency', currency: currentCurrency, maximumFractionDigits: currentCurrency==='JPY'?0:2 }).format(n); }
  catch(e){ return new Intl.NumberFormat('en-US', { style:'currency', currency: currentCurrency, maximumFractionDigits: currentCurrency==='JPY'?0:2 }).format(n); }
}
function num(n, d=2){ if (!isFinite(n)) return '—'; return Number(n).toLocaleString(localeForNum(), { maximumFractionDigits: d }); }
function pct(n, d=2){ if (!isFinite(n)) return '—'; return Number(n).toLocaleString(localeForNum(), { maximumFractionDigits: d }) + '%'; }
function weeklyFromMonthly(m){ return (m*12)/52; }

/* ---------- state helpers ---------- */
const STORAGE = { get(k,d){ try { const v=localStorage.getItem(k); return v===null?d:v; } catch(e){ return d; } }, set(k,v){ try { localStorage.setItem(k,v); } catch(e){} } };
const debounce = (fn, ms=120) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; };

/* ============================================================
   Calculator registry
   Each compute(inputs) returns a result object:
     { headline:{value,unit}, subtitle, caption, sub:{value,unit}|null,
       summary:[ [label, html] ],
       schedule:{ headers:[...], rows:[[...]] } | null,
       charts:[ {type, title, xLabel, yLabel, series:[{name,color,points:[{x,y}]}] or bars:[{label, value, color}] } ] | null,
       html: extra raw HTML }
   ============================================================ */
const fmt = { money, num, pct };

const Calculators = {

  /* ---- compound interest ---- */
  compound(i){
    const P = +i.principal || 0, r = (+i.rate||0)/100, years = +i.years||0;
    const contribRaw = +i.contrib || 0;
    const contribFreq = i.contribFreq || 'monthly';
    const periodFreqSel = i.freq || '12';
    const periodFreq = +periodFreqSel;
    if (!(P>=0) || !(years>0)) return empty();
    // convert contributions to per-period equivalent
    const contribPerPeriod = contribFreq==='weekly' ? (contribRaw*52/periodFreq) : contribRaw;
    const periodRate = r/periodFreq;
    const periods = Math.round(years*periodFreq);
    let bal=P, totalContrib=P; const rows=[]; const series=[];
    for (let k=1;k<=periods;k++){
      bal = bal*(1+periodRate) + contribPerPeriod;
      totalContrib += contribPerPeriod;
      if (k % periodFreq === 0){ const yr=k/periodFreq; rows.push([yr, money(bal), money(bal-totalContrib)]); series.push({x:yr, y:bal}); }
    }
    const interest = bal - totalContrib;
    const monthlyContrib = contribFreq==='weekly' ? contribRaw*(52/12) : contribRaw;
    return {
      headline:{ value: money(bal), unit:'total' },
      caption: `Balance after ${years} years`,
      sub: monthlyContrib>0 ? { value: money(monthlyContrib), unit:'/ mo', label:`Contributing ≈ ${money(monthlyContrib)}/mo (${contribFreq==='weekly'?money(contribRaw)+'/wk':'monthly'})` } : null,
      summary: [ ['Total contributions', money(totalContrib)], ['Interest earned', money(interest)], ['Final balance', money(bal)] ],
      schedule: { headers:['Year','Balance','Interest'], rows },
      charts: [ { type:'line', title:'Growth over time', xLabel:'Years', yLabel:'Value', series:[{ name:'Balance', color:'var(--brand)', points: series }] } ],
      actions: ['csv']
    };
  },

  /* ---- ROI ---- */
  roi(i){
    const cost=+i.cost||0, gain=+i.gain||0;
    if (cost===0) return empty();
    const net=gain-cost, roi=(net/cost)*100, years=(+i.years||0);
    const annualized = (years>0 && gain>0 && cost>0) ? (Math.pow(gain/cost, 1/years)-1)*100 : NaN;
    const s=[ ['Net profit', money(net)], ['Total cost', money(cost)], ['Total value', money(gain)] ];
    if (isFinite(annualized)) s.push(['Annualized return', pct(annualized)]);
    return {
      headline:{ value: pct(roi), unit:'ROI' },
      caption: 'Return on investment',
      sub:null,
      summary: s,
      charts: [ { type:'bars', title:'Cost vs final value', yLabel:'Value', bars:[ {label:'Cost', value:cost, color:'var(--ink-soft)'}, {label:'Value', value:gain, color:'var(--brand)'} ] } ]
    };
  },

  /* ---- loan payoff ---- */
  loan(i){
    const pv=+i.loanAmount||0, r=(+i.loanRate||0)/100/12, n=(+i.loanYears||0)*12;
    if (!(pv>0)||!(n>0)) return empty();
    let pmt = r===0 ? pv/n : (pv*r)/(1-Math.pow(1+r,-n));
    const total=pmt*n, interest=total-pv;
    const weekly = weeklyFromMonthly(pmt);
    // amortization schedule (annual summary)
    let bal=pv, paidInt=0, paidPrin=0; const rows=[]; const bars=[];
    for (let m=1;m<=n;m++){ const ir=bal*r, pr=pmt-ir; bal-=pr; paidInt+=ir; paidPrin+=pr; if (m%12===0){ rows.push([m/12, money(bal), money(paidInt), money(paidPrin)]); bars.push({x:m/12, y:bal}); } }
    return {
      headline:{ value: money(pmt), unit:'/ mo' },
      caption: 'Monthly payment',
      sub: { value: money(weekly), unit:'/ week', label:'≈ per week' },
      summary: [ ['Total paid', money(total)], ['Total interest', money(interest)], ['Number of payments', n] ],
      schedule: { headers:['Year','Balance','Interest paid','Principal paid'], rows },
      charts: [ { type:'line', title:'Remaining balance', xLabel:'Year', yLabel:'Balance', series:[{ name:'Balance', color:'var(--brand)', points: bars }] } ],
      actions: ['csv']
    };
  },

  /* ---- savings goal ---- */
  savings(i){
    const goal=+i.goal||0, have=+i.have||0, months=+i.months||0, r=(+i.savRate||0)/100/12;
    if (!(months>0)) return empty();
    const fvHave = have*Math.pow(1+r, months);
    const remaining = goal - fvHave;
    let pmt; if (remaining<=0) pmt=0; else if (r===0) pmt=remaining/months; else pmt=(remaining*r)/(Math.pow(1+r,months)-1);
    const weekly = weeklyFromMonthly(pmt);
    const series=[]; let bal=have;
    for (let m=0;m<=months;m++){ if (m% Math.max(1,Math.round(months/30))===0 || m===months){ series.push({x:m, y:bal}); } bal = bal*(1+r)+pmt; }
    return {
      headline:{ value: money(pmt), unit:'/ mo' },
      caption: 'Monthly savings needed',
      sub: { value: money(weekly), unit:'/ week', label:'≈ per week' },
      summary: [ ['Goal', money(goal)], ['Already saved', money(have)], ['Months to goal', months], ['Future value of current savings', money(fvHave)] ],
      charts: [ { type:'line', title:'Projected savings vs goal', xLabel:'Months', yLabel:'Value', series:[ {name:'Balance', color:'var(--brand)', points: series}, {name:'Goal', color:'var(--ink-soft)', points:[{x:0,y:goal},{x:months,y:goal}]} ] } ]
    };
  },

  /* ---- tip ---- */
  tip(i){
    const bill=+i.bill||0, tipPct=+i.tipPct||0, people=Math.max(1,+i.people||1);
    const tip=bill*(tipPct/100), total=bill+tip, per=total/people, perTip=tip/people;
    return {
      headline:{ value: money(per), unit:'/ person' },
      caption: `Split between ${people} ${people===1?'person':'people'}`,
      sub: { value: money(perTip), unit:'/ person tip', label:'tip share' },
      summary: [ [`Tip (${num(tipPct,0)}%)`, money(tip)], ['Total bill', money(total)], ['Tip per person', money(perTip)] ]
    };
  },

  /* ---- percentage ---- */
  percentage(i){
    const x=+i.pctX, y=+i.pctY;
    const ofResult = (isFinite(x)&&isFinite(y)) ? (x/100)*y : NaN;
    const isResult = (isFinite(x)&&isFinite(y)&&y!==0) ? (x/y)*100 : NaN;
    const change = (isFinite(x)&&isFinite(y)&&x!==0) ? ((y-x)/Math.abs(x))*100 : NaN;
    return {
      headline:{ value: pct(isResult), unit:'' },
      caption: `${num(x)} as a percentage of ${num(y)}`,
      sub: null,
      summary: [ [`${num(x)}% of ${num(y)}`, money(ofResult)], [`Percent change ${num(x)} → ${num(y)}`, pct(change)] ]
    };
  },

  /* ---- mortgage ---- */
  mortgage(i){
    const price=+i.price||0, downPct=+i.downPct||0, r=(+i.rate||0)/100/12, years=(+i.years||0), tax=+i.tax||0, insure=+i.insure||0, hoa=+i.hoa||0;
    if (!(price>0)||!(years>0)) return empty();
    const down = price*(downPct/100), loan = price-down, n=years*12;
    const pmt = r===0 ? loan/n : (loan*r)/(1-Math.pow(1+r,-n));
    const monthly = pmt + tax/12 + insure/12 + hoa;
    const total = pmt*n; const interest=total-loan;
    const weekly = weeklyFromMonthly(monthly);
    let bal=loan; const rows=[]; const series=[];
    for (let m=1;m<=n;m++){ const ir=bal*r; bal-=(pmt-ir); if (m%12===0){ rows.push([m/12, money(bal)]); series.push({x:m/12,y:bal}); } }
    return {
      headline:{ value: money(monthly), unit:'/ mo' },
      caption: 'Total monthly housing payment',
      sub: { value: money(weekly), unit:'/ week', label:'≈ per week' },
      summary: [ ['Loan amount', money(loan)], ['Principal & interest', money(pmt)], ['Property tax (mo)', money(tax/12)], ['Insurance (mo)', money(insure/12)], ['HOA (mo)', money(hoa)], ['Total interest', money(interest)] ],
      schedule: { headers:['Year','Balance'], rows },
      charts: [ { type:'line', title:'Remaining loan balance', xLabel:'Year', yLabel:'Balance', series:[{ name:'Balance', color:'var(--brand)', points: series }] } ],
      actions: ['csv']
    };
  },

  /* ---- credit card payoff ---- */
  creditcard(i){
    const bal=+i.balance||0, apr=(+i.apr||0)/100, pay=+i.payment||0;
    if (!(bal>0)) return empty();
    const r=apr/12;
    const p = pay>0 ? pay : Math.max(bal*0.03, 25);
    if (r>0 && p<=bal*r){
      return { headline:{value:'∞',unit:''}, caption:'Payment too low', summary:[ ['Interest this month', money(bal*r)], ['Minimum to pay down', money(bal*r + 0.01)] ], note:'Your payment only covers interest. Increase it to make progress on the principal.' };
    }
    return ccCompute(bal, r, p);
  },

  /* ---- retirement ---- */
  retirement(i){
    const start=+i.startAge||0, retire=+i.retireAge||0, current=+i.current||0, monthly=+i.monthly||0, r=(+i.rate||0)/100;
    if (!(retire>start)) return empty();
    const months=(retire-start)*12, rm=r/12;
    const fv = current*Math.pow(1+rm,months) + (rm===0 ? monthly*months : monthly*(Math.pow(1+rm,months)-1)/rm);
    const totalContrib = current + monthly*months;
    const interest = fv - totalContrib;
    // series
    let bal=current; const series=[];
    for (let m=0;m<=months;m+=12){ series.push({x:start+m/12, y:bal}); for(let k=0;k<12 && m<months;k++){ bal=bal*(1+rm)+monthly; } }
    return {
      headline:{ value: money(fv), unit:'at retirement' },
      caption: `Projected nest egg at age ${retire}`,
      sub: { value: money(monthly), unit:'/ mo', label:`Saving ${money(monthly)}/mo for ${retire-start} years` },
      summary: [ ['Total contributions', money(totalContrib)], ['Investment growth', money(interest)], ['Years investing', retire-start ] ],
      charts: [ { type:'line', title:'Portfolio growth', xLabel:'Age', yLabel:'Value', series:[{ name:'Balance', color:'var(--brand)', points: series }] } ],
      actions: ['csv']
    };
  },

  /* ---- BMI ---- */
  bmi(i){
    const units = i.bmiUnits || 'metric';
    const h = +i.height||0, w = +i.weight||0;
    let hM, wKg;
    if (units==='metric'){ hM=h/100; wKg=w; }
    else { hM = (h/39.3701); wKg = w/2.20462; }
    if (!(hM>0)||!(wKg>0)) return empty();
    const v = wKg/(hM*hM);
    let cat, color;
    if (v<18.5){ cat='Underweight'; color='#5b9bd5'; }
    else if (v<25){ cat='Healthy'; color='var(--brand)'; }
    else if (v<30){ cat='Overweight'; color='#e0a800'; }
    else { cat='Obese'; color='#d9534f'; }
    return {
      headline:{ value: num(v,1), unit:'kg/m²' },
      caption: cat,
      sub:null,
      summary: [ ['Category', cat], ['Healthy BMI range','18.5 – 24.9'] ],
      charts: [ { type:'gauge', title:'BMI scale', value:v, min:10, max:40, zones:[ {from:10,to:18.5,color:'#5b9bd5'},{from:18.5,to:25,color:'var(--brand)'},{from:25,to:30,color:'#e0a800'},{from:30,to:40,color:'#d9534f'} ] } ]
    };
  },

  /* ---- calorie ---- */
  calorie(i){
    const units = i.calUnits || 'metric';
    const age=+i.age||0, height=+i.height||0, weight=+i.weight||0;
    const sex = i.sex || 'male', activity = +i.activity || 1.2;
    let wKg, hCm;
    if (units==='metric'){ wKg=weight; hCm=height; }
    else { wKg=weight/2.20462; hCm=height*2.54; }
    if (!(age>0)||!(hCm>0)||!(wKg>0)) return empty();
    let bmr;
    if (sex==='male') bmr = 10*wKg + 6.25*hCm - 5*age + 5;
    else bmr = 10*wKg + 6.25*hCm - 5*age - 161;
    const tdee = bmr*activity;
    const maintain = Math.round(tdee);
    const labels=['Lose 1kg/wk','Lose 0.5kg/wk','Maintain','Gain 0.5kg/wk','Gain 1kg/wk'];
    const deltas=[-1000,-500,0,500,1000];
    const rows=deltas.map(d=>maintain+d);
    const bars=labels.map((l,idx)=>({label:l, value:rows[idx], color: d_idx(idx)}));
    return {
      headline:{ value: num(maintain,0), unit:'kcal/day' },
      caption:'Calories to maintain weight (TDEE)',
      sub:{ value: num(Math.round(bmr),0), unit:'BMR', label:'at rest' },
      summary: [ ['BMR', num(Math.round(bmr),0)+' kcal'], ['Activity factor', activity], ['Goal calories', labels.map((l,i)=>l+': '+rows[i]).join('  ·  ')] ],
      charts: [ { type:'bars', title:'Daily calorie targets', yLabel:'Calories', bars } ]
    };
  },

  /* ---- unit converter ---- */
  units(i){
    const cat = i.cat || 'length';
    const v = +i.value||0;
    const conv = UNITS[cat];
    if (!conv) return empty();
    const from = i.from || conv.base;
    const factor = conv.factors[from] || 1;
    const baseVal = v*factor;
    const rows = Object.keys(conv.factors).map(u=>{
      const out = baseVal / conv.factors[u];
      return [u, num(out, 6)];
    });
    return {
      headline:{ value: num(baseVal / (conv.factors[i.to]||1), 6), unit: i.to || conv.base },
      caption: `${num(v)} ${from} converted`,
      sub:null,
      summary: rows.map(r=>[r[0], r[1]])
    };
  },

  /* ---- sales tax ---- */
  tax(i){
    const amount=+i.amount||0, rate=(+i.rate||0)/100;
    const tax=amount*rate, total=amount+tax;
    return {
      headline:{ value: money(total), unit:'total' },
      caption: `Including ${num(+i.rate||0,0)}% tax`,
      sub:{ value: money(tax), unit:'tax', label:'tax portion' },
      summary: [ ['Pre-tax amount', money(amount)], ['Tax', money(tax)], ['Total', money(total)] ]
    };
  },

  /* ---- hourly to salary ---- */
  hourly(i){
    const wage=+i.wage||0, hours=+i.hours||0;
    if (!(wage>0)||!(hours>0)) return empty();
    const weekly=wage*hours, annual=weekly*52, monthly=annual/12;
    return {
      headline:{ value: money(annual), unit:'/ year' },
      caption:'Annual salary',
      sub:{ value: money(monthly), unit:'/ mo', label:`${money(weekly)} / week at ${hours} h/wk` },
      summary: [ ['Per hour', money(wage)], ['Per week', money(weekly)], ['Per month', money(monthly)], ['Per year', money(annual)] ]
    };
  },

  /* ---- roll length ----
     L = π × (D² − d²) / (4 × t)
     All inputs converted to mm, then result converted to chosen output unit.
     Material thickness supports microns (μm), mm, and inches — the key
     requirement for thin films, foils, paper and label stock. */
  rolllength(i){
    const OD = +i.outerDiameter || 0;
    const CD = +i.coreDiameter || 0;
    const thickness = +i.thickness || 0;
    const diamUnit = i.diamUnit || 'mm';
    const thickUnit = i.thickUnit || 'microns';
    const outUnit = i.outUnit || 'm';
    if (!(OD > 0) || !(thickness > 0)) return empty();
    if (OD <= CD) return { headline:{value:'—',unit:''}, caption:'Outer diameter must be larger than core diameter', summary:[] };

    const diamToMm = { 'mm':1, 'cm':10, 'inches':25.4 };
    const thickToMm = { 'microns':0.001, 'μm':0.001, 'mm':1, 'inches':25.4 };
    const fromMm = { 'm':0.001, 'cm':0.1, 'mm':1, 'inches':1/25.4, 'feet':1/304.8 };
    const outLabels = { 'm':'metres', 'cm':'cm', 'mm':'mm', 'inches':'inches', 'feet':'feet' };

    const OD_mm = OD * diamToMm[diamUnit];
    const CD_mm = (CD || 0) * diamToMm[diamUnit];
    const t_mm = thickness * thickToMm[thickUnit];

    const L_mm = Math.PI * (OD_mm * OD_mm - CD_mm * CD_mm) / (4 * t_mm);
    const L_out = L_mm * fromMm[outUnit];

    const series = [];
    const nPoints = 30;
    for (let k=0; k<=nPoints; k++){
      const r = CD_mm + (OD_mm - CD_mm) * (k / nPoints);
      const cumLen = (Math.PI * (r * r - CD_mm * CD_mm) / (4 * t_mm)) * fromMm[outUnit];
      const x = diamUnit==='inches' ? r/25.4 : (diamUnit==='cm' ? r/10 : r);
      series.push({ x, y: cumLen });
    }

    return {
      headline: { value: num(L_out, 2), unit: outUnit },
      caption: 'Total length of material on the roll',
      sub: { value: num(L_mm * 0.001, 2), unit: 'm', label: 'equivalent' },
      summary: [
        ['Outer diameter', `${num(OD,2)} ${diamUnit}`],
        ['Core diameter', `${num(CD,2)} ${diamUnit}`],
        ['Material thickness', `${num(thickness,4)} ${thickUnit}`],
        ['Total length', `${num(L_out,2)} ${outUnit}`]
      ],
      charts: [ { type:'line', title:'Length vs roll diameter', xLabel:`Diameter (${diamUnit})`, yLabel:`Length (${outUnit})`, series:[{ name:'Cumulative length', color:'var(--brand)', points: series }] } ]
    };
  }
};

/* helpers for calculators that need placeholder/dummy */
function empty(){ return { headline:{value:'—',unit:''}, caption:'', summary:[] }; }
function d_idx(idx){ return ['#d9534f','#e0a800','var(--brand)','#5b9bd5'][idx] || 'var(--brand)'; }

/* fix credit-card (clean) */
function ccCompute(bal, r, p){
  if (r===0){ const m=Math.ceil(bal/p); const total=p*m; return { headline:{value: money(p), unit:'/ mo'}, caption:'Monthly payment', sub:{value: num(m,0), unit:'months', label:'to pay off'}, summary:[['Months to payoff', m],['Total paid', money(total)],['Total interest', money(0)]], actions:['csv'] }; }
  let b=bal, m=0, tInt=0;
  while (b>0 && m<1200){ const ir=b*r, pr=Math.min(p-ir, b); if (p<=ir){ return { headline:{value: money(b*r+0.01), unit:'/ mo'}, caption:'Minimum payment', summary:[['Your payment only covers interest.', 'Increase it.']]}; } b-=pr; tInt+=ir; m++; }
  const total=bal+tInt;
  const rows=[]; let bb=bal; for(let k=1;k<=m;k++){ const ir=bb*r; bb-=(p-ir); if(k%6===0||k===m) rows.push([k, money(bb)]); }
  const weekly = weeklyFromMonthly(p);
  return { headline:{value: money(p), unit:'/ mo'}, caption:'Monthly payment', sub:{value: money(weekly), unit:'/ wk', label:'≈ per week'}, summary:[['Months to payoff', m],['Total interest', money(tInt)],['Total paid', money(total)]], schedule:{ headers:['Month','Balance'], rows }, actions:['csv'] };
}

/* ---- unit conversion tables ---- */
const UNITS = {
  length: { base:'m', factors:{ m:1, km:1000, cm:0.01, mm:0.001, mi:1609.344, yd:0.9144, ft:0.3048, in:0.0254 } },
  mass:   { base:'kg', factors:{ kg:1, g:0.001, mg:0.000001, t:1000, lb:0.45359237, oz:0.028349523 } },
  volume: { base:'l', factors:{ l:1, ml:0.001, m3:1000, gal:3.785411784, qt:0.946352946, pt:0.473176473, cup:0.2365882365, floz:0.0295735296 } },
  speed:  { base:'m/s', factors:{ 'm/s':1, 'km/h':1/3.6, mph:0.44704, knot:0.514444, 'ft/s':0.3048 } },
  time:   { base:'s', factors:{ s:1, min:60, h:3600, day:86400, week:604800, year:31557600 } },
  temperature: { base:'C', factors:null }
};
UNITS.temperature = { base:'C', factors:null, convert(v,from,to){
  let c;
  if (from==='C') c=v; else if (from==='F') c=(v-32)*5/9; else if (from==='K') c=v-273.15;
  if (to==='C') return c; if (to==='F') return c*9/5+32; if (to==='K') return c+273.15;
  return c;
}};
// temperature handled specially in units()
const _origUnits = Calculators.units;
Calculators.units = function(i){
  if (i.cat==='temperature'){
    const v=+i.value||0; const to=i.to||'C';
    const out=UNITS.temperature.convert(v, i.from||'C', to);
    return { headline:{value: num(out,2), unit:to}, caption: `${num(v)} ${i.from||'C'} = ${num(out,2)} ${to}`, sub:null, summary:[['Celsius', num(UNITS.temperature.convert(v,i.from||'C','C'),2)],['Fahrenheit', num(UNITS.temperature.convert(v,i.from||'C','F'),2)],['Kelvin', num(UNITS.temperature.convert(v,i.from||'C','K'),2)]] };
  }
  return _origUnits(i);
};

/* ============================================================
   Rendering
   ============================================================ */
function renderResult(container, r){
  if (!r) { container.innerHTML=''; return; }
  const parts=[];
  parts.push(`<h2>Results</h2>`);
  if (r.headline){ parts.push(`<div class="big">${r.headline.value} <span class="unit">${r.headline.unit||''}</span></div>`); }
  if (r.sub){ parts.push(`<div class="sub">${r.sub.value} <span class="unit">${r.sub.unit||''}</span> ${r.sub.label?`<span class="sub-label">${r.sub.label}</span>`:''}</div>`); }
  if (r.caption) parts.push(`<p class="caption">${r.caption}</p>`);
  if (r.note) parts.push(`<p class="note">${r.note}</p>`);
  if (r.summary && r.summary.length){ parts.push(`<table>${r.summary.map(([k,v])=>`<tr><th>${k}</th><td>${v}</td></tr>`).join('')}</table>`); }
  if (r.charts && r.charts.length){ r.charts.forEach((c,idx)=>{ parts.push(`<div class="chart-block" id="chart-${idx}">${drawChartHTML(c, idx)}</div>`); }); }
  if (r.schedule){ parts.push(`<div class="schedule"><table><thead><tr>${r.schedule.headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${r.schedule.rows.map(row=>`<tr>${row.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`); }
  if (r.actions && r.actions.includes('csv') && r.schedule){ parts.push(`<button class="btn-ghost" data-csv>Export CSV</button>`); }
  container.innerHTML = parts.join('');
  if (r.charts && r.charts.length){ r.charts.forEach((c,idx)=>{ renderChartSVG(c, container.querySelector(`#chart-${idx} .chart-mount`)); }); }
  if (r.actions && r.actions.includes('csv')){ container.querySelector('[data-csv]')?.addEventListener('click', ()=> exportCSV(r.schedule)); }
}

/* ---- SVG charts ---- */
function drawChartHTML(c, idx){ return `<h3 class="chart-title">${c.title||''}</h3><div class="chart-mount"></div>`; }
function renderChartSVG(c, mount){
  if (!mount) return;
  const col = c => {
    const dark = document.documentElement.getAttribute('data-theme')==='dark';
    const map = dark ? {'var(--brand)':'#2bd693','var(--brand-dark)':'#4fe0a4','var(--ink-soft)':'#c2c9d1','var(--ink)':'#f3f5f7','var(--border)':'#2c3742'} : {'var(--brand)':'#0a7c5a','var(--brand-dark)':'#075c43','var(--ink-soft)':'#383d44','var(--ink)':'#1a1a1a','var(--border)':'#e2e6ea'};
    return map[c] || c;
  };
  const W=520, H=240, P={l:54,r:16,t:12,b:34};
  const iw=W-P.l-P.r, ih=H-P.t-P.b;
  const svgNS='http://www.w3.org/2000/svg';
  const el=(n,a={})=>{ const e=document.createElementNS(svgNS,n); for(const k in a) e.setAttribute(k,a[k]); return e; };

  if (c.type==='line'){
    if (!c.series || !c.series.length || !c.series[0].points.length){ mount.innerHTML='<p class="muted">Not enough data to chart.</p>'; return; }
    let allPts=[]; c.series.forEach(s=>s.points.forEach(p=>allPts.push(p)));
    if (!allPts.length){ mount.innerHTML=''; return; }
    const xs=allPts.map(p=>p.x), ys=allPts.map(p=>p.y);
    const xMin=Math.min(...xs), xMax=Math.max(...xs), yMin=Math.min(...ys,0), yMax=Math.max(...ys,1);
    const xRange=(xMax-xMin)||1, yRange=(yMax-yMin)||1;
    const SX=x=>P.l+((x-xMin)/xRange)*iw;
    const SY=y=>P.t+ih-((y-yMin)/yRange)*ih;
    const svg=el('svg',{viewBox:`0 0 ${W} ${H}`, width:'100%', height:'auto', preserveAspectRatio:'xMidYMid meet'});
    // grid + Y labels
    for (let g=0;g<=4;g++){ const yv=yMin + (yRange*g/4); const yy=SY(yv); svg.appendChild(el('line',{x1:P.l,x2:P.l+iw,y1:yy,y2:yy,stroke:col('var(--border)'),'stroke-width':1})); const t=el('text',{x:P.l-8,y:yy+4,'text-anchor':'end','font-size':11,fill:col('var(--ink-soft)')}); t.textContent=shortNum(yv); svg.appendChild(t); }
    // X axis labels (start, mid, end)
    [[[xMin,'start']],[[xMax,'end']]].forEach(([[v,anchor]])=>{ const t=el('text',{x:SX(v),y:H-12,'text-anchor':'middle','font-size':11,fill:col('var(--ink-soft)')}); t.textContent=shortNum(v); svg.appendChild(t); });
    c.series.forEach(s=>{
      const d=s.points.map((p,i)=>`${i===0?'M':'L'} ${SX(p.x).toFixed(1)} ${SY(p.y).toFixed(1)}`).join(' ');
      const area=el('polygon',{points:s.points.map((p,i)=>`${SX(p.x).toFixed(1)},${SY(p.y).toFixed(1)}`).join(' ')+` ${SX(s.points[s.points.length-1].x).toFixed(1)},${(P.t+ih).toFixed(1)} ${SX(s.points[0].x).toFixed(1)},${(P.t+ih).toFixed(1)}`, fill:col(s.color), 'fill-opacity':0.10, stroke:'none'});
      svg.appendChild(area);
      svg.appendChild(el('path',{d, fill:'none', stroke:col(s.color), 'stroke-width':2.5, 'stroke-linejoin':'round','stroke-linecap':'round'}));
    });
    mount.innerHTML=''; mount.appendChild(svg);
  }
  else if (c.type==='bars'){
    const items=c.bars||[]; if(!items.length){mount.innerHTML='';return;}
    const maxV=Math.max(...items.map(b=>Math.max(0,b.value)),1);
    const bw=iw/items.length*0.5;
    const svg=el('svg',{viewBox:`0 0 ${W} ${H}`, width:'100%', height:'auto'});
    for (let g=0;g<=4;g++){ const yv=(maxV*g/4); const yy=P.t+ih-(g/4)*ih; svg.appendChild(el('line',{x1:P.l,x2:P.l+iw,y1:yy,y2:yy,stroke:col('var(--border)')})); const t=el('text',{x:P.l-8,y:yy+4,'text-anchor':'end','font-size':11,fill:col('var(--ink-soft)')}); t.textContent=shortNum(yv); svg.appendChild(t); }
    items.forEach((b,i)=>{ const x=P.l + (i+0.5)*(iw/items.length) - bw/2; const h=Math.max(0, (Math.max(0,b.value)/maxV)*ih); const y=P.t+ih-h; svg.appendChild(el('rect',{x,y,width:bw,height:h,fill:col(b.color),rx:4})); const t=el('text',{x:x+bw/2,y:P.t+ih+18,'text-anchor':'middle','font-size':10,fill:col('var(--ink-soft)')}); t.textContent=b.label; svg.appendChild(t); const tv=el('text',{x:x+bw/2,y:y-6,'text-anchor':'middle','font-size':10,fill:col('var(--ink)')}); tv.textContent=shortNum(b.value); svg.appendChild(tv); });
    mount.innerHTML=''; mount.appendChild(svg);
  }
  else if (c.type==='gauge'){
    const v=c.value, lo=c.min, hi=c.max;
    const pctv=Math.max(0,Math.min(1,(v-lo)/(hi-lo)));
    const W2=520,H2=150, cy=125, r=105, startA=Math.PI, endA=2*Math.PI;
    const svg=el('svg',{viewBox:`0 0 ${W2} ${H2}`, width:'100%', height:'auto'});
     c.zones.forEach(z=>{ const a0=startA + ((Math.max(lo,z.from)-lo)/(hi-lo))*Math.PI; const a1=startA + ((Math.min(hi,z.to)-lo)/(hi-lo))*Math.PI; const x0=W2/2 + r*Math.cos(a0), y0=cy + r*Math.sin(a0); const x1=W2/2 + r*Math.cos(a1), y1=cy + r*Math.sin(a1); svg.appendChild(el('path',{d:`M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`, stroke:col(z.color), 'stroke-width':18, fill:'none', 'stroke-linecap':'butt'})); });
    const va=startA + pctv*Math.PI; const nx=W2/2 + r*Math.cos(va), ny=cy + r*Math.sin(va);
    svg.appendChild(el('line',{x1:W2/2, y1:cy, x2:nx, y2:ny, stroke:col('var(--ink)'), 'stroke-width':3, 'stroke-linecap':'round'}));
    svg.appendChild(el('circle',{cx:W2/2, cy:cy, r:6, fill:col('var(--ink)')}));
    const tv=el('text',{x:W2/2, y:48,'text-anchor':'middle','font-size':22,fill:col('var(--ink)'),'font-weight':'700'}); tv.textContent=num(v,1); svg.appendChild(tv);
    mount.innerHTML=''; mount.appendChild(svg);
  }
}
function shortNum(n){
  const a=Math.abs(n);
  if (a>=1e9) return (n/1e9).toFixed(1)+'B';
  if (a>=1e6) return (n/1e6).toFixed(1)+'M';
  if (a>=1e3) return (n/1e3).toFixed(1)+'k';
  return num(n, a<10?1:0);
}

/* ---- CSV export ---- */
function exportCSV(schedule){
  if (!schedule) return;
  const esc=v=>`"${String(v).replace(/"/g,'""')}"`;
  const lines=[schedule.headers.map(esc).join(',')];
  schedule.rows.forEach(r=>lines.push(r.map(esc).join(',')));
  const blob=new Blob([lines.join('\n')], {type:'text/csv'});
  const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='calculator-hub-export.csv'; a.click(); URL.revokeObjectURL(url);
}

/* ---- shareable URL ---- */
function shareURL(form){
  const inputs=getInputs(form);
  const params=new URLSearchParams(); for(const k in inputs) params.set(k, inputs[k]);
  const url=`${location.origin}${location.pathname}?${params.toString()}`;
  navigator.clipboard?.writeText(url).then(()=>toast('Link copied to clipboard'), ()=>toast(url));
}
function toast(msg){ const t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t); requestAnimationFrame(()=>t.classList.add('show')); setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),300); }, 2200); }

/* ---- gather inputs from a form ---- */
function getInputs(form){
  const data={};
  form.querySelectorAll('input,select').forEach(el=>{
    if (!el.name) return;
    if (el.type==='checkbox') data[el.name]=el.checked?'on':'';
    else if (el.type==='radio'){ if (el.checked) data[el.name]=el.value; }
    else data[el.name]=el.value;
  });
  return data;
}
function hydrate(form){
  const params=new URLSearchParams(location.search);
  const stored=STORAGE.get('calc_'+form.dataset.calc, '');
  let store={}; try{ store=stored?JSON.parse(stored):{} }catch(e){}
  form.querySelectorAll('input,select').forEach(el=>{
    if (!el.name) return;
    let val;
    if (params.has(el.name)) val=params.get(el.name);
    else if (el.name in store) val=store[el.name];
    if (val!==undefined){
      if (el.type==='checkbox') el.checked = (val==='on'||val===true||val==='true');
      else if (el.type==='radio'){ if (el.value===val) el.checked=true; }
      else el.value=val;
    }
  });
}
function persist(form){
  const data=getInputs(form);
  STORAGE.set('calc_'+form.dataset.calc, JSON.stringify(data));
}

/* ============================================================
   Controller
   ============================================================ */
function initCalcPage(){
  const form=document.querySelector('form[data-calc]');
  if (!form) return;
  hydrate(form);
  const calcKey=form.dataset.calc;
  const resultEl=form.parentElement.querySelector('[data-result]') || document.querySelector('[data-result]');
  const run=()=>{ const data=getInputs(form); persist(form); const r=Calculators[calcKey](data); renderResult(resultEl, r); };
  form.addEventListener('input', debounce(run,80));
  form.addEventListener('change', run);
  form.addEventListener('submit', e=>{ e.preventDefault(); run(); });
  form.querySelectorAll('[data-action]').forEach(b=> b.addEventListener('click', ()=>{ if (b.dataset.action==='share') shareURL(form); if (b.dataset.action==='print') window.print(); if (b.dataset.action==='reset'){ form.reset(); STORAGE.set('calc_'+calcKey,''); if (PageInits[calcKey]) PageInits[calcKey](form); run(); } }));
  window.__rerunCurrent = run;
  if (PageInits[calcKey]) PageInits[calcKey](form);
  run();
}

/* ---- page-specific init (unit converter needs dynamic selects) ---- */
const PageInits = {
  units(form){
    const catSel=form.querySelector('[name="cat"]');
    const fromSel=form.querySelector('[name="from"]');
    const toSel=form.querySelector('[name="to"]');
    function build(){
      const cat=catSel.value;
      let units;
      if (cat==='temperature') units=['C','F','K'];
      else units=Object.keys(UNITS[cat].factors);
      const prevFrom=fromSel.value, prevTo=toSel.value;
      fromSel.innerHTML=units.map(u=>`<option value="${u}">${u}</option>`).join('');
      toSel.innerHTML=units.map(u=>`<option value="${u}">${u}</option>`).join('');
      fromSel.value=units.includes(prevFrom)?prevFrom:units[0];
      toSel.value=units.includes(prevTo)?prevTo:(units[1]||units[0]);
    }
    catSel.addEventListener('change', build);
    build();
  }
};

/* ---- currency switch init ---- */
function initCurrency(){
  let saved=null; try{ saved=localStorage.getItem('calcCurrency'); }catch(e){}
  currentCurrency = saved || detectCurrency();
  document.querySelectorAll('#currency').forEach(sel=>{
    sel.innerHTML = CURRENCIES.map(c=>`<option value="${c}"${c===currentCurrency?' selected':''}>${c} — ${CURRENCY_LABELS[c]||c}</option>`).join('');
    sel.value=currentCurrency;
    sel.addEventListener('change', ()=>{ currentCurrency=sel.value; STORAGE.set('calcCurrency', sel.value); document.querySelectorAll('#currency').forEach(s=>s.value=sel.value); if (window.__rerunCurrent) window.__rerunCurrent(); });
  });
}

/* ---- dark mode ---- */
function initTheme(){
  let theme=STORAGE.get('calcTheme','');
  if (!theme){ theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
  applyTheme(theme);
  document.querySelectorAll('[data-theme-toggle]').forEach(b=> b.addEventListener('click', ()=>{ const n = document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark'; applyTheme(n); STORAGE.set('calcTheme', n); }));
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e=>{ if (!STORAGE.get('calcTheme','')) applyTheme(e.matches?'dark':'light'); });
}
function applyTheme(t){ document.documentElement.setAttribute('data-theme', t); document.querySelectorAll('[data-theme-toggle]').forEach(b=> b.setAttribute('aria-pressed', t==='dark')); if (window.__rerunCurrent) window.__rerunCurrent(); }

/* ---- nav drawer ---- */
function initNav(){ document.querySelectorAll('[data-nav-toggle]').forEach(t=> t.addEventListener('click', ()=> document.body.classList.toggle('nav-open'))); }

document.addEventListener('DOMContentLoaded', ()=>{
  const y=document.getElementById('year'); if (y) y.textContent=new Date().getFullYear();
  initTheme();
  initCurrency();
  initNav();
  initCalcPage();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
});