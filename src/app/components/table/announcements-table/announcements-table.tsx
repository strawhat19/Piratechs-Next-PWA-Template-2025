'use client';

import Table from '../table';
import EditableCell from '../editable-cell/editable-cell';
import Loader from '../../loaders/loader';
import { toast } from 'react-toastify';
import { GridColDef } from '@mui/x-data-grid';
import { usePathname, useRouter } from 'next/navigation';
import { useContext, useEffect, useMemo, useState } from 'react';
import { StateGlobals } from '@/shared/global-context';
import { Roles, Types } from '@/shared/types/types';
import TableStatus from '../table-status/table-status';
import Icon_Button from '../../buttons/icon-button/icon-button';
import { Announcement, AnnouncementStatus } from '@/shared/types/models/Announcement';
import { minRole } from '@/shared/scripts/constants';
import AnnouncementForm from '../../store/announcement-form/announcement-form';
import AnnouncementDetails from '../../store/announcement-details/announcement-details';
import { deleteAnnouncementFromDatabase, updateAnnouncementInDatabase } from '@/shared/server/firebase';
import { Delete, Edit } from '@mui/icons-material';
import { richTextToPlainText } from '../../rich-text/rich-text';
import AnnouncementSelectField, {
    announcementIconColors,
    announcementIconOptions,
    announcementIcons,
    announcementStatusColors,
    announcementStatusIcons,
} from '../../store/announcement-form/announcement-select-field';

