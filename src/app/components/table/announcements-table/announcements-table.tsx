'use client';

import Table from '../table';
import { toast } from 'react-toastify';
import Loader from '../../loaders/loader';
import { Roles, Types } from '@/shared/types/types';
import { minRole } from '@/shared/scripts/constants';
import { StateGlobals } from '@/shared/global-context';
import { usePathname, useRouter } from 'next/navigation';
import ToggleCell from '../toggle-cell/toggle-cell';
import EditableCell from '../editable-cell/editable-cell';
import { Archive, Delete, Edit } from '@mui/icons-material';
import { richTextToPlainText } from '../../rich-text/rich-text';
import Icon_Button from '../../buttons/icon-button/icon-button';
import { useContext, useEffect, useMemo, useState } from 'react';
import { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import AnnouncementForm from '../../store/announcement-form/announcement-form';
import { Announcement, AnnouncementStatus } from '@/shared/types/models/Announcement';
import AnnouncementDetails from '../../store/announcement-details/announcement-details';
import { deleteAnnouncementFromDatabase, updateAnnouncementInDatabase } from '@/shared/server/firebase';
import TableStatus, { tableStatusBlue, tableStatusGray, tableStatusGreen, tableStatusRed } from '../table-status/table-status';
import AnnouncementSelectField, { announcementIconColors, announcementIconOptions, announcementIcons, announcementStatusColors, announcementStatusIcons } from '../../store/announcement-form/announcement-select-field';

const announcementRoutePattern = /(?:^|\/)(?:store\/)?announcements?\/([^/?#]+)/i;

const getAnnouncementStatus = (announcement: Announcement) => {
    const status = String(announcement?.status || (
        announcement?.active ? AnnouncementStatus.Active : AnnouncementStatus.Draft
    ) || AnnouncementStatus.Draft);
    const colors: any = {
        [AnnouncementStatus.Draft]: tableStatusBlue,
        [AnnouncementStatus.Active]: tableStatusGreen,
        [AnnouncementStatus.Archived]: tableStatusGray,
        [AnnouncementStatus.Unavailable]: tableStatusRed,
    };
    return {
        label: status,
        color: colors?.[status] || tableStatusGray,
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
            showText={true}
            label={`Status`}
            showLabel={false}
            value={currentStatus}
            onChange={updateStatus}
            icons={announcementStatusIcons}
            colors={announcementStatusColors}
            className={`announcementStatusCellField`}
            options={Object.values(AnnouncementStatus)}
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
            label={`Icon`}
            showText={false}
            showLabel={false}
            value={currentIcon}
            onChange={updateIcon}
            icons={announcementIcons}
            colors={announcementIconColors}
            options={announcementIconOptions}
            className={`announcementIconCellField`}
        />
    );
};

const AnnouncementShowTitleCell = ({ row }: any) => {
    const { user } = useContext<any>(StateGlobals);
    const canManageAnnouncements = minRole(user?.role, Roles.Administrator);
    const currentValue = Boolean(row?.showTitle);
    const updateShowTitle = async (nextShowTitle: boolean) => {
        if (!row?.id) return;
        try {
            await updateAnnouncementInDatabase(String(row?.id), { showTitle: nextShowTitle }, true);
            toast.success(`Announcement Show Title Updated`);
        } catch (error) {
            toast.error(`Announcement Show Title Update Failed`);
            console.error(`Announcement Show Title Update Failed`, error);
        }
    };
    return (
        <ToggleCell
            value={currentValue}
            onChange={updateShowTitle}
            canEdit={canManageAnnouncements}
            className={`announcementShowTitleCell`}
            disabled={!row?.name || row?.name == ``}
        />
    );
};

const AnnouncementActionsCell = ({
    row,
    rows,
    onEdit,
    quickEditing = false,
    selectedAnnouncementIDs,
    actionLabel = `processing`,
    setSelectedAnnouncementIDs,
    canManageAnnouncements = false,
}: any) => {
    const { showConfirm } = useContext<any>(StateGlobals);
    const rowDeletable = (rw: any = row) => [
        AnnouncementStatus.Draft, 
        AnnouncementStatus.Archived, 
        AnnouncementStatus.Unavailable
    ]?.includes(rw?.status);
    const selectedRows = rows?.filter((r: Announcement) => selectedAnnouncementIDs?.includes(r?.id));
    const deletableRows = selectedRows?.filter((r: Announcement) => rowDeletable(r));
    const archivableRows = selectedRows?.filter((r: Announcement) => !rowDeletable(r));
    const deleteAnnouncement = async (event: any) => {
        event.stopPropagation();
        const delTitle = `Delete${deletableRows?.length > 0 ? ` ${deletableRows?.length}` : ``}`;
        const title = `${delTitle} Announcement(s)`;
        const confirmed = await showConfirm({
            title,
            cancelText: `Cancel`,
            confirmText: delTitle,
            cancelAction: { color: `var(--buttons)` },
            confirmAction: { color: `var(--error)`, className: `dialogDeleteAction`, icon: <Delete /> },
            message: deletableRows?.length > 1 ? title : `Delete Announcement #${row?.number} "${row?.name}"?`,
        });
        if (!confirmed) return;
        if (deletableRows?.length > 1) {
            let failed = 0;
            let processed = 0;
            for (const announcement of deletableRows) {
                try {
                    const deleted = await deleteAnnouncementFromDatabase(announcement, true);
                    if (!deleted) failed += 1;
                } catch {
                    failed += 1;
                } finally {
                    processed += 1;
                    await new Promise(resolve => requestAnimationFrame(() => resolve(true)));
                }
            }
            // closeAppDialog(true);
            setSelectedAnnouncementIDs([]);
            if (failed > 0) {
                toast.warn(`${actionLabel} ${processed - failed}/${deletableRows?.length} Announcement(s)`);
                return;
            }
            return;
        }
        await deleteAnnouncementFromDatabase(row, true)?.then(() => {
            toast.success(`Announcement Deleted`);
        });
    };
    const archiveAnnouncement = async (event: any) => {
        event.stopPropagation();
        const archiveRows = selectedRows?.length > 1 ? (archivableRows?.length > 0 ? archivableRows : [row]) : [row];
        const targetRows = archiveRows?.filter((announcement: Announcement) => Boolean(announcement?.id));
        if (!targetRows?.length) return;
        const archiveTitle = `Archive${targetRows?.length > 1 ? ` ${targetRows?.length}` : ``}`;
        const title = `${archiveTitle} Announcement(s)`;
        const targetAnnouncement = targetRows?.[0] || row;
        const confirmed = await showConfirm({
            title,
            cancelText: `Cancel`,
            confirmText: archiveTitle,
            cancelAction: { color: `var(--buttons)` },
            confirmAction: { color: `var(--links)`, className: `dialogDeleteAction`, icon: <Archive /> },
            message: targetRows?.length > 1 ? title : `Archive Announcement #${targetAnnouncement?.number} "${targetAnnouncement?.name}"?`,
        });
        if (!confirmed) return;
        if (selectedRows?.length > 1) {
            let failed = 0;
            let processed = 0;
            for (const announcement of targetRows) {
                try {
                    const archived = await updateAnnouncementInDatabase(String(announcement?.id), { status: AnnouncementStatus.Archived, active: false }, true);
                    if (!archived) failed += 1;
                } catch {
                    failed += 1;
                } finally {
                    processed += 1;
                    await new Promise(resolve => requestAnimationFrame(() => resolve(true)));
                }
            }
            setSelectedAnnouncementIDs([]);
            if (failed > 0) {
                toast.warn(`Archived ${processed - failed}/${targetRows?.length} Announcement(s)`);
                return;
            }
            toast.success(targetRows?.length > 1 ? `Announcements Archived` : `Announcement Archived`);
            return;
        }
        await updateAnnouncementInDatabase(String(targetAnnouncement?.id), { status: AnnouncementStatus.Archived, active: false }, true)?.then(() => {
            toast.success(`Announcement Archived`);
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
                        {rowDeletable() ? <>
                            <Icon_Button
                                size={26}
                                placement={`top`}
                                onClick={deleteAnnouncement}
                                title={`Delete Announcement`}
                                className={`actionIconButton deleteAction`}
                            >
                                <Delete fontSize={`small`} />
                            </Icon_Button>
                        </> : <>
                            <Icon_Button
                                size={26}
                                placement={`top`}
                                onClick={archiveAnnouncement}
                                title={`Archive Announcement`}
                                className={`actionIconButton`}
                            >
                                <Archive fontSize={`small`} />
                            </Icon_Button>
                        </>}
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
    const [selectedAnnouncementIDs, setSelectedAnnouncementIDs] = useState<string[]>([]);
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

    const onSelectedRowsChange = (selectedIDs: string[]) => {
        setSelectedAnnouncementIDs(selectedIDs);
    }

    const announcementColumns: GridColDef[] = [
        { field: `number`, headerName: `ID`, width: 50 },
        {
            width: 175,
            field: `icon`,
            filterable: false,
            headerName: `Type`,
            renderCell: ({ row }: any) => <AnnouncementIconCell row={row} />,
        },
        { width: 90, field: `showTitle`, headerName: `Show Title`, filterable: false, renderCell: ({ row }: any) => <AnnouncementShowTitleCell row={row} /> },
        {
            width: 180,
            field: `name`,
            headerName: `Title`,
            valueGetter: (_value: any, row: any) => String(row?.name || ``),
            renderCell: ({ row, value }: any) => (
                canManageAnnouncements ? (
                    <EditableCell
                        mode={`text`}
                        value={value}
                        canEdit={true}
                        saveOnEnter={true}
                        cancelOnBlur={true}
                        showActions={false}
                        showStepper={false}
                        onCancel={() => onCancelAnnouncementNameDraft(row)}
                        onChangeValue={(next: string) => onChangeAnnouncementNameDraft(row, next)}
                        onSave={(next: string, original: string) => onSaveAnnouncementNameDraft(row, next, original)}
                        pendingValue={(pendingAnnouncementNameByID?.[String(row?.id)] ?? optimisticAnnouncementNameByID?.[String(row?.id)])}
                    />
                ) : (
                    <span className={`announcementNameCell lineClamp1`}>
                        {value}
                    </span>
                )
            ),
        },
        {
            flex: 1,
            maxWidth: 235,
            field: `description`,
            headerName: `Message`,
            valueGetter: (_value: any, row: any) => richTextToPlainText(row?.description) || String(row?.name || ``),
            renderCell: ({ row, value }: any) => (
                canManageAnnouncements ? (
                    <EditableCell
                        minLen={5}
                        mode={`text`}
                        value={value}
                        canEdit={true}
                        saveOnEnter={true}
                        showStepper={false}
                        cancelOnBlur={true}
                        showActions={false}
                        onCancel={() => onCancelAnnouncementMessageDraft(row)}
                        onChangeValue={(next: string) => onChangeAnnouncementMessageDraft(row, next)}
                        onSave={(next: string, original: string) => onSaveAnnouncementMessageDraft(row, next, original)}
                        pendingValue={(pendingAnnouncementMessageByID?.[String(row?.id)] ?? optimisticAnnouncementMessageByID?.[String(row?.id)])}
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
            width: 170,
            minWidth: 170,
            field: `actions`,
            filterable: false,
            headerName: `Action(s)`,
            valueGetter: (_value: any, row: any) => getAnnouncementStatusLabel(row) || ``,
            renderCell: ({ row }: any) => (
                <AnnouncementActionsCell
                    row={row}
                    rows={visibleAnnouncements}
                    onEdit={setQuickEditAnnouncement}
                    canManageAnnouncements={canManageAnnouncements}
                    selectedAnnouncementIDs={selectedAnnouncementIDs}
                    quickEditing={quickEditAnnouncement?.id == row?.id}
                    setSelectedAnnouncementIDs={setSelectedAnnouncementIDs}
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
                    onRowSelectionModelChange: (selectionModel: GridRowSelectionModel) => {
                        const ids = Array.from(selectionModel?.ids || [])?.map(id => String(id));
                        onSelectedRowsChange(ids);
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
