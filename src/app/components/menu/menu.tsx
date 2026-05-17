import MuiMenu from '@mui/material/Menu';
import { useRouter } from 'next/navigation';
import { dev } from '@/shared/scripts/constants';
import { Divider, MenuItem } from '@mui/material';
import { Close, Logout, Person } from '@mui/icons-material';

export default function Menu({
    open = false,
    topOffset = 0,
    menuItems = [],
    anchorEl = null,
    onClose = () => {},
    targetID = `targetID`,
    id = `menuComponentID`,
    className = `menuComponentClass`,
}: any) {
    const router = useRouter();
    menuItems = [
        {
            id: `profile`,
            label: `Profile`,
            icon: <Person />,
            onClick: () => {
                router.push(`/profile`);
            },
        },
        {
            id: `signout`,
            label: `Sign Out`,
            icon: <Logout />,
            onClick: () => {
                dev() && console.log(`Sign Out`);
            },
        },
        {
            id: `close`,
            label: `Close`,
            icon: <Close />,
        },
    ];
    return (
        // <MUI>
            <div className={`menuComponentContainer`}>
                <MuiMenu 
                    id={id}
                    open={open} 
                    anchorEl={anchorEl} 
                    className={`menuComponent ${className}`} 
                    anchorOrigin={{ vertical: `bottom`, horizontal: `right`, }} 
                    transformOrigin={{ vertical: `top`, horizontal: `right`, }} 
                    slotProps={{ list: { 'aria-labelledby': targetID, }, paper: { sx: { mt: topOffset, }, }, }}
                >
                    {menuItems?.map((mi: any, mii: number) => (
                        <div key={mii} className={`menuItemContent`}>
                            {(mii == (menuItems?.length - 1)) ? <Divider /> : <></>}
                            <MenuItem onClick={() => {
                                mi?.onClick?.();
                                onClose();
                            }}>
                                {mi?.icon} {mi?.label}
                            </MenuItem>
                        </div>
                    ))}
                </MuiMenu>
            </div>
        // </MUI>
    )
}