const announcementRoutePattern = /(?:^|\/)(?:store\/)?announcements?\/([^/?#]+)/i;

const getAnnouncementStatus = (announcement: Announcement) => {
    const status = String(announcement?.status || (announcement?.active ? AnnouncementStatus.Active : AnnouncementStatus.Draft) || AnnouncementStatus.Draft);
    const active = status == AnnouncementStatus.Active;
    return {
        color: active ? `var(--green_neon)` : `rgba(255,255,255,0.35)`,
        label: status,
    };
};

const getAnnouncementStatusColor = (announcement: Announcement) => getAnnouncementStatus(announcement)?.color;
const getAnnouncementStatusLabel = (announcement: Announcement) => getAnnouncementStatus(announcement)?.label;

const AnnouncementDescriptionCell = ({ row }: any) => {
    const text = richTextToPlainText(row?.description) || String(row?.description || row?.name || ``).trim();
    return (
        <span className={`announcementDescriptionPreview lineClamp2`}>
            {text}
        </span>
    );
};

const AnnouncementStatusCell = ({ row }: any) => {
    const { user } = useContext<any>(StateGlobals);
    const canManageAnnouncements = minRole(user?.role, Roles.Administrator);
    const currentStatus = String(row?.status || (row?.active ? AnnouncementStatus.Active : AnnouncementStatus.Draft) || AnnouncementStatus.Draft);
    const updateStatus = async (nextStatus: AnnouncementStatus | string) => {
        await updateAnnouncementInDatabase(String(row?.id), {
            status: nextStatus,
            active: String(nextStatus) == AnnouncementStatus.Active,
        }, true)?.then(() => {
            toast.success(`Announcement Status Updated`);
        });
    };
    const statusLabel = getAnnouncementStatusLabel(row);
    const statusColor = getAnnouncementStatusColor(row);
    if (!canManageAnnouncements) return <TableStatus label={statusLabel} color={statusColor} title={statusLabel} />;
    return (
        <AnnouncementSelectField
            search={false}
            showLabel={false}
            showText={true}
            label={`Status`}
            value={currentStatus}
            options={Object.values(AnnouncementStatus)}
            icons={announcementStatusIcons}
            colors={announcementStatusColors}
            onChange={updateStatus}
            className={`announcementStatusCellField`}
        />
    );
};

const AnnouncementIconCell = ({ row }: any) => {
    const { user } = useContext<any>(StateGlobals);
    const canManageAnnouncements = minRole(user?.role, Roles.Administrator);
    const currentIcon = String(row?.icon || `Campaign`);
    const updateIcon = async (nextIcon: string) => {
        await updateAnnouncementInDatabase(String(row?.id), { icon: nextIcon }, true)?.then(() => {
            toast.success(`Announcement Icon Updated`);
        });
    };
    if (!canManageAnnouncements) {
        return (
            <div className={`announcementIconCell`}>
                {announcementIcons?.[currentIcon] || announcementIcons?.Campaign}
            </div>
        );
    }
    return (
        <AnnouncementSelectField
            search={false}
            showLabel={false}
            showText={false}
            label={`Icon`}
            value={currentIcon}
            options={announcementIconOptions}
            icons={announcementIcons}
            colors={announcementIconColors}
            onChange={updateIcon}
            className={`announcementIconCellField`}
        />
    );
};

const AnnouncementActionsCell = ({
    row,
    onEdit,
    quickEditing = false,
    canManageAnnouncements = false,
}: any) => {
    const { showConfirm } = useContext<any>(StateGlobals);
    const deleteAnnouncement = async (event: any) => {
        event.stopPropagation();
        const confirmed = await showConfirm({
            cancelText: `Cancel`,
            confirmText: `Delete`,
            title: `Delete Announcement`,
            message: `Delete Announcement #${row?.number} "${row?.name}"?`,
            confirmAction: { color: `var(--error)`, className: `dialogDeleteAction`, icon: <Delete /> },
            cancelAction: { color: `var(--buttons)` },
        });
        if (!confirmed) return;
        await deleteAnnouncementFromDatabase(row, true)?.then(() => {
            toast.success(`Announcement Deleted`);
        });
    };
    return (
        <div className={`actionsCell announcementActionsCell`}>
            <TableStatus label={getAnnouncementStatusLabel(row)} color={getAnnouncementStatusColor(row)} title={getAnnouncementStatusLabel(row)} />
            <div className={`actions`}>
                {canManageAnnouncements ? (
                    <>
                        <Icon_Button
                            size={26}
                            placement={`top`}
                            title={quickEditing ? `Cancel Edit` : `Edit Announcement`}
                            className={`actionIconButton grayAction editAction ${quickEditing ? `btnActivated quickEditActive pulsate circular` : ``}`}
                            onClick={(event: any) => {
                                event.stopPropagation();
                                onEdit?.(quickEditing ? null : row);
                            }}
                        >
                            <Edit fontSize={`small`} />
                        </Icon_Button>
                        <Icon_Button
                            size={26}
                            placement={`top`}
                            title={`Delete Announcement`}
                            className={`actionIconButton deleteAction`}
                            onClick={deleteAnnouncement}
                        >
                            <Delete fontSize={`small`} />
                        </Icon_Button>
                    </>
                ) : <></>}
            </div>
        </div>
    );
};

export default function AnnouncementsTable({
    type = Types.Announcement,
}: any) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, announcements = [], announcementsLoading = false } = useContext<any>(StateGlobals);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [quickEditAnnouncement, setQuickEditAnnouncement] = useState<Announcement | null>(null);
    const [pendingAnnouncementNameByID, setPendingAnnouncementNameByID] = useState<Record<string, string>>({});
    const [pendingAnnouncementMessageByID, setPendingAnnouncementMessageByID] = useState<Record<string, string>>({});
    const [optimisticAnnouncementNameByID, setOptimisticAnnouncementNameByID] = useState<Record<string, string>>({});
    const [optimisticAnnouncementMessageByID, setOptimisticAnnouncementMessageByID] = useState<Record<string, string>>({});
    const routeAnnouncementID = decodeURIComponent(pathname?.match(announcementRoutePattern)?.[1] || ``);
    const canManageAnnouncements = minRole(user?.role, Roles.Administrator);
    const announcementsLabel = `Announcements`;

    const visibleAnnouncements = useMemo(() => (
        [...(announcements || [])].sort((a: Announcement, b: Announcement) => Number(a?.number || 0) - Number(b?.number || 0))
    ), [announcements]);

    useEffect(() => {
        setOptimisticAnnouncementNameByID(prev => {
            let changed = false;
            const next = { ...prev };
            Object.entries(prev).forEach(([id, optimisticName]) => {
                const liveAnnouncement = visibleAnnouncements?.find((announcement: Announcement) => String(announcement?.id) == id);
                const liveName = String(liveAnnouncement?.name || liveAnnouncement?.title || ``).trim();
                if (liveName && liveName == String(optimisticName || ``).trim()) {
                    delete next[id];
                    changed = true;
                }
            });
            return changed ? next : prev;
        });
        setOptimisticAnnouncementMessageByID(prev => {
            let changed = false;
            const next = { ...prev };
            Object.entries(prev).forEach(([id, optimisticMessage]) => {
                const liveAnnouncement = visibleAnnouncements?.find((announcement: Announcement) => String(announcement?.id) == id);
                const liveMessage = richTextToPlainText(liveAnnouncement?.description) || String(liveAnnouncement?.name || liveAnnouncement?.title || ``).trim();
                if (liveMessage && liveMessage == String(optimisticMessage || ``).trim()) {
                    delete next[id];
                    changed = true;
                }
            });
            return changed ? next : prev;
        });
    }, [visibleAnnouncements]);

    const onChangeAnnouncementNameDraft = (row: Announcement, nextName: string) => {
        setPendingAnnouncementNameByID(prev => ({ ...prev, [String(row?.id)]: nextName }));
    };

    const onCancelAnnouncementNameDraft = (row: Announcement) => {
        const rowID = String(row?.id);
        setPendingAnnouncementNameByID(prev => {
            const next = { ...prev };
            delete next[rowID];
            return next;
        });
    };

    const onSaveAnnouncementNameDraft = (row: Announcement, nextName: string, originalName: string) => {
        const safeName = String(nextName || ``).trim();
        const rowID = String(row?.id);
        if (safeName == String(originalName || ``).trim()) return onCancelAnnouncementNameDraft(row);
        setOptimisticAnnouncementNameByID(prev => ({ ...prev, [rowID]: safeName }));
        onCancelAnnouncementNameDraft(row);
        updateAnnouncementInDatabase(rowID, { name: safeName, title: safeName }, true)?.then(() => {
            toast.success(`Announcement Title Updated`);
        }).catch(() => {
            setOptimisticAnnouncementNameByID(prev => {
                const next = { ...prev };
                delete next[rowID];
                return next;
            });
            toast.error(`Announcement Title Update Failed`);
        });
    };

    const onChangeAnnouncementMessageDraft = (row: Announcement, nextMessage: string) => {
        setPendingAnnouncementMessageByID(prev => ({ ...prev, [String(row?.id)]: nextMessage }));
    };

    const onCancelAnnouncementMessageDraft = (row: Announcement) => {
        const rowID = String(row?.id);
        setPendingAnnouncementMessageByID(prev => {
            const next = { ...prev };
            delete next[rowID];
            return next;
        });
    };

    const onSaveAnnouncementMessageDraft = (row: Announcement, nextMessage: string, originalMessage: string) => {
        const safeMessage = String(nextMessage || ``).trim();
        const rowID = String(row?.id);
        if (safeMessage == String(originalMessage || ``).trim()) return onCancelAnnouncementMessageDraft(row);
        setOptimisticAnnouncementMessageByID(prev => ({ ...prev, [rowID]: safeMessage }));
        onCancelAnnouncementMessageDraft(row);
        updateAnnouncementInDatabase(rowID, { description: safeMessage }, true)?.then(() => {
            toast.success(`Announcement Message Updated`);
        }).catch(() => {
            setOptimisticAnnouncementMessageByID(prev => {
                const next = { ...prev };
                delete next[rowID];
                return next;
            });
            toast.error(`Announcement Message Update Failed`);
        });
    };

    const openAnnouncementDetails = (announcement: Announcement | null) => {
        if (!announcement?.id) return;
        setSelectedAnnouncement(announcement);
        const nextPath = `/store/announcement/${encodeURIComponent(String(announcement?.id))}`;
        if (pathname != nextPath) router.push(nextPath);
    };

    const closeAnnouncementDetails = () => {
        setSelectedAnnouncement(null);
        if (routeAnnouncementID) router.replace(`/store`);
    };

    useEffect(() => {
        if (!routeAnnouncementID) {
            if (selectedAnnouncement != null) setSelectedAnnouncement(null);
            return;
        }
        if (announcementsLoading || visibleAnnouncements?.length == 0) return;
        const matchedAnnouncement = visibleAnnouncements?.find((announcement: Announcement) => [
            announcement?.id,
            announcement?.number,
        ].some(value => String(value || ``) == routeAnnouncementID)) || null;
        if (matchedAnnouncement?.id) {
            setSelectedAnnouncement(prev => String(prev?.id) == String(matchedAnnouncement?.id) ? prev : matchedAnnouncement);
            return;
        }
        setSelectedAnnouncement(null);
        router.replace(`/store`);
    }, [announcementsLoading, routeAnnouncementID, selectedAnnouncement, visibleAnnouncements]);

    const announcementColumns: GridColDef[] = [
        { field: `number`, headerName: `ID`, width: 50 },
        {
            width: 175,
            field: `icon`,
            headerName: `Icon`,
            filterable: false,
            renderCell: ({ row }: any) => <AnnouncementIconCell row={row} />,
        },
        {
            field: `name`,
            width: 180,
            headerName: `Announcement`,
            valueGetter: (_value: any, row: any) => String(row?.name || row?.title || ``),
            renderCell: ({ row, value }: any) => (
                canManageAnnouncements ? (
                    <EditableCell
                        mode={`text`}
                        value={value}
                        showActions={false}
                        showStepper={false}
                        saveOnEnter={true}
                        cancelOnBlur={true}
                        canEdit={true}
                        pendingValue={(pendingAnnouncementNameByID?.[String(row?.id)] ?? optimisticAnnouncementNameByID?.[String(row?.id)])}
                        onChangeValue={(next: string) => onChangeAnnouncementNameDraft(row, next)}
                        onCancel={() => onCancelAnnouncementNameDraft(row)}
                        onSave={(next: string, original: string) => onSaveAnnouncementNameDraft(row, next, original)}
                    />
                ) : (
                    <span className={`announcementNameCell lineClamp1`}>
                        {value}
                    </span>
                )
            ),
        },
        {
            field: `description`,
            flex: 1,
            minWidth: 260,
            headerName: `Message`,
            valueGetter: (_value: any, row: any) => richTextToPlainText(row?.description) || String(row?.name || ``),
            renderCell: ({ row, value }: any) => (
                canManageAnnouncements ? (
                    <EditableCell
                        mode={`text`}
                        value={value}
                        showActions={false}
                        showStepper={false}
                        saveOnEnter={true}
                        cancelOnBlur={true}
                        canEdit={true}
                        pendingValue={(pendingAnnouncementMessageByID?.[String(row?.id)] ?? optimisticAnnouncementMessageByID?.[String(row?.id)])}
                        onChangeValue={(next: string) => onChangeAnnouncementMessageDraft(row, next)}
                        onCancel={() => onCancelAnnouncementMessageDraft(row)}
                        onSave={(next: string, original: string) => onSaveAnnouncementMessageDraft(row, next, original)}
                    />
                ) : (
                    <AnnouncementDescriptionCell row={row} />
                )
            ),
        },
        { width: 155, field: `status`, headerName: `Status`, renderCell: ({ row }: any) => <AnnouncementStatusCell row={row} /> },
        { field: `created`, headerName: `Created`, width: 155 },
        { field: `updated`, headerName: `Updated`, width: 155 },
        { field: `id`, headerName: `UUID`, width: 333, flex: 1 },
        {
            width: 160,
            minWidth: 160,
            field: `actions`,
            filterable: false,
            headerName: `Action(s)`,
            valueGetter: (_value: any, row: any) => getAnnouncementStatusLabel(row) || ``,
            renderCell: ({ row }: any) => (
                <AnnouncementActionsCell
                    row={row}
                    onEdit={setQuickEditAnnouncement}
                    quickEditing={quickEditAnnouncement?.id == row?.id}
                    canManageAnnouncements={canManageAnnouncements}
                />
            ),
        },
    ];

    if (announcementsLoading) {
        return <Loader height={250} label={`${announcementsLabel} Loading`} />;
    }

    return (
        <>
            <Table
                type={type}
                rows={visibleAnnouncements}
                columns={announcementColumns}
                className={`announcementsTableComponent`}
                dataGridProps={{
                    onCellClick: ({ row, field }: any) => {
                        if (field == `actions`) return;
                        openAnnouncementDetails(row);
                    },
                }}
                title={(
                    <div className={`tableHeaderComponent tableHeaderForm`}>
                        {announcementsLabel}
                        {canManageAnnouncements ? (
                            <AnnouncementForm
                                widget
                                funsized
                                announcement={quickEditAnnouncement}
                                onSaved={() => setQuickEditAnnouncement(null)}
                                onCancelEdit={() => setQuickEditAnnouncement(null)}
                                onFullEdit={(announcement: Announcement | null) => openAnnouncementDetails(announcement)}
                            />
                        ) : <></>}
                    </div>
                )}
            />
            <AnnouncementDetails
                announcement={selectedAnnouncement}
                open={selectedAnnouncement != null}
                onClose={closeAnnouncementDetails}
            />
        </>
    );
}
