'use client';

import 'swiper/css';
import './slider.scss';

import { useRef } from 'react';
// import 'swiper/css/effect-cards';
import { Swiper } from 'swiper/react';
import { Button } from '@mui/material';
// import { EffectCards } from 'swiper/modules';

export default function Slider({ children, showButtons = true, spaceBetween = 15, slidesPerView = 1, className = `sliderComponent` }: any) {
    let swiperRef = useRef<any>(null);

    const slide = (direction: number) => {
        let swiperInstance = null;
        if (swiperRef?.current && swiperRef?.current?.swiper) {
            swiperInstance = swiperRef?.current?.swiper;
        }
        if (swiperInstance != null) {
            if (direction > 0) {
                swiperInstance?.slideNext();
            } else {
                swiperInstance?.slidePrev();
            }
        }
    }

    return <>
        <div className={`slider ${className}`}>
            {showButtons && (
                <Button className={`sliderButton`} onClick={() => slide(-1)}>
                    {`<`}
                </Button>
            )}
            <Swiper 
                loop={true}
                // speed={500}
                ref={swiperRef}
                navigation={true} 
                pagination={false} 
                // effect={`cards`}
                simulateTouch={true} 
                allowTouchMove={true}
                // modules={[EffectCards]}
                spaceBetween={spaceBetween} 
                slidesPerView={slidesPerView} 
            >
                {children}
            </Swiper>
            {showButtons && (
                <Button className={`sliderButton`} onClick={() => slide(1)}>
                    {`>`}
                </Button>
            )}
        </div>
    </>
}