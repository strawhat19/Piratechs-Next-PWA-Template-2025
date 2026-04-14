import { NextResponse } from 'next/server';
import { getStocksFromSymbols } from '../route';
import { popularStocks, sampleStocks } from '@/shared/server/database/samples/stocks/stocks';

// let stockSymbols = [ ...new Set(sampleStocks?.map(s => s?.symbol)) ]?.sort();
let popularStockSymbols = [...Object.keys(popularStocks), `BRK.A`, `BRK.B`];
let uniquePopularStockSymbols = [ ...new Set(popularStockSymbols) ]?.filter(Boolean)?.sort();

export const GET = async (req: Request) => {
  let stocks: any[] = sampleStocks;
  let { searchParams } = new URL(req?.url);
  let token = searchParams?.get(`id`) ?? ``;
  let defaultSymbols = uniquePopularStockSymbols;
  let searchSymbol = searchParams?.get(`symbol`)?.toUpperCase();
  let searchSymbols = searchParams?.get(`symbols`)?.toUpperCase();
  let symbolstoUse: any = searchSymbol ? [searchSymbol] : (
    searchSymbols ? (
      (searchSymbols?.includes(`,`) ? searchSymbols?.split(`,`) : [searchSymbols])
    ) : defaultSymbols
  );
  if (symbolstoUse?.length == 0) symbolstoUse = defaultSymbols;
  if (token) {
    try {
      stocks = await getStocksFromSymbols(symbolstoUse, token);
      return NextResponse.json(stocks);
    } catch (error) {
      return NextResponse.json({ error: `Robinhood` }, { status: 500 });
    }
  } else return NextResponse.json({ error: `Robinhood Provide Token`, success: false, code: 500, token: `id?=` }, { status: 500 });
}
