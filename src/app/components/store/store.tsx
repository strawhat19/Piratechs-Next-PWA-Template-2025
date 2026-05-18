'use client';

import { useContext } from 'react';
import Table from '../table/table';
import Slider from '../slider/slider';
import Loader from '../loaders/loader';
import { SwiperSlide } from 'swiper/react';
import { constants } from '@/shared/scripts/constants';
import { StateGlobals } from '@/shared/global-context';
import UsersTable from '../table/users-table/users-table';
import ProductsTable from '../table/products-table/products-table';
import { useCheckoutReturnToast, useStoreCart } from './use-store-cart';

export default function Store({ className = `storeComponent` }) {
    const { user, width, loaded } = useContext<any>(StateGlobals);
    const { addToCart, saveCart } = useStoreCart();
    useCheckoutReturnToast(saveCart);

    return (
        <div className={`storeContainer w99 ${className}`}>
            {loaded ? <>
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
                        <ProductsTable onAddToCart={addToCart} />
                    </SwiperSlide>
                </Slider>
            </> : <Loader height={250} label={`Store Loading`} />}
        </div>
    )
}
