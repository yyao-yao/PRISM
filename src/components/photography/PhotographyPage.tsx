import type { PhotographyData } from '@/types/photography';
import PhotoGallery from './PhotoGallery';
import styles from './photography.module.css';

export default function PhotographyPage({ gallery }: { gallery: PhotographyData }) {
  return (
    <div className={styles.page} data-photography>
      <header className={styles.heading}>
        <h1>{gallery.title}</h1>
        {gallery.description && <p className={styles.subtitle}>{gallery.description}</p>}
        {gallery.photos.some(photo => photo.sample) && <p className={styles.sampleNotice}>Placeholder collection for layout review. These photographs belong to the credited photographers, not the site owner.</p>}
      </header>
      <PhotoGallery photos={gallery.photos} />
    </div>
  );
}
