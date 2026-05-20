'use client';

import Slider from '../slider/slider';
import Loader from '../loaders/loader';
import { SwiperSlide } from 'swiper/react';
import { useContext, useEffect, useState } from 'react';
import { Roles, Types } from '@/shared/types/types';
import { StateGlobals } from '@/shared/global-context';
import { Product } from '@/shared/types/models/Product';
import UsersTable from '../table/users-table/users-table';
import OrdersTable from '../table/orders-table/orders-table';
import { constants, minRole } from '@/shared/scripts/constants';
import { ProductFormDialog } from './product-form/product-form';
import ProductsTable from '../table/products-table/products-table';
import { Person, ReceiptLong, ShoppingCart } from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import { useCheckoutReturnToast, useStoreCart } from './use-store-cart';

const { Order, Customer } = Types;

export default function Store({ className = `storeComponent` }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, width, loaded, products = [] } = useContext<any>(StateGlobals);
    const canManageStore = minRole(user?.role, Roles.Editor);
    const { addToCart, saveCart } = useStoreCart();
    const [fullEditProduct, setFullEditProduct] = useState<Product | null>(null);
    const [quickEditProduct, setQuickEditProduct] = useState<Product | null>(null);
    const toggleQuickEditProduct = (product: Product | null) => setQuickEditProduct(prev => prev?.id == product?.id ? null : product);
    const routeEditMatch = pathname?.match(/\/(edit|update)\/([^/]+)/);
    const routeProductID = decodeURIComponent(routeEditMatch?.[2] || ``);

    const closeFullEdit = () => {
        setFullEditProduct(null);
        if (routeEditMatch) router.replace(`/store`);
    };

    useEffect(() => {
        if (!routeProductID || products?.length == 0) return;
        const matchedProduct = products?.find((product: Product) => String(product?.id || ``) == routeProductID) || null;
        if (matchedProduct?.id) setFullEditProduct(matchedProduct);
    }, [products, routeProductID]);
    
    useCheckoutReturnToast(saveCart);

    return (
        <div className={`storeContainer w99 ${className}`}>
            {loaded ? <>
                <Slider 
                    className={`componentSlider`} 
                    showButtons={width > constants?.breakpoints?.tabletSmall}
                    slideNames={[
                        { key: 0, icon: <ShoppingCart />, label: `${Types.Product}s` }, 
                        { key: 1, icon: <ReceiptLong />, label: `${Order}s` }, 
                        { key: 2, icon: <Person />, label: `${Customer}s` }
                    ]} 
                >
                    <SwiperSlide>
                        <div className={`storeProductsPanel`}>
                            <ProductsTable 
                                onAddToCart={addToCart} 
                                quickEditProduct={quickEditProduct} 
                                onQuickEdit={toggleQuickEditProduct} 
                                setFullEditProduct={setFullEditProduct}
                                setQuickEditProduct={setQuickEditProduct}
                            />
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
                    onClose={closeFullEdit}
                />
            </> : <Loader height={250} label={`Store Loading`} />}
        </div>
    )
}
