'use client';

import { Checkbox } from '@mui/material';
import { Campaign } from '@mui/icons-material';
import { Announcement } from '@/shared/types/models/Announcement';
import DataDisplayCard from '@/app/components/table/data-display-card/data-display-card';
import { TableGridCardParams } from '@/app/components/table/table-grid/table-grid';

export default function AnnouncementCard({
    row,
    selected,
    onSelect,
    selectable,
    onCardClick,
    renderColumn,
    checkboxAlignmentStart,
}: TableGridCardParams) {
    const announcement = row as Announcement;

    return (
        <DataDisplayCard selected={selected} onClick={onCardClick} className={`storeGridCard announcementGridCard`} checkboxAlignmentStart={checkboxAlignmentStart}>
            <div className={`storeGridCardHero announcementGridCardHero`}>
                {selectable ? (
                    <label className={`dataDisplayCardSelect storeGridCardSelect`} onClick={(event) => event.stopPropagation()}>
                        <Checkbox
                            checked={selected}
                            size={`small`}
                            onChange={onSelect}
                            className={`dataDisplayCardCheckbox`}
                        />
                    </label>
                ) : <></>}
                <div className={`storeGridCardHeroIcon announcementGridCardIcon`}>
                    {renderColumn(`icon`) || <Campaign />}
                </div>
                <div className={`storeGridCardHeroText`}>
                    <span>Announcement</span>
                    <strong>#{announcement?.number || `New`}</strong>
                </div>
            </div>
            <div className={`storeGridCardBody`}>
                <div className={`storeGridCardTop`}>
                    <span className={`storeGridCardNumber`}>#{announcement?.number || `New`}</span>
                    {renderColumn(`status`, `storeGridCardStatus`)}
                </div>
                <div className={`storeGridCardTitle`}>
                    {renderColumn(`name`)}
                </div>
                <div className={`storeGridCardField storeGridCardMessage`}>
                    <span>Message</span>
                    {renderColumn(`description`, `lineClamp3`)}
                </div>
                <div className={`storeGridCardMetrics`}>
                    <div className={`storeGridCardMetric`}>
                        <span>Show Name</span>
                        {renderColumn(`showTitle`)}
                    </div>
                    <div className={`storeGridCardMetric`}>
                        <span>Updated</span>
                        {renderColumn(`updated`)}
                    </div>
                </div>
                <div className={`storeGridCardActions`}>
                    {renderColumn(`actions`)}
                </div>
            </div>
        </DataDisplayCard>
    );
}
