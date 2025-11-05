import { NextResponse } from 'next/server';
import { getIDParts, tokenRequired } from '@/shared/scripts/constants';
import { arrayRemove, arrayUnion, collection, doc, getDocs, increment, query, where, writeBatch } from 'firebase/firestore';
import { boardConverter, db, itemConverter, listConverter, Tables, taskConverter, userConverter } from '@/shared/server/firebase';

export const runtime = `nodejs`;
export const dynamic = `force-dynamic`;

export const POST = async (req: Request) => {
  try {
    tokenRequired(req);

    const body = await req.json();
    const { id, userID, boardIDs, listIDs, updated } = body || {};

    if (!id || !userID || !updated || (!boardIDs || !Array.isArray(boardIDs)) || (!listIDs || !Array.isArray(listIDs))) {
      return NextResponse.json(
        { 
          code: 400,
          error: `Invalid Request Body`,
          expectedFormat: {
            updated: `2:55 PM 11/1/25`,
            id: `Item_1_Todos_2_55_PM_11_1_25_E4HEvN2vc`,
            userID: `User_1_Rakib1_11_36_PM_10_22_25_fjOQm4OD8`,
            listIDs: [`Board_1_Todos_2_55_PM_11_1_25_E4HEvN2vc`],
            boardIDs: [`Board_1_Todos_2_55_PM_11_1_25_E4HEvN2vc`],
          }
        },
        { status: 400 }
      );
    }

    const batch = writeBatch(db);

    const itemRef = doc(db, Tables.items, id).withConverter(itemConverter as any);
    const userRef  = doc(db, Tables.users, userID).withConverter(userConverter as any);
    const listRef = doc(db, Tables.lists, listIDs[0]).withConverter(listConverter as any);
    const boardRef = doc(db, Tables.boards, boardIDs[0]).withConverter(boardConverter as any);

    batch.set(itemRef, body, { merge: true });
    batch.update(listRef, {
      updated,
      itemIDs: arrayUnion(id),
      properties: increment(1),
    });
    batch.update(boardRef, { updated });
    batch.update(userRef, { updated });

    await batch.commit();

    return NextResponse.json(body, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error, message: `Error on Create Item` }, { status: 500 });
  }
};

export const DELETE = async (req: Request) => {
  try {
    tokenRequired(req);

    const body = await req.json();
    const { id, listID } = body || {};

    if (!id || typeof listID != `string`) {
      return NextResponse.json(
        {
          code: 400,
          error: `Invalid Request Body`,
          expectedFormat: {
            id: `Item_1_Todos_2_55_PM_11_1_25_XXXX`,
            listID: `List_1_Todos_2_55_PM_11_1_25_XXXX`,
          },
        },
        { status: 400 }
      );
    }

    const batch = writeBatch(db);

    const { date: updated } = getIDParts();

    const itemRef = doc(db, Tables.items, String(id)).withConverter(itemConverter as any);
    const listRef  = doc(db, Tables.lists, String(listID)).withConverter(listConverter as any);

    const tasksDB = collection(db, Tables.tasks).withConverter(taskConverter as any);
    const tasksQuery = query(tasksDB, where(`itemID`, `==`, id));
    const tasksSnapshot = await getDocs(tasksQuery);
    for (const taskDoc of tasksSnapshot.docs) {
      const taskRef = doc(db, Tables.tasks, taskDoc?.id);
      batch.delete(taskRef);
    }

    batch.update(listRef, {
      updated,
      itemIDs: arrayRemove(id),
      properties: increment(-1),
    });

    batch.delete(itemRef);

    await batch.commit();

    return NextResponse.json(
      { ok: true, id, updated, listID },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: String(error?.message || error), message: `Error on Delete Item` },
      { status: 500 }
    );
  }
};