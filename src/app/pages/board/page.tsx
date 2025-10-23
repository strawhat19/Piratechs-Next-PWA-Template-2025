import { Metadata } from 'next';
import Board from '@/app/components/board/board';
import { constants } from '@/shared/scripts/constants';
import Container from '@/app/components/container/container';

export const metadata: Metadata = {
  title: `Board | ${constants.titles.default}`,
};

export default function BoardPage() {
    return (
        <Container className={`boardPage`} logoLabel={`To Do`} showPageLogo={false}>
            <Board />
        </Container>
    )
}