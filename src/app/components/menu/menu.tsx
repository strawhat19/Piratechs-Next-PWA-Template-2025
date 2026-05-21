import MuiMenu from '@mui/material/Menu';
import { Close } from '@mui/icons-material';
import { Divider, MenuItem } from '@mui/material';

export default function Menu({
    open = false,
    topOffset = 0,
    colors = false,
    menuItems = [],
    anchorEl = null,
    onClose = () => {},
    targetID = `targetID`,
    id = `menuComponentID`,
    className = `menuComponentClass`,
}: any) {
    return (
        // <MUI>
            // <div className={`menuComponentContainer`}>
                <MuiMenu 
                    id={id}
                    open={open} 
                    onClose={onClose}
                    anchorEl={anchorEl} 
                    className={`menuComponent ${className}`} 
                    anchorOrigin={{ vertical: `bottom`, horizontal: `right`, }} 
                    transformOrigin={{ vertical: `top`, horizontal: `right`, }} 
                    slotProps={{ list: { 'aria-labelledby': targetID, }, paper: { sx: { mt: topOffset, }, }, }}
                >
                    {[ ...menuItems, { id: `close`, label: `Close`, icon: <Close htmlColor={`var(--links)`} />, divider: true }, ]?.map((mi: any, mii: number) => (
                        <div key={mii} className={`menuItemContent`}>
                            {mi?.divider ? <Divider /> : <></>}
                            <MenuItem className={`menuItemComponent ${colors ? `hasColors` : `noColors`} ${mi?.className}`} onClick={() => {
                                mi?.onClick?.();
                                onClose();
                            }}>
                                <div className={`menuItemContentContainer`}>
                                    <div className={`menuItemIcon`}>
                                        {mi?.icon}
                                    </div>
                                    <div className={`menuItemLabel`}>
                                        {mi?.label}
                                    </div>
                                </div>
                            </MenuItem>
                        </div>
                    ))}
                </MuiMenu>
            // </div>
        // </MUI>
    )
}
