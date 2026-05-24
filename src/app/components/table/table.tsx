'use client';

import Loader from '../loaders/loader';
import { useContext, useRef } from 'react';
import TableGrid from './table-grid/table-grid';
import { StateGlobals } from '@/shared/global-context';
import { GridToolbar } from '@mui/x-data-grid/internals';
import { DataDisplayModes, Types } from '@/shared/types/types';
import { GRID_CHECKBOX_SELECTION_FIELD } from '@mui/x-data-grid/colDef';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';

const paginationModel = { page: 0, pageSize: 15 };

const interactiveCellSelectors = [
  `button`,
  `a`,
  `input`,
  `select`,
  `textarea`,
  `[role="button"]`,
  `[contenteditable="true"]`,
  `.MuiButtonBase-root`,
  `.MuiDataGrid-cellCheckbox`,
  `.tableDropDown`,
  `.roleDropdownButton`,
  `.iconButton`,
  `.actionIconButton`,
  `.editableCellWrap`,
  `.editableCellInput`,
  `.toggleCell`
].join(`,`);

const shouldIgnoreCellClick = (target: any) => Boolean(target?.closest?.(interactiveCellSelectors));

const default_columns: GridColDef[] = [
  { field: `id`, headerName: `ID`, width: 50 },
  { field: `lastName`, headerName: `Last Name`, width: 130 },
  { field: `firstName`, headerName: `First Name`, width: 130 },
  { field: `age`, type: `number`, headerName: `Age`, width: 90, },
  {
    width: 160,
    field: `fullName`,
    headerName: `Full name`,
    valueGetter: (value: any, row: any) => `${row?.firstName || ``} ${row?.lastName || ``}`,
  },
];

const default_rows = [
  { id: 1, lastName: `Snow`, firstName: `Jon`, age: 35 },
  { id: 2, lastName: `Lannister`, firstName: `Cersei`, age: 42 },
  { id: 3, lastName: `Lannister`, firstName: `Jaime`, age: 45 },
  { id: 4, lastName: `Stark`, firstName: `Arya`, age: 16 },
  { id: 5, lastName: `Targaryen`, firstName: `Daenerys`, age: null },
  { id: 6, lastName: `Melisandre`, firstName: null, age: 150 },
  { id: 7, lastName: `Clifford`, firstName: `Ferrara`, age: 44 },
  { id: 8, lastName: `Frances`, firstName: `Rossini`, age: 36 },
  { id: 9, lastName: `Roxie`, firstName: `Harvey`, age: 65 },
  { id: 10, lastName: `Baratheon`, firstName: `Gendry`, age: 18 },
  { id: 11, lastName: `Dayne`, firstName: `Arthur`, age: 32 },
  { id: 12, lastName: `Stark`, firstName: `Eddard`, age: 35 },
  { id: 13, lastName: `Targaryen`, firstName: `Rhaegar`, age: 24 },
  { id: 14, lastName: `Clegane`, firstName: `Sandor`, age: 30 },
  { id: 15, lastName: `Tyrell`, firstName: `Margaery`, age: 22 },
];

export default function Table({ 
  gridProps = {},
  search = true,
  toolbar = true,
  title = `Table`,
  loading = false,
  search_delay = 0,
  type = Types.Data,
  selectable = true,
  dataGridProps = {},
  density = `compact`,
  rows = default_rows, 
  columns = default_columns, 
  rowCount = rows?.length || 0,
  className = `tableComponent`, 
  mode = DataDisplayModes.Table,
  page_size_options = [5, 10, 15],
  pagination_options = paginationModel, 
  emptyRowsLabel = `(${rowCount}) ${type}(s)`,
}: any) {
  const { loaded } = useContext<any>(StateGlobals);
  const checkedRowsRef = useRef<GridRowSelectionModel>({ type: `include`, ids: new Set() });
  const handleCellClick = (params: any, event: any) => {
    if (params?.field === GRID_CHECKBOX_SELECTION_FIELD) return;
    if (event?.defaultMuiPrevented) return;
    if (shouldIgnoreCellClick(event?.target)) return;
    if (typeof dataGridProps?.onCellClick === `function`) {
      dataGridProps.onCellClick(params, event);
      return;
    }
    console.log(`Row Clicked`, params?.row);
  };

  return (
      <div className={`table ${className} ${mode == DataDisplayModes.Grid ? `gridded` : `tabled`}`}>
        {loaded ? <>
          {toolbar ? <>
            <div className={`table_header`}>
              <span className={`table_header_row_count`}>
                ({rowCount})
              </span> {title}
            </div>
          </> : <></>}
          {mode == DataDisplayModes.Grid ? (
            <TableGrid
              type={type}
              rows={rows}
              columns={columns}
              loading={loading}
              rowCount={rowCount}
              selectable={selectable}
              dataGridProps={dataGridProps}
              emptyRowsLabel={emptyRowsLabel}
              {...gridProps}
            />
          ) : loading ? (
            <Loader height={250} label={`${type}(s) Loading`} />
          ) : (
            <DataGrid
              {...dataGridProps}
              rows={rows}
              columns={columns}
              density={density}
              disableRowSelectionOnClick={dataGridProps?.disableRowSelectionOnClick ?? true}
              showToolbar={toolbar}
              checkboxSelection={selectable}
              onCellClick={handleCellClick}
              onRowSelectionModelChange={(nextRowSelectionModel: GridRowSelectionModel, details: any) => {
                checkedRowsRef.current = nextRowSelectionModel;
                console.log(`Checked Rows`, Array.from(nextRowSelectionModel?.ids || []));
                dataGridProps?.onRowSelectionModelChange?.(nextRowSelectionModel, details);
              }}
              slots={{ toolbar: GridToolbar, }}
              pageSizeOptions={page_size_options}
              localeText={{ noRowsLabel: emptyRowsLabel }}
              initialState={{ pagination: { paginationModel: pagination_options } }}
              slotProps={{ toolbar: { showQuickFilter: search, quickFilterProps: { debounceMs: search_delay, }, }, }}
              sx={{ 
                border: 0, 
                borderColor: 'rgba(255,255,255,0.12)',
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: 'rgba(255,255,255,0.04)',
                },
                '& .MuiDataGrid-row:hover': {
                  bgcolor: 'rgba(255,255,255,0.06)',
                }, 
              }}
            />
          )}
        </> : <Loader height={250} label={`Table Loading`} />}
      </div>
  )
}
