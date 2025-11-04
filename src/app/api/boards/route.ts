import { NextResponse } from 'next/server';
import { tokenRequired } from '@/shared/scripts/constants';
import { boardConverter, db, Tables, userConverter } from '@/shared/server/firebase';
import { arrayRemove, arrayUnion, collection, doc, getDocs, increment, query, where, writeBatch } from 'firebase/firestore';

export const runtime = `nodejs`;
export const dynamic = `force-dynamic`;

export const GET = async (req: Request) => {
  try {
    const token = tokenRequired(req);
    return NextResponse.json(token);
  } catch (error) {
    return NextResponse.json({ error: `Error on Get Token` }, { status: 500 });
  }
};

export const POST = async (req: Request) => {
  try {
    tokenRequired(req);

    const body = await req.json();
    const { id, userID, updated } = body || {};

    if (!id || !userID || !updated) {
      return NextResponse.json(
        { 
          code: 400,
          error: `Invalid Request Body`,
          expectedFormat: {
            updated: `2:55 PM 11/1/25`,
            id: `Board_1_Todos_2_55_PM_11_1_25_E4HEvN2vc`,
            userID: `User_1_Rakib1_11_36_PM_10_22_25_fjOQm4OD8`,
          }
        },
        { status: 400 }
      );
    }

    const batch = writeBatch(db);

    const boardRef = doc(db, Tables.boards, id).withConverter(boardConverter as any);
    const userRef  = doc(db, Tables.users, userID).withConverter(userConverter as any);

    batch.set(boardRef, body, { merge: true });
    batch.update(userRef, {
      updated,
      selectedID: id,
      boardIDs: arrayUnion(id),
      properties: increment(1),
    });

    await batch.commit();

    return NextResponse.json(body, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error, message: `Error on Create Board` }, { status: 500 });
  }
};

export const DELETE = async (req: Request) => {
  try {
    tokenRequired(req);

    const body = await req.json();
    const { id, userID, updated, selectedID } = body || {};

    if (!id || !userID || !updated || typeof selectedID != `string`) {
      return NextResponse.json(
        {
          code: 400,
          error: 'Invalid Request Body',
          expectedFormat: {
            userID: `User_1_...`,
            updated: `2:55 PM 11/1/25`,
            id: `Board_1_Todos_2_55_PM_11_1_25_XXXX`,
            selectedID: `Board_1_Todos_2_55_PM_11_1_25_XXXX`,
          },
        },
        { status: 400 }
      );
    }

    const batch = writeBatch(db);

    const boardRef = doc(db, Tables.boards, String(id)).withConverter(boardConverter as any);
    const userRef  = doc(db, Tables.users, String(userID)).withConverter(userConverter as any);

    const listsQuery = query(collection(db, Tables.lists), where(`boardIDs`, `array-contains`, id));
    const listsSnapshot = await getDocs(listsQuery);

    for (const listDoc of listsSnapshot.docs) {
      const listRef = doc(db, Tables.lists, listDoc?.id);
      batch.delete(listRef);
    }

    batch.delete(boardRef);

    batch.update(userRef, {
      updated,
      selectedID,
      boardIDs: arrayRemove(id),
      properties: increment(-1),
    });

    await batch.commit();

    return NextResponse.json(
      { ok: true, id, userID, updated, selectedID },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: String(error?.message || error), message: `Error on Delete Board` },
      { status: 500 }
    );
  }
};