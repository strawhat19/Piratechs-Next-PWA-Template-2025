import { NextResponse } from 'next/server';
import { Stock } from '@/shared/types/models/stocks/Stock';
import { average as getAverage } from '@/shared/scripts/constants';
import { DataSources, RobinhoodAccountTypes, StockAPIs, Types } from '@/shared/types/types';
import { robinhoodAccountsDefault } from '@/shared/server/database/samples/stocks/robinhood/robinhood';
import { popularStocks, sampleStocksDB, stockImages } from '@/shared/server/database/samples/stocks/stocks';

let apple_stock_id = `450dfc6d-5510-4d40-abfb-f633b7d9be3e`;

let robinhoodMainAccountIDNumber = String(process.env.ROBINHOOD_MAIN_ACCOUNT_ID_NUMBER);
let robinhoodAuthorizationToken: string | any = process.env.ROBINHOOD_AUTHORIZATION_TOKEN;
let robinhoodIRAAccountIDNumber = String(process.env.ROBINHOOD_TRADITIONAL_IRA_ACCOUNT_ID_NUMBER);

let robinhoodAccounts = { main: { id: robinhoodMainAccountIDNumber, type: RobinhoodAccountTypes.individual }, traditional_IRA: { id: robinhoodIRAAccountIDNumber, type: RobinhoodAccountTypes.ira_traditional } };
let robinhoodAccount = robinhoodAccounts?.main;

export const robinhoodFetch = async (endpoint: string, token: string = robinhoodAuthorizationToken) => await fetch(endpoint, { method: `GET`, cache: `no-store`, headers: { [`Content-Type`]: `application/json`, Authorization: `Bearer ${token}`, } });
export const robinhoodFetchPost = async (endpoint: string, method = `POST`, body: any = {}) => await fetch(endpoint, { method, headers: { [`Accept`]: `application/json`, [`Content-Type`]: `application/json` , }, body });

