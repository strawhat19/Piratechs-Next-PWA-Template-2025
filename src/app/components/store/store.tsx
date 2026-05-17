'use client';

import { useContext } from 'react';
import Table from '../table/table';
import Slider from '../slider/slider';
import Loader from '../loaders/loader';
import { SwiperSlide } from 'swiper/react';
import { constants } from '@/shared/scripts/constants';
import { StateGlobals } from '@/shared/global-context';

export default function Store({ className = `storeComponent` }) {
    const { width, loaded } = useContext<any>(StateGlobals);
    return (
        <div className={`storeContainer w95 ${className}`}>
            {loaded ? <>
                <Slider className={`stocksComponentSlider`} showButtons={width > constants?.breakpoints?.tabletSmall}>
                    <SwiperSlide>
                        <Table title={`Customer(s)`} />
                    </SwiperSlide>
                    <SwiperSlide>
                        <Table title={`Order(s)`} />
                    </SwiperSlide>
                    <SwiperSlide>
                        <Table title={`Product(s)`} />
                    </SwiperSlide>
                </Slider>
            </> : <Loader height={250} label={`Store Loading`} />}
        </div>
    )
}