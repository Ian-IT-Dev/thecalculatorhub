const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('js/main.js', 'utf8') + '\n;globalThis.__Calcs = Calculators; globalThis.__UNITS = UNITS;';

const sandbox = {
  navigator: { language: 'en-US', languages: ['en-US'] },
  location: { protocol: 'file:', pathname: 'index.html', origin: '', search: '' },
  localStorage: { getItem: () => null, setItem: () => {} },
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
  document: { addEventListener: () => {}, querySelector: () => null, querySelectorAll: () => [], documentElement: { setAttribute: () => {}, getAttribute: () => 'light' }, createElement: () => ({ setAttribute:()=>{}, appendChild:()=>{}, addEventListener:()=>{} }) },
  window: {},
  console,
  Intl,
  setTimeout, clearTimeout, requestAnimationFrame: () => 0,
  URLSearchParams, Blob: function(){}, URL: { createObjectURL: () => '' },
  Number, Math, isFinite,
  navigator2: undefined
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

const C = sandbox.__Calcs;
const tests = [
  ['compound', C.compound({principal:1000,rate:7,years:20,contrib:200,contribFreq:'monthly',freq:'12'}), 'headline'],
  ['compound-weekly', C.compound({principal:1000,rate:7,years:20,contrib:50,contribFreq:'weekly',freq:'12'}), 'headline'],
  ['roi', C.roi({cost:5000,gain:7500,years:3}), 'headline'],
  ['loan', C.loan({loanAmount:20000,loanRate:7,loanYears:5}), 'headline'],
  ['savings', C.savings({goal:20000,have:2000,months:36,savRate:4}), 'headline'],
  ['tip', C.tip({bill:60,tipPct:18,people:2}), 'headline'],
  ['percentage', C.percentage({pctX:25,pctY:80}), 'headline'],
  ['mortgage', C.mortgage({price:350000,downPct:20,rate:6.5,years:30,tax:3600,insure:1200,hoa:0}), 'headline'],
  ['creditcard', C.creditcard({balance:5000,apr:22,payment:200}), 'headline'],
  ['creditcard-min', C.creditcard({balance:5000,apr:22,payment:0}), 'headline'],
  ['retirement', C.retirement({startAge:30,retireAge:65,current:10000,monthly:400,rate:7}), 'headline'],
  ['bmi', C.bmi({bmiUnits:'metric',height:175,weight:70}), 'headline'],
  ['bmi-imperial', C.bmi({bmiUnits:'imperial',height:69,weight:154}), 'headline'],
  ['calorie', C.calorie({calUnits:'metric',sex:'male',age:30,height:175,weight:70,activity:1.55}), 'headline'],
  ['units-length', C.units({cat:'length',value:100,from:'m',to:'ft'}), 'headline'],
  ['units-temp', C.units({cat:'temperature',value:100,from:'C',to:'F'}), 'headline'],
  ['tax', C.tax({amount:100,rate:8.25}), 'headline'],
  ['hourly', C.hourly({wage:22,hours:40}), 'headline'],
];

let pass = 0;
for (const [name, r, key] of tests) {
  try {
    const val = r && r.headline ? JSON.stringify(r.headline) : JSON.stringify(r);
    console.log(name.padEnd(18), val);
    if (r && r.headline && r.headline.value && !String(r.headline.value).includes('—')) pass++;
  } catch (e) { console.log(name.padEnd(18), 'ERROR', e.message); }
}
console.log(`\n${pass}/${tests.length} calculators produced non-empty results`);