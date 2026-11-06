/** Independent breathing and separately scheduled, stochastic twinkle events. */
export function animateSignals(container: HTMLElement): () => void {
  const markers = Array.from(container.querySelectorAll<HTMLElement>('[data-signal]'));
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set<Animation>();
  const timers = new Set<number>();
  const driftStates = new Map<SVGSVGElement, { value: string; priority: string }>();
  let generation = 0;

  function breathe(symbol: SVGSVGElement, version: number, first: boolean) {
    if (version !== generation) return;
    const duration = 2500 + Math.random() * 2000;
    // SVG scale/translate compose with CSS drift; its opacity can only dim the
    // outer star. Neither layer changes the resting opacity or transform.
    const animation = symbol.animate([
      { opacity: 1, scale: '1', translate: '0px 0px', offset: 0 },
      { opacity: 1, scale: '1', translate: '0px 0px', offset: 0.12 },
      { opacity: 1, scale: String(1.06 + Math.random() * 0.04), translate: '0.45px -0.65px', offset: 0.35 + Math.random() * 0.08 },
      { opacity: 0.9 + Math.random() * 0.04, scale: String(0.93 + Math.random() * 0.03), translate: '-0.35px 0.45px', offset: 0.64 + Math.random() * 0.08 },
      { opacity: 1, scale: '1', translate: '0px 0px', offset: 0.9 },
      { opacity: 1, scale: '1', translate: '0px 0px', offset: 1 },
    ].map(frame => ({ ...frame, easing: 'ease-in-out' })),
    { duration, delay: first ? -Math.random() * duration * 0.35 : 0, easing: 'linear' });
    animation.id = 'signal-breath';
    animations.add(animation);
    animation.finished.then(() => {
      animations.delete(animation);
      breathe(symbol, version, false);
    }).catch(() => { animations.delete(animation); });
  }

  function scheduleTwinkle(marker: HTMLElement, version: number, paired = false) {
    if (version !== generation) return;
    // The optional second event is smaller and separated by a calm pause. It
    // cannot chain into a burst: paired events always return to the normal wait.
    const wait = paired ? 1500 + Math.random() * 500 : 1500 + Math.random() * 3500;
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      if (version === generation) twinkle(marker, version, paired);
    }, wait);
    timers.add(timer);
  }

  function twinkle(marker: HTMLElement, version: number, paired: boolean) {
    if (version !== generation) return;
    const fadeIn = 200 + Math.random() * 300;
    const hold = 100 + Math.random() * 200;
    const fadeOut = 500 + Math.random() * 500;
    const duration = fadeIn + hold + fadeOut;
    const glint = !paired && marker.hasAttribute('data-glint') && Math.random() < 0.35;
    const peak = paired ? 0.5 + Math.random() * 0.13 : glint ? 0.9 + Math.random() * 0.05 : 0.64 + Math.random() * 0.14;
    const blur = paired ? 0.5 + Math.random() : glint ? 3.5 + Math.random() * 1.5 : 0.7 + Math.random() * 1.1;
    const clear = 'drop-shadow(0 0 0px currentColor)';
    const glow = `drop-shadow(0 0 ${blur}px currentColor)`;
    // Opacity/glow stay on the wrapper; breathing stays on the SVG. Restoring
    // opacity 0.3 and clearing the glow avoids a permanently brighter light theme.
    const animation = marker.animate([
      { opacity: 0.3, filter: clear, offset: 0 },
      { opacity: peak, filter: glow, offset: fadeIn / duration },
      { opacity: peak, filter: glow, offset: (fadeIn + hold) / duration },
      { opacity: 0.3, filter: clear, offset: 1 },
    ].map(frame => ({ ...frame, easing: 'ease-in-out' })), { duration, easing: 'linear' });
    animation.id = 'signal-twinkle';
    animations.add(animation);
    animation.finished.then(() => {
      animations.delete(animation);
      scheduleTwinkle(marker, version, !paired && Math.random() < 0.12);
    }).catch(() => { animations.delete(animation); });
  }

  function stop() {
    generation++;
    for (const timer of timers) window.clearTimeout(timer);
    timers.clear();
    for (const animation of animations) animation.cancel();
    animations.clear();
  }

  function pauseDrift(paused: boolean) {
    for (const marker of markers) {
      const symbol = marker.querySelector('svg');
      if (!symbol) continue;
      if (paused) {
        if (!driftStates.has(symbol)) driftStates.set(symbol, {
          value: symbol.style.getPropertyValue('animation-play-state'),
          priority: symbol.style.getPropertyPriority('animation-play-state'),
        });
        symbol.style.setProperty('animation-play-state', 'paused');
      } else {
        const previous = driftStates.get(symbol);
        if (!previous) continue;
        if (previous.value) symbol.style.setProperty('animation-play-state', previous.value, previous.priority);
        else symbol.style.removeProperty('animation-play-state');
        driftStates.delete(symbol);
      }
    }
  }

  function sync() {
    stop();
    const paused = media.matches || document.hidden;
    pauseDrift(paused);
    if (paused) return;
    for (const marker of markers) {
      if (typeof marker.animate === 'function') scheduleTwinkle(marker, generation);
      const symbol = marker.querySelector('svg');
      if (symbol && typeof symbol.animate === 'function') breathe(symbol, generation, true);
    }
  }

  media.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  sync();
  return () => {
    stop();
    pauseDrift(false);
    media.removeEventListener('change', sync);
    document.removeEventListener('visibilitychange', sync);
  };
}
