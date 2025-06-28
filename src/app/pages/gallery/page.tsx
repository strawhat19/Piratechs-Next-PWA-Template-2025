import Container from '@/app/components/container/container';
import ImagesCarousel from '@/app/components/slider/images-carousel/images-carousel';

export default function GalleryPage() {
    return (
        <Container className={`galleryPage`}>
            <ImagesCarousel />
        </Container>
    )
}