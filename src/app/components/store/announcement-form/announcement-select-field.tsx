'use client';

import { JSX } from 'react';
import { Button } from '@mui/material';
import MenuTrigger from '../../menu/menu-trigger';
import { AnnouncementStatus } from '@/shared/types/models/Announcement';
import {
    // Announcement as AnnouncementMuiIcon,
    // AutoAwesome,
    Bolt,
    Campaign,
    Celebration,
    // ChatBubble,
    CheckCircle,
    Discount,
    // EmojiEvents,
    // Handshake,
    Info,
    KeyboardArrowDown,
    // LocalFireDepartment,
    // Loyalty,
    // NewReleases,
    // NotificationsActive,
    Public,
    // PushPin,
    // Send,
    // Star,
    // SupportAgent,
    // TrendingUp,
    // Verified,
    // WarningAmber,
    Edit,
    Archive,
    // Cancel,
    // ChatBubble,
    // Error,
    Warning,
    Report,
    Redeem,
    // FlashOn,
    ShoppingBag,
    SupportAgent,
    AutoAwesome,
    Paid,
    Storefront,
    LocalFireDepartment,
    // Shield,
    GppGood,
    // NewReleases,
    Inventory2,
    Code,
} from '@mui/icons-material';

export const announcementStatusColors: Record<AnnouncementStatus, string> = {
    [AnnouncementStatus.Draft]: `var(--links)`,
    [AnnouncementStatus.Active]: `var(--green_neon)`,
    [AnnouncementStatus.Archived]: `var(--soft-silver)`,
    // [AnnouncementStatus.Unavailable]: `var(--error)`,
};

export const announcementStatusIcons: Record<AnnouncementStatus, JSX.Element> = {
    [AnnouncementStatus.Draft]: <Edit fontSize={`small`} htmlColor={announcementStatusColors?.[AnnouncementStatus.Draft]} />,
    [AnnouncementStatus.Active]: <CheckCircle fontSize={`small`} htmlColor={announcementStatusColors?.[AnnouncementStatus.Active]} />,
    [AnnouncementStatus.Archived]: <Archive fontSize={`small`} htmlColor={announcementStatusColors?.[AnnouncementStatus.Archived]} />,
    // [AnnouncementStatus.Unavailable]: <Cancel fontSize={`small`} htmlColor={announcementStatusColors?.[AnnouncementStatus.Unavailable]} />,
};

export const announcementIconColors: Record<string, string> = {
    Info: `var(--links)`,
    Error: `var(--error)`,
    Success: `var(--success)`,
    Warning: `var(--yellow_neon)`,
};

export const announcementIcons: Record<string, JSX.Element> = {
    Info: <Info fontSize={`small`} htmlColor={announcementIconColors.Info} />,
    Error: <Report fontSize={`small`} htmlColor={announcementIconColors.Error} />,
    Warning: <Warning fontSize={`small`} htmlColor={announcementIconColors.Warning} />,
    // Campaign: <Campaign fontSize={`small`} htmlColor={announcementIconColors.Success} />,
    // Message: <ChatBubble fontSize={`small`} htmlColor={announcementIconColors.Warning} />,
    Celebration: <Celebration fontSize={`small`} htmlColor={announcementIconColors.Info} />,
    // Thunder: <FlashOn fontSize={`small`} htmlColor={announcementIconColors.Warning} />,
    Hot: <LocalFireDepartment fontSize={`small`} htmlColor={announcementIconColors.Error} />,
    Shop: <ShoppingBag  fontSize={`small`} htmlColor={announcementIconColors.Success} />,
    // NewReleases: <NewReleases fontSize={`small`} htmlColor={announcementIconColors.NewReleases} />,
    Help: <SupportAgent fontSize={`small`} htmlColor={announcementIconColors.Warning} />,
    Gift: <Redeem fontSize={`small`} htmlColor={announcementIconColors.Info} />,
    // NotificationsActive: <NotificationsActive fontSize={`small`} htmlColor={announcementIconColors.NotificationsActive} />,
    // WarningAmber: <WarningAmber fontSize={`small`} htmlColor={announcementIconColors.WarningAmber} />,
    // AutoAwesome: <AutoAwesome fontSize={`small`} htmlColor={announcementIconColors.AutoAwesome} />,
    // Star: <Star fontSize={`small`} htmlColor={announcementIconColors.Star} />,
    // LocalFireDepartment: <LocalFireDepartment fontSize={`small`} htmlColor={announcementIconColors.LocalFireDepartment} />,
    // SupportAgent: <SupportAgent fontSize={`small`} htmlColor={announcementIconColors.SupportAgent} />,
    // Verified: <Verified fontSize={`small`} htmlColor={announcementIconColors.Verified} />,
    Promotion: <Discount fontSize={`small`} htmlColor={announcementIconColors.Success} />,
    Update: <Bolt fontSize={`small`} htmlColor={announcementIconColors.Warning} />,
    Store: <Storefront fontSize={`small`} htmlColor={announcementIconColors.Info} />,
    // Loyalty: <Loyalty fontSize={`small`} htmlColor={announcementIconColors.Loyalty} />,
    // Send: <Send fontSize={`small`} htmlColor={announcementIconColors.Send} />,
    // TrendingUp: <TrendingUp fontSize={`small`} htmlColor={announcementIconColors.TrendingUp} />,
    // Handshake: <Handshake fontSize={`small`} htmlColor={announcementIconColors.Handshake} />,
    // EmojiEvents: <EmojiEvents fontSize={`small`} htmlColor={announcementIconColors.EmojiEvents} />,
    // PushPin: <PushPin fontSize={`small`} htmlColor={announcementIconColors.PushPin} />,
    New: <AutoAwesome fontSize={`small`} htmlColor={announcementIconColors.Error} />,
    Sale: <Paid fontSize={`small`} htmlColor={announcementIconColors.Success} />,
    Public: <Public fontSize={`small`} htmlColor={announcementIconColors.Info} />,
    Protection: <GppGood fontSize={`small`} htmlColor={announcementIconColors.Warning} />,
    Inventory: <Inventory2 fontSize={`small`} htmlColor={announcementIconColors.Error} />,
    Announcement: <Campaign fontSize={`small`} htmlColor={announcementIconColors.Success} />,
    Devs: <Code fontSize={`small`} htmlColor={announcementIconColors.Info} />
    // Bulletin: <NewReleases fontSize={`small`} htmlColor={announcementIconColors.Info} />
};

