import { NextResponse } from 'next/server';
import Alpaca from '@alpacahq/alpaca-trade-api';

const alpaca = new Alpaca({
  paper: true,
  keyId: process.env.ALPACA_KEY_ID,
  secretKey: process.env.ALPACA_SECRET_KEY,
})

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get(`status`) || `all`;
  const limit = Number(searchParams.get(`limit`) || 25);
  try {
    const orders = await alpaca.getOrders({
      limit,
      status,
      after: ``,
      until: ``,
      symbols: [],
      nested: false,
      direction: `desc`,
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: `Failed to Get Orders` }, { status: 500 });
  }
};