export const loginPayload = {
  "device_token": "53fb8e23-8290-47b6-b24b-bc089b7734d1",
  "client_id": "c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS",
  "create_read_only_secondary_token": true,
  "expires_in": 86400,
  "grant_type": "password",
  "scope": "internal",
  "token_request_path": "/login?to=%2F",
  "username": "rakib987@gmail.com",
  "password": "usonofa678",
  "long_session": true,
  "request_id": "1147cbb0-f308-4fd4-b530-5c76b09ba0c4",
  "gr_key": "6Leq-w4qAAAAAEAT7gwYSJ21_sYIejmG73oR3fAO",
  "gr_token": "0cAFcWeA464jgR9uyLoMWCyXyvz6isn5MjgY2MRAVkNRc2EuHoXrmGVSSEnbz4X-9WyPtVi2aoRp3c1M9hgXJyclG06KTx14yHDYlb8QQUDliSQ2ATkbTjoOsUF-jz8vDE3bZtJvv7SeFIH0tSjEfBwjz1tDZ5sXDAXQmsYfv7MqL6rbuCrQy3hC-de1GKMLm8EL8cpwI0kxWdGmfjnCRm4ZVpqgYjRNRYdTT6dVERKpP-sGXWMbU2lAZwAnFfWbatziJUCzUE67mq25npXcbkhVhMqzylf_HI_5jJRTlrda9sLpbJMQ2MjPTmj06vhflLHKcs19rE81I5S4vUtQCRrMfU5QF2YfSQIRGx_XvEhrv-mDq7UKfyN1BU6ZEZVZ9PdsFoY0h-7VYSl9QDtrImktjV9CwGJhVYgNSVNEoQMtH5zK32BZrjLawabDLV0zOnwomTogO6miOQR3ql_N6TpBNqF7iev8tu_VnNowAcMPpaEdyy6mZaxUWMBbtxxriuMHmgjJhR55Lcbh704_EoWvBYmZe0E_h_gIU5_32x0hVxfYlE4XMQQS46Uu1BqI0HmVUp4GYl1P6mZ8FtW6OnUcjUSPY5AayIoNq_08We71gdP75lXnQRFFPhkIVFp1y13pNT9ltTPXmk3dPRoT2L7PxMxtGMZPg3CBPqu8mbLkMNlzf-cSXbB4hKr07s_6IjMNgnGsv4nSaGCzA2HvT6hiqL0eD9wrdeWiDFWSELkxqXrt1Ea8iDltyQxpO-HDvTaCBoiHIITPh61BQHUB-MDJ6wYUue8QOndNfacV8BYg_hMmtexvuyqjL8fMhfiVyctY1FQmeKrRvAvZhOT1TfNKyJDzsY5Ate4ekYJxaIUiNT-MWS3xQUvIbbhwXYPITxnSYXxld86j0xv1mRYxxjEmUFwMkYtudVZ176qz6Bmkn3WpgZ1m4-T_usuSOW_s3TYKqtW8VUf42dxnAZ4KgJlbqLUWAC58hDxEQor4i7yZZk_9WyaF3B2g9OxSV36Xw5cLDFzTkRdNGNVYQYqkbae5LtbelQNagoIZ9-cFpK7lvwbjQStKX7YN0rSxEcMLM9q7HPNpddmA7LCHqOmKEHxJqc8yqPOAYq0_AQ5o8SzvOL8aQ1nS3YwJiwGF-Vr31PX9xk5jEre2qYOgfK9Y800ziwM1_VdmJRIUKaJyDkjOcjxMTA_b_aXb9fcc9lyrso9Qqnq0Ls23YlwehNCMIrXLF1VRvqFuboyg6sNirY0ifT3uhl5uWvbLTANrkkt5F1sphqTMO3H3tAbMH-NZW9uWEzBqFFidA4eoKytqe_voNrSJVwsM5Zpt0gCBAdahxa02LNytlf3e-Bk_oH-aIh1JJDA5mJs0v4JLNHG_VY2Ir3ArFOQOap9pdKbDCOnekLAkApiWozU9fhkR8l4_4oRcm_BNleYIbW6Su5o4I9-4YmJyoJ8e866zW0_WcH7JyHK365TtPaWzhRNSQEeb1J5ScqMpy1qMJedIVuENLstg8JzBDVdh5NBWRSDDTlfh4Ja2KDoSGy_9L7krUvP00bR6wqk2yRq_zCC15csvVTr5Y2nj7vutY3Lwt2Rv1DWuhiQybXoTfI1m1z3oXFs0qGRTVkSZUcLqNsnW8zAbP-jJ40zyO7d433p6lIbAo-5-fM2gx_rtlv4CbS2wJrrrIc3fo_M6TkPRkHUVg3_89vPYgufzXtl13-qdNC15f_sUQCgvalmOTq9cbMLstljk_CwpUVBitujnMO8YrxvXv0MJSfCNHUU8169Ku2scpEZ0jtuO1N4G4eEHpPdmDmNOiNfFFiHLhBGs8HOep_noEFMiYmKhWiZrjISThaquyRvS3mez1Pvpm7vrO-Kk3zbC7y5bhTIE_KFJADH2iKk0FlR9r11mN72xmu2zpm10iT3gDs76AXfisIm-ChJnu_uy-sXKJuO4rsSL1X-DDscylanNwBbdM1IkwgAhYBPG7X6GWXQURJ9OOEkBmjnJ9_BQoeJ8ZNC7g2QiTj5WasoyOyPHkENX__Gz0FVhd8MdgakAksC9w7wMGmDrL_saB3t8bSpTxHMbRN8pOIe9a4rVuHuIIRtVYmEmpmnlCtJdQ_IsVPSlEiY6WP_HGifHheGHCAGOp2cMTVxA063EQmr7jgRKcB1Xbu4TdTDKHhjN1LXaz8V3-XpeCIJ7y21crNENxDjQNi7aMEuxxcew"
};

