import { NextResponse } from 'next/server';
import { getStocksFromSymbols } from '../route';
import { sampleStocks } from '@/shared/server/database/samples/stocks/stocks';

let stockSymbols = [ ...new Set(sampleStocks?.map(s => s?.symbol)) ]?.sort();

export const GET = async (req: Request) => {
let stocks: any[] = sampleStocks;
  try {
    stocks = await getStocksFromSymbols(stockSymbols);
    return NextResponse.json(stocks);
  } catch (error) {
    return NextResponse.json({ error: `Robinhood` }, { status: 500 });
  }
}
