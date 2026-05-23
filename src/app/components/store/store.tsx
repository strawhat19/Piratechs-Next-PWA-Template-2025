'use client';

import Logo from '../logo/logo';
import Slider from '../slider/slider';
import Loader from '../loaders/loader';
import { SwiperSlide } from 'swiper/react';
import { User } from '@/shared/types/models/User';
import { Roles, Types } from '@/shared/types/types';
import UserDetails from './user-details/user-details';
import { StateGlobals } from '@/shared/global-context';
import { useContext, useEffect, useState } from 'react';
import { Product } from '@/shared/types/models/Product';
import OrderDetails from './order-details/order-details';
import { usePathname, useRouter } from 'next/navigation';
import UsersTable from '../table/users-table/users-table';
import OrdersTable from '../table/orders-table/orders-table';
import { constants, minRole } from '@/shared/scripts/constants';
import { ProductFormDialog } from './product-form/product-form';
import { Order as StoreOrder } from '@/shared/types/models/Order';
import ProductsTable from '../table/products-table/products-table';
import { useCheckoutReturnToast, useStoreCart } from './use-store-cart';
import AnnouncementsTable from '../table/announcements-table/announcements-table';
import { Campaign, Person, ReceiptLong, ShoppingCart } from '@mui/icons-material';

const { Order, Customer } = Types;

export default function Store({ className = `storeComponent` }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, users = [], orders = [], width, loaded, products = [] } = useContext<any>(StateGlobals);
    const canManageStore = minRole(user?.role, Roles.Editor);
    const { addToCart, saveCart } = useStoreCart();
    const [fullEditProduct, setFullEditProduct] = useState<Product | null>(null);
    const [quickEditProduct, setQuickEditProduct] = useState<Product | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
    const toggleQuickEditProduct = (product: Product | null) => setQuickEditProduct(prev => prev?.id == product?.id ? null : product);
    const routeEditMatch = pathname?.match(/\/(edit|update)\/([^/]+)/);
    const routeProductID = decodeURIComponent(routeEditMatch?.[2] || ``);
    const routeDetailsMatch = pathname?.match(/(?:^|\/)(?:store\/)?(user|users|order|orders)\/([^/?#]+)/i);
    const routeDetailsType = String(routeDetailsMatch?.[1] || ``).toLowerCase();
    const routeDetailsID = decodeURIComponent(routeDetailsMatch?.[2] || ``);
    const storeSlideNames = [
        { key: 0, icon: <ShoppingCart />, label: `${Types.Product}s` }, 
        { key: 1, icon: <ReceiptLong />, label: `${Order}s` }, 
        { key: 2, icon: <Campaign />, label: `${Types.Announcement}s` },
        ...(canManageStore ? [{ key: 3, icon: <Person />, label: `${Customer}s` }] : []),
    ];

    const closeFullEdit = () => {
        setFullEditProduct(null);
        if (routeEditMatch) router.replace(`/store`);
    };

    const closeSelectedDetails = () => {
        setSelectedUser(null);
        setSelectedOrder(null);
        if (routeDetailsID) router.replace(`/store`);
    };

    const openUserDetails = (nextUser: User | null) => {
        if (!nextUser?.id) return;
        setSelectedUser(nextUser);
        setSelectedOrder(null);
        const nextPath = `/store/user/${encodeURIComponent(String(nextUser?.id))}`;
        if (pathname != nextPath) router.push(nextPath);
    };

    const openOrderDetails = (nextOrder: StoreOrder | null) => {
        const nextID = String(nextOrder?.id || nextOrder?.stripePaymentIntentID || nextOrder?.stripeCheckoutSessionID || nextOrder?.stripe_order_id || ``).trim();
        if (!nextID) return;
        setSelectedOrder(nextOrder);
        setSelectedUser(null);
        const nextPath = `/store/order/${encodeURIComponent(nextID)}`;
        if (pathname != nextPath) router.push(nextPath);
    };

    useEffect(() => {
        if (!routeProductID || products?.length == 0) return;
        const matchedProduct = products?.find((product: Product) => String(product?.id || ``) == routeProductID) || null;
        if (matchedProduct?.id) setFullEditProduct(matchedProduct);
    }, [products, routeProductID]);

    useEffect(() => {
        if (!routeDetailsID) {
            setSelectedUser(null);
            setSelectedOrder(null);
            return;
        }
        if (routeDetailsType.startsWith(`user`)) {
            if (!canManageStore) {
                setSelectedUser(null);
                return;
            }
            const matchedUser = users?.find((currentUser: User | any) => String(currentUser?.id || ``) == routeDetailsID) || null;
            setSelectedUser(matchedUser);
            setSelectedOrder(null);
            return;
        }
        if (routeDetailsType.startsWith(`order`)) {
            const visibleOrders = canManageStore ? orders : orders?.filter((order: StoreOrder) => Boolean(order?.userID) && [user?.id, user?.uid].includes(order?.userID) || Boolean(order?.userEmail && user?.email && order?.userEmail == user?.email));
            const matchedOrder = visibleOrders?.find((currentOrder: StoreOrder | any) => [
                currentOrder?.id,
                currentOrder?.stripePaymentIntentID,
                currentOrder?.stripeCheckoutSessionID,
                currentOrder?.stripe_order_id,
            ].some(value => String(value || ``) == routeDetailsID)) || null;
            setSelectedOrder(matchedOrder);
            setSelectedUser(null);
            return;
        }
        setSelectedUser(null);
        setSelectedOrder(null);
    }, [canManageStore, orders, routeDetailsID, routeDetailsType, users, user?.email, user?.id, user?.uid]);
    
    useCheckoutReturnToast(saveCart);

    return <>
        {user != null && <>
                <div className={`customPageTop mh40 flex alignCenter gap5 spaceBetween w100 relative`} style={{ top: 60, left: 10, marginBottom: 52 }}>
                    <Logo label={`Store`} style={{ marginRight: 5 }} />
                </div>
            </>
        }
        <div className={`storeContainer w99 ${className}`}>
            {loaded ? <>
                <Slider 
                    slideNames={storeSlideNames} 
                    className={`componentSlider storeSlider`} 
                    showButtons={width > constants?.breakpoints?.tabletSmall}
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
                        <OrdersTable onOpenOrderDetails={openOrderDetails} />
                    </SwiperSlide>
                    <SwiperSlide>
                        <AnnouncementsTable />
                    </SwiperSlide>
                    {canManageStore ? (
                        <SwiperSlide>
                            <UsersTable type={`Customer`} onOpenUserDetails={openUserDetails} />
                        </SwiperSlide>
                    ) : <></>}
                </Slider>
                <ProductFormDialog
                    onClose={closeFullEdit}
                    product={fullEditProduct}
                    open={fullEditProduct != null}
                />
                <UserDetails
                    user={selectedUser}
                    open={selectedUser != null}
                    onClose={closeSelectedDetails}
                />
                <OrderDetails
                    order={selectedOrder}
                    open={selectedOrder != null}
                    onClose={closeSelectedDetails}
                />
            </> : <Loader height={250} label={`Store Loading`} />}
        </div>
    </>
}
