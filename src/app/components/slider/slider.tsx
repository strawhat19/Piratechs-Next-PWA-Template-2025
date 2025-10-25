'use client';

import 'swiper/css';
import './slider.scss';

// import 'swiper/css/effect-cards';
import { Swiper } from 'swiper/react';
import { Button } from '@mui/material';
import { useRef, useState } from 'react';
import { Autoplay } from 'swiper/modules';
// import { EffectCards } from 'swiper/modules';
// import { State } from '../container/container';
import { generateArray } from '@/shared/scripts/constants';
import { Circle, CircleTwoTone } from '@mui/icons-material';

export default function Slider({ 
    children, 
    autoplay = false, 
    spaceBetween = 15, 
    slidesPerView = 1, 
    showButtons = true, 
    startingSlideIndex = 0,
    showPaginationDots = false,
    className = `sliderComponent`, 
    paginationClass = `paginationClass`, 
}: any) {
    let swiperRef = useRef<any>(null);
    let [activeSlideIndex, setActiveSlideIndex] = useState(startingSlideIndex);

    const onSlideChange = (e: any) => {
        setActiveSlideIndex(e?.activeIndex);
    }

    const getSwiper = () => {
        let swiperInstance = null;
        if (swiperRef?.current && swiperRef?.current?.swiper) {
            swiperInstance = swiperRef?.current?.swiper;
        }
        return swiperInstance;
    }

    const slide = (direction: number) => {
        let swiperInstance = getSwiper();
        if (swiperInstance != null) {
            if (direction > 0) {
                swiperInstance?.slideNext();
            } else {
                swiperInstance?.slidePrev();
            }
        }
    }

    const onPaginationDotClick = (e: any, slide: any, slideIndex: number) => {
        let swiperInstance = getSwiper();
        if (swiperInstance != null) {
            swiperInstance?.slideTo(slideIndex);
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
                    nested={true}
                    // speed={500}
                    ref={swiperRef}
                    noSwiping={true}
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
                    noSwipingClass={`swiper-no-swiping`}
                    onSlideChange={(e) => onSlideChange(e)}
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

            {showPaginationDots && (
                <div className={`paginationDots ${paginationClass}`}>
                    {generateArray(Math.floor(Math.round(children?.length / slidesPerView)), null).map((c: any, ci: number) => (
                        <div key={ci} className={`paginationDot cursorPointer relative`} onClick={(e) => onPaginationDotClick(e, c, ci)}>
                            <span className={`paginationDotIndex absoluteCenter`}>
                                {ci + 1}
                            </span>
                            {activeSlideIndex == ci ? <CircleTwoTone /> : <Circle />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    </>
}