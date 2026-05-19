import Table from '../table';
import Menu from '../../menu/menu';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';
import Loader from '../../loaders/loader';
import { GridColDef } from '@mui/x-data-grid';
import { JSX, useContext, useState } from 'react';
import { Roles, Types } from '@/shared/types/types';
import { minRole } from '@/shared/scripts/constants';
import TableStatus from '../table-status/table-status';
import { StateGlobals } from '@/shared/global-context';
import { updateUserInDatabase } from '@/shared/server/firebase';
import Icon_Button from '../../buttons/icon-button/icon-button';
import { Code, Star, Edit, Person, Security, WorkspacePremium, AdminPanelSettings, KeyboardArrowDown, ShoppingCart, Logout, Delete } from '@mui/icons-material';

const roleIcons: Record<Roles, JSX.Element> = {
  [Roles.Guest]: <Person fontSize={`small`} color={`secondary`} />,
  [Roles.Subscriber]: <Star fontSize={`small`} htmlColor={`var(--yellow_neon)`} />,
  [Roles.Customer]: <ShoppingCart style={{ fontSize: 18 }} htmlColor={`var(--blueneon)`} />,
  [Roles.Editor]: <Edit fontSize={`small`} htmlColor={`var(--success)`} />,
  [Roles.Moderator]: <Security style={{ fontSize: 18 }} color={`warning`} />,
  [Roles.Administrator]: <AdminPanelSettings fontSize={`small`} htmlColor={`var(--pink_neon)`} />,
  [Roles.Developer]: <Code fontSize={`small`} htmlColor={`var(--links)`} />,
  [Roles.Owner]: <WorkspacePremium fontSize={`small`} color={`error`} />,
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
        className={`tableDropDown roleDropdownButton`}
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
        colors={true}
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

const ActionsCell = ({ row, value, canManage = false }: any) => {
    const { user } = useContext<any>(StateGlobals);
    const online = Boolean(value);
    const statusColor = online ? `var(--green_neon)` : `rgba(255,255,255,0.35)`;
    const statusLabel = online ? `Online` : `Offline`;
    const onSignUserOut = () => {
        toast.info(`Signing Out ${row?.name}`);
        console.log(`Sign User Out`, row);
    };
    const onEditUser = () => {
        toast.info(`Editing ${row?.name}`);
        console.log(`Edit User`, row);
    };
    const onDeleteUser = () => {
        toast.info(`Deleting ${row?.name}`);
        console.log(`Delete User`, row);
    };
  return (
    <div className="actionsCell">
        <TableStatus label={statusLabel} color={statusColor} />
        <div className={`actions`}>
            {minRole(user?.role, Roles.Editor) ? <>
                <Icon_Button title="Edit User" size="small"
                    className="actionIconButton editAction"
                    onClick={(e: any) => {
                        e.stopPropagation();
                        onEditUser();
                    }}
                >
                    <Edit fontSize="small" />
                </Icon_Button>
            </> : <></>}
            {canManage ? <>
                {online ? (
                    <Icon_Button title="Sign User Out" size="small"
                    className="actionIconButton signOutAction"
                    onClick={(e: any) => {
                        e.stopPropagation();
                        onSignUserOut();
                    }}>
                        <Logout fontSize="small" />
                    </Icon_Button>
                ) : (
                <Icon_Button title="Delete User" size="small"
                    className="actionIconButton deleteAction"
                    onClick={(e: any) => {
                        e.stopPropagation();
                        onDeleteUser();
                    }}
                    >
                        <Delete fontSize="small" />
                </Icon_Button>
                )}
            </> : null}
        </div>
    </div>
  );
};

export default function UsersTable({
    type = Types.User,
}: any) {
    const { user, users } = useContext<any>(StateGlobals);
    const canViewUsers = minRole(user?.role, Roles.Editor);
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
        { field: `created`, headerName: `Registered`, width: 160, },
        { field: `lastSignIn`, headerName: `Last Sign In`, width: 160, },
        { field: `updated`, headerName: `Updated`, width: 165, },
        { field: `email`, headerName: `Email`, width: 175 },
        { field: `id`, headerName: `UUID`, width: 333, flex: 1 },
        { 
            minWidth: 150,
            field: `signedIn`, 
            headerName: `Actions`, 
            renderCell: ({ row, value }: any) => (
                <ActionsCell
                    row={row}
                    value={value}
                    canManage={minRole(user?.role, Roles.Moderator)}
                />
            ), 
        },
    ];
    if (!canViewUsers) return <Loader height={250} label={`${type}(s) Restricted`} />;
    return (
        users?.length > 0 ? <>
            <Table type={type} title={`${type}(s)`} rows={users} columns={user_columns} />
        </> : <Loader height={250} label={`${type}(s) Loading`} />
    )
}
