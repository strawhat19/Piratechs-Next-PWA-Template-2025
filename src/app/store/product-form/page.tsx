import { Metadata } from 'next';
import { constants } from '@/shared/scripts/constants';
import Container from '@/app/components/container/container';
import ProductForm from '@/app/components/store/product-form/product-form';

export const metadata: Metadata = {
  title: `Product Form | ${constants.titles.default}`,
};

export default function ProductFormPage() {
    return (
        <Container className={`productFormPage`}>
            <ProductForm full />
        </Container>
    )
}
