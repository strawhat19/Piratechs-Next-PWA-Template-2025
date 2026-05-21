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
    { icon: <LocalShipping fontSize={`small`} htmlColor={`var(--green_neon)`} />, value: `Fast Shipping On Every Order` },
    { icon: <Verified fontSize={`small`} htmlColor={`var(--links)`} />, value: `Secure Checkout With Stripe` },
    { icon: <Campaign fontSize={`small`} htmlColor={`var(--yellow_neon)`} />, value: `New Drops Added Weekly` },
    { icon: <Discount fontSize={`small`} htmlColor={`var(--success)`} />, value: `Bundle Deals Active Today` },
    { icon: <Sell fontSize={`small`} htmlColor={`var(--pink_neon)`} />, value: `Limited Inventory Updated Live` },
    { icon: <Loyalty fontSize={`small`} htmlColor={`var(--green_neon)`} />, value: `Member Discounts Available` },
    { icon: <ShoppingBag fontSize={`small`} htmlColor={`var(--links)`} />, value: `Free Shipping Over $75` },
    { icon: <SupportAgent fontSize={`small`} htmlColor={`var(--yellow_neon)`} />, value: `Live Support Ready To Help` },
    { icon: <AutoAwesome fontSize={`small`} htmlColor={`var(--success)`} />, value: `Fresh Product Drops Every Week` },
    { icon: <Star fontSize={`small`} htmlColor={`var(--pink_neon)`} />, value: `Top Rated Gear Trending Now` },
    { icon: <Paid fontSize={`small`} htmlColor={`var(--green_neon)`} />, value: `Buy More Save More Offers` },
    { icon: <MonetizationOn fontSize={`small`} htmlColor={`var(--links)`} />, value: `Flexible Payment Methods Accepted` },
    { icon: <Storefront fontSize={`small`} htmlColor={`var(--yellow_neon)`} />, value: `Official Piratechs Storefront` },
    { icon: <Inventory2 fontSize={`small`} htmlColor={`var(--success)`} />, value: `Stock Levels Sync In Realtime` },
    { icon: <GppGood fontSize={`small`} htmlColor={`var(--pink_neon)`} />, value: `Fraud Protection Enabled` },
    { icon: <Redeem fontSize={`small`} htmlColor={`var(--green_neon)`} />, value: `Giftable Items In Every Category` },
    { icon: <NewReleases fontSize={`small`} htmlColor={`var(--links)`} />, value: `Just Arrived Products Added Today` },
    { icon: <Shield fontSize={`small`} htmlColor={`var(--yellow_neon)`} />, value: `Protected Purchase Guarantee` },
    { icon: <Celebration fontSize={`small`} htmlColor={`var(--success)`} />, value: `Weekend Promo Event Live` },
    { icon: <FlashOn fontSize={`small`} htmlColor={`var(--pink_neon)`} />, value: `Flash Deals Rotate Hourly` },
    { icon: <LocalFireDepartment fontSize={`small`} htmlColor={`var(--green_neon)`} />, value: `Hot Sellers Going Fast` },
    { icon: <ElectricBolt fontSize={`small`} htmlColor={`var(--links)`} />, value: `Quick Checkout In Seconds` },
    { icon: <Bolt fontSize={`small`} htmlColor={`var(--yellow_neon)`} />, value: `Priority Fulfillment Available` },
    { icon: <ShoppingCart fontSize={`small`} htmlColor={`var(--success)`} />, value: `Cart Saves Automatically` },
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
                const value = richTextToPlainText(announcement?.description) || String(announcement?.name || announcement?.title || ``).trim();
                return value ? {
                    icon: announcementIcons?.[announcement?.icon] || <Campaign fontSize={`small`} htmlColor={`var(--yellow_neon)`} />,
                    value,
                } : null;
            })
            ?.filter(Boolean) as HorizontalScrollerItem[];
    }, [announcements, announcementsLoading]);
    const scrollerItems = (items?.length ? items : announcementItems?.length ? announcementItems : defaultMessages)
        ?.filter((item: HorizontalScrollerItem | null) => item?.value)
        ?.map((item: HorizontalScrollerItem) => ({
            icon: item?.icon,
            value: String(item?.value || ``),
        }));

    if (scrollerItems?.length <= 0) return null;

    return (
        <div className={`horizontalScrollerContainer w100 h100 ${className}`}>
            <Slider
                autoplay
                showButtons={false}
                spaceBetween={24}
                className={`horizontalScrollerCarousel`}
                autoplaySpeed={18000}
                autoplayDelay={0}
                autoplayPauseOnHover={false}
                autoplaySlidesPerView={`auto`}
            >
                {scrollerItems?.map((item: HorizontalScrollerItem, itemIndex: number) => (
                    <SwiperSlide key={`${item?.value}-${itemIndex}`} className={`horizontalScrollerSlide`}>
                        <div className={`horizontalScrollerItem`}>
                            {item?.icon ? <span className={`horizontalScrollerIcon`}>{item?.icon}</span> : <></>}
                            <span className={`horizontalScrollerText`}>{item?.value}</span>
                        </div>
                    </SwiperSlide>
                ))}
            </Slider>
        </div>
    );
}
