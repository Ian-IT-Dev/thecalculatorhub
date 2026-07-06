const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('js/main.js', 'utf8') + '\n;globalThis.__Calc = Calculators; globalThis.__render = renderResult; globalThis.__exportCSV = exportCSV;';

function fakeEl(){
  return { _a:{}, setAttribute(k,v){this._a[k]=v;}, appendChild(){}, addEventListener(){}, style:{}, classList:{add(){},remove(){}}, textContent:'', innerHTML:'', querySelector(){ return fakeEl(); }, querySelectorAll(){ return []; }, getContext: undefined };
}

const sandbox = {
  navigator: { language: 'en-US', languages: ['en-US'] },
  location: { protocol:'file:', pathname:'compound-interest-calculator.html', origin:'file://', search:'' },
  localStorage: { getItem:()=>null, setItem:()=>{} },
  matchMedia: ()=>({matches:false, addEventListener:()=>{}}),
  console, Intl, setTimeout, clearTimeout, requestAnimationFrame:()=>0,
  URLSearchParams, Blob: function(){}, URL:{ createObjectURL:()=>'', revokeObjectURL(){} },
  document: {
    addEventListener(){}, documentElement:{ setAttribute(){}, getAttribute(){return 'light';} },
    querySelector(){ return fakeEl(); }, querySelectorAll(){ return []; },
    createElementNS(){ return fakeEl(); }, createElement(){ return fakeEl(); }
  },
  Number, Math, isFinite
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

let ok = 0, fail = 0;
function tryRender(name, result){
  const container = fakeEl();
  // make querySelector for .chart-mount return a fake with appendChild working
  sandbox.__render(container, result);
  ok++;
  console.log('render OK:', name);
}
const C = sandbox.__Calc;
const samples = [
  ['compound', C.compound({principal:1000,rate:7,years:20,contrib:200,contribFreq:'monthly',freq:'12'})],
  ['loan', C.loan({loanAmount:20000,loanRate:7,loanYears:5})],
  ['mortgage', C.mortgage({price:350000,downPct:20,rate:6.5,years:30,tax:3600,insure:1200,hoa:0})],
  ['retirement', C.retirement({startAge:30,retireAge:65,current:10000,monthly:400,rate:7})],
  ['roi', C.roi({cost:5000,gain:7500,years:3})],
  ['bmi', C.bmi({bmiUnits:'metric',height:175,weight:70})],
  ['calorie', C.calorie({calUnits:'metric',sex:'male',age:30,height:175,weight:70,activity:1.55})],
  ['savings', C.savings({goal:20000,have:2000,months:36,savRate:4})],
  ['creditcard', C.creditcard({balance:5000,apr:22,payment:200})],
  ['units', C.units({cat:'length',value:100,from:'m',to:'ft'})]
];
for (const [n, r] of samples){
  try { tryRender(n, r); } catch(e){ fail++; console.log('render FAIL:', n, e.message); }
}
console.log(`\nRender: ${ok} ok, ${fail} fail`);