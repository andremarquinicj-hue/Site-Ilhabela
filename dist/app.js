const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('img[data-fallback]').forEach(image => {
  function fallback() {
    if (!image.dataset.fallback) return;
    const source = image.dataset.fallback; delete image.dataset.fallback;
    image.src = source; image.alt = 'Lembrança da turma em uma viagem à praia';
    if (image.classList.contains('hero-image')) {
      const label=document.querySelector('.hero-bottom>span:first-child');
      if (label) label.textContent='MEMÓRIAS DA NOSSA TURMA';
    }
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
