const tau=Math.PI*2;

function seedGenerator() {
  let state=270921;
  return ()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
}

// Each light has a tree position and a sky position. Keeping its identity
// through the transition makes opening and closing the hands reversible.
function makeLights() {
  const rand=seedGenerator(), data=[];
  const gaussian=()=>Math.sqrt(-2*Math.log(Math.max(.00001,rand())))*Math.cos(tau*rand());
  function point(x,y,z,r,g,b,size,kind=0) {
    const field=rand()>.78;
    const radius=.025+Math.pow(rand(),.65)*1.62;
    const arm=Math.floor(rand()*3),band=gaussian();
    const turn=arm*tau/3+radius*3.48+band*(.14+.25/(1+radius*5));
    let sx=Math.cos(turn)*radius, sz=Math.sin(turn)*radius;
    let sy=gaussian()*(.033+.080*radius);
    if(field){sx=(rand()-.5)*4.8;sy=(rand()-.5)*2.95;sz=(rand()-.5)*3.55;}
    const dice=rand(),tint=rand();
    const core=Math.exp(-radius*2.9);
    const intensity=(field?.26:.47+.42*core)*(.30+Math.pow(dice,5)*1.14);
    const col=(!field&&radius<.34)||tint<.13?[1,.73,.46]:tint<.33?[.80,.63,1.]:tint<.78?[.47,.80,1.]:[.88,.96,1.];
    let skySize=.76+1.08*Math.pow(dice,7);
    if(dice>.984)skySize=2.1+rand()*1.55;
    data.push(x,y,z,sx,sy,sz,r,g,b,col[0]*intensity,col[1]*intensity,col[2]*intensity,size,skySize,rand(),kind);
  }
  // Rows of needles are staggered around five overlapping branch tiers.
  for(let tier=0;tier<5;tier++){
    const peak=.605-tier*.218, width=.157+tier*.094;
    for(let row=1;row<=20;row++){
      const s=row/20, radius=width*Math.pow(s,.8), count=Math.max(10,Math.round(12+radius*181));
      for(let j=0;j<count;j++){
        const a=tau*(j+.34*(row%2))/count+tier*.41;
        const branch=.5+.5*Math.cos(9*a+tier*1.04+1.9*s);
        const rr=radius*(.80+.20*branch+.024*rand());
        const y=peak-(.315+tier*.017)*s+.037*s*s*(branch-.5)+.003*rand();
        const light=(.40+.52*branch+.26*rand())*(.63+.36*s);
        const frost=rand()<.065;
        point(rr*Math.cos(a),y,rr*Math.sin(a),
          (.13+.19*s+frost*.27)*light,(.49+.20*s+frost*.18)*light,(.33+.15*s+frost*.25)*light,
          .76+rand()*.38);
      }
    }
  }
  // A spiral of little coloured bulbs, each with a pair of nearby glints.
  const bulbs=[[1,.49,.22],[1,.78,.36],[.93,.32,.50],[.39,.72,1],[.64,.43,.99],[.40,.95,.72]];
  for(let j=0;j<525;j++){
    const s=j/524, a=s*tau*4.7+.2;
    const radius=.037+.51*s, y=.55-1.186*s-.034*Math.sin(a);
    const x=radius*Math.cos(a), z=radius*Math.sin(a);
    const c=bulbs[Math.floor(s*43)%bulbs.length];
    const scale=.65+.34*Math.cos(j*.13)**2;
    point(x,y,z,c[0]*scale,c[1]*scale,c[2]*scale,1.35+.36*rand(),1);
    if(j%4===0) point(x+.004,y+.004,z,c[0]*.44,c[1]*.46,c[2]*.46,.90);
  }
  // Small spherical baubles sit on the outer boughs.
  for(let n=0;n<28;n++){
    const s=.13+.85*(n+.4)/28,a=n*2.39996+.75;
    const radius=.06+.46*s, y=.56-1.17*s;
    const c=bulbs[n%bulbs.length], rr=.013+.010*rand();
    for(let j=0;j<24;j++){
      const zz=1-2*(j+.5)/24,b=j*2.39996, xy=Math.sqrt(1-zz*zz);
      const k=.51+.44*(.5+.5*xy*Math.cos(b));
      point(radius*Math.cos(a)+rr*xy*Math.cos(b),y+rr*zz,radius*Math.sin(a)+rr*xy*Math.sin(b),
        c[0]*k,c[1]*k,c[2]*k,1.1);
    }
  }
  // The five-point topper is built from the same particles as the tree.
  for(let j=0;j<320;j++){
    const edge=j%10,a=Math.PI*.5+edge*Math.PI/5,b=a+Math.PI/5;
    const r1=edge%2?.045:.108,r2=edge%2?.108:.045,t=rand();
    const fill=j<185?1:Math.sqrt(rand());
    const x=(Math.cos(a)*r1*(1-t)+Math.cos(b)*r2*t)*fill;
    const y=(Math.sin(a)*r1*(1-t)+Math.sin(b)*r2*t)*fill;
    point(x,.706+y,.004*rand(),1,.73+.19*rand(),.32+.21*rand(),.81+rand()*.34,2);
  }
  for(let j=0;j<240;j++){
    const a=tau*rand(), r=.032*Math.sqrt(rand());
    point(r*Math.cos(a),-.795+rand()*.185,r*Math.sin(a),.40,.26,.15,.91);
  }
  for(let j=0;j<600;j++){
    const a=rand()*tau, radius=.09+Math.sqrt(rand())*.77;
    const k=.12+.26*rand();
    point(radius*Math.cos(a),-.79+.012*rand(),radius*Math.sin(a)*.70,k,k*.86,k*.62,.8+rand()*.5);
  }
  // Airborne motes form loose spirals outside the solid branches.
  for(let j=0;j<460;j++){
    const level=rand(),a=level*11.8+rand()*.55+(j%2)*Math.PI;
    const radius=.12+.50*(1-level)+.055*rand(),y=-.74+1.49*level;
    point(radius*Math.cos(a),y,radius*Math.sin(a),.42,.83,.89,.75+.48*rand(),3);
  }
  return new Float32Array(data);
}

