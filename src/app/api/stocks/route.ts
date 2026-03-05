import { NextResponse } from 'next/server';
import { popularStocks } from '@/shared/server/database/samples/stocks/stocks';

const fmpAPIKey = process.env.FINANCIAL_MODELING_PREP_KEY;

const popularStockSymbols = [...Object.keys(popularStocks), `BRK.A`, `BRK.B`];
const uniquePopularStockSymbols = [ ...new Set(popularStockSymbols) ];

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

export const getStocks = async (symbols: string[] = uniquePopularStockSymbols): Promise<any[]> => {
  let requests = (symbols || []).map(async (symbol: any) => {
    try {
      let [profileRes, quoteRes] = await Promise.all([ fetch(fmpRoutes.company.profileData(symbol), { cache: `no-store` }), fetch(fmpRoutes.symbols.symbolQuote(symbol), { cache: `no-store` })]);
      if (!profileRes.ok || !quoteRes.ok) return null;
      let [profileJson, quoteJson] = await Promise.all([ profileRes.json(), quoteRes.json() ]);
      let profile = Array.isArray(profileJson) ? profileJson[0] : profileJson;
      let quote = Array.isArray(quoteJson) ? quoteJson[0] : quoteJson;
      let stock = { ...profile, ...quote };
      return stock;
    } catch { return null; }
  });
  let results = await Promise.all(requests);
  let stocks = results.filter(Boolean);
  return stocks;
}

export const GET = async () => {
  try {
    let stocks = await getStocks();
    return NextResponse.json(stocks);
  } catch (error) {
    return NextResponse.json({ error, ok: false, status: `Error`, message: `Failed to Get Stocks` }, { status: 500 });
  }
};

// Legacy
// if (Array.isArray(fmpAPIStocksResult)) {
//   fmpAPIStocksResult = fmpAPIStocksResult?.map((stock, stockIndex) => {
//     let { 
//       range,
//       symbol, 
//       website, 
//       volAvg: volume, 
//       companyName: name, 
//       lastDiv: lastDividend, 
//       exchangeShortName: exchange, 
//       fullTimeEmployees: employees, 
//     } = stock;
//     delete stock.website;
//     let cleanedStock = { ...stock, name, exchange, employees, volume, lastDividend };
//     let [low, high] = range?.split(`-`);
//     let updatedStock = { 
//       ...cleanedStock, 
//       id: symbol, 
//       label: name, 
//       value: symbol,
//       type: Types.Stock,
//       low: parseFloat(low), 
//       high: parseFloat(high),
//       number: stockIndex + 1,
//       ...(website && website != `` && { website }), 
//     };
//     return updatedStock;
//   });
//   if (fmpAPIStocksResult[0]?.symbol) {
//     fmpAPIStocksResult.sort((a: any, b: any) => a?.symbol?.localeCompare(b?.symbol));
//   } else if (fmpAPIStocksResult[0]?.companyName) {
//     fmpAPIStocksResult.sort((a: any, b: any) => a?.companyName?.localeCompare(b?.companyName));
//   }
// }