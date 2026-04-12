import { NextResponse } from 'next/server';
import { getStocksFromSymbols } from '../route';
import { sampleStocks } from '@/shared/server/database/samples/stocks/stocks';

let stockSymbols = [ ...new Set(sampleStocks?.map(s => s?.symbol)) ]?.sort();

export const GET = async (req: Request) => {
  let stocks: any[] = sampleStocks;
  let { searchParams } = new URL(req?.url);
  let token = searchParams?.get(`id`) ?? ``;
  let searchSymbol = searchParams?.get(`symbol`)?.toUpperCase();
  let searchSymbols = searchParams?.get(`symbols`)?.toUpperCase();
  let symbolstoUse: any = searchSymbol ? [searchSymbol] : (
    searchSymbols ? (
      (searchSymbols?.includes(`,`) ? searchSymbols?.split(`,`) : [searchSymbols])
    ) : stockSymbols
  );
  if (symbolstoUse?.length == 0) symbolstoUse = stockSymbols;
  if (token) {
    try {
      stocks = await getStocksFromSymbols(symbolstoUse, token);
      return NextResponse.json(stocks);
    } catch (error) {
      return NextResponse.json({ error: `Robinhood` }, { status: 500 });
    }
  } else return NextResponse.json({ error: `Robinhood Provide Token`, success: false, code: 500, token: `id?=` }, { status: 500 });
}
