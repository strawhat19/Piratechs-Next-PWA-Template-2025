import { NextResponse } from 'next/server';
import { popularStocks } from '@/shared/server/database/samples/stocks/stocks';

const fmpAPIKey = process.env.FINANCIAL_MODELING_PREP_KEY;

const popularStockSymbols = Object.keys(popularStocks);

const fmpRoutes = {
    stocks: () => fmpRoutes.popularStocks(),
    allStocks: (limit: number = 25) => `https://financialmodelingprep.com/api/v3/stock/list?limit=${limit}&apikey=${fmpAPIKey}`,
    totalStocks: (limit: number = 25) => `https://financialmodelingprep.com/api/v3/available-traded/list?limit=${limit}&apikey=${fmpAPIKey}`,
    listStocks: (limit: number = 25, exchange = `NASDAQ`) => `https://financialmodelingprep.com/api/v3/stock-screener?limit=${limit}&exchange=${exchange}&apikey=${fmpAPIKey}`,
    popularStocks: (symbolsJoinedString: string = popularStockSymbols.join(`,`)) => `https://financialmodelingprep.com/api/v3/profile/${symbolsJoinedString}?apikey=${fmpAPIKey}`,
}

export const GET = async () => {
  try {
    const fmpAPIStocksResponse = await fetch(fmpRoutes.stocks());
    if (fmpAPIStocksResponse) {
      const fmpAPIStocksResult = await fmpAPIStocksResponse?.json();
      if (fmpAPIStocksResult) {
        return NextResponse.json(fmpAPIStocksResult);
      }
    }
  } catch (error) {
    return NextResponse.json({ ok: false, status: `Error`, error: `Failed to Get Stocks` }, { status: 500 });
  }
};