'use client';

import { useContext } from 'react';
import Slider from '../slider/slider';
import ListComponent from './list/list';
import { SwiperSlide } from 'swiper/react';
import { State } from '../container/container';
import { constants } from '@/shared/scripts/constants';

export default function Board() {
    const { width } = useContext<any>(State);
    return <>
        <div className={`boardComponent`}>
            <Slider className={`boardsListsSlider`} showButtons={false} showPaginationDots={width > constants?.breakpoints?.tabletSmall}>
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