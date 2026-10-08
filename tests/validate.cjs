const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const stub={innerHTML:'',setAttribute(){},classList:{toggle(){}}};
const context={window:{addEventListener(){}},document:{documentElement:{dataset:{theme:'light'}},querySelector(){return stub},querySelectorAll(){return[]},addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},matchMedia(){return{matches:false}},location:{hash:''},console,katex:require(path.join(root,'dist/katex/katex.js'))};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'dist/content.js'),'utf8'),context);
context.LESSONS=context.window.LESSONS;
vm.runInContext(fs.readFileSync(path.join(root,'dist/app.js'),'utf8').replace(/route\(\);\s*$/,''),context);
assert.equal(context.LESSONS.length,13);
assert.equal(new Set(context.LESSONS.map(l=>l.id)).size,13);
let formulas=0;
for(const l of context.LESSONS){
  assert.equal(l.exercises.length,3);assert.equal(l.sections.length,4);
  assert.deepEqual(l.exercises.map(e=>e.level),['base','intermedio','avanzato']);
  const html=l.sections.map(s=>s.html).join('')+l.exercises.map(e=>e.question+e.solution).join('')+l.check.question;
  for(const m of html.matchAll(/\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g)){
    context.katex.renderToString(m[1]??m[2],{throwOnError:true,strict:'ignore'});formulas++;
  }
}
let widgets=0;
const configs=vm.runInContext('cfg',context);
for(const[type,c]of Object.entries(configs)){
 const base=Object.fromEntries(c.controls.map(x=>[x[0],x[5]]));
 for(const control of c.controls)assert(control[5]>=control[2]&&control[5]<=control[3],type+' initial range');
 const cases=[base];
 for(const[k,label,min,max]of c.controls){for(const value of [min,max,0]){if(value>=min&&value<=max)cases.push({...base,[k]:value})}}
 if(type==='implicit')cases.push({a:0,b:0,c:0},{a:0,b:0,c:2});
 if(type==='two'||type==='slope')cases.push({x1:1,y1:2,x2:1,y2:2},{x1:1,y1:2,x2:1,y2:3});
 if(type==='intersection')cases.push({m1:1,q1:2,m2:1,q2:2},{m1:1,q1:2,m2:1,q2:3});
 if(type==='parametric')cases.push({u:0,v:0,t:1});
 for(const z of cases){context.testType=type;context.testValues=z;const html=vm.runInContext('drawLab(testType,testValues)',context);assert(!/NaN|Infinity|katex-error/.test(html),type+' invalid output');assert(html.includes('lab-result'));widgets++}
}
assert.equal(vm.runInContext("search('due punti')[0].id",context),'due-punti');
assert.equal(vm.runInContext("search('inesistentezxyz').length",context),0);
assert.equal(vm.runInContext("search('secondo principio')[0].id",context),'newton-2');
assert(vm.runInContext("drawLab('two',{x1:2,y1:1,x2:2,y2:3})",context).includes('verticale'));
assert(vm.runInContext("drawLab('two',{x1:2,y1:1,x2:2,y2:1})",context).includes('coincidono'));
assert(vm.runInContext("drawLab('slope',{x1:0,y1:0,x2:2,y2:4})",context).includes('\\frac'));
const css=fs.readFileSync(path.join(root,'dist/katex/katex.min.css'),'utf8');
for(const m of css.matchAll(/url\(([^)]+)\)/g))assert(fs.existsSync(path.join(root,'dist/katex',m[1].replace(/['"]/g,''))),'missing font '+m[1]);
console.log(JSON.stringify({chapters:13,solvedExercises:39,latexFormulas:formulas,widgetCases:widgets,search:'passed',katexFonts:'all present'}));
