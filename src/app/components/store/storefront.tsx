'use client';

import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { useContext, useMemo } from 'react';
import { StateGlobals } from '@/shared/global-context';
import { Product } from '@/shared/types/models/Product';
import { richTextToPlainText } from '@/app/components/rich-text/rich-text';
import { Announcement, AnnouncementStatus } from '@/shared/types/models/Announcement';
import { formatStorePrice, useStoreCart } from '@/app/components/store/use-store-cart';
import { StorefrontProductCard, StorefrontProductMedia, isActiveProduct } from './storefront-product-card/storefront-product-card';
import {
    AddShoppingCart,
    ArrowForward,
    AutoAwesome,
    Brush,
    Collections,
    DesignServices,
    Favorite,
    Palette,
    Sell,
    ShoppingBag,
    ShoppingCartCheckout,
    Star,
    Storefront as StorefrontIcon,
} from '@mui/icons-material';
import { announcementIcons } from './announcement-form/announcement-select-field';
import IconText from '../icon-text/icon-text';

const heroImageURL = `/assets/store/storefront-hero.png`;
const activeAnnouncementStatus = AnnouncementStatus.Active.toLowerCase();

const isActiveAnnouncement = (announcement: Announcement) => (
    String(announcement?.status || (announcement?.active ? AnnouncementStatus.Active : AnnouncementStatus.Draft)).toLowerCase() == activeAnnouncementStatus
);

const sortProductCards = (products: Product[] = []) => [...products].sort((a, b) => (
    Number(Boolean(b?.featured)) - Number(Boolean(a?.featured)) ||
    Number(a?.number || 0) - Number(b?.number || 0) ||
    String(a?.name || ``).localeCompare(String(b?.name || ``))
));

