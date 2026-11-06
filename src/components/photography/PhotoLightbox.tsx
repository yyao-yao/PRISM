'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Photograph } from '@/types/photography';
import styles from './photography.module.css';

function ViewerImage({ photo, onRetryFocus }: { photo: Photograph; onRetryFocus: () => void }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const image = useRef<HTMLImageElement>(null);
  const jpeg = photo.assets.jpeg[photo.assets.jpeg.length - 1];
  const webp = photo.assets.webp[photo.assets.webp.length - 1];

  const finishLoading = useCallback((node: HTMLImageElement) => {
    void node.decode().then(() => {
      if (image.current === node) setStatus('loaded');
    }, () => {
      if (image.current === node) setStatus('error');
    });
  }, []);

  useEffect(() => {
    if (image.current?.complete && image.current.naturalWidth > 0) finishLoading(image.current);
  }, [attempt, finishLoading]);

  return <>
    <picture key={attempt} className={styles.viewerPicture} data-loaded={status === 'loaded'}>
      <source type="image/webp" srcSet={webp.src} />
      <img
        ref={image}
        className={styles.viewerImage}
        src={jpeg.src}
        width={photo.width}
        height={photo.height}
        alt={photo.alt}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        draggable={false}
        onLoad={event => finishLoading(event.currentTarget)}
        onError={() => setStatus('error')}
      />
    </picture>
    {status !== 'loaded' && <div className={styles.loadStatus} role="status">
      {status === 'error' ? <><p>Photograph unavailable.</p><button type="button" className={styles.retry} onClick={event => { if (document.activeElement === event.currentTarget) onRetryFocus(); setStatus('loading'); setAttempt(value => value + 1); }}>Retry</button></> : 'Loading photograph…'}
    </div>}
  </>;
}

interface PhotoLightboxProps {
  photos: Photograph[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  opener: HTMLButtonElement | null;
}

export default function PhotoLightbox({ photos, index, onIndexChange, onClose, opener }: PhotoLightboxProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const focusClose = useCallback(() => closeButton.current?.focus({ preventScroll: true }), []);
  const captionId = useId();
  const touchIds = useRef(new Set<number>());
  const swipe = useRef<{ id: number; x: number; y: number; time: number } | null>(null);
  const photo = photos[index];
  const navigate = (direction: number) => onIndexChange((index + direction + photos.length) % photos.length);
  const metadata = [photo.location, photo.date, photo.camera].filter(Boolean).join(' · ');

  useEffect(() => {
    const modal = dialog.current;
    if (!modal) return;
    const root = document.documentElement;
    const body = document.body;
    const x = window.scrollX, y = window.scrollY;
    const gap = window.innerWidth - root.clientWidth;
    const rootProperties = ['overflow', 'scroll-behavior'];
    const bodyProperties = ['position', 'top', 'left', 'right', 'width', 'overflow', 'padding-right'];
    const capture = (element: HTMLElement, properties: string[]) => properties.map(name => ({ name, value: element.style.getPropertyValue(name), priority: element.style.getPropertyPriority(name) }));
    const rootValues = capture(root, rootProperties), bodyValues = capture(body, bodyProperties);
    const restore = (element: HTMLElement, values: typeof rootValues) => values.forEach(({ name, value, priority }) => value ? element.style.setProperty(name, value, priority) : element.style.removeProperty(name));
    const padding = parseFloat(getComputedStyle(body).paddingRight) || 0;
    root.style.setProperty('scroll-behavior', 'auto', 'important');
    root.style.setProperty('overflow', 'hidden');
    body.style.setProperty('position', 'fixed');
    body.style.setProperty('top', `${-y}px`);
    body.style.setProperty('left', `${-x}px`);
    body.style.setProperty('right', '0');
    body.style.setProperty('width', '100%');
    body.style.setProperty('overflow', 'hidden');
    body.style.setProperty('padding-right', `${padding + gap}px`);
    modal.showModal();
    closeButton.current?.focus({ preventScroll: true });

    return () => {
      if (modal.open) modal.close();
      restore(body, bodyValues);
      // Keep instant scrolling until both scroll position and focus are restored.
      restore(root, rootValues.filter(property => property.name !== 'scroll-behavior'));
      if (opener?.isConnected) opener.focus({ preventScroll: true });
      window.scrollTo(x, y);
      restore(root, rootValues.filter(property => property.name === 'scroll-behavior'));
    };
  }, [opener]);

  const startSwipe = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch' || (event.target as HTMLElement).closest('button, a')) return;
    touchIds.current.add(event.pointerId);
    swipe.current = touchIds.current.size === 1 && event.isPrimary ? { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now() } : null;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const endSwipe = (event: PointerEvent<HTMLDivElement>) => {
    const origin = swipe.current;
    touchIds.current.delete(event.pointerId);
    swipe.current = null;
    if (!origin || origin.id !== event.pointerId || touchIds.current.size || photos.length < 2) return;
    const dx = event.clientX - origin.x, dy = event.clientY - origin.y;
    if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && performance.now() - origin.time < 1200) navigate(dx < 0 ? 1 : -1);
  };
  const cancelSwipe = (event: PointerEvent<HTMLDivElement>) => {
    touchIds.current.delete(event.pointerId);
    swipe.current = null;
  };

  return <dialog
    ref={dialog}
    className={styles.lightbox}
    aria-label="Photography viewer"
    aria-describedby={captionId}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onKeyDown={event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'Tab') {
        const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex="0"]')].filter(control => control.getClientRects().length > 0);
        if (controls.length) {
          event.preventDefault();
          const current = controls.indexOf(document.activeElement as HTMLElement);
          const next = current < 0 ? (event.shiftKey ? controls.length - 1 : 0) : (current + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
          controls[next].focus({ preventScroll: true });
        }
        return;
      }
      if (photos.length < 2) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        navigate(event.key === 'ArrowLeft' ? -1 : 1);
      }
    }}
  >
    <div className={styles.viewerToolbar}>
      <span className={styles.counter} role="status" aria-live="polite" aria-atomic="true" aria-label={`Image ${index + 1} of ${photos.length}`}>{index + 1} / {photos.length}</span>
      <button ref={closeButton} type="button" className={styles.viewerControl} aria-label="Close photograph viewer" onClick={onClose}><XMarkIcon aria-hidden="true" /></button>
    </div>
    <div className={styles.viewerStage}>
      <button type="button" className={styles.viewerControl} aria-label="Previous photograph" disabled={photos.length < 2} onClick={() => navigate(-1)}><ArrowLeftIcon aria-hidden="true" /></button>
      <div className={styles.imageWell} onPointerDown={startSwipe} onPointerUp={endSwipe} onPointerCancel={cancelSwipe} onLostPointerCapture={cancelSwipe}>
        <ViewerImage key={photo.id} photo={photo} onRetryFocus={focusClose} />
      </div>
      <button type="button" className={styles.viewerControl} aria-label="Next photograph" disabled={photos.length < 2} onClick={() => navigate(1)}><ArrowRightIcon aria-hidden="true" /></button>
    </div>
    <div className={styles.viewerCaption} id={captionId} tabIndex={photo.description ? 0 : undefined}>
      {photo.title && <p className={styles.viewerTitle}>{photo.title}</p>}
      {metadata && <p className={styles.viewerMetadata}>{metadata}</p>}
      {photo.description && <p className={styles.viewerDescription}>{photo.description}</p>}
      {photo.credit && <p className={styles.viewerCredit}>Photo by {photo.credit}{photo.sourceUrl?.startsWith('https://unsplash.com/') ? ' / Unsplash' : ''}</p>}
    </div>
  </dialog>;
}
