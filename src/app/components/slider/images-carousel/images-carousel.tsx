'use client';

import './images-carousel.scss';

import Slider from '../slider';
import Img from '../../image/image';
import { SwiperSlide } from 'swiper/react';
import { useContext, useState } from 'react';
import { State } from '../../container/container';
import { constants } from '@/shared/scripts/constants';

const imagesObject = {
    vertical: {
        ocean: `https://images.pexels.com/photos/1802268/pexels-photo-1802268.jpeg?w=1280&h=1920`,
        sunset: `https://images.pexels.com/photos/561463/pexels-photo-561463.jpeg?w=1280&h=1883`,
        skyview: `https://images.pexels.com/photos/2860705/pexels-photo-2860705.jpeg?w=1280&h=1920`,
        diver: `https://images.pexels.com/photos/4666754/pexels-photo-4666754.jpeg?w=1280&h=1916`,
        hand: `https://images.pexels.com/photos/1072842/pexels-photo-1072842.jpeg?w=1280&h=1920`,
    }
}

export default function ImagesCarousel() {
    let { width, smallScreen } = useContext<any>(State);
    let [images, setImages] = useState(Object.entries(imagesObject.vertical));
    return (
        <Slider className={`imagesCarousel`} slidesPerView={(smallScreen || width <= constants?.breakpoints?.mobile) ? 2.25 : 3.33} spaceBetween={15} showButtons={false}>
            {images?.map((img, imgIndex) => (
                <SwiperSlide key={imgIndex}>
                    <Img alt={img[0]} src={img[1]} width={`auto`} height={(smallScreen || width <= constants?.breakpoints?.mobile) ? `300px` : `650px`} />
                </SwiperSlide>
            ))}
        </Slider>
    )
}