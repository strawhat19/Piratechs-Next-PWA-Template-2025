'use client';

import { useContext } from 'react';
import Slider from '../slider/slider';
import Loader from '../loaders/loader';
import { SwiperSlide } from 'swiper/react';
import { Roles } from '@/shared/types/types';
import { StateGlobals } from '@/shared/global-context';
import { constants, minRole } from '@/shared/scripts/constants';
import UsersTable from '../table/users-table/users-table';
import OrdersTable from '../table/orders-table/orders-table';
import ProductsTable from '../table/products-table/products-table';
import { useCheckoutReturnToast, useStoreCart } from './use-store-cart';

export default function Store({ className = `storeComponent` }) {
    const { user, width, loaded } = useContext<any>(StateGlobals);
    const canManageStore = minRole(user?.role, Roles.Editor);
    const { addToCart, saveCart } = useStoreCart();
    useCheckoutReturnToast(saveCart);

    return (
        <div className={`storeContainer w99 ${className}`}>
            {loaded ? <>
                <Slider className={`componentSlider`} showButtons={width > constants?.breakpoints?.tabletSmall}>
                    {canManageStore ? (
                        <SwiperSlide>
                            <UsersTable type={`Customer`} />
                        </SwiperSlide>
                    ) : <></>}
                    <SwiperSlide>
                        <OrdersTable />
                    </SwiperSlide>
                    <SwiperSlide>
                        <ProductsTable onAddToCart={addToCart} />
                    </SwiperSlide>
                </Slider>
            </> : <Loader height={250} label={`Store Loading`} />}
        </div>
    )
}
