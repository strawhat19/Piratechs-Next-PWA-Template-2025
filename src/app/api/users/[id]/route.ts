import { NextResponse } from 'next/server';
import { db, Tables, userConverter } from '@/shared/server/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export const runtime = `nodejs`;
export const dynamic = `force-dynamic`;

function unauthorized(message = `Unauthorized`) {
  return NextResponse.json({ code: 401, error: message }, { status: 401 });
}

function tokenRequired(req: Request) {
  const authHeader = req.headers.get(`authorization`) || req.headers.get(`Authorization`);
  if (!authHeader?.startsWith(`Bearer `)) {
    return unauthorized(`Missing Bearer Token`);
  }
  const token = authHeader.slice(`Bearer `.length).trim();
  if (!token) {
    return unauthorized();
  }
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const userRef = doc(db, Tables.users, id).withConverter(userConverter);
    const snap: any = await getDoc(userRef);

    if (!snap.exists()) {
      return NextResponse.json({ error: `User Not Found` }, { status: 404 });
    }

    return NextResponse.json({ id: snap.id, ...snap.data() });
  } catch (error) {
    return NextResponse.json({ error: `Error on Get User` }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    tokenRequired(req);
    const { id } = await ctx.params;
    const updates = await req.json();

    const userRef = doc(db, Tables.users, id).withConverter(userConverter);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      return NextResponse.json({ error: `User Not Found` }, { status: 404 });
    }

    await updateDoc(userRef, updates);
    return NextResponse.json({ id, ...updates }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error Updating User` }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    tokenRequired(_req);
    const { id } = await ctx.params;
    const userRef = doc(db, Tables.users, id);
    await deleteDoc(userRef);
    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error Deleting User` }, { status: 500 });
  }
}