let robinhoodEndpoints = {
  user: () => `https://api.robinhood.com/user/`,
  orders: () => `https://api.robinhood.com/orders/`,
  login: () => `https://api.robinhood.com/oauth2/token/`,
  quote: (symbol: string) => `https://api.robinhood.com/quotes/${symbol}/`,
  user_profile: () => `https://bonfire.robinhood.com/social/user_profile/`,
  identity: () => `https://identi.robinhood.com/user_info/address/residential/`,
  symbol: (symbol: string) => `https://api.robinhood.com/marketdata/fundamentals/?symbols=${symbol}`,
  quotes: (stock_ids: string[]) => `https://api.robinhood.com/marketdata/quotes/?ids=${stock_ids?.join(`,`)}`,
  stocks: (symbols: string[]) => `https://api.robinhood.com/marketdata/fundamentals/?symbols=${symbols?.join(',')}`,
  forex: (stock_id: string = apple_stock_id) => `https://api.robinhood.com/marketdata/forex/fundamentals/${stock_id}/`,
  stock: (stock_id: string = apple_stock_id) => `https://api.robinhood.com/marketdata/fundamentals/${stock_id}/?include_inactive=true`,
  instruments: (stock_ids: string[]) => `https://api.robinhood.com/instruments/?active_instruments_only=false&ids=${stock_ids?.join(`,`)}`,
  accounts: () => `https://api.robinhood.com/accounts/?default_to_all_accounts=true&include_managed=true&include_multiple_individual=true&is_default=false`,
  portfolio: (robinhood_account_id_number: number | string = robinhoodAccount?.id) => `https://api.robinhood.com/portfolios/${robinhood_account_id_number}/`,
  unified: (robinhood_account_id_number: number | string = robinhoodAccount?.id) => `https://bonfire.robinhood.com/accounts/${robinhood_account_id_number}/unified/`,
  orders_account: (robinhood_account_id_number: number | string = robinhoodAccount?.id) => `https://api.robinhood.com/options/orders/?account_number=${robinhood_account_id_number}`,
  POST_ORDER: (payload: any = { instrument_id: `4fcaa359-857a-421c-b499-aac8b3fa94ea`, price: `93.02`, quantity: `14.9`, side: `sell` }) => `https://api.robinhood.com/orders/fees/`,
  positions: (robinhood_account_id_number: number | string = robinhoodAccount?.id) => `https://api.robinhood.com/positions/?account_number=${robinhood_account_id_number}&nonzero=true`,
  holdings: (robinhood_account_id_number: number | string = robinhoodAccount?.id) => `https://nummus.robinhood.com/holdings/?nonzero=true&rhs_account_number=${robinhood_account_id_number}`,
  account: (robinhood_account_id_number: number | string = robinhoodAccount?.id) => `https://api.robinhood.com/portfolios/v2/performance/summary?rhsAccountNumber=${robinhood_account_id_number}`,
  discovery_lists: () => `https://api.robinhood.com/discovery/lists/v2/9827ee00-30ef-422c-8c37-a3efaf995362/items/?owner_type=custom&fields=market_cap%2Csector%2Cpe_ratio%2Cupcoming_earnings%2Cupcoming_dividend_date%2Cupcoming_ex_dividend_date%2Cdividend_yield%2Caverage_volume_30_days%2Cmargin_initial_requirement%2Cmargin_maintenance_requirement%2Cshort_low_risk_maintenance_ratio`,
}

export const robinhoodLogin = async (token: string = robinhoodAuthorizationToken) => {
  let robinhoodToken = {};
  try {
    let loginRes = await robinhoodFetchPost(robinhoodEndpoints.login(), `POST`, JSON.stringify(loginPayload));
    if (loginRes) {
      let loginResJson = await loginRes.json();
      if (loginResJson) {
        robinhoodToken = loginResJson;
      }
    }
    return NextResponse.json(robinhoodToken);
  } catch (err) { 
    robinhoodToken = {}; 
    return NextResponse.json({ error: err, robinhoodToken, message: `Robinhood Login Error, Check Authorization Token` }, { status: 500 });
  }
}

