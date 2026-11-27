import {starRenderer} from './particles.js';
import {HandMotion} from './motion.js';
import {drawComets} from './comets.js';
const el=id=>document.getElementById(id),clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const stage=el('stage'),canvas=el('stars'),slider=el('amount');
const mirror=el('mirror'),frame=el('frame'),video=el('self'),ambient=el('ambient'),joints=el('joints');
const ctx=joints.getContext('2d'),cameraButton=el('cameraButton');
const comets=el('comets'),ink=comets.getContext('2d');
const controls=new HandMotion();
const motion=matchMedia('(prefers-reduced-motion: reduce)').matches?0:1;
let w=1,h=1,dpr=1,frameW=1,frameH=1,overlayDpr=1;
function resize(){
  w=stage.clientWidth;h=stage.clientHeight;dpr=Math.min(window.devicePixelRatio||1,2,Math.sqrt(4700000/(w*h)));
  canvas.width=Math.max(1,Math.round(w*dpr));canvas.height=Math.max(1,Math.round(h*dpr));
  comets.width=canvas.width;comets.height=canvas.height;
  const aspect=video.videoWidth/video.videoHeight||4/3;
  frameW=Math.min(mirror.clientWidth,mirror.clientHeight*aspect);frameH=frameW/aspect;
  frame.style.width=frameW+'px';frame.style.height=frameH+'px';
  overlayDpr=Math.min(window.devicePixelRatio||1,2);
  joints.width=Math.max(1,Math.round(frameW*overlayDpr));joints.height=Math.max(1,Math.round(frameH*overlayDpr));
  ctx.setTransform(overlayDpr,0,0,overlayDpr,0,0);
}
new ResizeObserver(resize).observe(document.body);
video.addEventListener('loadedmetadata',resize);video.addEventListener('resize',resize);resize();
let spread=0,target=0,spreadVelocity=0,handSpread=null,manualUntil=0,manualReference=null;
function manual(n){
  target=clamp(n);slider.value=String(Math.round(target*100));
  manualReference=handSpread;manualUntil=performance.now()+1750;
}
slider.addEventListener('input',()=>manual(Number(slider.value)/100));
el('gather').addEventListener('click',()=>manual(0));el('scatter').addEventListener('click',()=>manual(1));
let drag=null,pointerUntil=0;
function pointerMotion(e){
  const r=canvas.getBoundingClientRect();
  const x=clamp((e.clientX-r.left)/r.width),y=clamp((e.clientY-r.top)/r.height);
  controls.sample([{x,y,tipX:x,tipY:y,scale:.13}],performance.now(),w/h);
  pointerUntil=performance.now()+420;
}
canvas.addEventListener('pointerdown',e=>{
  if(e.button!==0||drag)return;
  drag={id:e.pointerId,y:e.clientY,start:target};
  controls.release();canvas.setPointerCapture(e.pointerId);pointerMotion(e);
});
canvas.addEventListener('pointermove',e=>{
  if(e.pointerId!==drag?.id)return;
  pointerMotion(e);
  manual(drag.start+(drag.y-e.clientY)/Math.max(85,h*.76));
});
canvas.addEventListener('lostpointercapture',e=>{if(e.pointerId===drag?.id)drag=null;});
const edges=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[0,17],[17,18],[18,19],[19,20]];
function drawHands(hands) {
  ctx.clearRect(0,0,frameW,frameH);
  for(const marks of hands){
    const pts=marks.map(p=>[(1-p.x)*frameW,p.y*frameH]);
    const radius=clamp(Math.hypot(pts[0][0]-pts[9][0],pts[0][1]-pts[9][1])*.027,1.7,4.5);
    ctx.strokeStyle='rgba(255,247,232,.88)';ctx.lineWidth=Math.max(1.1,radius*.66);
    ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowColor='#b5d9ed';ctx.shadowBlur=2.7;ctx.beginPath();
    for(const [i,j] of edges){ctx.moveTo(...pts[i]);ctx.lineTo(...pts[j]);}ctx.stroke();
    ctx.fillStyle='#fffae9';ctx.shadowBlur=3.5;
    for(const [x,y] of pts){ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();}
    ctx.shadowBlur=0;
  }
}
let stream=null,tracker=null,trackerPromise=null,connecting=false,videoStamp=-1,lastRead=0,session=0;
function state(text,on){el('state').textContent=text;el('lamp').classList.toggle('on',on);}
function closeCamera(){
  session++;
  if(stream)stream.getTracks().forEach(track=>track.stop());
  stream=null;video.srcObject=null;ambient.srcObject=null;handSpread=null;videoStamp=-1;controls.release();
  cameraButton.textContent='카메라 켜기';cameraButton.disabled=false;connecting=false;drawHands([]);
  state('카메라 꺼짐',false);el('hint').textContent='카메라를 켜면 내 모습과 손동작이 이곳에 보여요.';
}
async function loadTracker(){
  const {HandLandmarker,FilesetResolver}=await import('./tracking/vision_bundle.mjs');
  const files=await FilesetResolver.forVisionTasks(new URL('./tracking/wasm',import.meta.url).href);
  const options={baseOptions:{modelAssetPath:new URL('./tracking/hand_landmarker.task',import.meta.url).href,delegate:'GPU'},runningMode:'VIDEO',numHands:2,minHandDetectionConfidence:.44,minHandPresenceConfidence:.45,minTrackingConfidence:.48};
  try{return await HandLandmarker.createFromOptions(files,options);}
  catch{options.baseOptions.delegate='CPU';return await HandLandmarker.createFromOptions(files,options);}
}
async function openCamera(){
  if(connecting||stream)return;
  const token=++session;connecting=true;cameraButton.disabled=true;
  cameraButton.textContent='연결 중';state('카메라 연결 중',false);
  el('hint').textContent='카메라 권한을 요청하면 허용해 주세요.';
  try{
    const incoming=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'user'},width:{ideal:960},height:{ideal:720}},audio:false});
    if(token!==session){incoming.getTracks().forEach(t=>t.stop());return;}
    stream=incoming;video.srcObject=stream;ambient.srcObject=stream;
    await video.play();ambient.play().catch(()=>{});
    if(token!==session)return;
    resize();el('hint').textContent='';state('카메라 켜짐 · 손 인식 준비 중',true);
    cameraButton.textContent='카메라 끄기';cameraButton.disabled=false;connecting=false;
    stream.getVideoTracks()[0].addEventListener('ended',()=>{if(token===session)closeCamera();},{once:true});
  }catch(err){
    if(token!==session)return;
    closeCamera();state('카메라 연결 필요',false);
    el('hint').textContent=err.name==='NotAllowedError'?'카메라 권한을 허용한 뒤 ‘카메라 켜기’를 눌러 주세요.':err.name==='NotFoundError'?'사용할 카메라가 없습니다. 카메라를 연결한 뒤 다시 켜 주세요.':'카메라를 열 수 없어요. 카메라 연결을 확인하고 다시 켜 주세요.';
    return;
  }
  try{
    trackerPromise??=loadTracker().catch(err=>{trackerPromise=null;throw err;});
    tracker=await trackerPromise;
    if(token===session)state('카메라 켜짐 · 손을 보여 주세요',true);
  }catch(err){
    if(token===session)state('카메라 켜짐 · 슬라이더로 조절',true);
    console.warn('Hand tracking unavailable',err);
  }
}
cameraButton.addEventListener('click',()=>stream?closeCamera():openCamera());
function readHands(ms){
  if(!stream||!tracker||video.readyState<2||ms<lastRead+55||video.currentTime===videoStamp)return;
  videoStamp=video.currentTime;lastRead=ms;
  let result;
  try{result=tracker.detectForVideo(video,ms);}catch{drawHands([]);state('카메라 켜짐 · 손 인식 대기',true);return;}
  const found=result.landmarks||[];drawHands(found);
  state(found.length===2?'양손 인식 중':found.length?'한 손 인식 중':'카메라 켜짐 · 손을 보여 주세요',true);
  if(!found.length){handSpread=null;return;}
  const shape=video.videoWidth/video.videoHeight;
  const palms=found.map(hand=>{
    const x=1-(hand[0].x+hand[9].x)*.5,y=(hand[0].y+hand[9].y)*.5;
    const scale=Math.hypot(hand[0].x-hand[9].x,(hand[0].y-hand[9].y)/shape);
    return {x,y,tipX:1-hand[8].x,tipY:hand[8].y,scale};
  });
  if(!drag&&ms>pointerUntil)controls.sample(palms,ms,shape);
  if(found.length<2){handSpread=null;return;}
  const [a,b]=palms;
  const separation=Math.hypot(a.x-b.x,(a.y-b.y)*video.videoHeight/video.videoWidth);
  handSpread=clamp((separation-.14)/.47);
  if(drag||ms<manualUntil)return;
  if(manualReference!==null&&Math.abs(handSpread-manualReference)<.10)return;
  manualReference=null;target=handSpread;slider.value=String(Math.round(target*100));
}
window.addEventListener('pagehide',closeCamera);
window.addEventListener('pageshow',e=>{if(e.persisted)openCamera();});
openCamera();
let render;
try{render=starRenderer(canvas);}catch(err){console.error('Star renderer',err);}
let prev=0,orbit=0;
function animate(ms){
  requestAnimationFrame(animate);
  if(document.hidden||ms-prev<1000/50)return;
  const delta=Math.min(.10,(ms-prev)/1000);prev=ms;
  readHands(ms);
  // Integrate the spring in short steps so a slow detection frame stays stable.
  let remaining=delta;
  while(remaining>0){
    const step=Math.min(remaining,1/100);
    spreadVelocity+=((target-spread)*70-spreadVelocity*14)*step;
    spread=clamp(spread+spreadVelocity*step);
    remaining-=step;
  }
  const pose=controls.step(ms,delta,!motion);
  orbit+=delta*.095*motion;
  render?.(w,h,dpr,spread,pose.yaw+controls.spin+orbit,ms*.001,motion,controls);
  drawComets(ink,controls,w,h,dpr,ms,!motion);
}
requestAnimationFrame(animate);
