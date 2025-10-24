import { useRouter } from 'next/navigation';
import { IconButton, Tooltip } from '@mui/material';

export default function Icon_Button({ 
    title, 
    children, 
    url = ``, 
    onClick = () => {}, 
    className = `iconButtonComponent`, 
}: any) {
    const router = useRouter();
    return (
        <Tooltip title={title} arrow>
            <IconButton 
                size={`small`} 
                className={`iconButton p0 ${className}`} 
                onClick={url != `` ? () => router.push(url) : onClick}
            >
                {children}
            </IconButton>
        </Tooltip>
    )
} 