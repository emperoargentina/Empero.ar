import { useState } from 'react';
import { cloudinarySrcSet, productCardImage, blurPlaceholder } from '@/lib/cloudinaryUrl';

const PLACEHOLDER = '/images/Card/Noimagecard.png';

interface CloudinaryImageProps {
  src: string | null | undefined;
  alt: string;
  width: number;
  height: number;
  className?: string;
  placeholderClass?: string;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
}

const DEFAULT_SIZES = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw';

export function CloudinaryImage({
  src,
  alt,
  width,
  height,
  className = '',
  placeholderClass,
  sizes = DEFAULT_SIZES,
  priority = false,
  onLoad,
}: CloudinaryImageProps) {
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return (
      <img
        src={PLACEHOLDER}
        alt={alt}
        width={width}
        height={height}
        className={placeholderClass ?? className}
        loading={priority ? undefined : 'lazy'}
        decoding="async"
      />
    );
  }

  const blurUrl = blurPlaceholder(src);

  return (
    <img
      src={productCardImage(src)}
      srcSet={cloudinarySrcSet(src)}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? undefined : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
      onLoad={() => { setLoaded(true); onLoad?.(); }}
      style={{
        backgroundImage: `url(${blurUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: loaded ? 1 : 0.99,
      }}
    />
  );
}
