import './topbar.scss';

export default function TopBar({ children, style, className = `topBarComponent` }: any) {
    return (
        <div className={`topBarContainer w100 ${className}`} style={style}>
            {children}
        </div>
    )
}