const vertex=`
precision highp float;
attribute vec3 tree, sky, treeColor, skyColor;
attribute vec4 style;
uniform float spread,angle,clock,aspect,pixels,unit,still;
uniform vec4 cameraPose; // pitch, roll, zoom, gesture energy
uniform vec2 pan;
uniform vec4 fingerA,fingerB,wave;
varying vec3 color;
varying float glint;
vec2 rotatePlane(vec2 v,float a){float c=cos(a),s=sin(a);return vec2(c*v.x-s*v.y,s*v.x+c*v.y);}
vec3 fingertip(vec2 pos,vec4 finger){
 vec2 delta=pos-finger.xy;
 float d2=dot(delta,delta);
 float influence=exp(-d2*6.5)*finger.z;
 vec2 tangent=vec2(-delta.y,delta.x);
 return vec3((tangent*(.20+.40*finger.w)-delta*.13)*influence,influence);
}
void main(){
 float phase=style.z*6.28318;
 float s=smoothstep(0.,1.,clamp(spread+(style.z-.5)*.38*sin(spread*3.14159),0.,1.));
 float mid=sin(3.14159*s),energy=cameraPose.w;
 vec3 p=tree;
 bool topper=style.w>1.5&&style.w<2.5;
 if(style.w>2.5){
   p.xz=rotatePlane(p.xz,still*clock*.24);
   p.y+=.025*sin(phase+clock*1.3)*still;
 }
 if(topper)p=vec3(0.,.706,0.);
 p.xz=rotatePlane(p.xz,-angle-mid*(.8+style.z*2.1));
 p.yz=rotatePlane(p.yz,cameraPose.x-.10);
 p.xy=rotatePlane(p.xy,cameraPose.y);
 if(topper)p.xy+=rotatePlane(tree.xy-vec2(0.,.706),cameraPose.y);
 float fit=min(1.,aspect*1.32);
 p*=fit;
 vec3 galaxy=sky;
 galaxy.xz=rotatePlane(galaxy.xz,-angle*.72+still*.067*clock);
 galaxy.yz=rotatePlane(galaxy.yz,-.53+cameraPose.x*.87);
 galaxy.xy=rotatePlane(galaxy.xy,.21+cameraPose.y);
 galaxy.x*=clamp(aspect*.81,.73,2.30);
 vec3 position=mix(p,galaxy,s);
 position.xy+=mid*rotatePlane(vec2(.13+.14*style.z,0.),phase+angle+5.1*s);
 position.z+=mid*sin(phase+4.2*s)*.36;
 float perspective=3.65/max(1.65,3.65-position.z*cameraPose.z);
 vec2 pos=position.xy*perspective*cameraPose.z+vec2(pan.x*min(aspect,1.8),pan.y)+vec2(0.,.051*(1.-s));
 vec3 a=fingertip(pos,fingerA),b=fingertip(pos,fingerB);
 vec2 delta=pos-wave.xy;
 float distanceToWave=length(delta);
 float edge=(distanceToWave-wave.z*1.78)/.115;
 float ripple=exp(-edge*edge)*wave.w;
 pos+=a.xy+b.xy+delta/max(.04,distanceToWave)*ripple*.105;
 gl_Position=vec4(pos.x/aspect,pos.y,0.,1.);
 float back=clamp(.90+p.z*.71,.53,1.27);
 vec3 tc=treeColor*(topper?1.:back)*(style.w<.5?1.38:1.08);
 if(style.w>2.5)tc*=.31+.63*energy;
 float twinkle=1.+still*(.13+.08*s)*sin(clock*(.72+style.z*1.5)+phase*8.);
 float spark=a.z*(.25+fingerA.w*.66)+b.z*(.25+fingerB.w*.66)+ripple*.88;
 color=mix(tc,skyColor,s)*twinkle*(1.+spark*.85)+vec3(.39,.59,.79)*spark*.29;
 glint=smoothstep(1.1,2.0,mix(style.x,style.y,s))+.31*spark;
 gl_PointSize=clamp(pixels*unit*mix(style.x,style.y,s)*3.75*clamp(perspective,.68,1.64)*(1.+spark*.35),1.,43.);
}`;
const fragment=`
precision mediump float;
varying vec3 color;
varying float glint;
void main(){
 vec2 xy=gl_PointCoord*2.-1.;
 float r=dot(xy,xy);
 float core=exp(-9.*r), halo=exp(-3.*r)*.14;
 float crossLight=(exp(-28.*abs(xy.x))*exp(-3.8*abs(xy.y))+exp(-28.*abs(xy.y))*exp(-3.8*abs(xy.x)))*.21*glint;
 gl_FragColor=vec4(color*(core+halo+crossLight)*(1.-smoothstep(.60,1.,r)),1.);
}`;

