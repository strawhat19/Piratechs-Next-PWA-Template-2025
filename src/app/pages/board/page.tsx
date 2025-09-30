import { Metadata } from 'next';
import { constants } from '@/shared/scripts/constants';
import Container from '@/app/components/container/container';
import DndKitSimpleDemo from '@/app/components/drag-and-drop/dnd-kit/demo/dnd-kit-demo';

export const metadata: Metadata = {
  title: `Board | ${constants.titles.default}`,
};

export default function BoardPage() {
    return (
        <Container className={`boardPage`} logoLabel={`To Do`} showPageLogo={false}>
            <DndKitSimpleDemo />
        </Container>
    )
}