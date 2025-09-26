import { Metadata } from 'next';
import { constants } from '@/shared/scripts/constants';
import Container from '@/app/components/container/container';
import DndKitSimpleDemo from '@/app/components/drag-and-drop/dnd-kit/demo/dnd-kit-demo';

export const metadata: Metadata = {
  title: `Lists | ${constants.titles.default}`,
};

export default function ListsPage() {
    return (
        <Container className={`listsPage`}>
            <DndKitSimpleDemo />
        </Container>
    )
}