export const getStocksFromSymbols = async (symbols: string[], token: string = robinhoodAuthorizationToken, useDBStocksDefault: boolean = false): Promise<any[]> => {
  let requests = (symbols || []).map(async (symbol: any) => {
    try {
      let dividend = 0;
      let quote: any = {};
      let instrument: any = {};
      let source = Types.RobinhoodStock;
      let [stockSymbolRes] = await Promise.all([ robinhoodFetch(robinhoodEndpoints.symbol(symbol), token) ]);
      if (!stockSymbolRes.ok) return null;
      let [stockSymbolResJson] = await Promise.all([ stockSymbolRes.json() ]);
      let stockFromSymbol = stockSymbolResJson?.results[0];
      let name = stockFromSymbol?.name ?? (popularStocks as any)[symbol] ?? symbol;
      let stock_id = stockFromSymbol?.instrument?.replaceAll(`https://api.robinhood.com/instruments/`, ``)?.replaceAll(`/`, ``);
      try {
        let quoteRes = await robinhoodFetch(robinhoodEndpoints.quotes([stock_id]), token);
        if (quoteRes) {
          let quoteResJson = await quoteRes.json();
          if (quoteResJson) {
            let quoteObj = quoteResJson?.results?.[0];
            if (quoteObj) {
              quote = {
                ...quoteObj,
                api: StockAPIs.Robinhood,
                dataSource: DataSources.api,
              };
            }
          }
        }
      } catch (err) { quote = {}; }
      try {
        let instrumentRes = await robinhoodFetch(robinhoodEndpoints.instruments([stock_id]), token);
        if (instrumentRes) {
          let instrumentResJson = await instrumentRes.json();
          if (instrumentResJson) {
            let instrumentObj = instrumentResJson?.results?.[0];
            if (instrumentObj) {
              instrument = {
                ...instrumentObj,
                api: StockAPIs.Robinhood,
                dataSource: DataSources.api,
              };
            }
          }
        }
      } catch (err) { instrument = {}; }
      let { ask_price: price, previous_close: previousClose, state: stock_quote_state, updated_at, last_trade_price: lastTradePrice, ask_size: size, last_extended_hours_trade_price: lastExtendedHoursTradePrice, last_non_reg_trade_price: lastNonRegTradePrice } = quote;
      let { country, list_date: ipoDate, account_type_tradabilities } = instrument;
      let { open, high, low, volume, average_volume: volAvg, high_52_weeks: yearHigh, float, low_52_weeks: yearLow, market_cap: marketCap, description, ceo, headquarters_city: city, headquarters_state: state, sector, industry, num_employees: employees, year_founded: founded, dividend_yield: divYield } = stockFromSymbol;
      let active = stock_quote_state == `active`;
      let paysDividends = divYield != null;
      if (paysDividends) dividend = Number(divYield);
      let account_type = account_type_tradabilities[0]?.account_type;
      account_type = (RobinhoodAccountTypes as any)[account_type as any] ?? account_type;
      low = Number(low);
      size = Number(size);
      open = Number(open);
      high = Number(high);
      price = Number(price);
      float = Number(float);
      volume = Number(volume);
      volAvg = Number(volAvg);
      yearLow = Number(yearLow);
      yearHigh = Number(yearHigh);
      marketCap = Number(marketCap);
      previousClose = Number(previousClose);
      lastTradePrice = Number(lastTradePrice);
      lastNonRegTradePrice = Number(lastNonRegTradePrice);
      lastExtendedHoursTradePrice = Number(lastExtendedHoursTradePrice);
      let website = `https://www.google.com/search?q=${symbol}`;
      let data = { ...instrument, ...quote, ...stockFromSymbol, api: StockAPIs.Robinhood, dataSource: DataSources.api };
      // let sources = { instrument, quote, stock: stockFromSymbol };
      let address = data?.address ?? `${city}, ${state}, ${country}`;
      let close = previousClose;
      // price = price > high ? lastTradePrice : price;
      // price = price > high ? getAverage([open, close, lastTradePrice]) : price;
      price = price > high ? getAverage([lastNonRegTradePrice, lastExtendedHoursTradePrice, lastTradePrice]) : price;
      let image = data?.image ?? (stockImages as any)[symbol] ?? `https://images.financialmodelingprep.com/symbol/${symbol}.png`;
      let logo = image;
      let url = website;
      let changes = open / close;
      let equity = price;
      let wentPublic = ipoDate;
      let change = price - previousClose;
      let changePercentage = parseFloat(((change / previousClose) * 100)?.toFixed(2));
      let stock = { address, symbol, name, id: symbol, stock_id, open, high, low, volume, volAvg, yearHigh, float, yearLow, marketCap, description, ceo, city, state, sector, industry, employees, founded, dividend, divYield, paysDividends, price, previousClose, active, updated_at, account_type, country, ipoDate, website, url, source, image, logo, close, changes, equity, wentPublic, lastTradePrice, size, lastNonRegTradePrice, lastExtendedHoursTradePrice, change, changePercentage, api: StockAPIs.Robinhood, dataSource: DataSources.api };
      return stock;
    } catch { return null; }
  });
  let results = await Promise.all(requests);
  let stocksFromAPI = results.filter(Boolean);
  let dataSourceStocks = sampleStocksDB?.map((s: any) => new Stock({ ...s, api: StockAPIs.Robinhood, dataSource: DataSources.database }));
  let stocks = stocksFromAPI?.length > 0 ? stocksFromAPI : (useDBStocksDefault ? dataSourceStocks : []);
  return stocks;
}

