/*
 * Reference implementation for the hero storyboard loop ("Your storyboard", refined).
 * EXTRACTED VERBATIM from the approved prototype artifact (Unifolio Hero Concepts).
 * It is plain JavaScript written for a prototype page, NOT production code:
 *   - port it to TypeScript inside components/hero/HeroStoryboardVisual.tsx,
 *   - load the images from /hero-storyboard/ using manifest.json (the prototype embedded them as data URIs),
 *   - replace the global `C` colour object with the constants listed in the plan,
 *   - replace the global `ptr` pointer with the pointer handling described in the plan,
 *   - DROP the review caption at the end of story4 (the "07 Settle into hero" pill) and the BEATS array,
 *   - replace SANS/HAND with the real font stacks read from next/font (see plan, "Fonts").
 * Loop time T = 11.6 s. q = t % T. p = q + 6.4 maps the loop onto beats 04-07 of the original 8-beat timeline.
 */
/*
 * ART2 (used by art2Ready / art2Build / story4) is the image set. In the prototype it was built from data URIs.
 * In production build it from public/hero-storyboard/manifest.json:
 *   ART2 = { w: manifest.width, h: manifest.height, baseImg: <Image of plate.webp>,
 *            layers: manifest.layers.map(l => ({ n: l.id, x: l.x, y: l.y, w: l.w, h: l.h, img: <Image of l.file> })) }
 * The layer order in manifest.drawOrder is the draw order (ring first, then cards, then tiles and spheres).
 * story4(c, w, h, t): c = 2D context already scaled for devicePixelRatio, w/h = CSS pixels, t = seconds since start.
 */
var TAU=Math.PI*2;
var clamp=function(x,a,b){a=a===undefined?0:a;b=b===undefined?1:b;return Math.min(b,Math.max(a,x))};
var lerp=function(a,b,t){return a+(b-a)*t};
var ease=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
var easeOut=function(t){return 1-Math.pow(1-t,3)};
var SANS='Manrope,system-ui,sans-serif', HAND='Caveat,"Segoe Print",cursive';
/* Colours used by the prototype for this concept (logo colours): */
var C={ink:'#111613',muted:'#5A685D',line:'#D9D5CB',card:'#FFFFFF',green:'#12B047',deep:'#0E8C3A',amber:'#F59E0B',slate:'#64748B',dark:false};
/* pointer: nx, ny in -1..1 relative to the canvas, active=true while the pointer is over the hero */
var ptr={x:0,y:0,nx:0,ny:0,active:false};
var SPX=0,SPY=0,ARTFB2=null; /* smoothed pointer + cached feathered plate canvas */

var SRC=[413,229],SCARD=[['mf',186,151],['ins',540,57],['dmr',651,189],['cc',737,300],['dml',263,297],['epf',577,335]],
 SORD={mf:0,ins:1,dmr:2,cc:3,dml:4,epf:5,t1:6,t2:7,t3:8,t4:9,s1:10,s2:11},SGRP={ring:1,epf:1,dml:1},
 SMOT={mf:{a:6,s:.9,ph:0,r:.012,rs:.7,dep:12},ins:{a:7,s:.8,ph:1.2,r:.015,rs:.5,dep:14},dmr:{a:6,s:.7,ph:2.3,r:.01,rs:.6,dep:12},cc:{a:6,s:.85,ph:3.4,r:.012,rs:.6,dep:12},
  t1:{a:8,s:1.1,ph:.5,dep:20,r:.1,rs:.6},t2:{a:6,s:.9,ph:1.9,dep:20,r:.1,rs:.5},t3:{a:8,s:1.2,ph:3.1,dep:18,r:.1,rs:.7},t4:{a:7,s:1.0,ph:4.2,dep:18,r:.1,rs:.6},s1:{a:6,s:.8,ph:.9,dep:22},s2:{a:5,s:1.1,ph:2.4,dep:20}},
 BEATS=[[0,'01 Clean start'],[1.6,'02 Accounts appear'],[4.2,'03 Data flows'],[6.4,'04 Everything connects'],[9,'05 Processing and analysis'],[11.8,'06 Key insights emerge'],[15.2,'07 Settle into hero']],
 SINS=[{big:'₹2.84 Cr',sm:'Total Wealth',x:34,y:78,ic:'bars',ix:176,iy:58},{big:'23%',sm:'Concentration',x:612,y:78,ic:'pie',ix:576,iy:76},{big:'₹42,000',sm:'Fee Leakage',x:34,y:300,ic:'zig',ix:44,iy:336},{big:'14 Months',sm:'Family Runway',x:640,y:312,ic:'arrow',ix:560,iy:344}];

function hexA(hex,a){var n=parseInt(String(hex).replace('#',''),16)||0;return'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')'}

