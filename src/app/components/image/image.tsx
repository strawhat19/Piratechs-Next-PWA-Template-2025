'use client';

import Image from 'next/image';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { LazyLoadImage } from 'react-lazy-load-image-component';

export default function Img({ 
    id,
    alt,
    src,
    width,
    height,
    className,
    effect = `blur`,
    useLazyLoad = true,
    onImageLoad = (e?: any) => {},
    onImageError = (e?: any) => {}, 
}: any) {
    return useLazyLoad ? (
        <LazyLoadImage 
            id={id} 
            alt={alt} 
            src={src} 
            width={width}
            height={height} 
            effect={effect} 
            className={className} 
            onLoad={(e?: any) => onImageLoad(e)}
            onError={(e?: any) => onImageError(e)}
        />
    ) : (
        <Image 
            id={id} 
            alt={alt} 
            src={src} 
            width={width}
            height={height} 
            className={className}
            onLoad={(e) => onImageLoad(e)}
            onError={(e) => onImageError(e)}
        />
    )
}