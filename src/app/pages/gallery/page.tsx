import { Metadata } from 'next';
import { constants } from '@/shared/scripts/constants';
import Container from '@/app/components/container/container';
import ImagesCarousel from '@/app/components/slider/images-carousel/images-carousel';

export const metadata: Metadata = {
  title: `Gallery | ${constants.titles.default}`,
};

export default function GalleryPage() {
    return (
        <Container className={`galleryPage`}>
            <ImagesCarousel className={`galleryCarousel`} imageClassName={`galleryCarouselImage`} />
        </Container>
    )
}