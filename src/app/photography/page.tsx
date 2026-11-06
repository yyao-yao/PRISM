import type { Metadata } from 'next';
import { getPhotography } from '@/lib/photography';
import PhotographyPage from '@/components/photography/PhotographyPage';

export function generateMetadata(): Metadata {
  const gallery = getPhotography();
  return { title: gallery.title, description: gallery.description };
}

export default function Photography() {
  return <PhotographyPage gallery={getPhotography()} />;
}
