import './container.scss';

import Header from '../headers/header/header';
import Footer from '../footers/footer/footer';

export default function Container({ children, className = `containerComponent` }: any) {
    return (
        <body className={`${className} pageContainer`}>
            <Header />
            <main className={`container`}>
                {children}
            </main>
            <Footer />
        </body>
    )
}