export function starRenderer(canvas) {
  const data=makeLights();
  const gl=canvas.getContext('webgl',{alpha:true,antialias:false,depth:false,premultipliedAlpha:false});
  if(!gl) return flatRenderer(canvas,data);
  const compile=(type,s)=>{
    const shader=gl.createShader(type); gl.shaderSource(shader,s);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  };
  const background=gl.createProgram();
  gl.attachShader(background,compile(gl.VERTEX_SHADER,`attribute vec2 pos; void main(){gl_Position=vec4(pos,0.,1.);}`));
  gl.attachShader(background,compile(gl.FRAGMENT_SHADER,`
    precision highp float;
    uniform vec2 size;
    uniform float pixel, time, spread;
    uniform vec2 drift;
    float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
    float dust(vec2 coord,float cell,float t){
      vec2 g=coord/cell,id=floor(g);
      vec2 offset=vec2(hash(id+vec2(2,7)),hash(id+vec2(21,4)))*.76+.12;
      vec2 d=(fract(g)-offset)*cell;
      float key=hash(id+vec2(9,12));
      float r=length(d)/(.48+key*.69);
      return exp(-1.6*r*r)*(.15+.60*key)*(.86+.14*sin(t*(.48+key)+key*187.));
    }
    void main(){
      vec2 uv=gl_FragCoord.xy/size, p=(gl_FragCoord.xy-.5*size)*2./size.y;
      vec3 bg=mix(vec3(.018,.024,.046),vec3(.019,.044,.072),1.-uv.y);
      bg+=vec3(.006,.029,.033)*exp(-4.*dot(p-vec2(0.,-.18),p-vec2(0.,-.18)))*(1.-spread);

      vec2 css=gl_FragCoord.xy/pixel;
      float stars=dust(css+drift*8.,23.,time)+dust(css+vec2(33.,7.)+drift*22.,52.,time)*1.1;
      bg+=stars*vec3(.76,.87,1.);
      bg+= (hash(gl_FragCoord.xy)-.5)*.007;
      gl_FragColor=vec4(bg,1.);
    }`));
  gl.linkProgram(background);
  if(!gl.getProgramParameter(background,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(background));
  const bgPos=gl.getAttribLocation(background,'pos');
  const bgVars=Object.fromEntries(['size','pixel','time','spread','drift'].map(k=>[k,gl.getUniformLocation(background,k)]));
  const tri=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,tri);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const program=gl.createProgram();
  gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
  const attributes=[];
  for(const [name,count,offset] of [['tree',3,0],['sky',3,3],['treeColor',3,6],['skyColor',3,9],['style',4,12]]){
    const a=gl.getAttribLocation(program,name);attributes.push([a,count,offset]);
  }
  const uniforms={};
  for(const k of ['spread','angle','clock','aspect','pixels','unit','still','cameraPose','pan','fingerA','fingerB','wave']) uniforms[k]=gl.getUniformLocation(program,k);
  gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.ONE,gl.ONE,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  // Opaque clear avoids transparent black writing a black square around every point.
  return (width,height,dpr,mix,angle,time,motion,controls)=>{
    const pose=controls.pose, aspect=width/height;
    gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(.018,.030,.055,1);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.BLEND);gl.useProgram(background);
    gl.bindBuffer(gl.ARRAY_BUFFER,tri);gl.enableVertexAttribArray(bgPos);gl.vertexAttribPointer(bgPos,2,gl.FLOAT,false,0,0);
    gl.uniform2f(bgVars.size,canvas.width,canvas.height);gl.uniform1f(bgVars.pixel,dpr);
    gl.uniform2f(bgVars.drift,Math.sin(angle)*.8+pose.x,pose.pitch+pose.y);
    gl.uniform1f(bgVars.time,time*motion);gl.uniform1f(bgVars.spread,mix);
    gl.drawArrays(gl.TRIANGLES,0,3);gl.disableVertexAttribArray(bgPos);
    gl.useProgram(program);gl.enable(gl.BLEND);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    for(const [a,count,offset] of attributes){gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,count,gl.FLOAT,false,64,offset*4);}
    const u={spread:mix,angle,clock:time,aspect:width/height,pixels:dpr,unit:Math.min(1.8,Math.max(.78,height/410)),still:motion};
    for(const k in u)gl.uniform1f(uniforms[k],u[k]);
    gl.uniform4f(uniforms.cameraPose,pose.pitch,pose.roll,pose.zoom,pose.energy);
    gl.uniform2f(uniforms.pan,pose.x,pose.y);
    for(let i=0;i<2;i++){
      const m=controls.marks[i];
      gl.uniform4f(i?uniforms.fingerB:uniforms.fingerA,(2*m.x-1)*aspect,1-2*m.y,m.weight,m.power);
    }
    const ring=controls.rings.at(-1);
    if(ring&&motion){
      const age=Math.max(0,time-ring.ms*.001);
      gl.uniform4f(uniforms.wave,(2*ring.x-1)*aspect,1-2*ring.y,age,ring.force*Math.max(0,1-age));
    }else gl.uniform4f(uniforms.wave,0,0,0,0);
    gl.drawArrays(gl.POINTS,0,data.length/16);
    for(const [a] of attributes)gl.disableVertexAttribArray(a);
  };
}

