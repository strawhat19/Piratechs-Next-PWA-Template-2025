import { NextResponse } from 'next/server';
import { saveProduct } from '@/shared/server/products';
import { Product } from '@/shared/types/models/Product';
import { collection, getDocs } from 'firebase/firestore';
import { tokenRequired } from '@/shared/scripts/constants';
import { db, productConverter, Tables } from '@/shared/server/firebase';

export const runtime = `nodejs`;
export const dynamic = `force-dynamic`;

export const GET = async () => {
  try {
    const productsDatabase = collection(db, Tables.products)?.withConverter(productConverter);
    const productsDocs = await getDocs(productsDatabase);
    const products = productsDocs.docs.map(productDoc => new Product(productDoc.data()));
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: `Error On Get Product(s)` }, { status: 500 });
  }
};

export const POST = async (req: Request) => {
  try {
    tokenRequired(req);
    const body = await req.json();
    const product = await saveProduct(body, body?.id);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : `Error On Save Product` }, { status: 500 });
  }
};
