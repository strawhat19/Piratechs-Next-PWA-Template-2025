import './topbar.scss';

export default function TopBar({ children, className = `topBarComponent` }: any) {
    return (
        <div className={`topBarContainer w100 ${className}`}>
            {children}
        </div>
    )
}