function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}

function fio(p,a,b,f){return clamp((p-a)/f)*clamp((b-p)/f)}

function spaced(c,px){try{c.letterSpacing=px+'px'}catch(e){}}

function nz(s){var x=Math.sin(s*127.1+311.7)*43758.5453;return(x-Math.floor(x))*2-1}

function subdiv(pts,step){var out=[pts[0]];for(var i=1;i<pts.length;i++){var a=pts[i-1],b=pts[i],L=Math.sqrt(Math.pow(b[0]-a[0],2)+Math.pow(b[1]-a[1],2)),n=Math.max(1,Math.ceil(L/step));for(var k=1;k<=n;k++)out.push([lerp(a[0],b[0],k/n),lerp(a[1],b[1],k/n)])}return out}

function sk(c,pts,f,seed,amp,boil){
  if(f<=0||pts.length<2)return;var P=subdiv(pts,16).map(function(p,i){var s=seed*13.7+i*3.1+boil*9.1;return[p[0]+nz(s)*amp,p[1]+nz(s+50)*amp]}),tot=0,L=[0],i;
  for(i=1;i<P.length;i++){tot+=Math.sqrt(Math.pow(P[i][0]-P[i-1][0],2)+Math.pow(P[i][1]-P[i-1][1],2));L.push(tot)}
  var lim=tot*Math.min(1,f);c.beginPath();c.moveTo(P[0][0],P[0][1]);
  for(i=1;i<P.length;i++){if(L[i]<=lim)c.lineTo(P[i][0],P[i][1]);else{var u=(lim-L[i-1])/(L[i]-L[i-1]||1);c.lineTo(lerp(P[i-1][0],P[i][0],u),lerp(P[i-1][1],P[i][1],u));break}}
  c.stroke()}

function ellPts(cx,cy,rx,ry,seed,n){var a0=nz(seed)*Math.PI,out=[];for(var i=0;i<=n;i++){var a=a0+TAU*1.05*i/n,k=1+nz(seed+i*1.7)*.025;out.push([cx+Math.cos(a)*rx*k,cy+Math.sin(a)*ry*k])}return out}

function circlePts(cx,cy,r,seed,n){return ellPts(cx,cy,r,r,seed,n)}

function inkStyle(c,lw){c.strokeStyle=C.ink;c.lineCap='round';c.lineJoin='round';c.lineWidth=lw;c.setLineDash([])}

function hand(c,txt,x,y,px,al,align,f,col){
  c.globalAlpha=al;c.font='700 '+px+'px '+HAND;c.textBaseline='middle';c.textAlign='left';c.fillStyle=col||C.ink;
  var tw=c.measureText(txt).width,x0=align==='center'?x-tw/2:(align==='right'?x-tw:x),n=Math.floor(clamp(f===undefined?1:f)*txt.length);c.fillText(txt.slice(0,n),x0,y)}

function sQ(a,b,cc,u){var m=1-u;return[m*m*a[0]+2*m*u*b[0]+u*u*cc[0],m*m*a[1]+2*m*u*b[1]+u*u*cc[1]]}

function sIcon(c,X,Y,sc,ic,x,y,f,boil){
  var lw=1.7*sc;inkStyle(c,lw);c.lineWidth=lw;
  if(ic==='bars'){var hs=[12,20,16,28,38];hs.forEach(function(hh,i){var bx=x+i*17,by=y+44,fp=clamp(f*6-i*.7);if(fp<=0)return;c.fillStyle=hexA(C.green,.55);c.fillRect(X(bx),Y(by-hh*fp),14*sc,hh*fp*sc);
      sk(c,[[X(bx),Y(by)],[X(bx),Y(by-hh*fp)],[X(bx+14),Y(by-hh*fp)],[X(bx+14),Y(by)]],1,i+400,.6,boil)});sk(c,[[X(x-4),Y(y+44)],[X(x+88),Y(y+44)]],clamp(f*2),410,.6,boil)}
  else if(ic==='pie'){c.fillStyle=hexA(C.green,.5*clamp(f*2));c.beginPath();c.moveTo(X(x),Y(y));c.arc(X(x),Y(y),24*sc,-Math.PI/2,-Math.PI/2+TAU*.23);c.closePath();c.fill();
    sk(c,circlePts(X(x),Y(y),24*sc,420,24),f,420,.7,boil);sk(c,[[X(x),Y(y)],[X(x),Y(y-24)]],clamp(f*2-.5),421,.5,boil);sk(c,[[X(x),Y(y)],[X(x+23),Y(y-6)]],clamp(f*2-.5),422,.5,boil)}
  else if(ic==='zig'){var pts=[[x,y+22],[x+30,y+4],[x+54,y+16],[x+96,y-20]].map(function(q){return[X(q[0]),Y(q[1])]});c.save();c.strokeStyle=hexA(C.ink,.8);sk(c,pts,f,430,.7,boil);c.restore();
    if(f>.95){c.fillStyle=C.ink;c.beginPath();c.arc(pts[3][0],pts[3][1],3*sc,0,TAU);c.fill()}}
  else{var pa=[[x,y+34],[x+22,y+18],[x+40,y+24],[x+66,y-6]].map(function(q){return[X(q[0]),Y(q[1])]});c.save();c.strokeStyle=C.green;c.lineWidth=2.4*sc;sk(c,pa,f,440,.7,boil);c.restore();
    sk(c,[[pa[3][0]-8*sc,pa[3][1]+1*sc],[pa[3][0],pa[3][1]],[pa[3][0]-2*sc,pa[3][1]+9*sc]],clamp(f*3-2),441,.5,boil)}}

