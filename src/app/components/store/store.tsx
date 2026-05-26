'use client';

import Logo from '../logo/logo';
import Slider from '../slider/slider';
import Storefront from './storefront';
import Loader from '../loaders/loader';
import { SwiperSlide } from 'swiper/react';
import Selector from '../selector/selector';
import { User } from '@/shared/types/models/User';
import UserDetails from './user-details/user-details';
import { StateGlobals } from '@/shared/global-context';
import { Product } from '@/shared/types/models/Product';
import OrderDetails from './order-details/order-details';
import { usePathname, useRouter } from 'next/navigation';
import UsersTable from '../table/users-table/users-table';
import OrdersTable from '../table/orders-table/orders-table';
import { ProductFormDialog } from './product-form/product-form';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Order as StoreOrder } from '@/shared/types/models/Order';
import ProductsTable from '../table/products-table/products-table';
import { constants, dev, minRole } from '@/shared/scripts/constants';
import { DataDisplayModes, Roles, Types } from '@/shared/types/types';
import { useCheckoutReturnToast, useStoreCart } from './use-store-cart';
import AnnouncementsTable from '../table/announcements-table/announcements-table';
import { Campaign, Person, ReceiptLong, ShoppingCart } from '@mui/icons-material';
import DataDisplayModeSelector from '../table/data-display-mode-selector/data-display-mode-selector';

const { Order, Customer } = Types;

const devEnv = dev();

export const productsDefaultDisplayType: DataDisplayModes = DataDisplayModes.Grid;
export const ordersDefaultDisplayType: DataDisplayModes = devEnv ? DataDisplayModes.Grid : DataDisplayModes.Table;
export const customersDefaultDisplayType: DataDisplayModes = devEnv ? DataDisplayModes.Grid : DataDisplayModes.Table;
export const announcementsDefaultDisplayType: DataDisplayModes = devEnv ? DataDisplayModes.Grid : DataDisplayModes.Table;

export const defaultDisplayTypes = {
    orders: ordersDefaultDisplayType,
    products: productsDefaultDisplayType,
    customers: customersDefaultDisplayType,
    announcements: announcementsDefaultDisplayType,
}

