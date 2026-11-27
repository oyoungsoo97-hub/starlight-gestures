const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
const smooth=(from,to,rate,dt)=>from+(to-from)*(1-Math.exp(-rate*dt));

function marker(){
  return {x:.5,y:.5,vx:0,vy:0,stamp:-Infinity,lastBurst:-Infinity,weight:0,power:0,trail:[]};
}

export class HandMotion {
  constructor(){
    this.marks=[marker(),marker()];
    this.goal={yaw:0,pitch:0,roll:0,zoom:1,x:0,y:0};
    this.pose={...this.goal,energy:0};
    this.lastInput=-Infinity;
    this.spin=0;
    this.spinSpeed=0;
    this.rings=[];
    this.sparks=[];
    this.activity=0;
  }
  release(){
    for(const m of this.marks){m.stamp=-Infinity;m.trail.length=0;m.vx=0;m.vy=0;}
    this.lastInput=-Infinity;
  }
  // Keep control points on the same physical hands even if detection order changes.
  sample(input,ms,aspect=1){
    if(!input.length)return;
    const distance=(m,p)=>ms-m.stamp>260?.55:Math.hypot(m.x-p.tipX,m.y-p.tipY);
    let pair=input;
    let ids=[0,1];
    if(input.length===2){
      if(distance(this.marks[0],input[1])+distance(this.marks[1],input[0])<
         distance(this.marks[0],input[0])+distance(this.marks[1],input[1]))pair=[input[1],input[0]];
    }else if(distance(this.marks[1],input[0])<distance(this.marks[0],input[0]))ids=[1];
    let cx=0,cy=0,depth=0;
    for(let i=0;i<pair.length;i++){
      const p=pair[i];
      cx+=p.x;cy+=p.y;depth+=p.scale;
      this.follow(ids[i],p.tipX,p.tipY,ms);
    }
    cx/=pair.length;cy/=pair.length;depth/=pair.length;
    this.goal.yaw=clamp((cx-.5)*5.9,-2.7,2.7);
    this.goal.pitch=clamp((.5-cy)*2.5,-1.02,1.02);
    this.goal.x=clamp((cx-.5)*.44,-.19,.19);
    this.goal.y=clamp((.5-cy)*.30,-.13,.13);
    this.goal.zoom=clamp(.84+(depth-.055)*2.8,.80,1.38);
    this.goal.roll=clamp((cx-.5)*-.35,-.15,.15);
    if(pair.length===2){
      const [a,b]=pair[0].x<=pair[1].x?pair:[pair[1],pair[0]];
      this.goal.roll=clamp(Math.atan2((a.y-b.y)/aspect,Math.max(.13,b.x-a.x))*.78,-.73,.73);
    }
    this.lastInput=ms;
  }
  follow(id,x,y,ms){
    const m=this.marks[id],dt=(ms-m.stamp)*.001;
    x=clamp(x,.015,.985);y=clamp(y,.015,.985);
    if(dt<=0)return;
    if(dt>.26||Math.hypot(x-m.x,y-m.y)>.49){
      m.x=x;m.y=y;m.vx=0;m.vy=0;m.power=0;m.trail.length=0;
    }else{
      const oldX=m.x,oldY=m.y;
      m.x=smooth(oldX,x,30,dt);m.y=smooth(oldY,y,30,dt);
      m.vx=smooth(m.vx,(m.x-oldX)/Math.max(.016,dt),13,dt);
      m.vy=smooth(m.vy,(m.y-oldY)/Math.max(.016,dt),13,dt);
      const speed=Math.hypot(m.vx,m.vy);
      m.power=clamp((speed-.09)/1.15,0,1);
      this.activity=Math.max(this.activity,m.power);
      if(speed>.19)this.emit(m,id,Math.min(8,Math.ceil(speed*dt*44)),false);
      if(speed>.91&&ms-m.lastBurst>710){
        this.rings.push({x:m.x,y:m.y,id,ms,force:clamp(speed*.64,.6,1.45)});
        if(this.rings.length>5)this.rings.shift();
        this.emit(m,id,Math.round(18+14*m.power),true);
        this.spinSpeed=clamp(this.spinSpeed+m.vx*.92,-3.2,3.2);
        m.lastBurst=ms;
      }
    }
    m.stamp=ms;
    m.trail.push({x:m.x,y:m.y,ms});
    if(m.trail.length>28)m.trail.shift();
  }
  emit(m,id,n,burst){
    for(let i=0;i<n;i++){
      const a=Math.random()*2*Math.PI;
      const speed=burst?.16+Math.random()*.49:.024+Math.random()*.12;
      this.sparks.push({x:m.x,y:m.y,z:0,vx:m.vx*.19+Math.cos(a)*speed,vy:m.vy*.19+Math.sin(a)*speed,
        vz:(Math.random()-.4)*(burst?.95:.44),life:0,duration:burst?.48+Math.random()*.7:.32+Math.random()*.48,
        size:.55+Math.random()*1.55,id});
    }
    if(this.sparks.length>330)this.sparks.splice(0,this.sparks.length-330);
  }
  step(ms,dt,reduced=false){
    const tracked=ms-this.lastInput<380, pose=this.pose;
    const speed=reduced?7:9;
    for(const key of ['yaw','pitch','roll','zoom','x','y']){
      const value=tracked?this.goal[key]:(key==='zoom'?1:0);
      pose[key]=smooth(pose[key],value,tracked?speed:2.4,dt);
    }
    this.activity*=Math.exp(-dt*3.7);
    pose.energy=smooth(pose.energy,this.activity,11,dt);
    this.spinSpeed*=Math.exp(-2.7*dt);
    if(!reduced)this.spin+=this.spinSpeed*dt;
    for(const m of this.marks){
      m.weight=smooth(m.weight,ms-m.stamp<230?1:0,10,dt);
      while(m.trail.length&&ms-m.trail[0].ms>425)m.trail.shift();
    }
    this.rings=this.rings.filter(r=>ms-r.ms<1150);
    for(const p of this.sparks){
      p.life+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;
      p.vx*=Math.exp(-1.6*dt);p.vy=p.vy*Math.exp(-1.6*dt)+.10*dt;
    }
    this.sparks=this.sparks.filter(p=>p.life<p.duration);
    return pose;
  }
}
