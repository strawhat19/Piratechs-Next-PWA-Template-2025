import { NextResponse } from 'next/server';
import { db, Tables, userConverter } from '@/shared/server/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export const GET = async (
  _req: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const { id } = params;
    const userRef = doc(db, Tables.users, id).withConverter(userConverter);
    const snap: any = await getDoc(userRef);
    if (!snap.exists()) {
      return NextResponse.json({ error: `User Not Found` }, { status: 404 });
    }
    return NextResponse.json({ id: snap.id, ...snap.data() });
  } catch (error) {
    return NextResponse.json({ error: `Error on Get User` }, { status: 500 });
  }
};

export const PATCH = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const { id } = params;
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
};

export const DELETE = async (
  _req: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const { id } = params;
    const userRef = doc(db, Tables.users, id);
    await deleteDoc(userRef);
    return NextResponse.json({ id }, { status: 200 });
  } catch {
    return NextResponse.json({ error: `Error Deleting User` }, { status: 500 });
  }
};