function art2Ready(){var A=ART2;if(!A.baseImg.complete||!A.baseImg.naturalWidth)return false;for(var i=0;i<A.layers.length;i++){var im=A.layers[i].img;if(!im.complete||!im.naturalWidth)return false}return true}

function art2Build(){var A=ART2,oc=document.createElement('canvas');oc.width=A.w;oc.height=A.h;var o=oc.getContext('2d');o.drawImage(A.baseImg,0,0);o.globalCompositeOperation='destination-in';
  var gx=o.createLinearGradient(0,0,A.w,0),F=44/A.w;gx.addColorStop(0,'rgba(0,0,0,0)');gx.addColorStop(F,'#000');gx.addColorStop(1-F,'#000');gx.addColorStop(1,'rgba(0,0,0,0)');o.fillStyle=gx;o.fillRect(0,0,A.w,A.h);
  var gy=o.createLinearGradient(0,0,0,A.h),G=36/A.h;gy.addColorStop(0,'rgba(0,0,0,0)');gy.addColorStop(G,'#000');gy.addColorStop(1-G,'#000');gy.addColorStop(1,'rgba(0,0,0,0)');o.fillStyle=gy;o.fillRect(0,0,A.w,A.h);return oc}

function story4(c,w,h,t){
  var A=ART2,wide=w>h*1.15,sc=wide?Math.min(w*.58/A.w,h*.98/A.h):Math.min((w-8)/A.w,300/A.h*.98),x0=wide?w-A.w*sc-w*.015:(w-A.w*sc)/2,y0=wide?(h-A.h*sc)/2:(300-A.h*sc)/2+10;
  function X(x){return x0+x*sc}function Y(y){return y0+y*sc}
  if(!art2Ready()){c.fillStyle=C.muted;c.font='600 13px '+SANS;c.textAlign='center';c.fillText('Loading sketch',X(A.w/2),Y(A.h/2));c.textAlign='left';return}
  if(!ARTFB2)ARTFB2=art2Build();
  var T=11.6,q=t%T,p=q+6.4,fade=clamp(t/.5),boil=Math.floor(t*5),tx=ptr.active?ptr.nx:0,ty=ptr.active?ptr.ny:0;SPX+=(tx-SPX)*.06;SPY+=(ty-SPY)*.06;
  if(C.dark){c.fillStyle='#F6F3EC';rr(c,x0-6,y0-6,A.w*sc+12,A.h*sc+12,18);c.fill()}
  // beat 1: the paper and faint lines wipe in
  c.globalAlpha=fade;c.drawImage(ARTFB2,x0,y0,A.w*sc,A.h*sc);
  var ringIn=1,dim=clamp(1-.78*ease(clamp((p-11.4)/.9))+.78*ease(clamp((p-15.2)/1))),stA=lerp(.25,1,ease(clamp(q/.8)))*(1-.75*ease(clamp((p-11.4)/.8))),dotA=clamp((p-6.4)/.6)*(1-clamp((p-11.4)/.6));
  // beat 3 and 4: streams and travelling dots
  SCARD.forEach(function(q,i){var P0=[q[1],q[2]],dx=P0[0]-SRC[0],dy=P0[1]-SRC[1],l=Math.sqrt(dx*dx+dy*dy),P2=[SRC[0]+dx/l*112,SRC[1]+dy/l*116],sg=i%2?1:-1,P1=[(P0[0]+P2[0])/2-dy/l*l*.22*sg,(P0[1]+P2[1])/2+dx/l*l*.22*sg];
    if(stA>0){c.save();c.globalAlpha=fade*stA*.7;c.strokeStyle=C.green;c.lineWidth=1.4*sc;c.setLineDash([8*sc,9*sc]);c.lineDashOffset=-t*30*sc;c.beginPath();c.moveTo(X(P0[0]),Y(P0[1]));c.quadraticCurveTo(X(P1[0]),Y(P1[1]),X(P2[0]),Y(P2[1]));c.stroke();c.restore()}
    if(dotA>0)for(var d=0;d<2;d++){var u=(t*.3+i*.19+d*.5)%1,pt=sQ(P0,P1,P2,u);c.globalAlpha=fade*dotA*Math.sin(Math.PI*u);c.fillStyle=C.green;c.beginPath();c.arc(X(pt[0]),Y(pt[1]),3*sc,0,TAU);c.fill()}});
  var halo=clamp((p-6.4)/1)*(1-clamp((p-12)/1.2));if(halo>0){var g=c.createRadialGradient(X(SRC[0]),Y(SRC[1]),20*sc,X(SRC[0]),Y(SRC[1]),170*sc);g.addColorStop(0,hexA(C.green,(.16+.1*Math.sin(t*3))*halo));g.addColorStop(1,hexA(C.green,0));c.globalAlpha=fade;c.fillStyle=g;c.fillRect(0,0,w,h)}
  // layers: ring group moves as one piece, the rest float on their own
  var gdx=3*Math.sin(t*.6),gdy=3*Math.sin(t*.5+1),grot=.008*Math.sin(t*.45),gzs=1+.006*Math.sin(t*.9);
  A.layers.forEach(function(L,i){var o=SORD[L.n],ie=1,al=(L.n==='ring'?1:dim)*fade;if(al<=.003)return;
    c.save();c.globalAlpha=al;
    if(SGRP[L.n]){c.translate(X(SRC[0])+gdx*sc+SPX*5,Y(SRC[1])+gdy*sc+SPY*3);c.rotate(grot);var zz=gzs*(L.n==='ring'?.92+.08*ie:1);c.scale(zz,zz);c.drawImage(L.img,(L.x-SRC[0])*sc,(L.y-SRC[1]+(L.n==='ring'?0:(1-ie)*14))*sc,L.w*sc,L.h*sc)}
    else{var M=SMOT[L.n],dy=M.a*Math.sin(t*M.s+M.ph)+(1-ie)*14,dx=M.a*.5*Math.cos(t*M.s*.8+M.ph),rot=(M.r||0)*Math.sin(t*(M.rs||.5)+M.ph),zs=.94+.06*ie;
      c.translate(X(L.x+L.w/2+dx)+SPX*M.dep,Y(L.y+L.h/2+dy)+SPY*M.dep*.6);c.rotate(rot);c.scale(zs,zs);c.drawImage(L.img,-L.w/2*sc,-L.h/2*sc,L.w*sc,L.h*sc)}
    c.restore()});
  // beat 5: scan arc around the ring
  var sa=fio(p,9,11.8,.6);if(sa>0){c.save();c.translate(X(SRC[0]),Y(SRC[1]));c.lineCap='round';var a=t*2.4;c.strokeStyle=hexA(C.green,.85*sa*fade);c.lineWidth=5*sc;c.beginPath();c.arc(0,0,124*sc,a,a+.9);c.stroke();c.strokeStyle=hexA(C.green,.3*sa*fade);c.lineWidth=2*sc;c.beginPath();c.arc(0,0,124*sc,a-.7,a);c.stroke();c.restore()}
  // beat 6: insights write themselves in
  SINS.forEach(function(q,k){var al=ease(clamp((p-11.8-k*.5)/.8))*(1-ease(clamp((p-15.2)/.8)))*fade;if(al<=.01)return;var fp=clamp((p-11.8-k*.5)/1.3);
    c.globalAlpha=al;sIcon(c,X,Y,sc,q.ic,q.ix,q.iy,fp,boil);c.globalAlpha=al;hand(c,q.big,X(q.x),Y(q.y),30*sc,al,'left',clamp(fp*1.6));
    c.globalAlpha=al*clamp(fp*2-.4);c.fillStyle=C.muted;c.font='600 '+(11.5*sc)+'px '+SANS;c.textAlign='left';c.textBaseline='middle';c.fillText(q.sm,X(q.x+2),Y(q.y+24))});
  // review caption: which beat of your storyboard this is
  var bi=0;for(var b=0;b<BEATS.length;b++)if(p>=BEATS[b][0])bi=b;c.globalAlpha=.9;c.font='700 11px '+SANS;c.textBaseline='middle';c.textAlign='left';var cap=BEATS[bi][1],cw=c.measureText(cap).width+22;
  c.fillStyle='rgba(15,20,17,.72)';rr(c,w-cw-12,h-34,cw,24,12);c.fill();c.fillStyle='#fff';c.fillText(cap,w-cw-1,h-21.5);c.globalAlpha=1}

