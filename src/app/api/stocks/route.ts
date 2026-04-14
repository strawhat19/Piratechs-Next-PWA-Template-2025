import { NextResponse } from 'next/server';
import { DataSources, StockAPIs } from '@/shared/types/types';
import { popularStocks, sampleStocks } from '@/shared/server/database/samples/stocks/stocks';

const fmpAPIKey = process.env.FINANCIAL_MODELING_PREP_KEY;

const popularStockSymbols = [...Object.keys(popularStocks), `BRK.A`, `BRK.B`];
const uniquePopularStockSymbols = [ ...new Set(popularStockSymbols) ]?.filter(Boolean)?.sort();

const fmpRoutes = {
  company: {
    profileBulk: () => `https://financialmodelingprep.com/stable/profile-bulk?part=0&apikey=${fmpAPIKey}`,
    profileData: (symbol: string = `AAPL`) => `https://financialmodelingprep.com/stable/profile?symbol=${symbol}&apikey=${fmpAPIKey}`,
    profileSymbols: (symbols: string[] = uniquePopularStockSymbols) => `https://financialmodelingprep.com/stable/profile?symbol=${encodeURIComponent(symbols?.join(`,`))}&apikey=${fmpAPIKey}`,
  },
  symbols: {
    symbolQuote: (symbol: string = `AAPL`) => `https://financialmodelingprep.com/stable/quote?symbol=${symbol}&apikey=${fmpAPIKey}`,
    symbolsSearch: (symbol: string = `AAPL`) => `https://financialmodelingprep.com/stable/search-symbol?query=${symbol}&apikey=${fmpAPIKey}`,
    symbolsQuotes: (symbols: string[] = uniquePopularStockSymbols) => `https://financialmodelingprep.com/stable/batch-quote?symbols=${encodeURIComponent(symbols?.join(`,`))}&apikey=${fmpAPIKey}`,
  },
  legacy: {
    symbolsQuote: (symbol: string = `AAPL`) => `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${fmpAPIKey}`,
    allStocks: (limit: number = 25) => `https://financialmodelingprep.com/api/v3/stock/list?limit=${limit}&apikey=${fmpAPIKey}`,
    totalStocks: (limit: number = 25) => `https://financialmodelingprep.com/api/v3/available-traded/list?limit=${limit}&apikey=${fmpAPIKey}`,
    listStocks: (limit: number = 25, exchange = `NASDAQ`) => `https://financialmodelingprep.com/api/v3/stock-screener?limit=${limit}&exchange=${exchange}&apikey=${fmpAPIKey}`,
    popularStocks: (symbols: string[] = uniquePopularStockSymbols) => `https://financialmodelingprep.com/api/v3/profile/${encodeURIComponent(symbols?.join(`,`))}?apikey=${fmpAPIKey}`,
  },
}

export const getStocks = async (getRealStocks = false, symbols: string[] = uniquePopularStockSymbols): Promise<any[]> => {
  let stocksFromAPI = [];
  if (getRealStocks) {
    let requests = (symbols || []).map(async (symbol: any) => {
      try {
        let [profileRes, quoteRes] = await Promise.all([ fetch(fmpRoutes.company.profileData(symbol), { cache: `no-store` }), fetch(fmpRoutes.symbols.symbolQuote(symbol), { cache: `no-store` })]);
        if (!profileRes.ok || !quoteRes.ok) return null;
        let [profileJson, quoteJson] = await Promise.all([ profileRes.json(), quoteRes.json() ]);
        let profile = Array.isArray(profileJson) ? profileJson[0] : profileJson;
        let quote = Array.isArray(quoteJson) ? quoteJson[0] : quoteJson;
        let stock = { ...profile, ...quote, dataSource: DataSources.api, api: StockAPIs.Alpaca };
        return stock;
      } catch { return null; }
    });
    let results = await Promise.all(requests);
    stocksFromAPI = results.filter(Boolean);
  }
  let stocks = stocksFromAPI?.length > 0 ? stocksFromAPI : sampleStocks;
  return stocks;
}

export const GET = async (req: Request) => {
  try {
    // let token = tokenRequired(req, false);
    // if (!token) return NextResponse.json({ ok: false, status: `Error`, message: `Missing Authorization Token` }, { status: 401 });
    let stocks = await getStocks();
    return NextResponse.json(stocks);
  } catch (error) {
    return NextResponse.json({ error, ok: false, status: `Error`, message: `Failed to Get Stocks` }, { status: 500 });
  }
};