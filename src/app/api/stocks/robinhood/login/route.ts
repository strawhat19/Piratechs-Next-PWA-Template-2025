import { robinhoodLogin } from '../route';
import { NextResponse } from 'next/server';

export const GET = async (req: Request) => {
  try {
      return await robinhoodLogin();
    } catch (error) {
      return NextResponse.json({ error: `Error on Login Robinhood` }, { status: 500 });
    }
}

export const POST = async (req: Request) => {
  try {
      const body = await req.json();
      if (!body?.username || !body?.password) {
        return NextResponse.json({ error: `Invalid Format` }, { status: 400 });
      }
      let token = robinhoodLogin();
      return NextResponse.json({ ...body, token }, { status: 201 });
    } catch (error) {
      return NextResponse.json({ error: `Error on Login Robinhood Post` }, { status: 500 });
    }
}