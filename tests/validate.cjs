const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const stub={innerHTML:'',setAttribute(){},classList:{toggle(){}}};
const context={window:{addEventListener(){}},document:{documentElement:{dataset:{theme:'light'}},querySelector(){return stub},querySelectorAll(){return[]},addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},matchMedia(){return{matches:false}},location:{hash:''},console,katex:require(path.join(root,'dist/katex/katex.js'))};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'dist/content.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'dist/extra-content.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'dist/extra-labs.js'),'utf8'),context);
context.LESSONS=context.window.LESSONS;
context.TOPICS=context.window.TOPICS;
vm.runInContext(fs.readFileSync(path.join(root,'dist/app.js'),'utf8').replace(/route\(\);\s*$/,''),context);
assert.equal(context.LESSONS.length,23);
assert.equal(new Set(context.LESSONS.map(l=>l.id)).size,23);
assert.equal(context.LESSONS.filter(l=>l.subject==='matematica').length,15);
assert.equal(context.LESSONS.filter(l=>l.subject==='fisica').length,8);
assert.equal(context.TOPICS.length,4);
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
for(const l of context.LESSONS){assert(configs[l.widget],l.id+' missing lab');assert(context.TOPICS.some(t=>t.id===l.group&&t.subject===l.subject),l.id+' wrong topic');}
for(const[type,c]of Object.entries(configs)){
 const base=Object.fromEntries(c.controls.map(x=>[x[0],x[5]]));
 for(const control of c.controls)assert(control[5]>=control[2]&&control[5]<=control[3],type+' initial range');
 const cases=[base];
 for(const[k,label,min,max]of c.controls){for(const value of [min,max,0]){if(value>=min&&value<=max)cases.push({...base,[k]:value})}}
 if(type==='implicit')cases.push({a:0,b:0,c:0},{a:0,b:0,c:2});
 if(type==='two'||type==='slope')cases.push({x1:1,y1:2,x2:1,y2:2},{x1:1,y1:2,x2:1,y2:3});
 if(type==='intersection')cases.push({m1:1,q1:2,m2:1,q2:2},{m1:1,q1:2,m2:1,q2:3});
 if(type==='quadratic')cases.push({a:0,b:0,c:0},{a:0,b:0,c:1},{a:1,b:2,c:1},{a:1,b:0,c:1});
 if(type==='balance')cases.push({a:0,b:2,c:2},{a:0,b:2,c:3});
 if(type==='parametric')cases.push({u:0,v:0,t:1});
 for(const z of cases){context.testType=type;context.testValues=z;const html=vm.runInContext('drawLab(testType,testValues)',context);assert(!/NaN|Infinity|katex-error/.test(html),type+' invalid output');assert(html.includes('lab-result'));widgets++}
}
assert.equal(vm.runInContext("search('due punti')[0].id",context),'due-punti');
assert.equal(vm.runInContext("search('inesistentezxyz').length",context),0);
assert.equal(vm.runInContext("search('secondo principio')[0].id",context),'newton-2');
assert(vm.runInContext("drawLab('two',{x1:2,y1:1,x2:2,y2:3})",context).includes('verticale'));
assert(vm.runInContext("drawLab('two',{x1:2,y1:1,x2:2,y2:1})",context).includes('coincidono'));
assert(vm.runInContext("drawLab('slope',{x1:0,y1:0,x2:2,y2:4})",context).includes('\\frac'));
assert.equal(vm.runInContext("search('caduta libera')[0].id",context),'caduta-libera');
assert.equal(vm.runInContext("search('frazioni')[0].id",context),'frazioni');
assert.equal(vm.runInContext("realRoots(0,0,0).kind",context),'all');
assert.equal(vm.runInContext("realRoots(0,0,1).kind",context),'none');
assert.equal(vm.runInContext("realRoots(1,2,1).kind",context),'double');
assert.equal(vm.runInContext("realRoots(1,0,1).kind",context),'none');
assert.equal(vm.runInContext("realRoots(2,-5,2).roots.join(',')",context),'0.5,2');
assert(vm.runInContext("drawExtraLab('powers',{base:0,exponent:-1})",context).includes('non definita'));
assert(vm.runInContext("drawExtraLab('fall',{h:20,v0:0,progress:100})",context).includes('y ≈ 0 m'));
assert(vm.runInContext("home()",context).includes('23 capitoli'));
assert(vm.runInContext("home()",context).includes('di tanto in tanto'));
assert(vm.runInContext("catalog('fisica')",context).includes('caduta-libera'));
assert(vm.runInContext("catalog('matematica','fondamenti')",context).includes('equazioni-secondo-grado'));
assert(!vm.runInContext("lesson(LESSONS.find(l=>l.id==='frazioni'))",context).includes('newton-1'));
const css=fs.readFileSync(path.join(root,'dist/katex/katex.min.css'),'utf8');
for(const m of css.matchAll(/url\(([^)]+)\)/g))assert(fs.existsSync(path.join(root,'dist/katex',m[1].replace(/['"]/g,''))),'missing font '+m[1]);
console.log(JSON.stringify({chapters:23,solvedExercises:69,latexFormulas:formulas,widgetCases:widgets,search:'passed',katexFonts:'all present'}));
