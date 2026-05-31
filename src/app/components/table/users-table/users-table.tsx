import Image from 'next/image';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';
import Loader from '../../loaders/loader';
import { GridColDef } from '@mui/x-data-grid';
import Table, { checkboxColumn } from '../table';
import MenuTrigger from '../../menu/menu-trigger';
import { Roles, Types } from '@/shared/types/types';
import TableStatus from '../table-status/table-status';
import { StateGlobals } from '@/shared/global-context';
import UserCard from '../../store/user-card/user-card';
import { defaultDisplayTypes } from '../../store/store';
import EditableCell from '../editable-cell/editable-cell';
import { colors, minRole } from '@/shared/scripts/constants';
import { JSX, useContext, useEffect, useState } from 'react';
import { updateUserInDatabase } from '@/shared/server/firebase';
import Icon_Button from '../../buttons/icon-button/icon-button';
// import CheckboxMulti from '../../autocomplete/checkbox-multi/checkbox-multi';
import { Code, Star, Edit, Person, Security, WorkspacePremium, AdminPanelSettings, ShoppingCart, Logout, Delete, KeyboardArrowDown } from '@mui/icons-material';

const roleIcons: Record<Roles, JSX.Element> = {
  [Roles.Guest]: <Person fontSize={`small`} htmlColor={`var(--gray)`} />,
  [Roles.Subscriber]: <Star fontSize={`small`} htmlColor={`var(--yellow_neon)`} />,
  [Roles.Customer]: <ShoppingCart style={{ fontSize: 18 }} htmlColor={`var(--blueneon)`} />,
  [Roles.Editor]: <Edit fontSize={`small`} htmlColor={`var(--success)`} />,
  [Roles.Moderator]: <Security style={{ fontSize: 18 }} color={`warning`} />,
  [Roles.Administrator]: <AdminPanelSettings fontSize={`small`} htmlColor={`var(--pink_neon)`} />,
  [Roles.Developer]: <Code fontSize={`small`} htmlColor={`var(--links)`} />,
  [Roles.Owner]: <WorkspacePremium fontSize={`small`} color={`error`} />,
};

const RoleCell = ({ row, value }: any) => {
  const filteredRoles: Roles[] = Object.values(Roles)?.filter(r => r != value);
  const roleItems = filteredRoles?.map((role: Roles | string) => ({
    id: role,
    label: role,
    value: role,
    icon: roleIcons[role as Roles],
    className: role === value ? `selectedRoleItem` : ``,
    onClick: () => {
      let newRole = role;
      let oldRole = value;
      let userName = row?.name;
      let msg = (end: string = `ing`) => `Updat${end} ${userName} from Role "${oldRole}" to "${newRole}"`;
      updateUserInDatabase(row?.id, { role: newRole })?.then(() => {
        toast.success(msg(`ed`));
      });
    },
  }));
  return (
    <>
      <MenuTrigger
        search={false}
        colors={true}
        topOffset={0.5}
        menuItems={roleItems}
        className={`roleDropdownMenu`}
        targetID={`role-menu-${row?.id}`}
        id={`role-menu-trigger-${row?.id}`}
        renderTrigger={({ id, onClick, onFocus, onType, searchValue }) => (
          <Button
            id={id}
            size={`small`}
            onClick={onClick}
            endIcon={<KeyboardArrowDown />}
            className={`tableDropDown roleDropdownButton`}
            startIcon={roleIcons[(value || Roles.Guest) as Roles]}
          >
            <span className={`dropDownBtnLabel`}>
                {value || Roles.Guest}
            </span>
          </Button>
        )}
      />
    </>
  );
}

const getUserImageURL = (row: any) => String(row?.imageURL || row?.imageUrl || row?.avatar || row?.photoURL || row?.image || ``).trim();
const getUserInitial = (row: any) => String(row?.name || row?.displayName || row?.email || `User`).trim()?.[0]?.toUpperCase() || `U`;

const UserImageCell = ({ row, user }: any) => {
    const initial = getUserInitial(row);
    const imageURL = getUserImageURL(row);
    if (imageURL) {
        return (
            <Image
                width={38}
                unoptimized
                height={38}
                src={imageURL}
                alt={row?.name || `User`}
                style={{ borderRadius: `50%` }}
                className={`iconImg productTableImage`}
            />
        );
    }
    return (
        <div className={`iconImg avatar productTableImage`} style={{ 
            borderRadius: (user != null && row?.id == user?.id) ? `50%` : undefined,
            background: (user != null && row?.id == user?.id) ? colors.info.color : row?.color?.color, 
            color: ((user != null && row?.id == user?.id) || row?.color?.type == `dark`) ? `white` : `var(--navy)`, 
        }}>
            <div className={`avatarLetter`} style={{ position: `relative`, top: 1 }}>
                {initial}
            </div>
        </div>
    );
};

