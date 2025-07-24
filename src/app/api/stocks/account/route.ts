import { NextResponse } from 'next/server';
import Alpaca from '@alpacahq/alpaca-trade-api';

const alpaca = new Alpaca({
  paper: true,
  keyId: process.env.ALPACA_KEY_ID,
  secretKey: process.env.ALPACA_SECRET_KEY,
})

export const GET = async () => {
  try {
    const account = await alpaca.getAccount();
    return NextResponse.json(account);
  } catch (error) {
    return NextResponse.json({ error: `Failed to Get Account ` }, { status: 500 });
  }
};