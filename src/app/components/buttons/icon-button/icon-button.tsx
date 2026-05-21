import { MouseEventHandler } from 'react';
import { useRouter } from 'next/navigation';
import { Button, IconButton, Tooltip } from '@mui/material';

export default function Icon_Button({ 
    size,
    title, 
    children, 
    url = ``,
    arrow = true,
    button = false,
    rounded = true,
    target = `_self`,
    color = `primary`,
    disabled = false, 
    onClick = () => {}, 
    id = `iconButtonID`,
    placement = `bottom`,
    followCursor = false,
    className = `iconButtonComponent`, 
    style = { position: `relative`, ...(rounded == false ? { borderRadius: 2 } : {}), },
}: any) {
    const router = useRouter();
    const handleClick = (e?: MouseEventHandler<HTMLButtonElement> | any) => {
        if (url != ``) {
            if (target === `_blank`) {
                window.open(url, `_blank`, `noopener,noreferrer`);
                return;
            }
            router.push(url);
            return;
        }
        onClick?.(e);
    };
    return (
        <Tooltip 
            color={color}
            title={title} 
            arrow={arrow} 
            placement={placement} 
            followCursor={followCursor} 
            slotProps={{
                popper: {
                    modifiers: [
                        {
                            name: `flip`,
                            enabled: false,
                        },
                    ],
                },
            }}
        >
            {button == true ? (
                <Button 
                    id={id}
                    color={color}
                    size={`small`} 
                    onClick={disabled ? undefined : handleClick}
                    className={`iconButton p0 ${className} ${disabled ? `disabled` : ``}`} 
                    style={{ 
                        ...style, 
                        maxWidth: size, 
                        maxHeight: size, 
                        ...(disabled ? { pointerEvents: `none` } : {}), 
                    }} 
                >
                    {children}
                </Button>
            ) : (
                <IconButton 
                    id={id}
                    color={color}
                    size={`small`} 
                    onClick={disabled ? undefined : handleClick}
                    className={`iconButton p0 ${className} ${disabled ? `disabled` : ``}`} 
                    style={{ 
                        ...style, 
                        maxWidth: size, 
                        maxHeight: size, 
                        ...(disabled ? { pointerEvents: `none` } : {}), 
                    }} 
                >
                    {children}
                </IconButton>
            )}
        </Tooltip>
    )
}