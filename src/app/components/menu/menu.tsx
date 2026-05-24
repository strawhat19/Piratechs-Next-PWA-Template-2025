import MuiMenu from '@mui/material/Menu';
import { Close } from '@mui/icons-material';
import { Divider, MenuItem } from '@mui/material';

export default function Menu({
    open = false,
    topOffset = 0,
    colors = false,
    showLabels = true,
    menuItems = [],
    anchorEl = null,
    onClose = () => {},
    onMouseEnter = undefined,
    onMouseLeave = undefined,
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
                    slotProps={{ list: { 'aria-labelledby': targetID, onMouseEnter, }, paper: { onMouseEnter, onMouseLeave, sx: { mt: topOffset, }, }, }}
                >
                    {[ ...menuItems, { id: `close`, label: `Close`, icon: <Close htmlColor={`var(--links)`} />, divider: true }, ]?.map((mi: any, mii: number) => (
                        <div key={mii} className={`menuItemContent`}>
                            {mi?.divider ? <Divider /> : <></>}
                            <MenuItem
                                aria-label={String(mi?.label || ``)}
                                className={`menuItemComponent ${colors ? `hasColors` : `noColors`} ${mi?.className} ${showLabels ? `` : `iconOnly`}`.trim()}
                                onClick={() => {
                                mi?.onClick?.();
                                onClose();
                            }}>
                                <div className={`menuItemContentContainer ${showLabels ? `` : `iconOnly`}`.trim()}>
                                    <div className={`menuItemIcon`}>
                                        {mi?.icon}
                                    </div>
                                    {showLabels ? (
                                        <div className={`menuItemLabel`}>
                                            {mi?.label}
                                        </div>
                                    ) : <></>}
                                </div>
                            </MenuItem>
                        </div>
                    ))}
                </MuiMenu>
            // </div>
        // </MUI>
    )
}
