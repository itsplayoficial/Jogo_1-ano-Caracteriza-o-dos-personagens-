import * as THREE from 'three';

let renderer,world,camera,model,stage,turn=0,frame=0,lastCharacter='',lastOutfit='';
const materials=new Map();
function mat(color,roughness=.46,metalness=.05){const k=color+'|'+roughness+'|'+metalness;if(!materials.has(k))materials.set(k,new THREE.MeshStandardMaterial({color,roughness,metalness}));return materials.get(k)}
function mesh(parent,geometry,color,x=0,y=0,z=0,rough=.46){const m=new THREE.Mesh(geometry,mat(color,rough));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function rectShape(w,h,r){const s=new THREE.Shape(),x=-w/2,y=-h/2;r=Math.min(r,w/2,h/2);s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
function box(p,w,h,d,color,x,y,z,r=.10){let b=Math.min(r,d*.25,w*.12,h*.12);const g=new THREE.ExtrudeGeometry(rectShape(w-2*b,h-2*b,r),{depth:d-2*b,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:3,steps:1,curveSegments:10});g.translate(0,0,-d/2+b);return mesh(p,g,color,x,y,z)}
function sphere(p,r,color,x,y,z,sx=1,sy=1,sz=1){const m=mesh(p,new THREE.SphereGeometry(r,24,16),color,x,y,z);m.scale.set(sx,sy,sz);return m}
function cyl(p,rt,rb,h,color,x,y,z){return mesh(p,new THREE.CylinderGeometry(rt,rb,h,32),color,x,y,z)}
function tube(p,pts,color,r=.04){return mesh(p,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(v=>new THREE.Vector3(...v))),32,r,8,false),color)}
function bar(p,a,b,r,color){let av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av),m=cyl(p,r,r,delta.length(),color,...av.clone().add(bv).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m}
function poly(p,points,depth,color,x,y,z){const s=new THREE.Shape();points.forEach((v,i)=>i?s.lineTo(...v):s.moveTo(...v));s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false});g.translate(0,0,-depth/2);return mesh(p,g,color,x,y,z)}
function gear(p,r,x,y,z){const s=new THREE.Shape();for(let i=0;i<48;i++){const a=i*Math.PI*2/48,rr=(i%4===0||i%4===3)?r*.8:r;i?s.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):s.moveTo(rr,0)}s.closePath();const hole=new THREE.Path();hole.absarc(0,0,r*.32,0,Math.PI*2,true);s.holes.push(hole);const g=new THREE.ExtrudeGeometry(s,{depth:.045,bevelEnabled:false});return mesh(p,g,'#ffffff',x,y,z)}
function star(p,r,color,x,y,z){return poly(p,Array.from({length:10},(_,i)=>{let a=Math.PI/2+i*Math.PI/5,rr=i%2?r*.48:r;return[Math.cos(a)*rr,Math.sin(a)*rr]}),.045,color,x,y,z)}
function eyeArc(parent,c,x,z,r=.205,th=.065){const pts=[];for(let n=0;n<=28;n++){let a=n*Math.PI/28;pts.push([Math.cos(a)*r,Math.sin(a)*r-.055])}for(let n=28;n>=0;n--){let a=n*Math.PI/28;pts.push([Math.cos(a)*(r-th),Math.sin(a)*(r-th)-.055])}return poly(parent,pts,.045,c,x,0,z)}
function addRobot(id){const spec={play:{color:'#a4d734',accent:'#329eb5',eyes:'#22657b',head:[1.95,1.40,.63],body:[1.07,.98,.70]},rosy:{color:'#f143ac',accent:'#a12eae',eyes:'#88418d',head:[1.95,1.40,.65],body:[1.08,.90,.68]},enzo:{color:'#ffe400',accent:'#78830d',eyes:'#777600',head:[1.92,1.48,.72],body:[1.13,1.03,.73]},helena:{color:'#02b5ee',accent:'#f5ba24',eyes:'#f7b019',head:[1.82,1.33,.60],body:[.98,1.02,.67]}}[id];
 const c=spec.color,a=spec.accent;const g=new THREE.Group();model.add(g);const bodyY=1.72,headY=3.20,bw=spec.body[0],bh=spec.body[1],bd=spec.body[2];
 box(g,bw,bh,bd,id==='helena'?'#ded6fa':c,0,bodyY,0,.17);cyl(g,.115,.115,.34,c,0,2.36,0);if(id==='helena')cyl(g,.116,.116,.07,'#f4bd2a',0,2.40,0);const head=new THREE.Group();head.position.y=headY;g.add(head);if(id==='play')head.rotation.z=.07;box(head,...spec.head,c,0,0,0,.18);box(head,spec.head[0]-.32,spec.head[1]-.29,.06,'#fffefb',0,0,spec.head[2]/2+.027,.12);
 for(const side of [-1,1]){sphere(head,.18,id==='helena'?c:a,side*(spec.head[0]/2+.06),-.03,0,.72,1,1);const ez=spec.head[2]/2+.083;eyeArc(head,spec.eyes,side*.37,ez,id==='play'?.22:.205,id==='play'?.080:.061);if(id==='rosy'||id==='helena'){for(let n=0;n<2;n++)tube(head,[[side*(.52+n*.015),.04+n*.032,ez],[side*(.62+n*.035),.09+n*.055,ez],[side*(.63+n*.035),.17+n*.055,ez]],spec.eyes,.035)}if(id==='enzo'){let brow=poly(head,[[-.13,-.03],[.12,.01],[.10,.065],[-.06,.085]],.036,spec.eyes,side*.37,.27,ez);brow.rotation.z=-side*.25;}}
 // One curved antenna, with the official sphere or arrow tip.
 tube(head,[[-.26,spec.head[1]/2-.02,0],[-.25,spec.head[1]/2+.27,0],[-.48,spec.head[1]/2+.50,0]],id==='enzo'?'#e0cf00':c,.055);if(id==='enzo'){poly(head,[[-.16,-.1],[.15,.14],[.13,-.16],[.03,-.09],[-.07,-.21]],.09,a,-.48,spec.head[1]/2+.52,0)}else sphere(head,.15,id==='helena'?c:a,-.48,spec.head[1]/2+.50,0);
 // Original locomotion: Enzo has exactly one wheel.
 if(id==='enzo'){bar(g,[0,1.22,0],[0,.71,0],.08,a);let wheel=cyl(g,.29,.29,.23,a,0,.35,0);wheel.rotation.x=Math.PI/2;let hub=cyl(g,.12,.12,.25,c,0,.35,0);hub.rotation.x=Math.PI/2;bar(g,[0,.76,0],[.1,.65,0],.08,a)}else for(const side of [-1,1]){bar(g,[side*.25,1.22,0],[side*.31,.66,0],.07,c);sphere(g,.18,id==='rosy'?a:id==='helena'?'#ded6fa':c,side*.34,.31,.10,1.18,.85,1.5);bar(g,[side*.31,.66,0],[side*.34,.41,.10],.075,c)}
 for(const side of [-1,1]){sphere(g,.17,id==='play'?c:a,side*(bw/2+.03),1.99,0);const elbow=[side*.86,1.62,.04],hand=[side*1.00,1.34,.10];bar(g,[side*(bw/2+.04),1.94,0],elbow,.083,c);bar(g,elbow,hand,.083,c);tube(g,[[hand[0]+side*.10,hand[1]+.04,.12],[hand[0]+side*.06,hand[1]-.12,.12],[hand[0]-side*.07,hand[1]-.1,.12],[hand[0]-side*.09,hand[1]+.02,.12]],id==='helena'?'#ded6fa':c,.078)}
 const defaultSkirt=new THREE.Group();g.add(defaultSkirt);if(id==='rosy'){cyl(defaultSkirt,.5,.69,.38,c,0,1.14,0);for(let j=0;j<14;j++){let t=j*2*Math.PI/14;bar(defaultSkirt,[Math.cos(t)*.5,1.34,Math.sin(t)*.5],[Math.cos(t)*.67,.96,Math.sin(t)*.67],.012,a)}const heart=poly(g,[[0,-.25],[-.28,.02],[-.28,.18],[-.13,.27],[0,.15],[.13,.27],[.28,.18],[.28,.02]],.025,a,0,1.77,bd/2+.02);}
 if(id==='helena'){poly(g,[[-.14,.54],[.14,.54],[.22,-.40],[-.22,-.40]],.03,c,0,bodyY,bd/2+.02);star(g,.32,'#f2b451',0,1.86,bd/2+.015);star(g,.22,'#f4e9fa',0,1.86,bd/2+.044);cyl(defaultSkirt,.49,.68,.34,'#ded6fa',0,1.08,0);for(let n=0;n<12;n++){let a=n*Math.PI/6;bar(defaultSkirt,[Math.sin(a)*.49,1.25,Math.cos(a)*.49],[Math.sin(a)*.68,.91,Math.cos(a)*.68],.015,'#efbc37')}}else{gear(g,.15,-.19,1.87,bd/2+.04);gear(g,.15,.18,1.82,bd/2+.04);gear(g,.15,0,1.57,bd/2+.04)}
 // Rear shell seams and charging port: visible as the model turns.
 box(g,.31,.14,.025,a,0,bodyY,-bd/2-.019,.025);for(let n=0;n<3;n++)box(g,.05,.07,.02,'#e1efe7',-.09+n*.09,bodyY,-bd/2-.037,.007);
 return {id,group:g,head,bodyY,headY,bw,bh,bd,spec,defaultSkirt};
}
function dressBody(r,i){const g=r.group,c=i.color,bw=r.bw,bh=r.bh,bd=r.bd,y=r.bodyY;const girls=['rosy','helena'].includes(r.id);r.defaultSkirt.visible=false;
 const dressTypes=['partyDress','starDress','sunDress','uniformSkirt','summerSet','sportSkirt'];
 const white=['uniformSkirt','uniformPants','partyShirt','suit'].includes(i.type);
 const top=(white||['schoolShort','pinafore','overalls','waistcoat','suspenders'].includes(i.style))?'#fff9ef':c;const bottom=c;
 // Close-fitting torso shell, with a clearly different cut for each garment.
 box(g,bw+.12,bh+.06,bd+.18,top,0,y,0,.17);
 const z=bd/2+.12;
 if(r.id==='helena'){star(g,.22,'#e5b54f',0,y+.10,z);star(g,.14,'#f9f5e9',0,y+.10,z+.025)}else{gear(g,.105,-.13,y+.15,z);gear(g,.105,.13,y+.13,z);gear(g,.105,0,y-.09,z)}
 const noSleeves=['partyDress','starDress','sunDress','summerSet','jumpsuit'].includes(i.type)||i.style==='basketball';
 for(let side of [-1,1]){if(!noSleeves){const long=['longCoat','puffer','knit','tracksuit','raincoat','rainJacket','suit'].includes(i.type);let sleeve=box(g,.28,long?.70:.31,.34,top,side*(long?.76:bw/2+.12),long?1.70:y+.29,.02,.10);sleeve.rotation.z=side*.39;if(i.type==='tracksuit'){bar(g,[side*.7,1.97,.205],[side*.9,1.40,.205],.017,'#fff9e9')}}else{box(g,.12,.26,.14,top,side*bw*.36,y+bh*.48,.19,.025)}}
 if(dressTypes.includes(i.type)){
  const festive=['partyDress','starDress'].includes(i.type);const radius=bw*.54,hem=i.style==='ballgown'?.94:i.style==='tulle'?.95:festive?.85:.69,length=i.style==='ballgown'?.88:festive?.68:.47,center=1.22-length/2;
  cyl(g,radius,hem,length,bottom,0,center,0);
  const trim=cyl(g,radius+.02,radius+.02,.075,festive?'#efcd83':'#f4f1e6',0,1.25,0);trim.scale.z=1.01;
  for(let n=0;n<16;n++){let a=n*Math.PI/8;bar(g,[Math.cos(a)*(radius+.005),1.20,Math.sin(a)*(radius+.005)],[Math.cos(a)*(hem+.009),center-length/2+.035,Math.sin(a)*(hem+.009)],.009,festive?'#f5bbd3':'#c2d2ea')}
  if(festive){poly(g,[[-.17,-.09],[-.17,.09],[0,0],[.17,.09],[.17,-.09],[0,0]],.07,'#efcd83',0,1.26,bd/2+.13);sphere(g,.045,'#fce2a6',0,1.26,bd/2+.17)}
  if(i.type==='starDress'){for(let n=0;n<9;n++){let a=n*2*Math.PI/9;const st=star(g,.065,'#f5d888',Math.sin(a)*.75,.83,Math.cos(a)*.75);st.rotation.y=a;}}
  if(i.type==='sunDress'){for(const x of [-.32,.32]){sphere(g,.045,'#fff8d4',x,.91,.65);for(let n=0;n<5;n++)sphere(g,.037,'#ef85a1',x+Math.sin(n*2*Math.PI/5)*.07,.91+Math.cos(n*2*Math.PI/5)*.07,.652)}}
 }
 else if(['longCoat','puffer','raincoat','poncho'].includes(i.type)){
  const length=i.type==='longCoat'?.65:.34;
  if(i.type==='poncho'){cyl(g,bw*.30,bw*.85,1.1,c,0,1.65,0);bar(g,[0,2.16,.40],[0,1.17,.80],.018,'#e7fbf4')}
  else{cyl(g,bw*.55,bw*.67,length,c,0,1.24-length/2,0);bar(g,[0,2.15,z+.06],[0,1.22-length+.03,bd*.60+.06],.017,'#fae9d1');for(let n=0;n<4;n++)sphere(g,.023,'#fff0cd',.09,2.04-n*.21,z+.07)}
  if(i.type==='puffer'){for(let n=0;n<4;n++){let ring=mesh(g,new THREE.TorusGeometry(bw*.5,.014,8,32), '#c4ddf2',0,2.04-n*.21,0);ring.rotation.x=Math.PI/2;ring.scale.z=(bd+.20)/(bw+.13)}}
  if(i.type==='raincoat'){tube(g,[[-bw*.40,2.18,-.30],[-bw*.38,2.36,-.21],[0,2.43,-.34],[bw*.38,2.36,-.21],[bw*.4,2.18,-.3]],'#fbe36c',.10)}
  if(i.type==='longCoat'){for(const side of [-1,1]){let lapel=box(g,.14,.32,.045,'#eee0dc',side*.2,2.05,z+.06,.025);lapel.rotation.z=side*.43;box(g,.22,.12,.04,'#ede0dc',side*.36,1.24,.49,.018)}}
 }
 else{
  const shorts=['shorts','sportShorts'].includes(i.type);const pants=['uniformPants','jumpsuit','knit','tracksuit','suit','partyShirt','polo','shorts','sportShorts','rainJacket'].includes(i.type);
  if(pants&&r.id!=='enzo'){for(let side of [-1,1]){box(g,i.style==='wideleg'?.40:.29,shorts?(i.style==='basketball'?.46:.35):.76,.32,bottom,side*.29,shorts?1.05:.84,0,.065);if(['tracksuit','sportShorts'].includes(i.type))bar(g,[side*.36,1.19,.18],[side*.36,shorts?.90:.49,.18],.014,'#fff9e9')}}
  if(r.id==='enzo'){box(g,bw+.12,.16,bd+.18,bottom,0,1.23,0,.03)}
 }
 if(['uniformPants','uniformSkirt','polo','partyShirt','suit'].includes(i.type)){for(let side of [-1,1]){let collar=poly(g,[[-.12,.09],[.12,.09],[.04,-.10]],.025,i.type==='polo'?'#fff9ef':c,side*.19,2.14,z+.015);collar.rotation.z=-side*.25;}for(let n=0;n<3;n++)sphere(g,.014,'#b2b9bf',0,1.94-n*.16,z+.025)}
 if(i.type==='suit'){for(let side of [-1,1]){box(g,bw*.28,bh+.13,.06,c,side*bw*.35,y,z+.055,.05);let lapel=box(g,.15,.37,.04,'#637ba5',side*.20,2.03,z+.10,.025);lapel.rotation.z=-side*.35;}poly(g,[[-.06,.12],[.06,.12],[.08,-.14],[0,-.20],[-.08,-.14]],.03,'#e5bd67',0,2.05,z+.12)}
 if(i.type==='partyShirt'){poly(g,[[-.16,-.08],[-.16,.08],[0,0],[.16,.08],[.16,-.08],[0,0]],.07,'#c6799f',0,2.17,z+.06)}
 if(i.type==='rainJacket'){for(let side of [-1,1]){let collar=box(g,.18,.25,.05,'#e9f0df',side*.18,2.09,z+.035,.02);collar.rotation.z=side*.35;}bar(g,[0,2.15,z+.03],[0,1.30,z+.03],.016,'#f3eacc');box(g,bw+.10,.08,bd+.17,c,0,1.25,0,.025);tube(g,[[-.40,2.20,-.25],[-.25,2.39,-.27],[0,2.42,-.32],[.25,2.39,-.27],[.40,2.20,-.25]],c,.08);}
 if(i.type==='knit'){for(let n=0;n<6;n++)bar(g,[-.4,2.06-n*.12,z+.02],[.4,2.06-n*.12,z+.02],.006,'#f4bd96')}
}
function dress(r,items){for(const i of items){extraModels(r,i);let c=i.color,g=r.group,bw=r.bw,bh=r.bh,bd=r.bd,y=r.bodyY;
 if(i.slot==='body'){dressBody(r,i);customizeGarment(r,i);}
 if(i.slot==='head'){
  const h=r.head,top=r.spec.head[1]/2;
  if(i.type==='cap'||i.type==='visor'){if(i.type==='cap'){let dome=mesh(h,new THREE.SphereGeometry(.72,32,20,0,Math.PI*2,0,Math.PI/2),c,0,top+.025,0);dome.scale.set(1.22,.32,.70)}let band=cyl(h,.80,.80,.08,c,0,top+.055,0);band.scale.z=.56;box(h,1.12,.06,.65,c,.18,top+.07,.49,.05);}
  if(i.type==='wool'){let dome=mesh(h,new THREE.SphereGeometry(.78,32,20,0,Math.PI*2,0,Math.PI/2),c,0,top,0);dome.scale.set(1.18,.36,.61);let band=cyl(h,.82,.82,.16,'#a5a4f1',0,top+.02,0);band.scale.z=.57;sphere(h,.1,'#f6d373',.2,top+.31,0);}
  if(i.type==='partyhat'){let cone=cyl(h,0,.36,.72,c,.33,top+.36,0);star(h,.10,'#ffdc69',.30,top+.42,.29);sphere(h,.065,'#ffdc69',.33,top+.74,0)}
 }
 if(['tiara','hairbow','sunhat','rainhat','sportsband'].includes(i.type)){
  const h=r.head,top=r.spec.head[1]/2,z=r.spec.head[2]/2+.09;
  if(i.type==='tiara'){tube(h,[[-.8,top-.08,.1],[-.54,top+.03,.25],[0,top+.1,.34],[.54,top+.03,.25],[.8,top-.08,.1]],c,.028);for(let n=0;n<5;n++){let x=(n-2)*.19,height=.18+(2-Math.abs(n-2))*.07;poly(h,[[-.09,0],[0,height],[.09,0]],.06,c,x,top+.035,.28);sphere(h,.037,'#ed85b6',x,top+height+.035,.28)}}
  if(i.type==='hairbow'){poly(h,[[-.24,-.16],[-.24,.16],[0,0],[.24,.16],[.24,-.16],[0,0]],.12,c,.61,top-.1,z+.01);sphere(h,.07,'#f9d6e4',.61,top-.1,z+.08)}
  if(i.type==='sunhat'||i.type==='rainhat'){let brim=cyl(h,1.03,1.03,.06,c,0,top+.05,0);brim.scale.z=.64;let crown=cyl(h,.57,.75,.23,c,0,top+.16,0);crown.scale.z=.59;let band=cyl(h,.73,.73,.06,i.type==='sunhat'?'#d783aa':'#fff0a5',0,top+.11,0);band.scale.z=.6;}
  if(i.type==='sportsband'){box(h,1.7,.14,.04,c,0,top-.09,z,.025);for(let side of [-1,1])box(h,.07,.14,.45,c,side*.9,top-.09,0,.02)}
 }
 if(i.type==='handbag'){box(g,.41,.28,.19,c,1.06,1.14,.19,.065);tube(g,[[.94,1.28,.19],[.94,1.45,.19],[1.15,1.45,.19],[1.17,1.28,.19]],'#e8c575',.024);sphere(g,.024,'#edca70',1.06,1.14,.30)}
 if(i.type==='pearls'){for(let n=0;n<18;n++){let a=n*Math.PI*2/18;sphere(g,.026,c,Math.cos(a)*.29,2.24-Math.sin(a)*.06,Math.sin(a)*.30+.02)}sphere(g,.065,'#edc575',0,2.12,.38)}
 if(i.type==='earrings'){for(let side of [-1,1]){tube(r.head,[[side*1.00,-.16,0],[side*1.00,-.28,.05],[side*1.0,-.35,.08]],c,.013);star(r.head,.085,c,side*1.00,-.41,.08)}}
 if(i.type==='bag'){box(g,.70,.75,.35,c,0,y,-bd/2-.22,.12);box(g,.48,.26,.09,'#ffd779',0,y-.18,-bd/2-.45,.045);tube(g,[[-.23,y+.40,-bd/2-.23],[-.20,y+.53,-bd/2-.22],[.20,y+.53,-bd/2-.22],[.23,y+.40,-bd/2-.23]],c,.04);for(let side of [-1,1]){tube(g,[[side*.38,y+.43,-bd/2-.08],[side*.46,y+.49,0],[side*.39,y+.38,bd/2+.10],[side*.39,y-.32,bd/2+.1],[side*.45,y-.36,0],[side*.38,y-.3,-bd/2-.08]],'#334478',.027)}}
 if(i.type==='bottle'){cyl(g,.095,.095,i.style==='thermal'?.46:.38,c,1.06,1.17,.20);if(i.style==='thermal')tube(g,[[1.14,1.36,.20],[1.23,1.35,.20],[1.23,1.11,.20],[1.14,1.10,.20]],'#e8ddcb',.019);cyl(g,.074,.074,.06,'#3b6b75',1.06,1.39,.20);cyl(g,.096,.096,.12,'#d8fff3',1.06,1.19,.20)}
 if(i.type==='scarf'){let scarf=mesh(g,new THREE.TorusGeometry(.23,.075,10,28),c,0,2.33,0);scarf.rotation.x=Math.PI/2;box(g,.19,.46,.09,c,.25,2.05,.42,.04);for(let j=0;j<4;j++)bar(g,[.19+j*.04,1.84,.43],[.19+j*.04,1.76,.43],.011,'#ffd987')}
 if(i.type==='bow'){poly(g,[[-.21,-.13],[-.21,.13],[0,0],[.21,.13],[.21,-.13],[0,0]],.08,c,0,2.18,bd/2+.15);sphere(g,.065,'#ffd580',0,2.18,bd/2+.20)}
 if(i.type==='glasses'){const h=r.head,z=r.spec.head[2]/2+.13;for(let side of [-1,1]){box(h,.56,.31,.05,'#273d65',side*.39,-.05,z,.10);box(h,.42,.21,.015,'#829eca',side*.39,-.04,z+.035,.065);tube(h,[[side*.64,.02,z],[side*.83,.06,.23],[side*.91,.04,-.11]],c,.024)}bar(h,[-.10,.025,z],[.10,.025,z],.035,c)}
 if(i.type==='umbrella'){const u=new THREE.Group();g.add(u);u.position.set(1.2,1.14,.16);bar(u,[0,0,0],[0,1.5,0],.025,'#d6dded');tube(u,[[0,.05,0],[0,-.10,0],[-.12,-.15,0],[-.20,-.08,0]],'#525071',.026);let canopy=mesh(u,new THREE.SphereGeometry(.64,32,16,0,Math.PI*2,0,Math.PI/2),c,0,1.42,0);canopy.scale.y=.38;if(i.style==='rainbowumbrella'){for(let n=0;n<8;n++){let panel=mesh(u,new THREE.SphereGeometry(.645,8,12,n*Math.PI/4,Math.PI/4,0,Math.PI/2),['#df929f','#e5b85d','#7db5a0','#829dd0'][n%4],0,1.42,0);panel.scale.y=.38;}}for(let n=0;n<8;n++){let t=n*Math.PI/4;bar(u,[0,1.65,0],[Math.cos(t)*.63,1.42,Math.sin(t)*.63],.009,'#d7c6f8')};}
}}
function flower3D(g,x,y,z,size=.06){for(let n=0;n<5;n++)sphere(g,size,'#fff4e4',x+Math.sin(n*Math.PI*2/5)*size,y+Math.cos(n*Math.PI*2/5)*size,z,1,1,.4);sphere(g,size*.55,'#efc25d',x,y,z+.018,1,1,.45)}
function customizeGarment(r,i){if(!i.style)return;const g=r.group,c=i.color,bw=r.bw,z=r.bd/2+.15,y=r.bodyY,st=i.style;
 const pocket=(x,py,pz=z)=>{box(g,.23,.20,.05,c,x,py,pz,.035);bar(g,[x-.10,py+.08,pz+.028],[x+.10,py+.08,pz+.028],.012,'#f3e4ce')};
 if(['ruffles','tulle','ballgown'].includes(st)){let levels=st==='ruffles'?3:2;for(let n=0;n<levels;n++){let py=1.12-n*(st==='ballgown'?.30:.22),rad=.65+n*.14;let m=cyl(g,rad-.07,rad+.08,.21,n%2?'#f5d8cf':c,0,py-.09,0);if(st==='tulle'){m.material=mat('#cfb7e8');}let edge=mesh(g,new THREE.TorusGeometry(rad+.08,.017,8,48),'#fff3df',0,py-.195,0);edge.rotation.x=Math.PI/2;}for(let side of [-1,1])sphere(g,.16,c,side*(bw/2+.07),2.09,0,1.0,.72,1.25);}
 if(['flowers','daisies'].includes(st)){for(let n=0;n<5;n++){let a=(n-2)*.43;flower3D(g,Math.sin(a)*.72,.86,Math.cos(a)*.72+.018,.05)}flower3D(g,.31,y+.16,z,.035);}
 if(['pleats','tennis'].includes(st)){for(let n=0;n<20;n++){let a=n*Math.PI/10;bar(g,[Math.sin(a)*.57,1.2,Math.cos(a)*.57],[Math.sin(a)*.70,.76,Math.cos(a)*.70],.018,c)}if(st==='tennis')for(let side of [-1,1])poly(g,[[-.10,.04],[.12,.04],[.05,-.13]],.035,'#fff6e6',side*.18,2.13,z);}
 if(['pinafore','overalls','suspenders'].includes(st)){for(let side of [-1,1]){bar(g,[side*bw*.33,2.17,z],[side*bw*.27,1.30,z],.045,c);bar(g,[side*bw*.33,2.17,-z],[side*bw*.27,1.30,-z],.045,c);sphere(g,.027,'#f2d391',side*bw*.27,1.7,z+.05)}if(st!=='suspenders'){box(g,.54,.46,.06,c,0,1.55,z+.027,.05);pocket(0,1.53,z+.07)}}
 if(['vest','waistcoat','cardigan'].includes(st)){for(let side of [-1,1]){box(g,bw*.38,.78,.06,c,side*bw*.28,y,z+.03,.07);bar(g,[side*.07,2.10,z+.07],[side*.08,1.31,z+.07],.018,'#f8e7d2');pocket(side*.31,1.47,z+.08)}for(let n=0;n<3;n++)sphere(g,.026,'#ebc585',0,1.79-n*.16,z+.07)}
 if(st==='tuxedo'){for(let side of [-1,1]){let lapel=poly(g,[[-.10,.22],[.14,.15],[.02,-.17]],.035,'#fff4df',side*.20,2.0,z+.13);lapel.rotation.z=-side*.35;}poly(g,[[-.14,-.06],[-.14,.06],[0,0],[.14,.06],[.14,-.06],[0,0]],.055,c,0,2.15,z+.16);}
 if(st==='wideleg'){poly(g,[[-.18,-.08],[-.18,.08],[0,0],[.18,.08],[.18,-.08],[0,0]],.055,'#fff1dd',0,1.30,z+.04)}
 if(['pockets','parka','duffle','zipper'].includes(st)){pocket(-.33,1.47);pocket(.33,1.47);if(st==='duffle')for(let n=0;n<3;n++)bar(g,[-.12,2.03-n*.20,z+.07],[.12,2.03-n*.20,z+.07],.025,'#77513c');if(st==='parka')tube(g,[[-.48,2.20,-.25],[-.34,2.42,-.18],[0,2.46,-.24],[.34,2.42,-.18],[.48,2.20,-.25]],'#e8dec8',.095);if(st==='zipper')bar(g,[0,2.15,z+.03],[0,1.28,z+.03],.014,'#f9ebde')}
 if(st==='cable'){cyl(g,.26,.26,.20,c,0,2.28,0);for(let side of [-1,1])tube(g,Array.from({length:19},(_,n)=>[side*.22+Math.sin(n*.8)*.035,2.10-n*.043,z+.03]),'#f1dfe9',.014)}
 if(st==='quilt'){for(let n=-2;n<3;n++){bar(g,[-.42,1.40+n*.14,z+.02],[.42,2.04+n*.14,z+.02],.008,'#b4dcd9');bar(g,[-.42,2.04+n*.14,z+.02],[.42,1.40+n*.14,z+.02],.008,'#b4dcd9')}}
 if(['stripes','sailor','gingham'].includes(st)){for(let n=0;n<5;n++)bar(g,[-.44,2.08-n*.13,z+.02],[.44,2.08-n*.13,z+.02],.014,'#f8eddb');if(st==='gingham')for(let n=-2;n<3;n++)bar(g,[n*.17,2.12,z+.03],[n*.17,1.32,z+.03],.014,'#f8eddb');if(st==='sailor'){poly(g,[[-.39,.10],[0,-.16],[.39,.10]],.03,'#fff6df',0,2.10,z+.06);bar(g,[0,1.96,z+.10],[0,1.68,z+.10],.025,c)}}
 if(['clouds','dots'].includes(st)){for(let n=0;n<5;n++){let py=1.60-(n%2)*.20,x=(n-2)*.19,pz=Math.sqrt(Math.max(.1,.64*.64-x*x))+.11;if(st==='dots')sphere(g,.045,'#fff6e6',x,py,pz,1,1,.3);else{for(let j=-1;j<2;j++)sphere(g,.065,'#f3f6f5',x+j*.045,py+(j===0?.025:0),pz,1,.7,.25)}}}
 if(['football','basketball'].includes(st)){box(g,.11,.37,.025,'#fff6e8',.07,1.80,z+.02,.012);box(g,.30,.07,.025,'#fff6e8',-.03,1.97,z+.03,.008);for(let side of [-1,1])bar(g,[side*.43,2.1,z],[side*.43,1.29,z],.021,'#fff6e8');}
 if(st==='running')for(let side of [-1,1])bar(g,[side*.30,1.18,.21],[side*.30,.50,.21],.024,'#f5d9a1');
}
function extraModels(r,i){const g=r.group,h=r.head,c=i.color,top=r.spec.head[1]/2,z=r.spec.head[2]/2+.10;
 if(i.type==='beret'){sphere(h,.73,c,.08,top+.12,0,1.25,.24,.64);bar(h,[.12,top+.24,0],[.12,top+.32,0],.035,c);poly(h,[[-.14,-.07],[-.14,.07],[0,0],[.14,.07],[.14,-.07],[0,0]],.06,'#f3cadb',.66,top+.05,z)}
 if(i.type==='crown'){let band=cyl(h,.75,.75,.10,c,0,top+.04,0);band.scale.z=.55;for(let n=0;n<8;n++){let a=n*Math.PI/4;const t=poly(h,[[-.12,0],[0,.26],[.12,0]],.04,c,Math.sin(a)*.72,top+.07,Math.cos(a)*.41);t.rotation.y=a;sphere(h,.038,'#8db6d0',Math.sin(a)*.72,top+.21,Math.cos(a)*.42)}}
 if(i.type==='flowerband'){tube(h,[[-.84,top-.12,0],[-.65,top+.10,.2],[0,top+.16,.3],[.65,top+.10,.2],[.84,top-.12,0]],c,.025);for(let n=-2;n<3;n++)flower3D(h,n*.23,top+.16-Math.abs(n)*.03,.30,.055)}
 if(i.type==='earmuffs'){tube(h,[[-1.06,0,0],[-1.08,top+.06,0],[0,top+.13,-.08],[1.08,top+.06,0],[1.06,0,0]],c,.045);for(let side of [-1,1])sphere(h,.22,c,side*1.08,-.02,0,.60,1,1)}
 if(i.type==='bucket'){const brim=cyl(h,.77,1.0,.18,c,0,top+.025,0);brim.scale.z=.59;const crown=cyl(h,.59,.76,.25,c,0,top+.22,0);crown.scale.z=.60;const stripe=cyl(h,.77,.77,.045,'#fff0d0',0,top+.14,0);stripe.scale.z=.60;}
 if(i.style==='ribbonhat')flower3D(h,.50,top+.15,.49,.055);
 if(i.style==='starcap')star(h,.095,'#ffdc77',0,top+.18,.48);
 if(['satchel','clutch','heartbag'].includes(i.type)){let x=i.type==='satchel'?.68:1.04,py=1.18,pz=.22;if(i.type==='heartbag'){poly(g,[[0,-.20],[-.27,.02],[-.25,.18],[-.10,.22],[0,.12],[.10,.22],[.25,.18],[.27,.02]],.20,c,x,py,pz);tube(g,[[x-.12,py+.18,pz],[x-.10,py+.38,pz],[x+.12,py+.38,pz],[x+.14,py+.18,pz]],'#e4c177',.020)}else{box(g,i.type==='satchel'?.53:.49,.30,.21,c,x,py,pz,.055);box(g,.40,.12,.025,c,x,py+.065,pz+.12,.025);sphere(g,.025,'#edca70',x,py,pz+.14);if(i.type==='satchel')tube(g,[[-.40,2.18,.40],[0,1.90,.46],[.48,1.60,.47],[.68,1.35,.24]],'#866749',.026)}}
 if(i.type==='necklace'){tube(g,[[-.29,2.26,.13],[-.26,2.19,.32],[0,2.10,.43],[.26,2.19,.32],[.29,2.26,.13]],c,.013);star(g,.092,c,0,2.04,.44)}
 if(i.type==='watch'){let ring=mesh(g,new THREE.TorusGeometry(.079,.025,8,20),c,-.95,1.43,.08);ring.rotation.z=-.38;ring.rotation.x=Math.PI/2;let face=cyl(g,.071,.071,.045,'#fff4dd',-.96,1.43,.18);face.rotation.x=Math.PI/2;bar(g,[-.96,1.43,.205],[-.96,1.48,.205],.006,'#566477')}
 if(i.type==='gloves'){for(let side of [-1,1]){sphere(g,.13,c,side*1.01,1.31,.10,1.05,1.16,.8);sphere(g,.06,c,side*.89,1.34,.15);}}
 if(i.type==='flask'){let flask=cyl(g,.18,.18,.10,c,1.03,1.15,.22);flask.rotation.x=Math.PI/2;cyl(g,.044,.044,.07,'#476655',1.03,1.35,.22);tube(g,[[.88,1.21,.21],[.91,1.40,.21],[1.15,1.40,.21],[1.19,1.21,.21]],'#e6dcc1',.018)}
 if(i.style==='rocketbag'){poly(g,[[0,.20],[-.10,.02],[-.10,-.13],[.10,-.13],[.10,.02]],.03,'#fbf1d8',0,r.bodyY,-r.bd/2-.47);sphere(g,.04,'#78aac5',0,r.bodyY+.03,-r.bd/2-.50,1,1,.2)}
 if(i.style==='flowerbag')flower3D(g,0,r.bodyY-.15,-r.bd/2-.50,.07);
 if(i.style==='checkscarf')for(let n=0;n<4;n++)bar(g,[.16,2.20-n*.10,.48],[.33,2.20-n*.10,.48],.013,'#eee4c8');
}
function makeRoom(){const room=new THREE.Group();world.add(room);box(room,10,.12,9,'#d4b28c',0,-.08,-.4,.02);box(room,10,5.8,.15,'#e4daf2',0,2.8,-2.7,.015);box(room,.15,5.8,8,'#cbe1da',-4.9,2.8,-.5,.015);box(room,9.8,.16,.17,'#fff5eb',0,.12,-2.59,.01);
 // Floorboard seams and a thick woven rug.
 for(let x=-4.5;x<5;x+=.55)box(room,.008,.01,8,'#bb9979',x,.0,-.5,.002);const rug=cyl(room,1.5,1.5,.025,'#b6b0e6',0,.025,.08);rug.scale.set(1.35,1,.87);let rim=cyl(room,1.58,1.58,.015,'#f1e7c8',0,.01,.08);rim.scale.set(1.35,1,.87);
 // Bed with pillow and softly rounded blankets.
 box(room,1.64,.38,2.4,'#e3c9aa',-2.65,.29,-.7,.11);box(room,1.58,.17,2.30,'#fff8ed',-2.65,.56,-.7,.08);box(room,1.5,.11,1.42,'#65bcb9',-2.65,.69,-.25,.065);box(room,1.7,1.04,.13,'#e3c9aa',-2.65,.6,-1.98,.14);box(room,.87,.17,.53,'#fff5d8',-2.65,.72,-1.42,.1);for(let x of [-3.26,-2.04])for(let z of [-1.55,.19])box(room,.11,.3,.11,'#947f6c',x,.12,z,.025);
 // A window with a garden view in the rear wall.
 box(room,1.75,1.92,.12,'#fff8ed',-1.79,3.35,-2.52,.04);box(room,1.56,1.73,.06,'#bce8ed',-1.79,3.35,-2.44,.015);sphere(room,.18,'#ffe498',-1.32,3.85,-2.385,1,1,.10);box(room,1.55,.55,.035,'#91c995',-1.79,2.77,-2.38,.01);box(room,.055,1.80,.10,'#fff8ed',-1.79,3.35,-2.34,.01);box(room,1.60,.055,.10,'#fff8ed',-1.79,3.35,-2.34,.01);for(let x of [-2.78,-.79])box(room,.35,2.14,.14,'#b890cb',x,3.28,-2.34,.045);
 // Open wooden wardrobe with scaled garments on a rail.
 box(room,1.78,3.67,.13,'#ccb194',2.87,1.87,-2.24,.055);for(let x of [1.96,3.78])box(room,.12,3.78,.72,'#d9c0a5',x,1.89,-1.96,.04);for(let y of [.08,3.72,1.24])box(room,1.94,.12,.77,'#decab2',2.87,y,-1.94,.04);bar(room,[2.10,3.4,-1.9],[3.65,3.4,-1.9],.025,'#819198');for(let n=0;n<4;n++){let x=2.23+n*.39;const colors=['#729fcc','#dc92b4','#edd66f','#7fc0a3'];tube(room,[[x,3.38,-1.87],[x+.07,3.43,-1.87],[x+.09,3.53,-1.87]],'#eee6da',.018);bar(room,[x-.16,3.22,-1.87],[x,3.35,-1.87],.012,'#ddd5cd');bar(room,[x,3.35,-1.87],[x+.16,3.22,-1.87],.012,'#ddd5cd');box(room,.30,.75,.15,colors[n],x,2.79,-1.87,.07)}for(let n=0;n<3;n++)box(room,.65,.13,.47,['#9b87c5','#e9bd73','#82b0a3'][n],2.6,.23+n*.15,-1.91,.035);box(room,.60,.55,.54,'#a29acb',3.35,.40,-1.91,.055);
 // Bedside table, lamp, and wall art.
 box(room,.65,.13,.58,'#eee0c6',-.98,.72,-1.85,.04);for(let x of [-1.21,-.75])bar(room,[x,.07,-1.85],[x,.65,-1.85],.04,'#c0a884');cyl(room,.16,.16,.08,'#b487cc',-.98,.86,-1.85);bar(room,[-.98,.9,-1.85],[-.98,1.17,-1.85],.03,'#af91bc');cyl(room,.16,.28,.30,'#ffe8a7',-.98,1.31,-1.85);box(room,.75,.83,.10,'#fef8e8',.55,3.15,-2.50,.035);star(room,.25,'#e9bf65',.55,3.15,-2.42);
}
function disposeModel(){if(!model)return;model.traverse(o=>{if(o.geometry)o.geometry.dispose()});model.clear()}
function draw(){if(renderer)renderer.render(world,camera)}
function resize(){if(!renderer)return;const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w/h<1?43:40;camera.updateProjectionMatrix();draw()}
function setTurn(degrees){turn=degrees*Math.PI/180;if(model)model.rotation.y=turn;draw()}
function update(c,items){if(!renderer)return;let outfit=items.map(i=>i.id).join('|');if(c.id!==lastCharacter||outfit!==lastOutfit){disposeModel();const r=addRobot(c.id);dress(r,items);lastCharacter=c.id;lastOutfit=outfit}model.rotation.y=turn;draw()}
function photo(){draw();return renderer?.domElement.toDataURL('image/png')}
function init(){stage=document.getElementById('stage');try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.22;stage.prepend(renderer.domElement);renderer.domElement.style.cssText='position:absolute;inset:0;width:100%;height:100%;touch-action:pan-y;';renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','Quarto dos robôs com personagem e roupas em três dimensões');world=new THREE.Scene();world.background=new THREE.Color('#efe6f5');camera=new THREE.PerspectiveCamera(40,1,.1,50);camera.position.set(0,2.55,8.3);camera.lookAt(0,2.0,0);world.add(new THREE.HemisphereLight('#fff9ed','#bfb3d1',2.6));const key=new THREE.DirectionalLight('#fff4db',3.5);key.position.set(-3,6,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=6;key.shadow.camera.bottom=-3;key.shadow.normalBias=.035;world.add(key);let fill=new THREE.DirectionalLight('#ccdfff',1.25);fill.position.set(4,3,-1);world.add(fill);makeRoom();model=new THREE.Group();world.add(model);new ResizeObserver(resize).observe(stage);resize();let start=null,moved=false;renderer.domElement.addEventListener('pointerdown',e=>{start={x:e.clientX,angle:turn*180/Math.PI};moved=false});renderer.domElement.addEventListener('pointermove',e=>{if(!start)return;let dx=e.clientX-start.x;if(Math.abs(dx)>8){moved=true;window.dispatchEvent(new CustomEvent('robotturn',{detail:start.angle+dx*.65}))}});window.addEventListener('pointerup',()=>start=null);renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();document.getElementById('viewTag').textContent='A imagem 3D pausou. Recarregue o jogo.'});window.ROBOT3D={update,setTurn,photo,draw,ready:true};window.dispatchEvent(new Event('robot3dready'));}catch(err){console.error('3D unavailable',err);stage.innerHTML='<div style="padding:32px;text-align:center;line-height:1.6"><b>Vamos abrir o quarto 3D!</b><p>Este navegador não conseguiu ativar o 3D. Abra o jogo no Chrome ou Edge com a aceleração gráfica ligada.</p></div>';window.ROBOT3D={ready:false}}}
init();
