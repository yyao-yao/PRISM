/** Shared by the Home component and the dependency-free standalone preview. */
export function bindHomeInteraction(root: HTMLElement, toggle: () => void, reset: () => void): () => void {
  let pointer: { id: number; x: number; y: number; dragged: boolean; canceled: boolean } | null = null;
  const excluded = 'nav, a, button:not([data-particle-toggle]), input, select, textarea, summary, [role="button"]:not([data-particle-toggle]), [role="link"], [contenteditable], [data-no-toggle]';
  const target = (event: Event) => event.target instanceof Element ? event.target : null;
  const down = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) { pointer = null; return; }
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, dragged: false,
      canceled: !!target(event)?.closest(excluded) };
  };
  const move = (event: PointerEvent) => {
    if (pointer?.id === event.pointerId && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 6) pointer.dragged = true;
  };
  const cancel = () => { if (pointer) pointer.canceled = true; };
  const click = (event: MouseEvent) => {
    const element = target(event);
    const home = element?.closest<HTMLAnchorElement>('a[data-home-reset]');
    if (home) {
      // Selecting the current Home resets its greeting without a morph or reload.
      const url = new URL(home.href, window.location.href);
      if (url.origin === window.location.origin && url.pathname === window.location.pathname) event.preventDefault();
      reset();
      return;
    }
    if (!element || element.closest(excluded)) return;
    // Keyboard-generated native button clicks have detail=0 and need no gesture.
    if (event.detail !== 0 && (!pointer || pointer.dragged || pointer.canceled)) return;
    if (event.detail !== 0 && window.getSelection()?.isCollapsed === false) return;
    toggle();
  };
  const restored = (event: PageTransitionEvent) => { if (event.persisted) reset(); };
  root.addEventListener('pointerdown', down, { capture: true, passive: true });
  root.addEventListener('pointermove', move, { capture: true, passive: true });
  root.addEventListener('pointerup', move, { capture: true, passive: true });
  root.addEventListener('pointercancel', cancel, true);
  root.addEventListener('click', click);
  window.addEventListener('pageshow', restored);
  return () => {
    root.removeEventListener('pointerdown', down, true);
    root.removeEventListener('pointermove', move, true);
    root.removeEventListener('pointerup', move, true);
    root.removeEventListener('pointercancel', cancel, true);
    root.removeEventListener('click', click);
    window.removeEventListener('pageshow', restored);
  };
}
