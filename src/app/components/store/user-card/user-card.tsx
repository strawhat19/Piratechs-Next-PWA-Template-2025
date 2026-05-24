'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Checkbox, Skeleton } from '@mui/material';
import { User } from '@/shared/types/models/User';
import DataDisplayCard from '@/app/components/table/data-display-card/data-display-card';
import { TableGridCardParams } from '@/app/components/table/table-grid/table-grid';

const getUserImageURL = (user: User) => String(user?.imageURL || user?.imageUrl || user?.avatar || user?.photoURL || user?.image || ``).trim();
const getUserInitial = (user: User) => String(user?.name || user?.displayName || user?.email || `User`).trim()?.[0]?.toUpperCase() || `U`;

export default function UserCard({
    row,
    selected,
    onSelect,
    selectable,
    onCardClick,
    renderColumn,
    checkboxAlignmentStart,
}: TableGridCardParams) {
    const user = row as User;
    const imageURL = getUserImageURL(user);
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(Boolean(imageURL));

    useEffect(() => {
        setImageError(false);
        setImageLoading(Boolean(imageURL));
    }, [imageURL]);

    return (
        <DataDisplayCard selected={selected} onClick={onCardClick} className={`storeGridCard userGridCard`} checkboxAlignmentStart={checkboxAlignmentStart}>
            <div className={`storeGridCardHero userGridCardHero`}>
                {selectable ? (
                    <label className={`dataDisplayCardSelect storeGridCardSelect`} onClick={(event) => event.stopPropagation()}>
                        <Checkbox
                            size={`small`}
                            checked={selected}
                            onChange={onSelect}
                            className={`dataDisplayCardCheckbox`}
                        />
                    </label>
                ) : <></>}
                <div className={`userGridCardAvatar`} style={{
                    background: user?.color?.color,
                    color: user?.color?.type == `dark` ? `white` : `var(--navy)`,
                }}>
                    {imageLoading ? (
                        <Skeleton variant={`circular`} animation={`wave`} className={`userGridCardAvatarSkeleton`} />
                    ) : <></>}
                    {imageURL && !imageError ? (
                        <Image
                            fill
                            unoptimized
                            sizes={`96px`}
                            src={imageURL}
                            alt={user?.name || `User`}
                            onLoad={() => setImageLoading(false)}
                            className={`userGridCardAvatarImage ${imageLoading ? `loading` : ``}`}
                            onError={() => {
                                setImageError(true);
                                setImageLoading(false);
                            }}
                        />
                    ) : (
                        <span>{getUserInitial(user)}</span>
                    )}
                </div>
            </div>
            <div className={`storeGridCardBody`}>
                <div className={`storeGridCardTop`}>
                    <span className={`storeGridCardNumber cardNumber`}>
                        {user?.number || 0}
                    </span>
                    {renderColumn(`signedIn`, `storeGridCardActionsCompact`)}
                </div>
                <div className={`storeGridCardTitle`}>
                    {renderColumn(`name`, `userCardName`, { showLabel: true })}
                </div>
                <div className={`storeGridCardField`}>
                    <span>Email</span>
                    {renderColumn(`email`, `lineClamp1`)}
                </div>
                <div className={`storeGridCardMetrics`}>
                    <div className={`storeGridCardMetric`}>
                        <span>Role</span>
                        {renderColumn(`role`)}
                    </div>
                    <div className={`storeGridCardMetric`}>
                        <span>Source</span>
                        {renderColumn(`dataSource`)}
                    </div>
                </div>
                <div className={`storeGridCardMeta`}>
                    <div className={`storeGridCardMetaItem`}>
                        <span>Registered</span>
                        {renderColumn(`created`)}
                    </div>
                    <div className={`storeGridCardMetaItem`}>
                        <span>Last Sign In</span>
                        {renderColumn(`lastSignIn`)}
                    </div>
                </div>
            </div>
        </DataDisplayCard>
    );
}
