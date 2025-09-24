'use client';

import 'swiper/css';
import './slider.scss';

import { useRef } from 'react';
// import 'swiper/css/effect-cards';
import { Swiper } from 'swiper/react';
import { Button } from '@mui/material';
import { Autoplay } from 'swiper/modules';
// import { EffectCards } from 'swiper/modules';
// import { State } from '../container/container';

export default function Slider({ children, showButtons = true, spaceBetween = 15, slidesPerView = 1, autoplay = false, className = `sliderComponent` }: any) {
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

            {/* {autoplay ? (

            ) : ( */}
                <Swiper 
                    loop={true}
                    // speed={500}
                    ref={swiperRef}
                    navigation={true} 
                    grabCursor={true}
                    pagination={false} 
                    // effect={`cards`}
                    simulateTouch={true} 
                    allowTouchMove={true}
                    // modules={[EffectCards]}
                    // freeModeMomentum={false}
                    spaceBetween={spaceBetween} 
                    slidesPerView={slidesPerView} 
                    {...autoplay && {
                        speed: 5000,
                        freeMode: true,
                        slidesPerView: 10,
                        modules: [Autoplay],
                        autoplay: {
                            delay: 0,
                            pauseOnMouseEnter: true,
                            disableOnInteraction: false,
                        },
                    }}
                >
                    {children}
                </Swiper>
            {/* )} */}
            
            {showButtons && (
                <Button className={`sliderButton`} onClick={() => slide(1)}>
                    {`>`}
                </Button>
            )}
        </div>
    </>
}