import { NextResponse } from 'next/server';
import { arrayRemove, arrayUnion, doc, writeBatch } from 'firebase/firestore';
import { boardConverter, db, Tables, userConverter } from '@/shared/server/firebase';

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

export const POST = async (req: Request) => {
  try {
    tokenRequired(req);

    const body = await req.json();
    const { id, userID, updated, props } = body || {};

    if (!id || !userID || !updated || !props) {
      return NextResponse.json(
        { 
            code: 400,
            error: `Invalid Request Body`,
            expectedFormat: {
                props: 1,
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
      properties: props + 1,
      boardIDs: arrayUnion(id),
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
    const { id, userID, updated, props, selectedID } = body || {};

    if (!id || !userID || !updated || isNaN(props) || typeof selectedID != `string`) {
      return NextResponse.json(
        {
          code: 400,
          error: 'Invalid Request Body',
          expectedFormat: {
            props: 15,
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

    batch.delete(boardRef);

    const userUpdates: Record<string, any> = {
      updated,
      selectedID,
      boardIDs: arrayRemove(id),
      properties: Math.max(0, props - 1),
    };

    batch.update(userRef, userUpdates);

    await batch.commit();

    return NextResponse.json(
      { ok: true, removedBoardId: id, userID, updated, selectedID: userUpdates.selectedID },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: String(error?.message || error), message: 'Error on Delete Board' },
      { status: 500 }
    );
  }
};