import { NextResponse } from 'next/server';
import { User } from '@/shared/types/models/User';
import { tokenRequired } from '@/shared/scripts/constants';
import { db, Tables, userConverter } from '@/shared/server/firebase';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';

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
    await setDoc(userDoc, body, { merge: true });
    return NextResponse.json({ id: body.id, ...body }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: `Error on Create/Update User` }, { status: 500 });
  }
};

// export const DELETE = async (req: Request) => {
//   try {
//     tokenRequired(req);
//     const body = await req.json();
//     const { id } = body || {};
//     if (!id) {
//       return NextResponse.json(
//         {
//           code: 400,
//           error: `Invalid Request Body`,
//           expectedFormat: {
//             id: `User_1_Rakib1_11_36_PM_10_22_25_fjOQm4OD8`,
//           },
//         },
//         { status: 400 }
//       );
//     }
//     const userDoc = doc(db, Tables.users, String(body?.id)).withConverter(userConverter);
//     await deleteDoc(userDoc)?.then(() => {

//     });
//     return NextResponse.json(
//       { ok: true, id, },
//       { status: 200 }
//     );
//   } catch (error: any) {
//     return NextResponse.json(
//       { error: String(error?.message || error), message: `Error on Delete Board` },
//       { status: 500 }
//     );
//   }
// };