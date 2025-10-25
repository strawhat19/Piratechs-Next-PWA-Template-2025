'use client';

import { useContext } from 'react';
import Slider from '../slider/slider';
import ListComponent from './list/list';
import { SwiperSlide } from 'swiper/react';
import { constants } from '@/shared/scripts/constants';
import { StateGlobals } from '@/shared/global-context';

export default function Board() {
    const { width, height } = useContext<any>(StateGlobals);
    return <>
        <div className={`boardComponent`}>
            <Slider 
                spaceBetween={1}
                showButtons={false} 
                className={`boardsListsSlider`} 
                paginationClass={`boardListPaginationDots`}
                slidesPerView={width >= 1540 ? 3 : (width >= 1045 ? 2 : 1)}
                showPaginationDots={width > constants?.breakpoints?.tabletSmall && height > constants?.breakpoints?.tabletSmall} 
            >
                <SwiperSlide>
                    <ListComponent />
                </SwiperSlide>
                <SwiperSlide>
                    <ListComponent title={`Active`} />
                </SwiperSlide>
                <SwiperSlide>
                    <ListComponent title={`Complete`} />
                </SwiperSlide>
            </Slider>
        </div>
    </>
}