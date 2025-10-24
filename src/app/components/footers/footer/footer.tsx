import './footer.scss';

import Link from 'next/link';
import Logo from '../../logo/logo';
import { useContext, useState } from 'react';
import { Copyright } from '@mui/icons-material';
import FolderIcon from '@mui/icons-material/Folder';
import RestoreIcon from '@mui/icons-material/Restore';
import { StateGlobals } from '@/shared/global-context';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';

export default function Footer({ full = false }: any) {
    let { isPWA } = useContext<any>(StateGlobals);

    let [value, setValue] = useState(`recents`);
    let [showBottomNav, setShowBottomNav] = useState(false);

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    return (
        <footer className={`container footerContainer ${full ? `fullFooter` : `clippedFooter`} ${isPWA ? `isPWAFooter` : `standardWFooter`}`}>
            <div className={`footerInner`}>
                {showBottomNav ? (
                    <BottomNavigation showLabels={true} sx={{ width: `100%` }} value={value} onChange={handleChange}>
                        <BottomNavigationAction
                            label="Recents"
                            value="recents"
                            icon={<RestoreIcon />}
                        />
                        <BottomNavigationAction
                            label="Favorites"
                            value="favorites"
                            icon={<FavoriteIcon />}
                        />
                        <BottomNavigationAction
                            label="Nearby"
                            value="nearby"
                            icon={<LocationOnIcon />}
                        />
                        <BottomNavigationAction 
                            label="Folder" 
                            value="folder" 
                            icon={<FolderIcon />} 
                        />
                    </BottomNavigation>
                ) : <>
                    <Link href={`/`} className={`logoLink largeFont colorwhite`}>
                        <Logo size={30} />
                    </Link>
                    <span className={`copyright flex alignCenter gap5`}>
                        Copyright <Copyright style={{ color: `var(--links)` }} /> {new Date()?.getFullYear()}
                    </span>
                </>}
            </div>
        </footer>
    )
}