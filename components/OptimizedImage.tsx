import Image, { ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'alt'> {
  alt: string; // Make alt required for SEO
  priority?: boolean;
}

/**
 * SEO-optimized image component wrapper
 * Ensures all images have proper alt text and are optimized
 */
export default function OptimizedImage({
  alt,
  priority = false,
  ...props
}: OptimizedImageProps) {
  // Validate alt text
  if (!alt || alt.trim() === '') {
    console.warn('⚠️ Image missing alt text:', props.src);
  }

  return (
    <Image
      {...props}
      alt={alt}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      placeholder="blur"
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    />
  );
}

/**
 * Usage example:
 * 
 * <OptimizedImage
 *   src="/images/tool-demo.png"
 *   alt="Screenshot showing Word to PDF conversion process"
 *   width={800}
 *   height={600}
 *   priority={false}
 * />
 */
