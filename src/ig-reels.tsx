export type Reel = { url: string; cover: string; caption: string; views?: string }

const reelScript = `(() => {
  const root = document.currentScript.closest('[data-reel]');
  if (!root || root.dataset.reelReady) return;
  const cards = Array.from(root.querySelectorAll('.reel-card'));
  if (!cards.length) return;
  root.dataset.reelReady = 'true';
  const stage = root.querySelector('.reel-stage');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, timer, hovering = false, focused = false, pointer = null, startX = 0, startY = 0, swiped = false;
  const show = next => {
    current = (next + cards.length) % cards.length;
    cards.forEach((card, index) => {
      let offset = (index - current + cards.length) % cards.length;
      if (offset > cards.length / 2) offset -= cards.length;
      const distance = Math.abs(offset);
      card.style.setProperty('--reel-offset', String(offset));
      card.style.setProperty('--reel-depth', (distance * distance * -35) + 'px');
      card.style.setProperty('--reel-angle', (offset < 0 ? 35 : offset > 0 ? -35 : 0) + 'deg');
      card.style.setProperty('--reel-scale', String(distance ? Math.max(0.65, 0.85 - distance * 0.05) : 1.08));
      card.style.opacity = distance > 2 ? '0' : String(1 - distance * 0.25);
      card.style.zIndex = String(cards.length - distance);
      card.style.pointerEvents = distance > 2 ? 'none' : 'auto';
      card.tabIndex = distance > 2 ? -1 : 0;
      if (index === current) card.setAttribute('aria-current', 'true');
      else card.removeAttribute('aria-current');
    });
  };
  const schedule = () => {
    clearInterval(timer);
    if (cards.length > 1 && !motion.matches && !hovering && !focused && pointer === null && !document.hidden)
      timer = setInterval(() => show(current + 1), 2800);
  };
  root.addEventListener('mouseenter', () => { hovering = true; schedule(); });
  root.addEventListener('mouseleave', () => { hovering = false; schedule(); });
  root.addEventListener('focusin', () => { focused = true; schedule(); });
  root.addEventListener('focusout', event => { if (!root.contains(event.relatedTarget)) { focused = false; schedule(); } });
  stage.addEventListener('pointerdown', event => {
    if (pointer !== null || (event.pointerType === 'mouse' && event.button !== 0)) return;
    pointer = event.pointerId; startX = event.clientX; startY = event.clientY; swiped = false; schedule();
  });
  window.addEventListener('pointerup', event => {
    if (event.pointerId !== pointer) return;
    const dx = event.clientX - startX, dy = event.clientY - startY;
    if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) { swiped = true; show(current + (dx < 0 ? 1 : -1)); }
    pointer = null; schedule();
    setTimeout(() => { swiped = false; }, 0);
  });
  window.addEventListener('pointercancel', event => { if (event.pointerId === pointer) { pointer = null; schedule(); } });
  stage.addEventListener('click', event => { if (swiped) { event.preventDefault(); event.stopPropagation(); } }, true);
  stage.addEventListener('dragstart', event => event.preventDefault());
  root.querySelector('[data-reel-prev]').addEventListener('click', () => { show(current - 1); schedule(); });
  root.querySelector('[data-reel-next]').addEventListener('click', () => { show(current + 1); schedule(); });
  root.querySelectorAll('.reel-arrow').forEach(button => { button.disabled = cards.length < 2; });
  motion.addEventListener('change', schedule);
  document.addEventListener('visibilitychange', schedule);
  show(0); schedule();
})();`

export const ReelShowcase = (p: { reels: Reel[]; profileUrl: string; handle: string }) => (
  <section class="reel-showcase" data-reel="" aria-label="Instagram 短片輪播">
    <div class="reel-stage">
      {p.reels.map(reel => (
        <a class="reel-card" href={reel.url} target="_blank" rel="noopener">
          <img src={reel.cover} loading="lazy" alt={reel.caption} draggable={false} />
          <span class="reel-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 5v14l11-7z" fill="currentColor" /></svg></span>
          <span class="reel-overlay"><span class="reel-caption">{reel.caption}</span>{reel.views && <span class="reel-views">{reel.views} 次觀看</span>}</span>
        </a>
      ))}
    </div>
    <div class="reel-controls"><button class="reel-arrow" type="button" data-reel-prev="" aria-label="上一條短片">←</button><button class="reel-arrow" type="button" data-reel-next="" aria-label="下一條短片">→</button></div>
    <a class="reel-more" href={p.profileUrl} target="_blank" rel="noopener">喺 Instagram 睇更多 @{p.handle.replace(/^@/, '')}</a>
    <script dangerouslySetInnerHTML={{ __html: reelScript }} />
  </section>
)
