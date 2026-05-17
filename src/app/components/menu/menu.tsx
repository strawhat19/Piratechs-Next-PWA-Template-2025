import MuiMenu from '@mui/material/Menu';
import { Divider, MenuItem, MenuList } from '@mui/material';

export default function Menu({
    open = false,
    id = `menuComponentID`,
}: any) {
    return (
        // <MUI>
            <MuiMenu id={id} open={open}>
                <MenuList>
                    <MenuItem>
                        Profile
                    </MenuItem>
                    <Divider />
                    <MenuItem>
                        Sign Out
                    </MenuItem>
                </MenuList>
            </MuiMenu>
        // </MUI>
    )
}