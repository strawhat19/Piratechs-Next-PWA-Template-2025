'use client';

import { useContext, useState } from 'react';
import Slider from '../slider/slider';
import Loader from '../loaders/loader';
import { SwiperSlide } from 'swiper/react';
import { Roles } from '@/shared/types/types';
import { StateGlobals } from '@/shared/global-context';
import UsersTable from '../table/users-table/users-table';
import OrdersTable from '../table/orders-table/orders-table';
import { Product } from '@/shared/types/models/Product';
import { constants, minRole } from '@/shared/scripts/constants';
import ProductsTable from '../table/products-table/products-table';
import ProductForm, { ProductFormDialog } from './product-form/product-form';
import { useCheckoutReturnToast, useStoreCart } from './use-store-cart';

export default function Store({ className = `storeComponent` }) {
    const { user, width, loaded } = useContext<any>(StateGlobals);
    const canManageStore = minRole(user?.role, Roles.Editor);
    const { addToCart, saveCart } = useStoreCart();
    const [fullEditProduct, setFullEditProduct] = useState<Product | null>(null);
    const [quickEditProduct, setQuickEditProduct] = useState<Product | null>(null);
    const toggleQuickEditProduct = (product: Product | null) => setQuickEditProduct(prev => prev?.id == product?.id ? null : product);
    useCheckoutReturnToast(saveCart);

    return (
        <div className={`storeContainer w99 ${className}`}>
            {loaded ? <>
                <Slider className={`componentSlider`} showButtons={width > constants?.breakpoints?.tabletSmall}>
                    <SwiperSlide>
                        <div className={`storeProductsPanel`}>
                            <ProductForm
                                widget
                                product={quickEditProduct}
                                onSaved={() => setQuickEditProduct(null)}
                                onCancelEdit={() => setQuickEditProduct(null)}
                                onFullEdit={(product: Product | null) => setFullEditProduct(product)}
                            />
                            <ProductsTable quickEditProduct={quickEditProduct} onAddToCart={addToCart} onQuickEdit={toggleQuickEditProduct} />
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <OrdersTable />
                    </SwiperSlide>
                    {canManageStore ? (
                        <SwiperSlide>
                            <UsersTable type={`Customer`} />
                        </SwiperSlide>
                    ) : <></>}
                </Slider>
                <ProductFormDialog
                    product={fullEditProduct}
                    open={fullEditProduct != null}
                    onClose={() => setFullEditProduct(null)}
                />
            </> : <Loader height={250} label={`Store Loading`} />}
        </div>
    )
}
