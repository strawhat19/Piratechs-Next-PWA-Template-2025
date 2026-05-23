'use client';

import './horizontal-scroller.scss';

import React, { useContext, useMemo } from 'react';
import Slider from '../slider/slider';
import { SwiperSlide } from 'swiper/react';
import { StateGlobals } from '@/shared/global-context';
import { AnnouncementStatus } from '@/shared/types/models/Announcement';
import {
    AutoAwesome,
    Bolt,
    Campaign,
    Celebration,
    Discount,
    ElectricBolt,
    FlashOn,
    GppGood,
    Inventory2,
    LocalFireDepartment,
    LocalShipping,
    Loyalty,
    MonetizationOn,
    NewReleases,
    Paid,
    Redeem,
    Sell,
    Shield,
    ShoppingBag,
    ShoppingCart,
    Star,
    Storefront,
    SupportAgent,
    Verified,
} from '@mui/icons-material';
import { richTextToPlainText } from '../rich-text/rich-text';
import { announcementIcons } from '../store/announcement-form/announcement-select-field';

export type HorizontalScrollerItem = {
    icon?: React.ReactNode;
    value: string;
};

export const defaultMessages: HorizontalScrollerItem[] = [
    { value: `Fast Shipping On Every Order`, icon: <LocalShipping fontSize={`small`} htmlColor={`var(--green_neon)`} /> },
    { value: `Secure Checkout With Stripe`, icon: <Verified fontSize={`small`} htmlColor={`var(--links)`} /> },
    { value: `New Drops Added Weekly`, icon: <Campaign fontSize={`small`} htmlColor={`var(--yellow_neon)`} /> },
    { value: `Bundle Deals Active Today`, icon: <Discount fontSize={`small`} htmlColor={`var(--success)`} /> },
    { value: `Limited Inventory Updated Live`, icon: <Sell fontSize={`small`} htmlColor={`var(--pink_neon)`} /> },
    { value: `Member Discounts Available`, icon: <Loyalty fontSize={`small`} htmlColor={`var(--green_neon)`} /> },
    { value: `Free Shipping Over $75`, icon: <ShoppingBag fontSize={`small`} htmlColor={`var(--links)`} /> },
    { value: `Live Support Ready To Help`, icon: <SupportAgent fontSize={`small`} htmlColor={`var(--yellow_neon)`} /> },
    { value: `Fresh Product Drops Every Week`, icon: <AutoAwesome fontSize={`small`} htmlColor={`var(--success)`} /> },
    { value: `Top Rated Gear Trending Now`, icon: <Star fontSize={`small`} htmlColor={`var(--pink_neon)`} /> },
    { value: `Buy More Save More Offers`, icon: <Paid fontSize={`small`} htmlColor={`var(--green_neon)`} /> },
    { value: `Flexible Payment Methods Accepted`, icon: <MonetizationOn fontSize={`small`} htmlColor={`var(--links)`} /> },
    { value: `Official Piratechs Storefront`, icon: <Storefront fontSize={`small`} htmlColor={`var(--yellow_neon)`} /> },
    { value: `Stock Levels Sync In Realtime`, icon: <Inventory2 fontSize={`small`} htmlColor={`var(--success)`} /> },
    { value: `Fraud Protection Enabled`, icon: <GppGood fontSize={`small`} htmlColor={`var(--pink_neon)`} /> },
    { value: `Giftable Items In Every Category`, icon: <Redeem fontSize={`small`} htmlColor={`var(--green_neon)`} /> },
    { value: `Just Arrived Products Added Today`, icon: <NewReleases fontSize={`small`} htmlColor={`var(--links)`} /> },
    { value: `Protected Purchase Guarantee`, icon: <Shield fontSize={`small`} htmlColor={`var(--yellow_neon)`} /> },
    { value: `Weekend Promo Event Live`, icon: <Celebration fontSize={`small`} htmlColor={`var(--success)`} /> },
    { value: `Flash Deals Rotate Hourly`, icon: <FlashOn fontSize={`small`} htmlColor={`var(--pink_neon)`} /> },
    { value: `Hot Sellers Going Fast`, icon: <LocalFireDepartment fontSize={`small`} htmlColor={`var(--green_neon)`} /> },
    { value: `Quick Checkout In Seconds`, icon: <ElectricBolt fontSize={`small`} htmlColor={`var(--links)`} /> },
    { value: `Priority Fulfillment Available`, icon: <Bolt fontSize={`small`} htmlColor={`var(--yellow_neon)`} /> },
    { value: `Cart Saves Automatically`, icon: <ShoppingCart fontSize={`small`} htmlColor={`var(--success)`} /> },
];

export default function HorizontalScroller({
    items,
    className = `horizontalScrollerComponent`,
}: {
    className?: string;
    items?: HorizontalScrollerItem[];
}) {
    const { announcements = [], announcementsLoading = false } = useContext<any>(StateGlobals);

    const announcementItems = useMemo(() => {
        if (announcementsLoading || !Array.isArray(announcements) || announcements.length <= 0) return [];
        return announcements
            ?.filter((announcement: any) => String(announcement?.status || (announcement?.active ? AnnouncementStatus.Active : AnnouncementStatus.Draft)) == AnnouncementStatus.Active)
            ?.map((announcement: any) => {
                const title = String(announcement?.name || ``).trim();
                const descriptionText = richTextToPlainText(announcement?.description);
                const showTitle = Boolean(announcement?.showTitle);
                const value = showTitle && title
                    ? (descriptionText ? `${title} - ${descriptionText}` : title)
                    : (descriptionText || title);
                return value ? {
                    title,
                    value,
                    icon: announcementIcons?.[announcement?.icon] || <Campaign fontSize={`small`} htmlColor={`var(--yellow_neon)`} />,
                } : null;
            })
            ?.filter(Boolean) as HorizontalScrollerItem[];
    }, [announcements, announcementsLoading]);

    const databaseScrollerItems = (items?.length ? items : announcementItems)
        ?.filter((item: HorizontalScrollerItem | null) => item?.value)
        ?.map((item: HorizontalScrollerItem) => ({
            icon: item?.icon,
            value: String(item?.value || ``),
        }));
    const scrollerItems = databaseScrollerItems?.length < 10 ? [ ...databaseScrollerItems, /* ...defaultMessages */ ] : databaseScrollerItems;

    if (scrollerItems?.length <= 0) return null;

    return (
        <div className={`horizontalScrollerContainer w100 h100 ${className}`}>
            <Slider
                autoplay
                autoplayDelay={0}
                spaceBetween={24}
                showButtons={false}
                autoplaySpeed={18_000}
                autoplayPauseOnHover={false}
                autoplaySlidesPerView={`auto`}
                className={`horizontalScrollerCarousel`}
            >
                {scrollerItems?.map((item: HorizontalScrollerItem, itemIndex: number) => (
                    <SwiperSlide key={`${item?.value}-${itemIndex}`} className={`horizontalScrollerSlide`}>
                        <div className={`horizontalScrollerItem`}>
                            {item?.icon ? (
                                <span className={`horizontalScrollerIcon`}>
                                    {item?.icon}
                                </span>
                            ) : <></>}
                            <span className={`horizontalScrollerText`}>
                                {item?.value}
                            </span>
                        </div>
                    </SwiperSlide>
                ))}
            </Slider>
        </div>
    );
}
