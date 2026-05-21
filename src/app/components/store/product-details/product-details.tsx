'use client';

import { Product } from '@/shared/types/models/Product';
import { ProductFormDialog } from '../product-form/product-form';

type ProductDetailsProps = {
  open?: boolean;
  onClose?: () => void;
  product?: Product | null;
};

export default function ProductDetails({
  open = false,
  onClose = () => {},
  product = null,
}: ProductDetailsProps) {
  return (
    <ProductFormDialog
      open={open}
      onClose={onClose}
      product={product}
    />
  );
}
