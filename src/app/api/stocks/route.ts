import { NextResponse } from 'next/server';
import { popularStocks } from '@/shared/server/database/samples/stocks/stocks';

// const fmpAPIKey = process.env.FINANCIAL_MODELING_PREP_KEY;
const fmpAPIKey = process.env.FINANCIAL_MODELING_PREP_KEY_OFFICIAL;

const popularStockSymbols = [...Object.keys(popularStocks), `BRK.A`, `BRK.B`];
const popularStockSymbolsJoined = popularStockSymbols.join(`,`);

const fmpRoutes = {
  stocks: () => fmpRoutes?.company?.profileData(),
  defaultLegacy: () => fmpRoutes?.legacy?.popularStocks(),
  company: {
    profileBulk: () => `https://financialmodelingprep.com/stable/profile-bulk?part=0&apikey=${fmpAPIKey}`,
    profileData: (symbolsJoinedString: string = popularStockSymbolsJoined) => `https://financialmodelingprep.com/stable/profile?symbol=AAPL&apikey=${fmpAPIKey}`,
  },
  new: {
    symbols: (symbolsJoinedString: string = popularStockSymbolsJoined) => `https://financialmodelingprep.com/stable/search-symbol?query=AAPL&apikey=${fmpAPIKey}`,
  },
  legacy: {
    allStocks: (limit: number = 25) => `https://financialmodelingprep.com/api/v3/stock/list?limit=${limit}&apikey=${fmpAPIKey}`,
    totalStocks: (limit: number = 25) => `https://financialmodelingprep.com/api/v3/available-traded/list?limit=${limit}&apikey=${fmpAPIKey}`,
    symbolsQuote: (symbolsJoinedString: string = popularStockSymbolsJoined) => `https://financialmodelingprep.com/api/v3/quote/AAPL?apikey=${fmpAPIKey}`,
    listStocks: (limit: number = 25, exchange = `NASDAQ`) => `https://financialmodelingprep.com/api/v3/stock-screener?limit=${limit}&exchange=${exchange}&apikey=${fmpAPIKey}`,
    popularStocks: (symbolsJoinedString: string = popularStockSymbolsJoined) => `https://financialmodelingprep.com/api/v3/profile/${symbolsJoinedString}?apikey=${fmpAPIKey}`,
  },
}

export const GET = async () => {
  try {
    const fmpAPIStocksResponse = await fetch(fmpRoutes.stocks());
    if (fmpAPIStocksResponse) {
      let fmpAPIStocksResult = await fmpAPIStocksResponse?.json();
      if (fmpAPIStocksResult) {
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
        return NextResponse.json(fmpAPIStocksResult);
      }
    }
  } catch (error) {
    return NextResponse.json({ ok: false, status: `Error`, error: `Failed to Get Stocks` }, { status: 500 });
  }
};