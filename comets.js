// The index fingertips map to the same normalized stage coordinates as the
// shader's local attractors. Trails fade by age, independent of camera FPS.
const palette=['147,225,255','255,197,118'];
export function drawComets(ctx,controls,w,h,dpr,ms,reduced) {
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,w,h);
  const scale=Math.min(1.4,Math.max(.72,h/440));
  ctx.globalCompositeOperation='lighter';
  if(!reduced){
    for(const ring of controls.rings){
      const t=(ms-ring.ms)/1050;
      if(t<=0||t>=1)continue;
      const r=(.014+t*.87)*h;
      ctx.strokeStyle='rgba('+palette[ring.id]+','+(.23*(1-t)**2*ring.force)+')';
      ctx.lineWidth=(1.5+2*(1-t))*scale;
      ctx.beginPath();ctx.arc(ring.x*w,ring.y*h,r,0,2*Math.PI);ctx.stroke();
    }
    for(const p of controls.sparks){
      const k=1-p.life/p.duration;
      const perspective=2.8/(2.8-p.z);
      const x=((p.x-.5)*perspective+.5)*w, y=((p.y-.5)*perspective+.5)*h;
      const dx=p.vx*w*.025*perspective, dy=p.vy*h*.025*perspective;
      ctx.lineCap='round';ctx.lineWidth=Math.max(.45,scale*p.size*k*perspective);
      ctx.strokeStyle='rgba('+palette[p.id]+','+Math.min(.86,k*.87)+')';
      ctx.beginPath();ctx.moveTo(x-dx,y-dy);ctx.lineTo(x,y);ctx.stroke();
    }
  }
  controls.marks.forEach((m,id)=>{
    if(m.weight<.02)return;
    const tint=palette[id];
    if(!reduced&&m.trail.length>1){
      for(let i=1;i<m.trail.length;i++){
        const a=m.trail[i-1],b=m.trail[i];
        const f=Math.max(0,1-(ms-b.ms)/425);
        if(!f)continue;
        ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a.x*w,a.y*h);ctx.lineTo(b.x*w,b.y*h);
        ctx.strokeStyle='rgba('+tint+','+(.17*f*f*m.weight)+')';ctx.lineWidth=scale*(1+11*f*m.power);ctx.stroke();
        ctx.strokeStyle='rgba('+tint+','+(.82*f*f*m.weight)+')';ctx.lineWidth=scale*(.6+3.1*f*m.power);ctx.stroke();
      }
    }
    const x=m.x*w,y=m.y*h, radius=scale*(13+10*m.power);
    const halo=ctx.createRadialGradient(x,y,0,x,y,radius);
    halo.addColorStop(0,'rgba(255,253,239,'+m.weight+')');
    halo.addColorStop(.10,'rgba('+tint+','+(.95*m.weight)+')');
    halo.addColorStop(.34,'rgba('+tint+','+(.36*m.weight)+')');
    halo.addColorStop(1,'rgba('+tint+',0)');
    ctx.fillStyle=halo;ctx.fillRect(x-radius,y-radius,radius*2,radius*2);
    ctx.lineWidth=.8*scale;
    ctx.strokeStyle='rgba('+tint+','+(.74*m.weight)+')';
    ctx.beginPath();ctx.moveTo(x-radius*.49,y);ctx.lineTo(x+radius*.49,y);
    ctx.moveTo(x,y-radius*.49);ctx.lineTo(x,y+radius*.49);ctx.stroke();
  });
  ctx.globalCompositeOperation='source-over';
}
