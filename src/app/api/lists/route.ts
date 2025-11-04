import { NextResponse } from 'next/server';
import { tokenRequired } from '@/shared/scripts/constants';
import { arrayUnion, doc, increment, writeBatch } from 'firebase/firestore';
import { boardConverter, db, listConverter, Tables, userConverter } from '@/shared/server/firebase';

export const runtime = `nodejs`;
export const dynamic = `force-dynamic`;

export const POST = async (req: Request) => {
  try {
    tokenRequired(req);

    const body = await req.json();
    const { id, userID, boardIDs, updated } = body || {};

    if (!id || !userID || !updated || (!boardIDs || !Array.isArray(boardIDs))) {
      return NextResponse.json(
        { 
          code: 400,
          error: `Invalid Request Body`,
          expectedFormat: {
            updated: `2:55 PM 11/1/25`,
            id: `List_1_Todos_2_55_PM_11_1_25_E4HEvN2vc`,
            userID: `User_1_Rakib1_11_36_PM_10_22_25_fjOQm4OD8`,
            boardIDs: [`Board_1_Todos_2_55_PM_11_1_25_E4HEvN2vc`],
          }
        },
        { status: 400 }
      );
    }

    const batch = writeBatch(db);

    const listRef = doc(db, Tables.lists, id).withConverter(listConverter as any);
    const userRef  = doc(db, Tables.users, userID).withConverter(userConverter as any);
    const boardRef = doc(db, Tables.boards, boardIDs[0]).withConverter(boardConverter as any);

    batch.set(listRef, body, { merge: true });
    batch.update(boardRef, {
      updated,
      listIDs: arrayUnion(id),
      properties: increment(1),
    });
    batch.update(userRef, { updated });

    await batch.commit();

    return NextResponse.json(body, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error, message: `Error on Create List` }, { status: 500 });
  }
};