export const getAccountPerfomancesFromAccountIDs = async (account_ids: string[] | number[], token: string = robinhoodAuthorizationToken): Promise<any[]> => {
  let requests = (account_ids || []).map(async (account_id: any) => {
    try {
      let res = await robinhoodFetch(robinhoodEndpoints.account(account_id), token);
      if (!res.ok) return null;
      let accountPerformance = {};
      let accountRes = await res.json();
      if (accountRes) {
        let { displayCurrency: currency, marketValue } = accountRes;
        let { depositAdjustedMarketValue: value, cash: buying_power, equityMarketValue: equity, forexMarketValue: forex, lastCorePortfolioEquity: portfolio, excessMaintenanceWithUnclearedDeposits: summary } = marketValue;
        accountPerformance = { id: account_id, currency, value, buying_power, equity, forex, portfolio, summary, api: StockAPIs.Robinhood, dataSource: DataSources.api };
      }
      return accountPerformance;
    } catch { return null; }
  });
  let results = await Promise.all(requests);
  let accountPerformances = results.filter(Boolean);
  return accountPerformances;
}

export const getPositions = async (account: any = robinhoodAccount, token: string = robinhoodAuthorizationToken) => {
  let account_id = account?.id;
  let account_type = account?.account_type == `ira_traditional` ? RobinhoodAccountTypes.ira_traditional : RobinhoodAccountTypes.individual;
  let positionsRes = await robinhoodFetch(robinhoodEndpoints?.positions(account_id), token);
  if (positionsRes) {
    let positionsResl = await positionsRes?.json();
    if (positionsResl) {
      let stockPositions = positionsResl?.results;
      let positions = Array.isArray(stockPositions) && stockPositions?.length > 0 ? stockPositions?.map(sp => {
        let modifiedSP = { 
          ...sp, 
          account_id, 
          account_type,
          api: StockAPIs.Robinhood, 
          dataSource: DataSources.api, 
        };
        return modifiedSP;
      }) : [];
      return positions;
    }
  }
}

export const getHoldings = async (account_id: string | number = robinhoodAccount?.id, token: string = robinhoodAuthorizationToken) => {
  let holdingsRes = await robinhoodFetch(robinhoodEndpoints?.holdings(account_id), token);
  if (holdingsRes) {
    let holdingsResl = await holdingsRes?.json();
    if (holdingsResl) {
      let stockHoldings = holdingsResl?.results;
      let holdings = Array.isArray(stockHoldings) ? stockHoldings?.map(h => {
        let { id, account_id, cost_bases, currency, currency_pair_id: currency_id, quantity, tax_lot_cost_bases, created_at, updated_at } = h;
        let { id: crypto_id, code: symbol, type, name, increment, crypto_type: crypto } = currency;
        let taxes = tax_lot_cost_bases?.map((t: any) => ({ tax_id: t?.id, tax_quantity: t?.clearing_running_quantity, tax_cost: t?.clearing_book_cost_basis, api: StockAPIs.Robinhood, dataSource: DataSources.api }));
        let costs = cost_bases?.map((c: any) => ({ cost_id: c?.id, cost_currency: c?.currency_id, cost_basis: c?.direct_cost_basis, cost_quantity: c?.direct_quantity, api: StockAPIs.Robinhood, dataSource: DataSources.api }));
        let mod_holding = { id, account_id, currency_id, quantity, crypto_id, symbol, type, name, increment, crypto, created_at, updated_at, ...taxes[0], ...costs[0], api: StockAPIs.Robinhood, dataSource: DataSources.api, };
        return mod_holding;
      }) : [];
      return holdings;
    }
  }
}

