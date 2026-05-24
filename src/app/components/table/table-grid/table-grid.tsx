'use client';

import { useState } from 'react';
import { Checkbox, Skeleton } from '@mui/material';
import { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import DataDisplayCard from '../data-display-card/data-display-card';

export const defaultCheckboxAlignmentStart = false;

const interactiveGridSelectors = [
    `button`,
    `a`,
    `input`,
    `select`,
    `textarea`,
    `[role="button"]`,
    `[contenteditable="true"]`,
    `.MuiButtonBase-root`,
    `.dataDisplayCardSelect`,
    `.tableDropDown`,
    `.roleDropdownButton`,
    `.iconButton`,
    `.actionIconButton`,
    `.editableCellWrap`,
    `.editableCellInput`,
    `.toggleCell`,
].join(`,`);

const getRowID = (row: any, rowIndex = 0) => String(row?.id ?? row?.uid ?? row?.number ?? rowIndex);
const shouldIgnoreGridClick = (target: any) => Boolean(target?.closest?.(interactiveGridSelectors));

export type TableGridCardParams = {
    row: any;
    rowID: string;
    rowIndex: number;
    selected: boolean;
    columns: GridColDef[];
    selectable: boolean;
    onSelect: (event: any) => void;
    checkboxAlignmentStart?: boolean;
    onCardClick: (event: any) => void;
    getColumnValue: (field: string | GridColDef) => any;
    renderColumn: (field: string | GridColDef, className?: string, options?: any) => any;
};

type TableGridProps = {
    rows?: any[];
    type?: string;
    loading?: boolean;
    rowCount?: number;
    dataGridProps?: any;
    selectable?: boolean;
    columns?: GridColDef[];
    emptyRowsLabel?: string;
    checkboxAlignmentStart?: boolean;
    renderCard?: (params: TableGridCardParams) => any;
};

const getSelectionIDs = (selectionModel: GridRowSelectionModel | any, rows: any[] = []) => {
    const rowIDs = rows?.map((row, index) => getRowID(row, index));
    if (selectionModel?.type == `exclude`) {
        return rowIDs?.filter(id => !selectionModel?.ids?.has?.(id));
    }
    return Array.from(selectionModel?.ids || [])?.map(id => String(id));
};

const getColumnValue = (column: GridColDef, row: any) => {
    const value = row?.[column?.field];
    if (typeof column?.valueGetter != `function`) return value;
    try {
        return (column.valueGetter as any)(value, row, column, null);
    } catch {
        return value;
    }
};

const TableGridSkeleton = ({ count = 6 }: { count?: number }) => (
    <div className={`tableGridCards`}>
        {Array.from({ length: count }).map((_, index) => (
            <DataDisplayCard key={`grid-skeleton-${index}`} className={`dataDisplayCardSkeleton`}>
                <Skeleton variant={`rectangular`} height={170} animation={`wave`} />
                <Skeleton variant={`text`} height={28} animation={`wave`} />
                <Skeleton variant={`text`} height={22} width={`68%`} animation={`wave`} />
                <div className={`dataDisplayCardSkeletonRow`}>
                    <Skeleton variant={`rounded`} height={34} animation={`wave`} />
                    <Skeleton variant={`rounded`} height={34} animation={`wave`} />
                </div>
            </DataDisplayCard>
        ))}
    </div>
);

const GenericGridCard = ({
    row,
    rowID,
    selected,
    columns,
    rowIndex,
    onSelect,
    selectable,
    onCardClick,
    renderColumn,
    checkboxAlignmentStart = defaultCheckboxAlignmentStart,
}: TableGridCardParams) => (
    <DataDisplayCard selected={selected} onClick={onCardClick} className={`genericGridCard`} checkboxAlignmentStart={checkboxAlignmentStart}>
        {selectable ? (
            <label className={`dataDisplayCardSelect`} onClick={(event) => event.stopPropagation()}>
                <Checkbox
                    checked={selected}
                    size={`small`}
                    onChange={onSelect}
                    className={`dataDisplayCardCheckbox`}
                />
            </label>
        ) : <></>}
        <div className={`genericGridCardHeader`}>
            <span>#{row?.number || rowIndex + 1}</span>
            <strong>{row?.name || row?.title || rowID}</strong>
        </div>
        <div className={`genericGridCardFields`}>
            {columns?.filter(column => ![`actions`, `id`].includes(column?.field))?.slice(0, 6)?.map(column => (
                <div key={`${rowID}-${column?.field}`} className={`genericGridCardField`}>
                    <span>{column?.headerName || column?.field}</span>
                    <div>{renderColumn(column)}</div>
                </div>
            ))}
        </div>
        {columns?.some(column => column?.field == `actions`) ? (
            <div className={`genericGridCardActions`}>
                {renderColumn(`actions`)}
            </div>
        ) : <></>}
    </DataDisplayCard>
);

export default function TableGrid({
    rows = [],
    columns = [],
    loading = false,
    selectable = true,
    dataGridProps = {},
    renderCard = undefined,
    emptyRowsLabel = `No Rows`,
    rowCount = rows?.length || 0,
    checkboxAlignmentStart = defaultCheckboxAlignmentStart,
}: TableGridProps) {
    const [internalSelectionModel, setInternalSelectionModel] = useState<GridRowSelectionModel>({ type: `include`, ids: new Set() });
    if (loading) return <TableGridSkeleton count={Math.max(4, Math.min(rowCount || 6, 8))} />;
    if (!rows?.length) return <div className={`tableGridEmpty`}>{emptyRowsLabel}</div>;

    const isControlledSelection = dataGridProps?.rowSelectionModel != null;
    const activeSelectionModel = isControlledSelection ? dataGridProps?.rowSelectionModel : internalSelectionModel;
    const selectedIDs = getSelectionIDs(activeSelectionModel, rows);

    return (
        <div className={`tableGridCards`}>
            {rows?.map((row, rowIndex) => {
                const rowID = getRowID(row, rowIndex);
                const selected = selectedIDs?.includes(rowID);
                const params: TableGridCardParams = {
                    row,
                    rowID,
                    columns,
                    selected,
                    rowIndex,
                    selectable,
                    checkboxAlignmentStart,
                    getColumnValue: (field: string | GridColDef) => getColumnValue(typeof field == `string` ? columns?.find(column => column?.field == field) as GridColDef : field, row),
                    renderColumn: (field: string | GridColDef, className = ``, options: any = {}) => {
                        const column = typeof field == `string` ? (
                            columns?.find(currentColumn => currentColumn?.field == field)
                        ) : field;
                        if (!column) return null;
                        const value = getColumnValue(column, row);
                        const content = typeof column?.renderCell == `function` ? (
                            column.renderCell({ id: rowID, row, value, field: column?.field, colDef: column, ...options } as any)
                        ) : value;
                        return (
                            <div className={`tableGridField tableGridField-${column?.field} ${className}`.trim()}>
                                {content}
                            </div>
                        );
                    },
                    onSelect: (event: any) => {
                        event?.stopPropagation?.();
                        const nextIDs = new Set(selectedIDs);
                        selected ? nextIDs.delete(rowID) : nextIDs.add(rowID);
                        const nextSelectionModel: GridRowSelectionModel = { type: `include`, ids: nextIDs };
                        if (!isControlledSelection) setInternalSelectionModel(nextSelectionModel);
                        dataGridProps?.onRowSelectionModelChange?.(nextSelectionModel, { reason: `checkboxSelection` });
                    },
                    onCardClick: (event: any) => {
                        if (shouldIgnoreGridClick(event?.target)) return;
                        dataGridProps?.onCellClick?.({ id: rowID, row, field: `gridCard` }, event);
                    },
                };
                return (
                    <div key={rowID} className={`tableGridCardSlot`}>
                        {renderCard ? renderCard(params) : <GenericGridCard {...params} />}
                    </div>
                );
            })}
        </div>
    );
}
