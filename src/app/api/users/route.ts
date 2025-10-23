import { NextResponse } from 'next/server';
import { User } from '@/shared/types/models/User';
import { db, Tables, userConverter } from '@/shared/server/firebase';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';

export const GET = async () => {
  try {
    const usersDatabase = collection(db, Tables.users)?.withConverter(userConverter);
    const usersDocs = await getDocs(usersDatabase);
    const users = usersDocs.docs.map(doc => new User(doc.data()));
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: `Error on Get Users` }, { status: 500 });
  }
};

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    if (!body?.id) {
      return NextResponse.json({ error: `id is required when using setDoc` }, { status: 400 });
    }
    const userDoc = doc(db, Tables.users, String(body.id)).withConverter(userConverter);
    await setDoc(userDoc, body);
    return NextResponse.json({ id: body.id, ...body }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: `Error on Create User` }, { status: 500 });
  }
};