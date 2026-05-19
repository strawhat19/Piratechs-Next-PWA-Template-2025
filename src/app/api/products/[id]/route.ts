import { NextResponse } from 'next/server';
import { tokenRequired } from '@/shared/scripts/constants';
import { deleteProduct, findProductDocument, updateProduct } from '@/shared/server/products';

export const runtime = `nodejs`;
export const dynamic = `force-dynamic`;

export const GET = async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await ctx.params;
    const productDocument = await findProductDocument(id);
    if (!productDocument) return NextResponse.json({ error: `Product Not Found` }, { status: 404 });
    return NextResponse.json({ ...productDocument?.data, id: productDocument?.data?.id || productDocument?.documentID });
  } catch (error) {
    return NextResponse.json({ error: `Error On Get Product` }, { status: 500 });
  }
}

export const PATCH = async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  try {
    tokenRequired(req);
    const { id } = await ctx.params;
    const updates = await req.json();
    const product = await updateProduct(id, updates);
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : `Error Updating Product` }, { status: 500 });
  }
}

export const DELETE = async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  try {
    tokenRequired(req);
    const { id } = await ctx.params;
    const product = await deleteProduct(id);
    return NextResponse.json({ ok: true, id: product?.id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : `Error Deleting Product` }, { status: 500 });
  }
}
