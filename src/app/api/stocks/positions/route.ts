import { NextResponse } from 'next/server';
import Alpaca from '@alpacahq/alpaca-trade-api';
import { Position } from '@/shared/types/models/stocks/Position';
import { DataSources, RobinhoodAccountTypes, StockAPIs, Types } from '@/shared/types/types';

const alpaca = new Alpaca({
  paper: true,
  keyId: process.env.ALPACA_KEY_ID,
  secretKey: process.env.ALPACA_SECRET_KEY,
})

export const GET = async () => {
  try {
    const positions = await alpaca.getPositions();
    let modifiedPositions = positions?.length > 0 ? positions?.map((o: any) => {
      let modPos = new Position({ ...o,  merged: [], forceUpdate: false, type: Types.AlpacaStockPosition, api: StockAPIs.Alpaca, account_type: RobinhoodAccountTypes.alpaca, dataSource: DataSources.api, });
      let copy = new Position({ ...modPos, forceUpdate: false, type: Types.AlpacaStockPosition, api: StockAPIs.Alpaca, account_type: RobinhoodAccountTypes.alpaca, dataSource: DataSources.api });
      modPos.merged = [copy];
      return modPos;
    })?.sort((a: any, b: any) => b?.totalProfitLoss - a?.totalProfitLoss) : [];
    return NextResponse.json(modifiedPositions);
  } catch (error) {
    return NextResponse.json({ error: `Failed to Get Positions` }, { status: 500 });
  }
};