function flatRenderer(canvas,data){
  const ctx=canvas.getContext('2d');
  return (w,h,dpr,s,a,time,motion,controls)=>{
    const pose=controls.pose, ca=Math.cos(a), sa=Math.sin(a);
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    for(let i=0;i<data.length;i+=32){
      const x=data[i]*(1-s)+data[i+3]*s, y=data[i+1]*(1-s)+data[i+4]*s;
      const z=data[i+2]*(1-s)+data[i+5]*s, pitch=pose.pitch-.48*s;
      const side=x*ca+z*sa, depth=-x*sa+z*ca;
      const up=y*Math.cos(pitch)-depth*Math.sin(pitch);
      const scale=pose.zoom*3.65/Math.max(1.65,3.65-depth*Math.cos(pitch)-y*Math.sin(pitch));
      const px=(side*Math.cos(pose.roll)-up*Math.sin(pose.roll))*scale+pose.x;
      const py=(side*Math.sin(pose.roll)+up*Math.cos(pose.roll))*scale+pose.y;
      const c=[0,1,2].map(k=>Math.round(Math.min(1,data[i+6+k]*(1-s)+data[i+9+k]*s)*255));
      ctx.fillStyle='rgb('+c.join(',')+')';ctx.fillRect((w+px*h)*.5,(1-py)*h*.5,1.35,1.35);
    }
  };
}
