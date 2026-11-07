import NextImage, { ImageProps } from 'next/image';
export function VisualImage({ src, alt, className, fill, ...props }: Omit<ImageProps,'src'> & {src?:string}) {
 if(!src) return <div role="img" aria-label={alt || 'Chưa có ảnh'} className={`${fill?'absolute inset-0 ':''}bg-slate-100 ${className || ''}`} />;
 return <NextImage {...props} src={src} alt={alt} fill={fill} className={className} />;
}
