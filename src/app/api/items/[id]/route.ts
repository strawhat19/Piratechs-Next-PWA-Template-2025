import { NextResponse } from 'next/server';
import { doc, deleteDoc } from 'firebase/firestore';
import { db, Tables } from '@/shared/server/firebase';
import { tokenRequired } from '@/shared/scripts/constants';

export const runtime = `nodejs`;
export const dynamic = `force-dynamic`;

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    tokenRequired(_req);
    const { id } = await ctx.params;
    const itemRef = doc(db, Tables.items, id);
    await deleteDoc(itemRef);
    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error Deleting Item` }, { status: 500 });
  }
}