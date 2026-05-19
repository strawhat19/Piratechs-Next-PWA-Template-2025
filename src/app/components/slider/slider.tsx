'use client';

import 'swiper/css';
import './slider.scss';

// import 'swiper/css/effect-cards';
import { Swiper } from 'swiper/react';
import { useRef, useState } from 'react';
import { Autoplay } from 'swiper/modules';
import { Button, Tooltip } from '@mui/material';
// import { EffectCards } from 'swiper/modules';
// import { State } from '../container/container';
import { generateArray } from '@/shared/scripts/constants';
import { Circle, CircleTwoTone } from '@mui/icons-material';
import Icon_Button from '../buttons/icon-button/icon-button';

export default function Slider({ 
    children,
    key = `icon`,
    slideNames = [], 
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
    let [realSlideIndex, setRealSlideIndex] = useState(startingSlideIndex);
    let [activeSlideIndex, setActiveSlideIndex] = useState(startingSlideIndex);

    const onSlideChange = (e: any) => {
        setRealSlideIndex(e?.realIndex);
        setActiveSlideIndex(e?.activeIndex);
    }

    const getDotsNumToShow = (): number => {
        let slidesLen = children?.length ?? 0;
        let dotsToShow = Math.ceil(slidesLen / slidesPerView);
        return dotsToShow;
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
        <div className={`slider ${className} ${getDotsNumToShow() > 1 ? `multi-slider` : `single-slider`}`}>
            {children?.length > 1 && showButtons && (
                <Icon_Button rounded={false} button={true} className={`sliderButton sliderButtonPrev`} onClick={() => slide(-1)}>
                    <Tooltip arrow title={slideNames?.length > 0 ? slideNames?.[(realSlideIndex - 1 + slideNames?.length) % slideNames?.length]?.label : ``}>
                       <div className={`slideNameContent`}>
                            <span className={`pointerEventsNoneI`}>
                                {`<`}
                            </span>
                            <span className={`slideName slideNamePrev pointerEventsNoneI`}>
                                {slideNames?.length > 0 ? slideNames?.[(realSlideIndex - 1 + slideNames?.length) % slideNames?.length]?.[key] : ``}
                            </span>
                       </div>
                    </Tooltip>
                </Icon_Button>
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
            
            {children?.length > 1 && showButtons && (
                <Icon_Button rounded={false} button={true} className={`sliderButton sliderButtonNext`} onClick={() => slide(1)}>
                    <Tooltip arrow title={slideNames?.length > 0 ? slideNames?.[(realSlideIndex + 1) % slideNames?.length]?.label : ``}>
                        <div className={`slideNameContent`}>
                            <span className={`slideName slideNameNext pointerEventsNoneI`}>
                                {slideNames?.length > 0 ? slideNames?.[(realSlideIndex + 1) % slideNames?.length]?.[key] : ``}
                            </span>
                            <span className={`pointerEventsNoneI`}>
                                {`>`}
                            </span>
                        </div>
                    </Tooltip>
                </Icon_Button>
            )}

            {children?.length > 1 && showPaginationDots && (
                <div className={`paginationDots ${paginationClass}`}>
                    {generateArray(getDotsNumToShow(), null).map((c: any, ci: number) => (
                        <div key={ci} className={`paginationDot cursorPointer relative ${getDotsNumToShow() > 1 ? `` : `invisible`}`} onClick={(e) => onPaginationDotClick(e, c, ci)}>
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