import { Home } from '@mui/icons-material';
import Img from '@/app/components/image/image';
import { constants } from '@/shared/scripts/constants';

export type LogoOptions = {
    src?: string;
    size?: number;
    label?: string;
    logoIcon?: any;
    fontSize?: number;
    className?: string;
    fontWeight?: number;
    showLogoIcon?: boolean;
}

export default function Logo({
    size = 40,
    fontSize = 24,
    fontWeight = 700,
    className = `logo`,
    showLogoIcon = false,
    label = constants?.titles?.extended,
    src = `/${constants?.images?.icons?.logo}`,
    logoIcon = <Home className={`linkHover`} style={{ fontSize: size }} />,
}: LogoOptions) {
    return (
        <div className={`logoContainer ${className} flex alignCenter start gap10`} style={{ fontWeight }}>
            {(showLogoIcon && logoIcon != undefined) ? logoIcon : (
                <Img className={`logo`} src={src} alt={`Logo`} width={size} height={size} />
            )}
            <div className={`lineClamp1`} style={{ fontSize }}>
                {label}
            </div>
        </div>
    )
}