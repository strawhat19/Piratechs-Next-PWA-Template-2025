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
  user: () => `https://api.robinhood.com/user/`,
  orders: () => `https://api.robinhood.com/orders/`,
  user_profile: () => `https://bonfire.robinhood.com/social/user_profile/`,
  identity: () => `https://identi.robinhood.com/user_info/address/residential/`,
  symbol: (symbol: string) => `https://api.robinhood.com/marketdata/fundamentals/?symbols=${symbol}`,
  quotes: (stock_ids: string[]) => `https://api.robinhood.com/marketdata/quotes/?bounds=24_5&ids=${stock_ids}`,
  stocks: (symbols: string[]) => `https://api.robinhood.com/marketdata/fundamentals/?symbols=${symbols?.join(',')}`,
  forex: (stock_id: string = apple_stock_id) => `https://api.robinhood.com/marketdata/forex/fundamentals/${stock_id}/`,
  instruments: (stock_ids: string[]) => `https://api.robinhood.com/instruments/?active_instruments_only=false&ids=${stock_ids?.join(`,`)}`,
  stock_unbound: (stock_id: string = apple_stock_id) => `https://api.robinhood.com/marketdata/fundamentals/${stock_id}/?include_inactive=true`,
  stock: (stock_id: string = apple_stock_id) => `https://api.robinhood.com/marketdata/fundamentals/${stock_id}/?bounds=24_5&include_inactive=true`,
  accounts: () => `https://api.robinhood.com/accounts/?default_to_all_accounts=true&include_managed=true&include_multiple_individual=true&is_default=false`,
  portfolio: (robinhood_account_id_number: number | string = robinhoodAccount?.id) => `https://api.robinhood.com/portfolios/${robinhood_account_id_number}/`,
  unified: (robinhood_account_id_number: number | string = robinhoodAccount?.id) => `https://bonfire.robinhood.com/accounts/${robinhood_account_id_number}/unified/`,
  orders_account: (robinhood_account_id_number: number | string = robinhoodAccount?.id) => `https://api.robinhood.com/options/orders/?account_number=${robinhood_account_id_number}`,
  positions: (robinhood_account_id_number: number | string = robinhoodAccount?.id) => `https://api.robinhood.com/positions/?account_number=${robinhood_account_id_number}&nonzero=true`,
  holdings: (robinhood_account_id_number: number | string = robinhoodAccount?.id) => `https://nummus.robinhood.com/holdings/?nonzero=true&rhs_account_number=${robinhood_account_id_number}`,
  account: (robinhood_account_id_number: number | string = robinhoodAccount?.id) => `https://api.robinhood.com/portfolios/v2/performance/summary?rhsAccountNumber=${robinhood_account_id_number}`,
  discovery_lists: () => `https://api.robinhood.com/discovery/lists/v2/9827ee00-30ef-422c-8c37-a3efaf995362/items/?owner_type=custom&fields=market_cap%2Csector%2Cpe_ratio%2Cupcoming_earnings%2Cupcoming_dividend_date%2Cupcoming_ex_dividend_date%2Cdividend_yield%2Caverage_volume_30_days%2Cmargin_initial_requirement%2Cmargin_maintenance_requirement%2Cshort_low_risk_maintenance_ratio`,
  POST_ORDER: (payload: any = {
    "instrument_id": "4fcaa359-857a-421c-b499-aac8b3fa94ea",
    "price": "93.02",
    "quantity": "14.9",
    "side": "sell"
}) => `https://api.robinhood.com/orders/fees/`,
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