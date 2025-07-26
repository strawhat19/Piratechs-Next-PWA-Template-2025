import { NextResponse } from 'next/server';
import { sampleStocks } from '@/shared/server/database/samples/stocks/stocks';

export const GET = async () => {
  try {
    return NextResponse.json(sampleStocks);
  } catch (error) {
    return NextResponse.json({ error: `Failed to Get Stocks` }, { status: 500 });
  }
};