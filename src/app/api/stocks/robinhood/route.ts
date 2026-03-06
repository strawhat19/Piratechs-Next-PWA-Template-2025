import { NextResponse } from 'next/server';
import { popularStocks } from '@/shared/server/database/samples/stocks/stocks';

let apple_stock_id = `450dfc6d-5510-4d40-abfb-f633b7d9be3e`;

let robinhoodAuthorizationToken = process.env.ROBINHOOD_AUTHORIZATION_TOKEN;
let robinhoodMainAccountIDNumber = String(process.env.ROBINHOOD_MAIN_ACCOUNT_ID_NUMBER);
let robinhoodIRAAccountIDNumber = String(process.env.ROBINHOOD_TRADITIONAL_IRA_ACCOUNT_ID_NUMBER);

let robinhoodAccounts = { main: { id: robinhoodMainAccountIDNumber, type: `Individual` }, traditional_IRA: { id: robinhoodIRAAccountIDNumber, type: `Traditional IRA` } };
let robinhoodAccount = robinhoodAccounts?.main;

export const robinhoodFetch = async (endpoint: string) => await fetch(endpoint, { method: `GET`, headers: { [`Content-Type`]: `application/json`, Authorization: `Bearer ${robinhoodAuthorizationToken}`, } });

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

export const getAccountPerfomancesFromAccountIDs = async (account_ids: string[] | number[]): Promise<any[]> => {
  let requests = (account_ids || []).map(async (account_id: any) => {
    try {
      let res = await robinhoodFetch(robinhoodEndpoints.account(account_id));
      if (!res.ok) return null;
      let accountPerformance = {};
      let accountRes = await res.json();
      if (accountRes) {
        let { displayCurrency: currency, marketValue } = accountRes;
        let { depositAdjustedMarketValue: value, cash: buying_power, equityMarketValue: equity, forexMarketValue: forex, lastCorePortfolioEquity: portfolio, excessMaintenanceWithUnclearedDeposits: summary } = marketValue;
        accountPerformance = { id: account_id, currency, value, buying_power, equity, forex, portfolio, summary };
      }
      return accountPerformance;
    } catch { return null; }
  });
  let results = await Promise.all(requests);
  let accountPerformances = results.filter(Boolean);
  return accountPerformances;
}

export const getStocksFromSymbols = async (symbols: string[]): Promise<any[]> => {
  let requests = (symbols || []).map(async (symbol: any) => {
    try {
      let res = await robinhoodFetch(robinhoodEndpoints.symbol(symbol));
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

export const getPositions = async (account_id: string | number = robinhoodAccount?.id) => {
  let positionsRes = await robinhoodFetch(robinhoodEndpoints?.positions(account_id));
  if (positionsRes) {
    let positionsResl = await positionsRes?.json();
    if (positionsResl) {
      let stockPositions = positionsResl?.results;
      let positions = Array.isArray(stockPositions) ? stockPositions?.map(sp => ({ ...sp, account_id })) : [];
      return positions;
    }
  }
}

export const getHoldings = async (account_id: string | number = robinhoodAccount?.id) => {
  let holdingsRes = await robinhoodFetch(robinhoodEndpoints?.holdings(account_id));
  if (holdingsRes) {
    let holdingsResl = await holdingsRes?.json();
    if (holdingsResl) {
      let stockHoldings = holdingsResl?.results;
      let holdings = Array.isArray(stockHoldings) ? stockHoldings?.map(h => {
        let { id, account_id, cost_bases, currency, currency_pair_id: currency_id, quantity, tax_lot_cost_bases, created_at, updated_at } = h;
        let { id: crypto_id, code: symbol, type, name, increment, crypto_type: crypto } = currency;
        let taxes = tax_lot_cost_bases?.map((t: any) => ({ tax_id: t?.id, tax_quantity: t?.clearing_running_quantity, tax_cost: t?.clearing_book_cost_basis }));
        let costs = cost_bases?.map((c: any) => ({ cost_id: c?.id, cost_currency: c?.currency_id, cost_basis: c?.direct_cost_basis, cost_quantity: c?.direct_quantity }));
        let mod_holding = { id, account_id, currency_id, quantity, crypto_id, symbol, type, name, increment, crypto, created_at, updated_at, ...taxes[0], ...costs[0] };
        return mod_holding;
      }) : [];
      return holdings;
    }
  }
}

export const GET = async () => {
  try {
    let robinhood: any = {};

    let robinhoodAccountsRes = await robinhoodFetch(robinhoodEndpoints?.accounts());
     if (robinhoodAccountsRes) {
      let robinhoodAccountsJson = await robinhoodAccountsRes?.json();
      if (robinhoodAccountsJson) {
        let robinhoodAccountsResult = robinhoodAccountsJson?.results;
        let robinhoodAccountsArray = Array.isArray(robinhoodAccountsResult) ? robinhoodAccountsResult : [];
        let robinhoodAccounts = robinhoodAccountsArray?.length > 0 ? robinhoodAccountsArray?.map(rbacc => {
          let { url, cash, created_at, updated_at, brokerage_account_type: account_type, type, deactivated, buying_power, max_ach_early_access_amount: early_access_amount, account_number: id, cash_held_for_orders: orders_cash, margin_balances, option_level, state, locked, permanently_deactivated: deactivated_permanently, user_id, equity_trading_lock: lock_equity_trading, option_trading_lock: lock_option_trading, disable_adt, management_type, affiliate, car_valid_until: valid_at, nickname, ref_id, user_real_instant_limit: instant_limit, user_dynamic_instant_limit: dynamic_limit } = rbacc;
          let { overnight_ratio, day_trade_ratio = null, is_primary_account: primary = null, start_of_day_dtbp: start_of_day_buying_power = null, eligible_deposit_as_instant: instant_eligible_deposit = null, start_of_day_overnight_buying_power = null } = margin_balances ?? {};
          let rbAccount = { id, url, cash, created_at, updated_at, account_type, type, deactivated, buying_power, early_access_amount, orders_cash, option_level, state, locked, deactivated_permanently, user_id, lock_equity_trading, lock_option_trading, disable_adt, management_type, affiliate, valid_at, nickname, ref_id, instant_limit, dynamic_limit, overnight_ratio, day_trade_ratio, primary, start_of_day_buying_power, instant_eligible_deposit, start_of_day_overnight_buying_power };
          return rbAccount;
        }) : [];
        robinhood.accounts = robinhoodAccounts;
      }
    }

    if (robinhood?.accounts && robinhood?.accounts?.length > 0) {
      let account_ids = robinhood?.accounts?.map((acc: any) => String(acc?.id));
      let performances = await getAccountPerfomancesFromAccountIDs(account_ids);
      if (performances && Array.isArray(performances) && performances?.length > 0) {
        robinhood.accounts = await Promise.all(
          robinhood?.accounts?.map(async (acc: any) => {
            let holdings: any = [];
            let positions: any = [];
            let acc_perf = performances?.find(p => p?.id == acc?.id) ?? null;
            let mod_acc = acc_perf ? { ...acc, ...acc_perf, } : acc;
            try { positions = await getPositions(acc?.id); } catch (error) { positions = []; }
            try { holdings = await getHoldings(acc?.id); } catch (error) { holdings = []; }
            mod_acc = { ...mod_acc, positions, holdings };
            return mod_acc;
          })
        );
      }
    }

    return NextResponse.json(robinhood.accounts);
  } catch (error) {
    return NextResponse.json({ error: `Robinhood` }, { status: 500 });
  }
};