export default function Store({ className = `storeComponent` }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, users = [], orders = [], width, loaded, products = [], announcements = [] } = useContext<any>(StateGlobals);
    const canManageStore = minRole(user?.role, Roles.Editor);
    const { addToCart, saveCart } = useStoreCart();
    const [fullEditProduct, setFullEditProduct] = useState<Product | null>(null);
    const [quickEditProduct, setQuickEditProduct] = useState<Product | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
    const [storeSlideIndex, setStoreSlideIndex] = useState(0);
    const [tableDisplayModes, setTableDisplayModes] = useState<Record<number, DataDisplayModes>>({
        0: defaultDisplayTypes?.products,
        1: defaultDisplayTypes?.orders,
        2: defaultDisplayTypes?.announcements,
        3: defaultDisplayTypes?.customers,
    });
    const toggleQuickEditProduct = (product: Product | null) => setQuickEditProduct(prev => prev?.id == product?.id ? null : product);
    const routeEditMatch = pathname?.match(/\/(edit|update)\/([^/]+)/);
    const routeProductID = decodeURIComponent(routeEditMatch?.[2] || ``);
    const routeDetailsMatch = pathname?.match(/(?:^|\/)(?:store\/)?(user|users|order|orders)\/([^/?#]+)/i);
    const routeDetailsType = String(routeDetailsMatch?.[1] || ``).toLowerCase();
    const routeDetailsID = decodeURIComponent(routeDetailsMatch?.[2] || ``);
    const storeSlideNames = useMemo(() => ([
        { 
            value: 0, 
            number: products?.length,
            label: `${Types.Product}s`, 
            color: `var(--success_dark_vibrant)`, 
            activeButtonBG: `var(--success_dark)`,
            icon: <ShoppingCart style={{ fontSize: 15 }} />, 
        },
        { 
            value: 1, 
            label: `${Order}s`, 
            color: `var(--error)`, 
            number: orders?.length,
            icon: <ReceiptLong style={{ fontSize: 16 }} />, 
        },
        { 
            value: 2, 
            color: `var(--links)`,
            number: announcements?.length,
            label: `${Types.Announcement}s`, 
            activeButtonBG: `var(--buttons)`, 
            icon: <Campaign style={{ fontSize: 18 }} />, 
        },
        ...(canManageStore ? [{ 
            value: 3, 
            label: `${Customer}s`, 
            number: users?.length,
            color: `var(--silver)`, 
            activeFontColor: `black`, 
            activeButtonBG: `var(--white_silver)`, 
            icon: <Person style={{ fontSize: 16 }} />, 
        }] : []),
    ]), [announcements?.length, canManageStore, orders?.length, products?.length, users?.length]);

    const activeDisplayMode = tableDisplayModes?.[storeSlideIndex] || DataDisplayModes.Table;
    const setActiveDisplayMode = (nextMode: DataDisplayModes) => {
        setTableDisplayModes(prev => ({ ...prev, [storeSlideIndex]: nextMode }));
    };

    const closeFullEdit = () => {
        setFullEditProduct(null);
        if (routeEditMatch) router.replace(`/store`);
    };

    const closeSelectedDetails = () => {
        setSelectedUser(null);
        setSelectedOrder(null);
        if (routeDetailsID) router.replace(`/store`);
    };

    useEffect(() => {
        const maxSlideIndex = Math.max(storeSlideNames?.length - 1, 0);
        setStoreSlideIndex(prev => Math.min(prev, maxSlideIndex));
    }, [storeSlideNames?.length]);

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
        {loaded && canManageStore && <>
            <div className={`storePageTop customPageTop mh40 flex alignCenter gap5 relative`}>
                <Logo label={`Store`} style={{ marginRight: 5 }} />
                <>
                    <Selector
                        customColors={false}
                        value={storeSlideIndex}
                        options={storeSlideNames}
                        className={`storeOptions`}
                        ariaLabel={`Store sections`}
                        onChange={(nextSlideIndex) => setStoreSlideIndex(Number(nextSlideIndex))}
                    />
                    <DataDisplayModeSelector
                        value={activeDisplayMode}
                        onChange={setActiveDisplayMode}
                        className={`storeDisplayOptions`}
                    />
                </>
            </div>
        </>}
        <div className={`storeContainer ${user != null && minRole(user?.role, Roles.Editor) ? `w99` : `w100`} ${className}`}>
            {loaded ? <>
                {user != null && minRole(user?.role, Roles.Editor) ? <>
                    <Slider 
                        slideNames={storeSlideNames} 
                        startingSlideIndex={storeSlideIndex}
                        selectedSlideIndex={storeSlideIndex}
                        onSlideChangeIndex={setStoreSlideIndex}
                        className={`componentSlider storeSlider`} 
                        showButtons={width > constants?.breakpoints?.tabletSmall}
                    >
                        <SwiperSlide>
                            <div className={`storeProductsPanel`}>
                                <ProductsTable 
                                    onAddToCart={addToCart} 
                                    mode={tableDisplayModes?.[0]}
                                    quickEditProduct={quickEditProduct} 
                                    onQuickEdit={toggleQuickEditProduct} 
                                    setFullEditProduct={setFullEditProduct}
                                    setQuickEditProduct={setQuickEditProduct}
                                />
                            </div>
                        </SwiperSlide>
                        <SwiperSlide>
                            <OrdersTable mode={tableDisplayModes?.[1]} onOpenOrderDetails={openOrderDetails} />
                        </SwiperSlide>
                        <SwiperSlide>
                            <AnnouncementsTable mode={tableDisplayModes?.[2]} />
                        </SwiperSlide>
                        {canManageStore ? (
                            <SwiperSlide>
                                <UsersTable type={`Customer`} mode={tableDisplayModes?.[3]} onOpenUserDetails={openUserDetails} />
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
                </> : <Storefront />}
            </> : <Loader height={250} label={`Store Loading`} />}
        </div>
    </>
}
