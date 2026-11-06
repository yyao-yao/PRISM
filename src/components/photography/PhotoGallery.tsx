'use client';

import { useCallback, useRef, useState } from 'react';
import PhotoLightbox from './PhotoLightbox';
import type { Photograph } from '@/types/photography';
import styles from './photography.module.css';

function Photo({ photo, opening = false, onOpen }: { photo: Photograph; opening?: boolean; onOpen: (id: string, trigger: HTMLButtonElement) => void }) {
  const jpeg = photo.assets.jpeg;
  const largest = jpeg[jpeg.length - 1];
  const orientation = photo.height > photo.width ? 'portrait' : 'landscape';
  const sizes = `(max-width: 640px) calc(100vw - 48px), (max-width: 1023px) ${opening ? '90vw' : '48vw'}, ${opening ? '940px' : '580px'}`;
  const metadata = [photo.location, photo.date, photo.camera].filter(Boolean).join(' · ');
  return (
    <figure className={styles.photograph} data-photo-id={photo.id} data-orientation={orientation}>
      <button type="button" className={styles.photoButton} aria-label={`View ${photo.title || photo.alt}`} aria-haspopup="dialog" onClick={event => onOpen(photo.id, event.currentTarget)}>
        <picture className={styles.picture}>
          <source type="image/webp" srcSet={photo.assets.webp.map(asset => `${asset.src} ${asset.width}w`).join(', ')} sizes={sizes} />
          {/* Native srcsets are deliberate: all variants are prepared for static export. */}
          <img
            src={largest.src}
            srcSet={jpeg.map(asset => `${asset.src} ${asset.width}w`).join(', ')}
            sizes={sizes}
            width={photo.width}
            height={photo.height}
            alt={photo.alt}
            loading={opening ? 'eager' : 'lazy'}
            fetchPriority={opening ? 'high' : undefined}
            decoding="async"
            draggable={false}
          />
        </picture>
      </button>
      {(photo.title || photo.description || metadata || photo.credit) && (
        <figcaption className={styles.caption}>
          {photo.title && <p className={styles.photoTitle}>{photo.title}</p>}
          {photo.description && <p className={styles.photoDescription}>{photo.description}</p>}
          {metadata && <p className={styles.metadata}>{metadata}</p>}
          {photo.credit && <p className={styles.credit}>{photo.sourceUrl ? <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">Photo by {photo.credit}{photo.sourceUrl.startsWith('https://unsplash.com/') ? ' / Unsplash' : ''}</a> : `Photo by ${photo.credit}`}</p>}
        </figcaption>
      )}
    </figure>
  );
}

export default function PhotoGallery({ photos }: { photos: Photograph[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const close = useCallback(() => setActiveIndex(null), []);
  const open = (id: string, trigger: HTMLButtonElement) => {
    const index = photos.findIndex(photo => photo.id === id);
    if (index < 0) return;
    opener.current = trigger;
    setActiveIndex(index);
  };
  if (photos.length === 0) return null;
  const [opening, ...remaining] = photos;
  const pairs: Photograph[][] = [];
  for (let index = 0; index < remaining.length; index += 2) pairs.push(remaining.slice(index, index + 2));
  return (
    <>
      <div className={styles.gallery}>
        <div className={styles.opening}><Photo photo={opening} opening onOpen={open} /></div>
        {pairs.map((pair, index) => (
          <div key={pair[0].id} className={pair.length === 1 ? styles.solo : styles.pair} data-rhythm={index % 3}>
            {pair.map(photo => <Photo key={photo.id} photo={photo} onOpen={open} />)}
          </div>
        ))}
      </div>
      {activeIndex !== null && photos[activeIndex] && (
        <PhotoLightbox photos={photos} index={activeIndex} onIndexChange={setActiveIndex} onClose={close} opener={opener.current} />
      )}
    </>
  );
}
