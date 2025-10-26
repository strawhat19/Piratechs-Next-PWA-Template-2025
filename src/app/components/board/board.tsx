'use client';

import { useContext } from 'react';
import Slider from '../slider/slider';
import ListComponent from './list/list';
import { SwiperSlide } from 'swiper/react';
import { StateGlobals } from '@/shared/global-context';
import { constants } from '@/shared/scripts/constants';

export default function Board() {
    const { width } = useContext<any>(StateGlobals);

    const getSlidesPerView = (wd: number = width): number => {
        let slidesInView = 1;
        let { desktop, tabletMed, pc } = constants?.breakpoints ?? {};
        
        if (wd >= pc) {
            if (wd > desktop) {
                slidesInView = 4;
            } else {
                slidesInView = 3;
            }
        } else {
            if (wd >= tabletMed) {
                slidesInView = 2;
            }
        }

        return slidesInView;
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