const ActionsCell = ({ row, value, canManage = false }: any) => {
    const { user, showConfirm } = useContext<any>(StateGlobals);
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
    const onDeleteUser = async () => {
        const confirmed = await showConfirm({
            cancelText: `Cancel`,
            confirmText: `Delete`,
            title: `Delete Product`,
            message: `Delete Product #${row?.number} "${row?.name}"?`,
            confirmAction: { color: `var(--error)`, className: `dialogDeleteAction` },
            cancelAction: { color: `var(--buttons)` },
        });
        if (!confirmed) return;
        toast.info(`Deleting ${row?.name}`);
        console.log(`Delete User`, row);
    };
  return (
    <div className="actionsCell">
        <TableStatus label={statusLabel} color={statusColor} />
        <div className={`actions`}>
            {minRole(user?.role, Roles.Editor) ? <>
                <Icon_Button title="Edit User" size="small" className="actionIconButton editAction" 
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
                    <Icon_Button title="Sign User Out" size="small" className="actionIconButton signOutAction grayAction" 
                        onClick={(e: any) => {
                            e.stopPropagation();
                            onSignUserOut();
                        }}
                    >
                        <Logout fontSize="small" />
                    </Icon_Button>
                ) : (
                <Icon_Button title="Delete User" size="small" className="actionIconButton deleteAction"
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
    onOpenUserDetails = () => {},
    mode = defaultDisplayTypes?.customers,
}: any) {
    const { user, users } = useContext<any>(StateGlobals);
    const [pendingNameByID, setPendingNameByID] = useState<Record<string, string>>({});
    const [optimisticNameByID, setOptimisticNameByID] = useState<Record<string, string>>({});
    const canViewUsers = minRole(user?.role, Roles.Editor);
    useEffect(() => {
        setOptimisticNameByID(prev => {
            let changed = false;
            const next = { ...prev };
            Object.entries(prev).forEach(([id, optimisticName]) => {
                const liveName = String(users?.find((currentUser: any) => String(currentUser?.id) == id)?.name ?? ``);
                if (liveName == String(optimisticName || ``)) {
                    delete next[id];
                    changed = true;
                }
            });
            return changed ? next : prev;
        });
    }, [users]);
    const onChangeNameDraft = (row: any, nextName: string) => {
        setPendingNameByID(prev => ({ ...prev, [String(row?.id)]: nextName }));
    };
    const onCancelNameDraft = (row: any) => {
        const rowID = String(row?.id);
        setPendingNameByID(prev => {
            const next = { ...prev };
            delete next[rowID];
            return next;
        });
    };
    const onSaveNameDraft = (row: any, nextName: string, originalName: string) => {
        const safeName = String(nextName || ``).trim();
        const rowID = String(row?.id);
        if (safeName == String(originalName || ``).trim()) return onCancelNameDraft(row);
        setOptimisticNameByID(prev => ({ ...prev, [rowID]: safeName }));
        onCancelNameDraft(row);
        updateUserInDatabase(rowID, { name: safeName })?.then(() => {
            toast.success(`User Name Updated`);
        }).catch(() => {
            setOptimisticNameByID(prev => {
                const next = { ...prev };
                delete next[rowID];
                return next;
            });
            toast.error(`User Name Update Failed`);
        });
    };
    const user_columns: GridColDef[] = [
        { field: `number`, headerName: `ID`, width: 50 },
        {
            width: 70,
            field: `imageURL`,
            filterable: false,
            headerName: `Image`,
            headerClassName: `imageHeaderCell`,
            renderCell: ({ row }: any) => <UserImageCell row={row} user={user} />,
        },
        {
            field: `name`,
            width: 130,
            headerName: `Name`,
            renderCell: ({ row, value, showLabel }: any) => (
                <EditableCell
                    mode={`text`}
                    value={value}
                    showLabel={showLabel}
                    saveOnEnter={true}
                    cancelOnBlur={true}
                    showActions={false}
                    showStepper={false}
                    placeholder={`Name`}
                    canEdit={minRole(user?.role, Roles.Editor)}
                    pendingValue={(pendingNameByID?.[String(row?.id)] ?? optimisticNameByID?.[String(row?.id)])}
                    onChangeValue={(next: string) => onChangeNameDraft(row, next)}
                    onCancel={() => onCancelNameDraft(row)}
                    onSave={(next: string, original: string) => onSaveNameDraft(row, next, original)}
                />
            ),
        },
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
        { field: `id`, headerName: `UID`, width: 333, flex: 1 },
        {
            minWidth: 150,
            field: `signedIn`,
            headerName: `Action(s)`,
            renderCell: ({ row, value }: any) => (
                <ActionsCell
                    row={row}
                    value={value}
                    canManage={minRole(user?.role, Roles.Moderator)}
                />
            ),
        },
        checkboxColumn,
    ];
    if (!canViewUsers) return <Loader height={250} label={`${type}(s) Restricted`} />;
    return (
        users?.length > 0 ? <>
            <Table
                type={type}
                mode={mode}
                rows={users}
                title={`${type}(s)`}
                columns={user_columns}
                className={`usersTableComponent ${String(type).toLowerCase()}sTableComponent`}
                gridProps={{
                    renderCard: (params: any) => <UserCard {...params} />,
                }}
                dataGridProps={{
                    onCellClick: ({ row, field }: any) => {
                        if (field == `signedIn` || field == `actions`) return;
                        onOpenUserDetails(row);
                    },
                }}
            />
        </> : <Loader height={250} label={`${type}(s) Loading`} />
    )
}
