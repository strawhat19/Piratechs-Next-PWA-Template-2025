'use client';

import { useContext } from 'react';
import Table from '../table/table';
import Slider from '../slider/slider';
import Loader from '../loaders/loader';
import TestPayment from './test-payment';
import { SwiperSlide } from 'swiper/react';
import { constants } from '@/shared/scripts/constants';
import { StateGlobals } from '@/shared/global-context';
import UsersTable from '../table/users-table/users-table';

export default function Store({ className = `storeComponent` }) {
    const { user, width, loaded } = useContext<any>(StateGlobals);
    return (
        <div className={`storeContainer w99 ${className}`}>
            {loaded ? <>
                <TestPayment />
                <Slider className={`componentSlider`} showButtons={width > constants?.breakpoints?.tabletSmall}>
                    {user == null ? <></> : (
                        <SwiperSlide>
                            <UsersTable type={`Customer`} />
                        </SwiperSlide>
                    )}
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
