/** Independent, non-repeating brightness cycles; CSS supplies the slow drift. */
export function animateSignals(container: HTMLElement): () => void {
  const markers = Array.from(container.querySelectorAll<HTMLElement>('[data-signal]'));
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set<Animation>();
  let generation = 0;

  function cycle(marker: HTMLElement, version: number, first: boolean) {
    if (version !== generation) return;
    // Only two star shapes can glint, so bright accents stay rare and sparse.
    const glint = marker.hasAttribute('data-glint') && (first || Math.random() < 0.28);
    const duration = 11000 + Math.random() * 12000;
    const glow = glint ? 'drop-shadow(0 0 3px currentColor)' : 'drop-shadow(0 0 0px currentColor)';
    const animation = marker.animate([
      { opacity: 0.3, filter: 'drop-shadow(0 0 0px currentColor)', offset: 0 },
      { opacity: 0.23 + Math.random() * 0.08, offset: 0.15 + Math.random() * 0.1 },
      { opacity: 0.39 + Math.random() * 0.08, offset: 0.36 + Math.random() * 0.08 },
      { opacity: glint ? 0.8 + Math.random() * 0.08 : 0.5 + Math.random() * 0.12, filter: glow, offset: 0.58 + Math.random() * 0.08 },
      { opacity: 0.32 + Math.random() * 0.05, offset: 0.81 + Math.random() * 0.08 },
      { opacity: 0.3, filter: 'drop-shadow(0 0 0px currentColor)', offset: 1 },
    ], { duration, delay: first ? -Math.random() * duration * 0.6 : 0, easing: 'ease-in-out' });
    animations.add(animation);
    animation.finished.then(() => {
      animations.delete(animation);
      cycle(marker, version, false);
    }).catch(() => { animations.delete(animation); });
  }

  function sync() {
    generation++;
    for (const animation of animations) animation.cancel();
    animations.clear();
    if (media.matches || document.hidden) return;
    for (const marker of markers) {
      if (typeof marker.animate === 'function') cycle(marker, generation, true);
    }
  }

  media.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  sync();
  return () => {
    generation++;
    for (const animation of animations) animation.cancel();
    animations.clear();
    media.removeEventListener('change', sync);
    document.removeEventListener('visibilitychange', sync);
  };
}
