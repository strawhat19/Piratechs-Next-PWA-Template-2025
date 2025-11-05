import { NextResponse } from 'next/server';
import { tokenRequired } from '@/shared/scripts/constants';
import { db, listConverter, Tables } from '@/shared/server/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export const runtime = `nodejs`;
export const dynamic = `force-dynamic`;

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    tokenRequired(req);
    const { id } = await ctx.params;
    const updates = await req.json();

    const listRef = doc(db, Tables.lists, id).withConverter(listConverter);
    const snap = await getDoc(listRef);
    if (!snap.exists()) {
      return NextResponse.json({ error: `List Not Found` }, { status: 404 });
    }

    await updateDoc(listRef, updates);
    return NextResponse.json({ id, ...updates }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error Updating List` }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    tokenRequired(_req);
    const { id } = await ctx.params;
    const listRef = doc(db, Tables.lists, id);
    await deleteDoc(listRef);
    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error Deleting List` }, { status: 500 });
  }
}