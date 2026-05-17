'use client';

import { useContext } from 'react';
import Loader from '../loaders/loader';
import CssBaseline from '@mui/material/CssBaseline';
import { StateGlobals } from '@/shared/global-context';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { GridToolbar } from '@mui/x-data-grid/internals';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const paginationModel = { page: 0, pageSize: 12 };
const darkTheme = createTheme({ palette: { mode: `dark`, } });

const default_columns: GridColDef[] = [
  { field: `id`, headerName: `ID`, width: 87 },
  { field: `firstName`, headerName: `First Name`, width: 130 },
  { field: `lastName`, headerName: `Last Name`, width: 130 },
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
  search = true,
  toolbar = true,
  title = `Table`,
  search_delay = 0,
  selectable = true,
  density = `compact`,
  rows = default_rows, 
  columns = default_columns, 
  className = `tableComponent`, 
  page_size_options = [5, 10, 12],
  pagination_options = paginationModel, 
}: any) {
  const { loaded } = useContext<any>(StateGlobals);
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className={`table ${className}`}>
        {loaded ? <>
          {toolbar ? <>
            <div className={`table_header`}>
              {title}
            </div>
          </> : <></>}
          <DataGrid
            rows={rows}
            columns={columns}
            density={density}
            showToolbar={toolbar}
            checkboxSelection={selectable}
            slots={{ toolbar: GridToolbar, }}
            pageSizeOptions={page_size_options}
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
        </> : <Loader height={250} label={`Table Loading`} />}
      </div>
    </ThemeProvider>
  )
}