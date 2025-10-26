'use client';

import './images-carousel.scss';

import Slider from '../slider';
import Img from '../../image/image';
import { SwiperSlide } from 'swiper/react';
import { useContext, useEffect, useState } from 'react';
import { StateGlobals } from '@/shared/global-context';
import { constants, shuffleArray } from '@/shared/scripts/constants';

export const imagesObject = {
    vertical: {
        ocean: `https://images.pexels.com/photos/1802268/pexels-photo-1802268.jpeg?w=1280&h=1920`,
        sunset: `https://images.pexels.com/photos/561463/pexels-photo-561463.jpeg?w=1280&h=1883`,
        skyview: `https://images.pexels.com/photos/2860705/pexels-photo-2860705.jpeg?w=1280&h=1920`,
        diver: `https://images.pexels.com/photos/4666754/pexels-photo-4666754.jpeg?w=1280&h=1916`,
        hand: `https://images.pexels.com/photos/1072842/pexels-photo-1072842.jpeg?w=1280&h=1920`,
        night: `https://images.pexels.com/photos/2098427/pexels-photo-2098427.jpeg?w=1280&h=1920`,
        sky: `https://images.pexels.com/photos/1591252/pexels-photo-1591252.jpeg?w=1280&h=1920`,
        birds: `https://images.pexels.com/photos/207237/pexels-photo-207237.jpeg?w=1280&h=1920`,
        skymountain: `https://images.pexels.com/photos/1624504/pexels-photo-1624504.jpeg?w=1280&h=1920`,
        mountain: `https://images.pexels.com/photos/2387876/pexels-photo-2387876.jpeg?w=1280&h=1920`,
        darkjungle: `https://images.pexels.com/photos/2609106/pexels-photo-2609106.jpeg?w=1280&h=1920`,
        frostmountain: `https://images.pexels.com/photos/1366907/pexels-photo-1366907.jpeg?w=1280&h=1920`,
        bridge: `https://images.pexels.com/photos/358457/pexels-photo-358457.jpeg?w=1280&h=1920`,
        bridgewater: `https://images.pexels.com/photos/1398195/pexels-photo-1398195.jpeg?w=1280&h=1920`,
        trees: `https://images.pexels.com/photos/258123/pexels-photo-258123.jpeg?w=1280&h=1923`,
        mountainreflection: `https://images.pexels.com/photos/2444429/pexels-photo-2444429.jpeg?w=1280&h=1933`,
        nightbridge: `https://images.pexels.com/photos/1680247/pexels-photo-1680247.jpeg?w=1280&h=1917`,
        sunsetpeak: `https://images.pexels.com/photos/1459534/pexels-photo-1459534.jpeg?w=1280&h=1815`,
        nightvalley: `https://images.pexels.com/photos/2832039/pexels-photo-2832039.jpeg?w=1280&h=1759`,
        snowmountain: `https://images.pexels.com/photos/4215100/pexels-photo-4215100.jpeg?w=1280&h=1707`,
        darkleaf: `https://images.pexels.com/photos/1407305/pexels-photo-1407305.jpeg?w=1280&h=1707`,
        volcano: `https://images.pexels.com/photos/1743165/pexels-photo-1743165.jpeg?w=1280&h=1696`,
        girlmountain: `https://images.pexels.com/photos/4652275/pexels-photo-4652275.jpeg?w=1280&h=1600`,
        topbridge: `https://images.pexels.com/photos/1609440/pexels-photo-1609440.jpeg?w=1280&h=1600`,
        roadbridge: `https://images.pexels.com/photos/1590190/pexels-photo-1590190.jpeg?w=1280&h=1600`,
        jungle: `https://images.pexels.com/photos/788200/pexels-photo-788200.jpeg?w=1280&h=1600`,
        jelly: `https://images.pexels.com/photos/1076758/pexels-photo-1076758.jpeg?w=1280&h=1446`,
    },
    horizontal: {
        sky: `https://images.pexels.com/photos/55787/pexels-photo-55787.jpeg?w=1920&h=1280`,
        skyblue: `https://images.pexels.com/photos/531756/pexels-photo-531756.jpeg?w=1920&h=1281`,
        night: `https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg?w=1920&h=1043`,
        sunset: `https://images.pexels.com/photos/165754/pexels-photo-165754.jpeg?w=1920&h=1280`,
    }
}

export const defaultImagesObject = { ...imagesObject.vertical, ...imagesObject.horizontal }
export const defaultImages = Object.values(defaultImagesObject);
export const shuffledDefaultImages = shuffleArray(defaultImages);

export default function ImagesCarousel({ 
    height = undefined,
    heightContainer = ``,
    imageURLs = shuffledDefaultImages, 
}: any) {
    let { width, height: windowHeight, smallScreen } = useContext<any>(StateGlobals);

    let [imagesURLs, ] = useState(imageURLs);
    let [heightToUse, setHeightToUse] = useState(height != undefined ? height : windowHeight - 250);

    useEffect(() => {
        if (height == undefined) {
            let defaultHeight = windowHeight - 250;

            if (heightContainer != ``) {
                let heightElem = document.querySelector(`.${heightContainer}`);
                if (heightElem) {
                    defaultHeight = heightElem?.clientHeight * (width > 768 ? 0.45 : 0.33);
                }
            }

            setHeightToUse(defaultHeight);
        }
    }, [windowHeight])

    const getSlidesPerView = (wd: number = width, isSmall: boolean = smallScreen): number => {
        let slidesInView = 3.33;
        let { desktop, mobile, smallpc } = constants?.breakpoints ?? {};

        if (isSmall || wd <= mobile) {
            slidesInView = 2.25;
        }

        if (wd > smallpc) {
            if (wd > desktop) {
                slidesInView = 7.77;
            } else {
                slidesInView = 4.20;
            }
        }

        return slidesInView;
    };

    return (
        <Slider className={`imagesCarousel`} slidesPerView={getSlidesPerView()} spaceBetween={15} showButtons={false}>
            {imagesURLs?.map((imgURL: string, imgIndex: number) => (
                <SwiperSlide key={imgIndex} className={`imagesCarouselSlide`}>
                    <Img 
                        src={imgURL} 
                        alt={`Image`} 
                        width={`auto`} 
                        height={heightToUse} 
                    />
                </SwiperSlide>
            ))}
        </Slider>
    )
}