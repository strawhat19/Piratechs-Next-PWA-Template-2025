import { useRouter } from 'next/navigation';
import { IconButton, Tooltip } from '@mui/material';

export default function Icon_Button({ 
    size,
    title, 
    children, 
    url = ``, 
    onClick = () => {}, 
    className = `iconButtonComponent`, 
    style = { position: `relative` },
}: any) {
    const router = useRouter();
    return (
        <Tooltip title={title} arrow>
            <IconButton 
                size={`small`} 
                className={`iconButton p0 ${className}`} 
                style={{...style, maxWidth: size, maxHeight: size}}
                onClick={url != `` ? () => router.push(url) : onClick}
            >
                {children}
            </IconButton>
        </Tooltip>
    )
} 