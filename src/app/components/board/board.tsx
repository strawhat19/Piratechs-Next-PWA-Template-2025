'use client';

import { useContext } from 'react';
import Slider from '../slider/slider';
import ListComponent from './list/list';
import { SwiperSlide } from 'swiper/react';
import { constants } from '@/shared/scripts/constants';
import { StateGlobals } from '@/shared/global-context';

export default function Board() {
    const { width, height } = useContext<any>(StateGlobals);

    const getSlidesPerView = (wd: number = width): number => {
        if (wd >= 1540) {
            return wd > 1920 ? 4 : 3;
        } else {
            return wd >= 1045 ? 2 : 1;
        }
    }

    return <>
        <div className={`boardComponent`}>
            <Slider 
                spaceBetween={1}
                showButtons={false} 
                className={`boardsListsSlider`} 
                showPaginationDots={width >= 501} 
                slidesPerView={getSlidesPerView()}
                paginationClass={`boardListPaginationDots`}
                // showPaginationDots={width > constants?.breakpoints?.tabletSmall && height > constants?.breakpoints?.tabletSmall} 
            >
                <SwiperSlide>
                    <ListComponent />
                </SwiperSlide>
                <SwiperSlide>
                    <ListComponent title={`Active`} />
                </SwiperSlide>
                <SwiperSlide>
                    <ListComponent title={`Blocked`} />
                </SwiperSlide>
                <SwiperSlide>
                    <ListComponent title={`Complete`} />
                </SwiperSlide>
            </Slider>
        </div>
    </>
}