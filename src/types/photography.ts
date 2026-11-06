export interface PhotoAsset {
  src: string;
  width: number;
  height: number;
}

export interface Photograph {
  id: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
  location?: string;
  date?: string;
  camera?: string;
  collection?: string;
  credit?: string;
  sourceUrl?: string;
  license?: string;
  sample: boolean;
  width: number;
  height: number;
  assets: { jpeg: PhotoAsset[]; webp: PhotoAsset[] };
}

export interface PhotographyData {
  title: string;
  description?: string;
  photos: Photograph[];
}
