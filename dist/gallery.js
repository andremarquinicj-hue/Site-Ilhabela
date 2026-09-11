(() => {
  const photos = [
    {file:'memoria-01.webp',alt:'Casal sorrindo nas águas claras',caption:'Sol, sal e nós',description:'Um mergulho, um sorriso e aquela vontade de o dia durar um pouco mais.'},
    {file:'memoria-02.webp',alt:'Casal de óculos de sol aproveitando o mar',caption:'Leve como esse dia',description:'O tipo de lembrança que já faz a gente contar os dias para voltar.'},
    {file:'memoria-03.webp',alt:'A turma reunida para uma selfie no mar',caption:'A nossa melhor companhia',description:'O cenário é lindo. Mas é com essa turma que a viagem vira história.'},
    {file:'memoria-04.webp',alt:'Amigos sorrindo durante um passeio de barco',caption:'O mar é logo ali',description:'Vento no rosto, risada solta e mais uma história para guardar.'},
    {file:'memoria-05.webp',alt:'A turma descansando em cadeiras na praia',caption:'Sem pressa de ir embora',description:'Uma cadeira na areia, boa companhia e um dia para aproveitar sem olhar o relógio.'},
    {file:'memoria-06.webp',alt:'Selfie da turma durante a travessia de balsa',caption:'O caminho também vira história',description:'Tem viagem que começa muito antes de chegar. A nossa já começa na companhia.'}
  ];
  const order=[2,0,1,3,4,5];
  const dialog=document.getElementById('lightbox');
  const image=document.getElementById('lightbox-image');
  const thumbnails=dialog.querySelector('.viewer-thumbnails');
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let current=0,opener=null,touch=null;
  function show(index) {
    current=(index+order.length)%order.length;
    const photo=photos[order[current]];
    image.src=`assets/${photo.file}`;image.alt=photo.alt;
    const sourceTile=document.querySelector(`.album-tile[data-photo="${order[current]}"]`);
    if(sourceTile){const tone=getComputedStyle(sourceTile);for(const property of ['--photo-light','--photo-contrast','--photo-color'])image.style.setProperty(property,tone.getPropertyValue(property));}
    document.getElementById('viewer-title').textContent=photo.caption;
    document.getElementById('viewer-description').textContent=photo.description;
    document.getElementById('lightbox-caption').textContent=`Memória ${current+1} de ${order.length}`;
    thumbnails.querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===current)));
    if(!reducedMotion.matches && image.animate) image.animate([{opacity:.35},{opacity:1}],{duration:200});
  }
  order.forEach((photoIndex,index)=>{
    const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',`Ver ${photos[photoIndex].caption}`);button.setAttribute('aria-pressed','false');
    const thumb=document.createElement('img');thumb.src=`assets/${photos[photoIndex].file}`;thumb.alt='';thumb.width=80;thumb.height=80;
    button.appendChild(thumb);button.addEventListener('click',()=>show(index));thumbnails.appendChild(button);
  });
  document.querySelectorAll('.album-tile[data-photo]').forEach(button=>button.addEventListener('click',()=>{
    opener=button;show(order.indexOf(Number(button.dataset.photo)));dialog.showModal();document.body.classList.add('modal-open');
  }));
  dialog.querySelector('.viewer-close').addEventListener('click',()=>dialog.close());
  dialog.querySelector('.viewer-prev').addEventListener('click',()=>show(current-1));
  dialog.querySelector('.viewer-next').addEventListener('click',()=>show(current+1));
  dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');opener?.focus({preventScroll:true});touch=null;});
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();show(current+(event.key==='ArrowRight'?1:-1));}});
  const media=dialog.querySelector('.viewer-media');
  media.addEventListener('touchstart',event=>{touch=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;},{passive:true});
  media.addEventListener('touchend',event=>{if(!touch)return;const dx=event.changedTouches[0].clientX-touch.x,dy=event.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.3)show(current+(dx<0?1:-1));touch=null;},{passive:true});
  media.addEventListener('touchcancel',()=>{touch=null;},{passive:true});
})();
