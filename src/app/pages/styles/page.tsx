import Container from '@/app/components/container/container';
import Styles from '@/app/components/sections/styles/styles';

export default function StylesPage() {
    return (
        <Container className={`stylesPage`}>
            <h1>Styles Page</h1>
            <Styles />
        </Container>
    )
}