export const announcementIconOptions = Object.keys(announcementIcons);

interface AnnouncementSelectFieldProps {
    label: string;
    value: string;
    options: string[];
    className?: string;
    colors?: Record<string, string>;
    onChange: (value: string) => void;
    icons: Record<string, JSX.Element>;
    search?: boolean;
    showLabel?: boolean;
    showText?: boolean;
    showMenuLabels?: boolean;
}

export default function AnnouncementSelectField({
    label,
    value,
    icons,
    colors,
    options,
    onChange,
    className = ``,
    search = false,
    showText = true,
    showLabel = true,
    showMenuLabels = true,
}: AnnouncementSelectFieldProps) {
    const filteredOptions = options?.filter(option => option !== value);
    const menuItems = filteredOptions?.map(option => ({
        id: option,
        label: option,
        className: ``,
        icon: icons[option],
        onClick: () => onChange(option),
    }));
    const currentIcon = icons[value] || icons[options?.[0]];
    const currentColor = colors?.[value];

    return (
        <div className={`productSelectField announcementSelectField ${className}`.trim()}>
            {showLabel ? <span className={`productFieldLabelText`}>{label}</span> : <></>}
            <MenuTrigger
                search={search}
                id={`${label.toLowerCase().replace(/\s/g, '-')}-menu-trigger`}
                colors={true}
                showLabels={showMenuLabels}
                topOffset={0.5}
                menuItems={menuItems}
                className={`productSelectDropdown announcementSelectDropdown`}
                targetID={`${label.toLowerCase().replace(/\s/g, '-')}-menu`}
                renderTrigger={({ id, onClick, onFocus, onType, searchValue }) => (
                    <Button
                        id={id}
                        type={`button`}
                        size={`small`}
                        onClick={onClick}
                        startIcon={currentIcon}
                        data-row-click-ignore={`true`}
                        endIcon={<KeyboardArrowDown />}
                        onMouseDown={(event) => event.stopPropagation()}
                        className={`productSelectButton tableDropDown announcementSelectButton ${showText ? `` : `iconOnly`}`.trim()}
                        style={currentColor ? { color: currentColor } : undefined}
                    >
                        {search ? (
                            <input
                                value={searchValue || value}
                                onClick={(event) => event.stopPropagation()}
                                onFocus={onFocus}
                                onChange={onType}
                                className={`dropDownBtnLabel`}
                                placeholder={value}
                                style={{ border: `none`, background: `transparent`, color: `inherit`, width: `100%` }}
                            />
                        ) : (
                            <span className={`dropDownBtnLabel`}>
                                {searchValue || value}
                            </span>
                        )}
                    </Button>
                )}
            />
        </div>
    );
}
