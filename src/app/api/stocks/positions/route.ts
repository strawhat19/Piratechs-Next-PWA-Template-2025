import { NextResponse } from 'next/server';
import Alpaca from '@alpacahq/alpaca-trade-api';
import { DataSources, StockAPIs } from '@/shared/types/types';

const alpaca = new Alpaca({
  paper: true,
  keyId: process.env.ALPACA_KEY_ID,
  secretKey: process.env.ALPACA_SECRET_KEY,
})

export const GET = async () => {
  try {
    const positions = await alpaca.getPositions();
    let modifiedPositions = positions?.length > 0 ? positions?.map((o: any) => ({ 
      ...o, 
      merged: [o],
      api: StockAPIs.Alpaca,
      dataSource: DataSources.api, 
    })) : [];
    return NextResponse.json(modifiedPositions);
  } catch (error) {
    return NextResponse.json({ error: `Failed to Get Positions` }, { status: 500 });
  }
};