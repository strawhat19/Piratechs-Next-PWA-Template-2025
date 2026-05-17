import { useRouter } from 'next/navigation';
import { IconButton, Tooltip } from '@mui/material';

export default function Icon_Button({ 
    size,
    title, 
    children, 
    url = ``,
    disabled = false, 
    onClick = () => {}, 
    id = `iconButtonID`,
    style = { position: `relative` },
    className = `iconButtonComponent`, 
}: any) {
    const router = useRouter();
    return (
        <Tooltip title={title} arrow>
            <IconButton 
                id={id}
                size={`small`} 
                className={`iconButton p0 ${className} ${disabled ? `disabled` : ``}`} 
                onClick={disabled ? undefined : (url != `` ? () => router.push(url) : onClick)} 
                style={{ ...style, maxWidth: size, maxHeight: size, ...(disabled ? { pointerEvents: `none` } : {}), }} 
            >
                {children}
            </IconButton>
        </Tooltip>
    )
} 