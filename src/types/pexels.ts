
export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string; // Pexels URL to the photo page
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: PexelsPhotoSrc;
  liked: boolean;
  alt: string;
}

export interface PexelsPhotoSrc {
  original: string;
  large2x: string;
  large: string;
  medium: string;
  small: string;
  portrait: string;
  landscape: string;
  tiny: string;
}

export interface PexelsCuratedResponse {
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  total_results?: number; 
  next_page?: string;
}

export interface PexelsSearchResponse extends PexelsCuratedResponse {
  total_results: number;
}