export const GET = async (req: Request) => {
  let robinhood: any = {};
  let { searchParams } = new URL(req.url);
  let token = searchParams?.get(`id`) ?? ``;
  
  try {

    let robinhoodAccountsRes = await robinhoodFetch(robinhoodEndpoints?.accounts(), token);
     if (robinhoodAccountsRes) {
      let robinhoodAccountsJson = await robinhoodAccountsRes?.json();
      if (robinhoodAccountsJson) {
        let robinhoodAccountsResult = robinhoodAccountsJson?.results;
        let robinhoodAccountsArray = Array.isArray(robinhoodAccountsResult) ? robinhoodAccountsResult : [];
        let robinhoodAccounts = robinhoodAccountsArray?.length > 0 ? robinhoodAccountsArray?.map(rbacc => {
          let { url, cash, created_at, updated_at, brokerage_account_type: account_type, type, deactivated, buying_power, max_ach_early_access_amount: early_access_amount, account_number: id, cash_held_for_orders: orders_cash, margin_balances, option_level, state, locked, permanently_deactivated: deactivated_permanently, user_id, equity_trading_lock: lock_equity_trading, option_trading_lock: lock_option_trading, disable_adt, management_type, affiliate, car_valid_until: valid_at, nickname, ref_id, user_real_instant_limit: instant_limit, user_dynamic_instant_limit: dynamic_limit } = rbacc;
          let { overnight_ratio, day_trade_ratio = null, is_primary_account: primary = null, start_of_day_dtbp: start_of_day_buying_power = null, eligible_deposit_as_instant: instant_eligible_deposit = null, start_of_day_overnight_buying_power = null } = margin_balances ?? {};
          let rbAccount = { id, url, cash, created_at, updated_at, account_type, type, deactivated, buying_power, early_access_amount, orders_cash, option_level, state, locked, deactivated_permanently, user_id, lock_equity_trading, lock_option_trading, disable_adt, management_type, affiliate, valid_at, nickname, ref_id, instant_limit, dynamic_limit, overnight_ratio, day_trade_ratio, primary, start_of_day_buying_power, instant_eligible_deposit, start_of_day_overnight_buying_power, dataSource: DataSources.api, api: StockAPIs.Robinhood, };
          return rbAccount;
        }) : [];
        robinhood.accounts = robinhoodAccounts;
      }
    }

    if (robinhood?.accounts && robinhood?.accounts?.length > 0) {
      let account_ids = robinhood?.accounts?.map((acc: any) => String(acc?.id));
      let performances = await getAccountPerfomancesFromAccountIDs(account_ids, token);
      if (performances && Array.isArray(performances) && performances?.length > 0) {
        robinhood.accounts = await Promise.all(
          robinhood?.accounts?.map(async (acc: any) => {
            let holdings: any = [];
            let positions: any = [];
            let acc_perf = performances?.find(p => p?.id == acc?.id) ?? null;
            let mod_acc = acc_perf ? { ...acc, ...acc_perf, dataSource: DataSources.api, api: StockAPIs.Robinhood, } : acc;
            try { positions = await getPositions(acc, token); } catch (error) { positions = []; }
            if (acc?.account_type != `ira_traditional`) {
              try { holdings = await getHoldings(acc?.id, token); } catch (error) { holdings = []; }
            }
            mod_acc = { ...mod_acc, positions, holdings, dataSource: DataSources.api, api: StockAPIs.Robinhood, };
            return mod_acc;
          })
        );
      }
    }

    let robinhoodAccs = Array.isArray(robinhood?.accounts) && robinhood?.accounts?.length > 0 ? robinhood?.accounts : robinhoodAccountsDefault;

    return NextResponse.json(robinhoodAccs);
  } catch (error) {
    return NextResponse.json({ error, message: `Robinhood Error, Check Authorization Token` }, { status: 500 });
  }
};