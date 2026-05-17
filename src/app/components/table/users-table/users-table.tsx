import Table from '../table';
import Menu from '../../menu/menu';
import { Button } from '@mui/material';
import { toast } from 'react-toastify';
import Loader from '../../loaders/loader';
import { Roles } from '@/shared/types/types';
import { GridColDef } from '@mui/x-data-grid';
import { JSX, useContext, useState } from 'react';
import { minRole } from '@/shared/scripts/constants';
import { StateGlobals } from '@/shared/global-context';
import { updateUserInDatabase } from '@/shared/server/firebase';
import { Code, Star, Edit, Person, Security, WorkspacePremium, AdminPanelSettings, KeyboardArrowDown } from '@mui/icons-material';

const roleIcons: Record<Roles, JSX.Element> = {
  [Roles.Guest]: <Person fontSize={`small`} />,
  [Roles.Subscriber]: <Star fontSize={`small`} />,
  [Roles.Editor]: <Edit fontSize={`small`} />,
  [Roles.Moderator]: <Security fontSize={`small`} />,
  [Roles.Administrator]: <AdminPanelSettings fontSize={`small`} />,
  [Roles.Developer]: <Code fontSize={`small`} />,
  [Roles.Owner]: <WorkspacePremium fontSize={`small`} />,
};

const RoleCell = ({ row, value }: any) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const closeMenu = () => setAnchorEl(null);
  const filteredRoles: Roles[] = Object.values(Roles)?.filter(r => r != value);
  const roleItems = filteredRoles?.map((role: Roles) => ({
    id: role,
    label: role,
    icon: roleIcons[role as Roles],
    className: role === value ? `selectedRoleItem` : ``,
    onClick: () => {
        let newRole = role;
        let oldRole = value;
        let userName = row?.name;
        let msg = (end: string = `ing`) => `Updat${end} ${userName} from Role "${oldRole}" to "${newRole}"`;
        toast.info(msg());
        updateUserInDatabase(row?.id, { role: newRole })?.then(() => {
            toast.success(msg(`ed`));
        });
    },
  }));
  return (
    <>
      <Button
        size={`small`}
        className={`roleDropdownButton`}
        style={{ width: `100%`, justifyContent: `space-between`, top: -1 }}
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
        startIcon={roleIcons[(value || Roles.Guest) as Roles]}
        endIcon={<KeyboardArrowDown />}
      >
        <span style={{ marginRight: `auto` }}>
            {value || Roles.Guest}
        </span>
      </Button>
      <Menu
        open={open}
        topOffset={0.5}
        anchorEl={anchorEl}
        onClose={closeMenu}
        menuItems={roleItems}
        className={`roleDropdownMenu`}
        targetID={`role-menu-${row?.id}`}
      />
    </>
  );
}

export default function UsersTable({
    type = `User`,
}: any) {
    const { user, users } = useContext<any>(StateGlobals);
    const user_columns: GridColDef[] = [
        { field: `number`, headerName: `ID`, width: 87, },
        { field: `name`, headerName: `Name`, width: 130, editable: true, },
        { field: `properties`, type: `number`, headerName: `Props`, width: 90, },
        {
            width: 160,
            field: `role`,
            headerName: `Role`,
            renderCell: ({ row, value }: any) => (
                minRole(user?.role, Roles.Editor) ? <RoleCell row={row} value={value} /> : <>{value}</>
            ),
        },
        { field: `dataSource`, headerName: `Source`, width: 100, },
        { field: `created`, headerName: `Registered`, width: 165, },
        { field: `lastSignIn`, headerName: `Last Sign In`, width: 165, },
        { field: `updated`, headerName: `Updated`, width: 165, },
        { field: `email`, headerName: `Email`, width: 150 },
        { field: `id`, headerName: `UUID`, width: 333, },
    ];
    return (
        users?.length > 0 ? <>
            <Table title={`(${users?.length}) ${type}(s)`} rows={users} columns={user_columns} />
        </> : <Loader height={250} label={`${type}(s) Loading`} />
    )
}