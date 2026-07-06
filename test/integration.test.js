const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('js/integrations.js', 'utf8');

const fakeEl = () => ({
  _a:{}, _children:[], style:{}, classList:{add(){},contains(){return false;}},
  setAttribute(k,v){ this._a[k]=v; },
  getAttribute(k){ return this._a[k]; },
  appendChild(c){ this._children.push(c); return c; },
  insertAdjacentElement(pos, el){ this._children.push(el); return el; },
  addEventListener(){}, textContent:'', innerHTML:'',
  querySelectorAll(){ return []; },
  querySelector(){ return null; },
  previousElementSibling:null,
  closest(){ return null; }
});

const fakeAnchor = () => {
  const a = fakeEl();
  a.href = '';
  a.dataset = { affil: 'finance' };
  return a;
};

const sandbox = {
  document: {
    addEventListener(ev, cb){ if (ev==='DOMContentLoaded') setTimeout(cb, 0); },
    createElement: () => fakeEl(),
    head: { appendChild(){} },
    body: { appendChild(){} },
    querySelectorAll: () => [ fakeAnchor(), fakeAnchor() ],
  },
  window: {},
  console, setTimeout, clearTimeout,
  location: { protocol:'file:' },
  URL: function(href){ this.href=href; this.hostname='example.com'; this.searchParams={ has:()=>false, set(){} }; },
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
setTimeout(() => {
  // fake DOMContentLoaded handler captured via setTimeout(0); we invoked them but our document.querySelectorAll returns anchors
  // The format function was registered to run on DOMContentLoaded; let's confirm it would do nothing harmful.
  console.log('integration script loaded without error');
}, 50);