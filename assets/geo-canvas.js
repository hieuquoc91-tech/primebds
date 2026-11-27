// Canvas radar đánh dấu tọa độ dự án Bcons Riverside
(function(){
  var cv=document.getElementById('geoCanvas'); if(!cv) return;
  var ctx=cv.getContext('2d');
  var LAT=10.712460, LNG=106.623312;
  var KM_LAT=110.57, KM_LNG=111.32*Math.cos(LAT*Math.PI/180);
  // Mốc tham chiếu (khoảng cách đường chim bay)
  var marks=[
    {n:'Chợ Bến Thành · Q.1', lat:10.7725, lng:106.6980},
    {n:'Chợ Bình Tây · Q.6', lat:10.7495, lng:106.6510}
  ].map(function(m){var dy=(m.lat-LAT)*KM_LAT, dx=(m.lng-LNG)*KM_LNG;
    m.d=Math.sqrt(dx*dx+dy*dy); m.a=Math.atan2(-dy,dx); return m;});
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W=0,H=0,dpr=1,t0=performance.now(),visible=true;
  function size(){dpr=Math.min(window.devicePixelRatio||1,2);var r=cv.getBoundingClientRect();
    W=r.width;H=r.height;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw(reduce?t0+5000:performance.now());}
  function fmt(d){return d.toFixed(1).replace('.',',')+' km';}
  function draw(now){
    var t=(now-t0)/1000, cx=W/2, cy=H/2+18, R=Math.min(W,H)*0.42, pxKm=R/11;
    ctx.clearRect(0,0,W,H);
    // lưới nền
    ctx.strokeStyle='rgba(255,255,255,.05)';ctx.lineWidth=1;
    for(var x=(cx%32);x<W;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(var y=(cy%32);y<H;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    // vòng bán kính 3/6/9 km
    ctx.font='600 11px "Be Vietnam Pro",sans-serif';ctx.textAlign='center';
    [3,6,9].forEach(function(k){ctx.beginPath();ctx.setLineDash(k===9?[]:[4,6]);ctx.lineWidth=1;
      ctx.strokeStyle='rgba(240,201,119,'+(k===9?.35:.22)+')';ctx.arc(cx,cy,k*pxKm,0,Math.PI*2);ctx.stroke();
      ctx.setLineDash([]);ctx.fillStyle='rgba(240,201,119,.8)';ctx.fillText(k+' km',cx-k*pxKm,cy-6);});
    // trục
    ctx.strokeStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.moveTo(cx-R,cy);ctx.lineTo(cx+R,cy);ctx.moveTo(cx,cy-R);ctx.lineTo(cx,cy+R);ctx.stroke();
    // la bàn
    ctx.fillStyle='rgba(255,255,255,.75)';ctx.textAlign='center';ctx.font='700 12px "Be Vietnam Pro",sans-serif';
    ctx.fillText('B',cx,cy-R-8);ctx.fillText('N',cx,cy+R+18);ctx.fillText('Đ',cx+R+12,cy+4);ctx.fillText('T',cx-R-12,cy+4);
    // tia quét radar
    if(ctx.createConicGradient){var sw=reduce?-0.8:t*0.9, g=ctx.createConicGradient(sw,cx,cy);
      g.addColorStop(0,'rgba(212,162,76,0)');g.addColorStop(0.13,'rgba(212,162,76,.30)');g.addColorStop(0.131,'rgba(212,162,76,0)');g.addColorStop(1,'rgba(212,162,76,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,R,0,Math.PI*2);ctx.fill();}
    // mốc tham chiếu
    marks.forEach(function(m,i){
      var out=m.d*pxKm>R, r=Math.min(m.d*pxKm,R), ex=cx+Math.cos(m.a)*r, ey=cy+Math.sin(m.a)*r;
      var prog=reduce?1:Math.min(1,Math.max(0,(t-0.6-i*0.4)/1.2));
      ctx.strokeStyle='rgba(31,143,184,.95)';ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.lineDashOffset=reduce?0:-t*14;
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+(ex-cx)*prog,cy+(ey-cy)*prog);ctx.stroke();ctx.setLineDash([]);ctx.lineDashOffset=0;
      if(prog>=1){ctx.fillStyle='#1f8fb8';ctx.beginPath();ctx.arc(ex,ey,5.5,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();
        var lx,ly; if(i===0){ctx.textAlign='center';lx=Math.min(ex,W-78);ly=ey-30;}else{ctx.textAlign='right';lx=ex-12;ly=ey-4;}
        ctx.font='700 12px "Be Vietnam Pro",sans-serif';ctx.fillStyle='#fff';ctx.fillText(m.n+(out?' ↗':''),lx,ly);
        ctx.font='500 11px "Be Vietnam Pro",sans-serif';ctx.fillStyle='rgba(255,255,255,.65)';ctx.fillText('~'+fmt(m.d)+' đường chim bay',lx,ly+15);}
    });
    // xung nhịp quanh ghim
    for(var k=0;k<3;k++){var p=reduce?0.5:((t*0.6+k/3)%1);
      ctx.beginPath();ctx.arc(cx,cy,8+p*R*0.55,0,Math.PI*2);ctx.strokeStyle='rgba(240,201,119,'+(0.55*(1-p))+')';ctx.lineWidth=2;ctx.stroke();}
    // ghim vàng
    var bob=reduce?0:Math.sin(t*2.4)*3, py=cy-4+bob;
    ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(cx,cy+3,10-bob*0.6,3.5,0,0,Math.PI*2);ctx.fill();
    var pg=ctx.createLinearGradient(cx-16,py-46,cx+16,py);pg.addColorStop(0,'#f0c977');pg.addColorStop(1,'#d4a24c');
    ctx.fillStyle=pg;ctx.beginPath();ctx.moveTo(cx,py);
    ctx.bezierCurveTo(cx-5,py-10,cx-16,py-18,cx-16,py-30);ctx.arc(cx,py-30,16,Math.PI,0);
    ctx.bezierCurveTo(cx+16,py-18,cx+5,py-10,cx,py);ctx.fill();
    ctx.fillStyle='#0b1f3a';ctx.beginPath();ctx.arc(cx,py-30,6.5,0,Math.PI*2);ctx.fill();
    // nhãn dự án
    var lbl='BCONS RIVERSIDE', sub='10.712460, 106.623312';
    ctx.font='800 14px "Be Vietnam Pro",sans-serif';var w1=ctx.measureText(lbl).width;
    ctx.font='600 11px ui-monospace,Consolas,monospace';var w2=ctx.measureText(sub).width;
    var bw=Math.max(w1,w2)+28,bh=48,bx=cx-bw/2,by=cy+18;
    ctx.fillStyle='rgba(255,255,255,.97)';ctx.beginPath();
    if(ctx.roundRect)ctx.roundRect(bx,by,bw,bh,12);else ctx.rect(bx,by,bw,bh);ctx.fill();
    ctx.beginPath();ctx.moveTo(cx-7,by+1);ctx.lineTo(cx,by-7);ctx.lineTo(cx+7,by+1);ctx.fill();
    ctx.textAlign='center';ctx.fillStyle='#0b1f3a';ctx.font='800 14px "Be Vietnam Pro",sans-serif';ctx.fillText(lbl,cx,by+21);
    ctx.fillStyle='#b07f2c';ctx.font='600 11px ui-monospace,Consolas,monospace';ctx.fillText(sub,cx,by+37);
    // chú thích góc
    ctx.textAlign='left';ctx.font='500 11px "Be Vietnam Pro",sans-serif';ctx.fillStyle='rgba(255,255,255,.55)';
    ctx.fillText('Phú Định · Quận 8 · TP.HCM',18,H-18);
  }
  function loop(now){if(visible)draw(now);requestAnimationFrame(loop);}
  size();window.addEventListener('resize',size);
  if('IntersectionObserver'in window)new IntersectionObserver(function(e){visible=e[0].isIntersecting;}).observe(cv);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(size);
  if(!reduce)requestAnimationFrame(loop);
})();
