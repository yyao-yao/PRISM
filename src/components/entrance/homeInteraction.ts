/** Guard Home's background navigation without intercepting its normal controls. */
export function bindHomeNavigation(root: HTMLElement, navigate: () => void): () => void {
  let pointer: { id: number; x: number; y: number; dragged: boolean; canceled: boolean } | null = null;
  const excluded = 'nav, a, button, input, select, textarea, label, summary, details, [role="button"], [role="link"], [role="checkbox"], [role="switch"], [role="slider"], [role="tab"], [contenteditable]:not([contenteditable="false"]), [tabindex]:not([tabindex="-1"]), [data-no-toggle]';
  const target = (event: Event) => event.target instanceof Element ? event.target : null;
  const down = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) { pointer = null; return; }
    const element = target(event);
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, dragged: false,
      canceled: !!element?.closest(excluded) && !element.closest('[data-particle-link]') };
  };
  const move = (event: PointerEvent) => {
    if (pointer?.id === event.pointerId && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 6) pointer.dragged = true;
  };
  const cancel = () => { if (pointer) pointer.canceled = true; };
  const click = (event: MouseEvent) => {
    if (event.defaultPrevented) return;
    const element = target(event);
    if (!element) return;
    const invalidGesture = event.detail !== 0 && (!pointer || pointer.dragged || pointer.canceled || window.getSelection()?.isCollapsed === false);
    if (element.closest('[data-particle-link]')) {
      // This is a real link: Enter, modified clicks and open-in-new-tab retain
      // native behavior. Only a drag/canceled gesture suppresses navigation.
      if (invalidGesture) event.preventDefault();
      return;
    }
    if (element.closest(excluded) || invalidGesture) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    navigate();
  };
  root.addEventListener('pointerdown', down, { capture: true, passive: true });
  root.addEventListener('pointermove', move, { capture: true, passive: true });
  root.addEventListener('pointerup', move, { capture: true, passive: true });
  root.addEventListener('pointercancel', cancel, true);
  root.addEventListener('click', click);
  return () => {
    root.removeEventListener('pointerdown', down, true);
    root.removeEventListener('pointermove', move, true);
    root.removeEventListener('pointerup', move, true);
    root.removeEventListener('pointercancel', cancel, true);
    root.removeEventListener('click', click);
  };
}