const getCategorySummaries = (products: Product[] = []) => {
    const counts = new Map<string, number>();
    products.forEach(product => {
        const category = String(product?.category || product?.productType || `Art`).trim();
        if (!category) return;
        counts.set(category, (counts.get(category) || 0) + 1);
    });
    return Array.from(counts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
        .slice(0, 4);
};

const StorefrontAnnouncement = ({ announcement }: { announcement: Announcement }) => {
    const description = richTextToPlainText(announcement?.description);
    const details = richTextToPlainText(announcement?.details);
    return (
        <article className={`storefrontAnnouncementCard`}>
            <div className={`storefrontAnnouncementIcon`}>
                {announcementIcons?.[String(announcement?.icon)]}
            </div>
            <div>
                <strong>{announcement?.name || announcement?.title || `Studio Update`}</strong>
                <p className={`lineClamp4`}>
                    {description || details || `New art and shop notes are live.`}
                </p>
            </div>
        </article>
    );
};

type StorefrontProps = {
    className?: string;
    products?: Product[];
    announcements?: Announcement[];
};

export default function Storefront({
    className = ``,
    products: productsProp,
    announcements: announcementsProp,
}: StorefrontProps) {
    const {
        products = [],
        announcements = [],
        productsLoading = false,
        announcementsLoading = false,
    } = useContext<any>(StateGlobals);
    const catalogProducts = (productsProp || products || []) as Product[];
    const catalogAnnouncements = (announcementsProp || announcements || []) as Announcement[];
    const {
        cart,
        cartCount,
        cartTotal,
        addToCart,
        upsertCartItemQuantity,
        increaseCartItemQuantity,
        decreaseCartItemQuantity,
    } = useStoreCart();

    const activeProducts = useMemo(() => (
        sortProductCards(catalogProducts.filter(isActiveProduct))
    ), [catalogProducts]);
    const featuredProducts = useMemo(() => (
        activeProducts.filter(product => Boolean(product?.featured)).slice(0, 4)
    ), [activeProducts]);
    const standardProducts = useMemo(() => (
        activeProducts.filter(product => !product?.featured)
    ), [activeProducts]);
    const activeAnnouncements = useMemo(() => (
        catalogAnnouncements.filter(isActiveAnnouncement).slice(0, 3)
    ), [catalogAnnouncements]);
    const categories = useMemo(() => getCategorySummaries(activeProducts), [activeProducts]);
    const heroProduct = featuredProducts?.[0] || activeProducts?.[0] || null;
    const isLoading = productsLoading || announcementsLoading;

    const addProductToCart = (product: Product) => {
        const added = addToCart(product);
        if (added !== false) toast.success(`${product?.name || `Product`} Added To Cart`);
    };

    const getCartItem = (product: Product) => (
        cart.find((item) => String(item?.id) == String(product?.id)) || null
    );

    return (
        <section className={`storefrontComponent ${className}`.trim()}>
            <section className={`storefrontHero`} aria-label={`Art store storefront`}>
                <Image
                    fill
                    priority
                    sizes={`100vw`}
                    src={heroImageURL}
                    className={`storefrontHeroImage`}
                    alt={`Artist studio table with stickers, paintings, prints, and packaged art`}
                />
                <div className={`storefrontHeroOverlay`} />
                <div className={`storefrontHeroInner`}>
                    <div className={`storefrontHeroCopy`}>
                        <span className={`storefrontEyebrow`}>
                            <AutoAwesome fontSize={`small`} />
                            Custom Art & Graphics
                        </span>
                        <h1>Pocket Fox Studios</h1>
                        <p>
                            Stickers, custom art, paintings, prints, and crisp graphics made to collect, gift, and keep close.
                        </p>
                        <div className={`storefrontHeroActions`}>
                            <a href={`#storefront-products`} className={`storefrontPrimaryAction`}>
                                <ShoppingBag fontSize={`small`} />
                                Shop Art
                            </a>
                            <Link href={`/contact`} className={`storefrontSecondaryAction`}>
                                <DesignServices fontSize={`small`} />
                                Commission Art
                            </Link>
                        </div>
                        <div className={`storefrontHeroStats`} aria-label={`Storefront summary`}>
                            <span><StorefrontIcon fontSize={`small`} /> {activeProducts.length} active item{activeProducts.length == 1 ? `` : `s`}</span>
                            <span><Favorite fontSize={`small`} /> {featuredProducts.length} featured</span>
                            <span><Sell fontSize={`small`} /> {categories.length || 1} collection{(categories.length || 1) == 1 ? `` : `s`}</span>
                        </div>
                    </div>
                    {heroProduct ? (
                        <div className={`storefrontHeroFeature ${featuredProducts?.length > 0 ? `wFeatured` : ``}`} aria-label={`Featured product`}>
                            {featuredProducts?.length > 0 ? <>
                                <StorefrontProductCard
                                    product={heroProduct}
                                    key={String(heroProduct?.id)}
                                    onAddToCart={addProductToCart}
                                    featured={heroProduct?.featured}
                                    cartItem={getCartItem(heroProduct)}
                                    onSaveCartQuantity={upsertCartItemQuantity}
                                    onIncreaseCartQuantity={increaseCartItemQuantity}
                                    onDecreaseCartQuantity={decreaseCartItemQuantity}
                                    cartQuantity={getCartItem(heroProduct)?.quantity || 0}
                                />
                            </> : <>
                                <StorefrontProductMedia product={heroProduct} featured={heroProduct?.featured} />
                                <strong>{heroProduct?.name}</strong>
                                <button type={`button`} onClick={() => addProductToCart(heroProduct)}>
                                    <AddShoppingCart fontSize={`small`} />
                                    <IconText
                                        dollarSign
                                        format={false}
                                        className={`stockText`}
                                        number={heroProduct?.price / 100}
                                    />
                                </button>
                            </>}
                        </div>
                    ) : <></>}
                </div>
            </section>

            <div className={`storePageContent`}>
                <div className={`storefrontCartBar ${cartCount > 0 ? `active` : ``}`.trim()}>
                    <div>
                        <ShoppingCartCheckout fontSize={`small`} />
                        <span>{cartCount} item{cartCount == 1 ? `` : `s`} in cart</span>
                        <strong>{cartTotal}</strong>
                    </div>
                    <Link href={`/cart`}>
                        Checkout
                        <ArrowForward fontSize={`small`} />
                    </Link>
                </div>

                {activeAnnouncements.length > 0 ? (
                    <section className={`storefrontAnnouncements`} aria-label={`Store announcements`}>
                        {activeAnnouncements.map(announcement => (
                            <StorefrontAnnouncement key={String(announcement?.id || announcement?.number || announcement?.name)} announcement={announcement} />
                        ))}
                    </section>
                ) : <></>}

                <section className={`storefrontCategories`} aria-label={`Art collections`}>
                    {(categories.length > 0 ? categories : [
                        { name: `Stickers`, count: 0 },
                        { name: `Custom Art`, count: 0 },
                        { name: `Paintings`, count: 0 },
                        { name: `Graphics`, count: 0 },
                    ]).map((category, index) => (
                        <div className={`storefrontCategoryTile category${index + 1}`} key={category.name}>
                            <span>{category.name}</span>
                            <strong>{category.count > 0 ? `${category.count} item${category.count == 1 ? `` : `s`}` : `Open`}</strong>
                        </div>
                    ))}
                </section>

                {featuredProducts.length > 0 ? (
                    <section id={`storefront-featured`} className={`storefrontSection storefrontFeaturedProducts`}>
                        <div className={`storefrontSectionIntro`}>
                            <span><Star fontSize={`small`} /> Featured Drops</span>
                            <h2>Collector-ready pieces with extra spotlight.</h2>
                        </div>
                        <div className={`storefrontFeaturedGrid`}>
                            {featuredProducts.map(product => {
                                const cartItem = getCartItem(product);
                                return (
                                    <StorefrontProductCard
                                        featured
                                        product={product}
                                        cartItem={cartItem}
                                        key={String(product?.id)}
                                        onAddToCart={addProductToCart}
                                        cartQuantity={cartItem?.quantity || 0}
                                        onSaveCartQuantity={upsertCartItemQuantity}
                                        onIncreaseCartQuantity={increaseCartItemQuantity}
                                        onDecreaseCartQuantity={decreaseCartItemQuantity}
                                    />
                                );
                            })}
                        </div>
                    </section>
                ) : <></>}

                <section id={`storefront-products`} className={`storefrontSection storefrontProductsSection`}>
                    <div className={`storefrontSectionIntro`}>
                        <span><Collections fontSize={`small`} /> Shop The Collection</span>
                        <h2>{standardProducts.length > 0 ? `Fresh stickers, prints, graphics, and originals.` : `The next collection is on the table.`}</h2>
                    </div>
                    {isLoading ? (
                        <div className={`storefrontLoadingGrid`} aria-label={`Loading products`}>
                            {Array.from({ length: 4 }).map((_, index) => <span key={index} />)}
                        </div>
                    ) : standardProducts.length > 0 ? (
                        <div className={`storefrontProductGrid`}>
                            {standardProducts.map(product => {
                                const cartItem = getCartItem(product);
                                return (
                                    <StorefrontProductCard
                                        product={product}
                                        cartItem={cartItem}
                                        key={String(product?.id)}
                                        onAddToCart={addProductToCart}
                                        cartQuantity={cartItem?.quantity || 0}
                                        onSaveCartQuantity={upsertCartItemQuantity}
                                        onIncreaseCartQuantity={increaseCartItemQuantity}
                                        onDecreaseCartQuantity={decreaseCartItemQuantity}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className={`storefrontEmptyState`}>
                            <Brush fontSize={`small`} />
                            <strong>New work is being prepared.</strong>
                            <p>Check back for active products, limited sticker runs, custom art slots, paintings, and graphics.</p>
                        </div>
                    )}
                </section>

                <section className={`storefrontServices`} aria-label={`Custom art services`}>
                    <div className={`storefrontServiceIntro`}>
                        <span><Brush fontSize={`small`} /> Services</span>
                        <h2>Custom work for gifts, brands, walls, and everyday objects.</h2>
                    </div>
                    <div className={`storefrontServiceGrid`}>
                        <div><AutoAwesome fontSize={`small`} /><strong>Sticker Sets</strong><span>Die-cut, character, botanical, and themed packs.</span></div>
                        <div><Palette fontSize={`small`} /><strong>Paintings</strong><span>Original canvases, mini works, and display-ready pieces.</span></div>
                        <div><DesignServices fontSize={`small`} /><strong>Custom Art</strong><span>Commissions, gifts, avatars, and personal concepts.</span></div>
                        <div><Collections fontSize={`small`} /><strong>Graphics</strong><span>Prints, digital art, icons, covers, and visual assets.</span></div>
                    </div>
                </section>
            </div>
        </section>
    );
}
