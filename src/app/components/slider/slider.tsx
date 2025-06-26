import 'swiper/css';
import './slider.scss';

import { useRef } from 'react';
// import 'swiper/css/effect-cards';
import { Swiper } from 'swiper/react';
import { Button } from '@mui/material';
// import { EffectCards } from 'swiper/modules';

export default function Slider({ children }: any) {
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
        <div className={`slider`}>
            <Button onClick={() => slide(-1)} style={{ fontSize: 24, minWidth: `unset` }}>
                {`<`}
            </Button>
            <Swiper 
                loop={true}
                // speed={500}
                ref={swiperRef}
                spaceBetween={0} 
                slidesPerView={1} 
                navigation={true} 
                pagination={true} 
                // effect={`cards`}
                simulateTouch={true} 
                allowTouchMove={true}
                // modules={[EffectCards]}
            >
                {children}
            </Swiper>
            <Button onClick={() => slide(1)} style={{ fontSize: 24, minWidth: `unset` }}>
                {`>`}
            </Button>
        </div>
    </>
}