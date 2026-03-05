import { NextResponse } from 'next/server';
import { popularStocks } from '@/shared/server/database/samples/stocks/stocks';

let apple_stock_id = `450dfc6d-5510-4d40-abfb-f633b7d9be3e`;

let robinhoodAuthorizationToken = process.env.ROBINHOOD_AUTHORIZATION_TOKEN;
let robinhoodMainAccountIDNumber = String(process.env.ROBINHOOD_MAIN_ACCOUNT_ID_NUMBER);
let robinhoodIRAAccountIDNumber = String(process.env.ROBINHOOD_TRADITIONAL_IRA_ACCOUNT_ID_NUMBER);

let robinhoodAccounts = { main: { id: robinhoodMainAccountIDNumber, type: `Individual` }, traditional_IRA: { id: robinhoodIRAAccountIDNumber, type: `Traditional IRA` } };
let robinhoodAccount = robinhoodAccounts?.main;

let robinhoodEndpoints = {
  orders: () => `https://api.robinhood.com/orders/`,
  symbol: (symbol: string) => `https://api.robinhood.com/marketdata/fundamentals/?symbols=${symbol}`,
  stocks: (symbols: string[]) => `https://api.robinhood.com/marketdata/fundamentals/?symbols=${symbols?.join(',')}`,
  stock: (stock_id: string = apple_stock_id) => `https://api.robinhood.com/marketdata/fundamentals/${stock_id}/?bounds=24_5&include_inactive=true`,
  accounts: () => `https://api.robinhood.com/accounts/?default_to_all_accounts=true&include_managed=true&include_multiple_individual=true&is_default=false`,
  portfolio: (robinhood_account_id_number: number | string = robinhoodAccount?.id) => `https://api.robinhood.com/portfolios/${robinhood_account_id_number}/`,
  unified: (robinhood_account_id_number: number | string = robinhoodAccount?.id) => `https://bonfire.robinhood.com/accounts/${robinhood_account_id_number}/unified/`,
  positions: (robinhood_account_id_number: number | string = robinhoodAccount?.id) => `https://api.robinhood.com/positions/?account_number=${robinhood_account_id_number}&nonzero=true`,
  holdings: (robinhood_account_id_number: number | string = robinhoodAccount?.id) => `https://nummus.robinhood.com/holdings/?nonzero=true&rhs_account_number=${robinhood_account_id_number}`,
  account: (robinhood_account_id_number: number | string = robinhoodAccount?.id) => `https://api.robinhood.com/portfolios/v2/performance/summary?rhsAccountNumber=${robinhood_account_id_number}`,
}

export const getStocksFromSymbols = async (symbols: string[]): Promise<any[]> => {
  let requests = (symbols || []).map(async (symbol: any) => {
    try {
      let res = await fetch(robinhoodEndpoints.symbol(symbol));
      if (!res.ok) return null;
      let stockRes = await res.json();
      let stock = { ...stockRes?.results[0], symbol, name: (popularStocks as any)[symbol] ?? symbol };
      return stock;
    } catch { return null; }
  });
  let results = await Promise.all(requests);
  let stocks = results.filter(Boolean);
  return stocks;
}

export const robinhoodFetch = async (endpoint: string) => await fetch(endpoint, { method: `GET`, headers: { [`Content-Type`]: `application/json`, Authorization: `Bearer ${robinhoodAuthorizationToken}`, } });

export const GET = async () => {
  try {
    let robinhood: any = { ...robinhoodAccount, stocks: [], positions: [], holdings: [], };
    let robinhoodAPIResponse = await robinhoodFetch(robinhoodEndpoints?.positions());
    if (robinhoodAPIResponse) {
      let robinhoodAPIResult = await robinhoodAPIResponse?.json();
      if (robinhoodAPIResult) {
        let stockPositions = robinhoodAPIResult?.results;
        robinhood.positions = stockPositions;
        let stock_symbols = Object.keys(popularStocks);
        robinhood.stocks = await getStocksFromSymbols(stock_symbols);
        let robinhoodAPIResponse_Account = await robinhoodFetch(robinhoodEndpoints?.account());
        let robinhoodAPIResponse_Holdings = await robinhoodFetch(robinhoodEndpoints?.holdings());
        if (robinhoodAPIResponse_Holdings) {
          let robinhoodAPIResult_Holdings = await robinhoodAPIResponse_Holdings?.json();
          if (robinhoodAPIResult_Holdings) {
            let holdings = robinhoodAPIResult_Holdings?.results;
            let mod_holdings = holdings?.map((h: any) => {
              let { id, account_id, cost_bases, currency, currency_pair_id: currency_id, quantity, tax_lot_cost_bases, created_at, updated_at } = h;
              let { id: crypto_id, code: symbol, type, name, increment, crypto_type: crypto } = currency;
              let taxes = tax_lot_cost_bases?.map((t: any) => ({ tax_id: t?.id, tax_quantity: t?.clearing_running_quantity, tax_cost: t?.clearing_book_cost_basis }));
              let costs = cost_bases?.map((c: any) => ({ cost_id: c?.id, cost_currency: c?.currency_id, cost_basis: c?.direct_cost_basis, cost_quantity: c?.direct_quantity }));
              let mod_holding = { id, account_id, currency_id, quantity, crypto_id, symbol, type, name, increment, crypto, created_at, updated_at, ...taxes[0], ...costs[0] };
              return mod_holding;
            });
            robinhood.holdings = mod_holdings;
          }
        }
        if (robinhoodAPIResponse_Account) {
          let robinhoodAPIResult_Account = await robinhoodAPIResponse_Account?.json();
          if (robinhoodAPIResult_Account) {
            let { displayCurrency: currency, marketValue } = robinhoodAPIResult_Account;
            let { depositAdjustedMarketValue: value, cash: buying_power, equityMarketValue: equity, forexMarketValue: forex, lastCorePortfolioEquity: portfolio, excessMaintenanceWithUnclearedDeposits: summary } = marketValue;
            robinhood = { ...robinhood, currency, value, buying_power, equity, forex, portfolio, summary };
          }
        }
        return NextResponse.json(robinhood);
      }
    }
  } catch (error) {
    return NextResponse.json({ error: `Robinhood` }, { status: 500 });
  }
};