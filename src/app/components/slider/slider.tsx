'use client';

import 'swiper/css';
import './slider.scss';

import { Swiper } from 'swiper/react';
import { Tooltip } from '@mui/material';
import { Autoplay } from 'swiper/modules';
import { generateArray } from '@/shared/scripts/constants';
import { Circle, CircleTwoTone } from '@mui/icons-material';
import Icon_Button from '../buttons/icon-button/icon-button';
import { Children, cloneElement, isValidElement, useEffect, useMemo, useRef, useState } from 'react';

export default function Slider({ 
    children,
    key = `icon`,
    slideNames = [], 
    autoplay = false, 
    autoplayDelay = 0,
    spaceBetween = 15, 
    slidesPerView = 1, 
    showButtons = true, 
    autoplaySpeed = 12_000,
    marqueeSpeed = 100_000,
    startingSlideIndex = 0,
    showPaginationDots = false,
    autoplayPauseOnHover = true,
    className = `sliderComponent`, 
    autoplaySlidesPerView = `auto`,
    paginationClass = `paginationClass`, 
}: any) {
    let swiperRef = useRef<any>(null);
    let [realSlideIndex, setRealSlideIndex] = useState(startingSlideIndex);
    let [activeSlideIndex, setActiveSlideIndex] = useState(startingSlideIndex);
    const childrenArray = useMemo(() => Children.toArray(children), [children]);
    const isMarquee = autoplay && !showButtons && autoplaySlidesPerView === `auto`;
    const marqueeDuration = marqueeSpeed ?? autoplaySpeed;
    const marqueeCopies = useMemo(() => {
        if (!isMarquee || childrenArray?.length <= 0) return 0;
        return Math.max(2, Math.ceil(24 / childrenArray?.length));
    }, [childrenArray?.length, isMarquee]);
    const marqueeItems = useMemo(() => {
        if (!isMarquee || marqueeCopies <= 0 || childrenArray?.length <= 0) return [];
        return Array.from({ length: marqueeCopies }, (_, copyIndex: number) => (
            childrenArray?.map((child: any, childIndex: number) => {
                let key = `${copyIndex}_${child?.key ?? childIndex}`;
                if (isValidElement(child)) {
                    return cloneElement(child, { key });
                }
                return <span key={key}>{child}</span>;
            })
        ))?.flat();
    }, [childrenArray, isMarquee, marqueeCopies]);

    const onSlideChange = (e: any) => {
        setRealSlideIndex(e?.realIndex);
        setActiveSlideIndex(e?.activeIndex);
    }

    const getDotsNumToShow = (): number => {
        let slidesLen = childrenArray?.length ?? 0;
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

    const restartAutoplay = () => {
        const swiperInstance = getSwiper();
        if (!autoplay || !swiperInstance?.autoplay || swiperInstance?.destroyed) return;
        if (swiperInstance.autoplay.paused) {
            swiperInstance.autoplay.resume();
            return;
        }
        if (!swiperInstance.autoplay.running) {
            swiperInstance.autoplay.start();
        }
    }

    useEffect(() => {
        if (!autoplay || isMarquee) return;
        const frame = requestAnimationFrame(() => restartAutoplay());
        return () => cancelAnimationFrame(frame);
    }, [
        autoplay,
        isMarquee,
        childrenArray?.length,
        autoplaySpeed,
        autoplayDelay,
        autoplaySlidesPerView,
        spaceBetween,
    ]);

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
        <div className={`slider ${className} ${autoplay ? `autoplayLinear` : ``} ${isMarquee ? `sliderMarquee` : ``} ${!isMarquee && getDotsNumToShow() > 1 ? `multi-slider` : `single-slider`}`}>
            {childrenArray?.length > 1 && showButtons && (
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

            {isMarquee ? (
                <div className={`sliderMarqueeViewport`}>
                    <div
                        className={`sliderMarqueeTrack`}
                        style={{
                            gap: `${spaceBetween}px`,
                            [`--sliderMarqueeDuration` as any]: `${Math.max(1, Number(marqueeDuration || 0))}ms`,
                            [`--sliderMarqueeDistance` as any]: `-${100 / Math.max(marqueeCopies || 1, 1)}%`,
                        } as any}
                    >
                        {marqueeItems}
                    </div>
                </div>
            ) : (
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
                        speed: autoplaySpeed,
                        freeMode: false,
                        slidesPerView: autoplaySlidesPerView,
                        loopAdditionalSlides: Math.max(childrenArray?.length || 0, 10),
                        modules: [Autoplay],
                        observer: true,
                        observeParents: true,
                        observeSlideChildren: true,
                        autoplay: {
                            delay: Math.max(1, Number(autoplayDelay || 0)),
                            pauseOnMouseEnter: autoplayPauseOnHover,
                            disableOnInteraction: false,
                            waitForTransition: false,
                        },
                    }}
                    >
                    {children}
                </Swiper>
            )}
            
            {childrenArray?.length > 1 && showButtons && (
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

            {childrenArray?.length > 1 && showPaginationDots && (
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
