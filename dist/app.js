const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('img[data-fallback]').forEach(image => {
  function fallback() {
    if (!image.dataset.fallback) return;
    const source = image.dataset.fallback; delete image.dataset.fallback;
    image.src = source; image.alt = 'Lembrança da turma em uma viagem à praia';
    const caption = image.closest('figure')?.querySelector('figcaption');
    if (caption) { const note = document.createElement('span'); note.className='image-fallback-note'; note.textContent='Foto de lembrança da turma'; caption.appendChild(note); }
  }
  image.addEventListener('error',fallback,{once:true});
  if (image.complete && image.naturalWidth === 0) fallback();
});
let celebrated = false;
function updateCountdown() {
  const time = getCountdown();
  for (const part of ['days', 'hours', 'minutes', 'seconds']) {
    const element = document.getElementById(part);
    const next = String(time[part]).padStart(2, '0');
    if (element.textContent !== next) {
      element.textContent = next;
      if (part === 'seconds' && !prefersReducedMotion.matches) element.animate([{opacity:.45,transform:'translateY(3px)'},{opacity:1,transform:'translateY(0)'}], {duration:300});
    }
  }
  document.getElementById('countdown-label').textContent = time.arrived ? (time.travelDay ? 'CHEGOU O GRANDE DIA!' : 'A VIAGEM COMEÇOU!') : 'NOSSO PRÓXIMO MERGULHO EM';
  document.getElementById('countdown-note').textContent = time.arrived ? 'Ilhabela, a espera acabou. Bora viver essa história!' : 'Malas quase prontas. Coração já na ilha.';
  if (time.travelDay && !celebrated) { celebrated = true; celebrate(); }
}
function celebrate() {
  if (prefersReducedMotion.matches) return;
  const colors = ['#ddf581','#65d5dc','#ffffff','#f9c874'];
  for (let i = 0; i < 50; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti'; piece.setAttribute('aria-hidden','true');
    piece.style.cssText = `left:${Math.random()*100}vw;background:${colors[i%4]};animation-delay:${Math.random()*.7}s;--rotation:${Math.random()*1000}deg;`;
    document.body.appendChild(piece); setTimeout(() => piece.remove(), 6500);
  }
}
updateCountdown();
setInterval(updateCountdown, 1000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) updateCountdown(); });

if ('IntersectionObserver' in window && !prefersReducedMotion.matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), {threshold:.08});
  document.querySelectorAll('.reveal').forEach(element => { element.classList.add('will-reveal'); observer.observe(element); });
}

const memories = [
  ['memoria-01.webp','Casal sorrindo nas águas claras','Sol, sal e nós'],
  ['memoria-02.webp','Casal de óculos de sol aproveitando o mar','Leve como esse dia'],
  ['memoria-03.webp','A turma reunida para uma selfie no mar','A nossa melhor companhia'],
  ['memoria-04.webp','Amigos sorrindo durante um passeio de barco','O mar é logo ali'],
  ['memoria-05.webp','A turma descansando em cadeiras na praia','Sem pressa de ir embora'],
  ['memoria-06.webp','Selfie da turma durante a travessia de balsa','O caminho também vira história']
];
const photoOrder = [2,0,1,3,4,5];
const lightbox = document.getElementById('lightbox');
let currentPhoto = 0;
function showPhoto(index) {
  currentPhoto = (index + photoOrder.length) % photoOrder.length;
  const [file, alt, caption] = memories[photoOrder[currentPhoto]];
  const image = document.getElementById('lightbox-image');
  image.src = `assets/${file}`; image.alt = alt;
  document.getElementById('lightbox-caption').textContent = `${caption} · ${currentPhoto + 1} / ${memories.length}`;
}
document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => {
  showPhoto(photoOrder.indexOf(Number(button.dataset.photo)));
  lightbox.showModal(); document.body.classList.add('modal-open');
}));
document.querySelector('.close-lightbox').addEventListener('click', () => lightbox.close());
document.querySelector('.previous-photo').addEventListener('click', () => showPhoto(currentPhoto-1));
document.querySelector('.next-photo').addEventListener('click', () => showPhoto(currentPhoto+1));
lightbox.addEventListener('close', () => document.body.classList.remove('modal-open'));
lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
lightbox.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(currentPhoto+1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(currentPhoto-1); }
});
let touchX = null;
lightbox.addEventListener('touchstart', event => { touchX = event.changedTouches[0].screenX; }, {passive:true});
lightbox.addEventListener('touchend', event => {
  if (touchX === null) return;
  const delta = event.changedTouches[0].screenX - touchX;
  if (Math.abs(delta) > 60) showPhoto(currentPhoto + (delta < 0 ? 1 : -1));
  touchX = null;
}, {passive:true});
