import { NextResponse } from 'next/server';
import { tokenRequired } from '@/shared/scripts/constants';
import { db, itemConverter, Tables } from '@/shared/server/firebase';
import { doc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';

export const runtime = `nodejs`;
export const dynamic = `force-dynamic`;

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    tokenRequired(req);
    const { id } = await ctx.params;
    const updates = await req.json();

    const itemRef = doc(db, Tables.items, id).withConverter(itemConverter);
    const snap = await getDoc(itemRef);
    if (!snap.exists()) {
      return NextResponse.json({ error: `Item Not Found` }, { status: 404 });
    }

    await updateDoc(itemRef, updates);
    return NextResponse.json({ id, ...updates }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error Updating Item` }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    tokenRequired(_req);
    const { id } = await ctx.params;
    const itemRef = doc(db, Tables.items, id).withConverter(itemConverter);
    await deleteDoc(itemRef);
    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error Deleting Item` }, { status: 500 });
  }
}