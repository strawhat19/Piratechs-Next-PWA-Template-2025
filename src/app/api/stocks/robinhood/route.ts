import { NextResponse } from 'next/server';

let robinhoodAuthorizationToken = process.env.ROBINHOOD_AUTHORIZATION_TOKEN;
let robinhoodMainAccountIDNumber = String(process.env.ROBINHOOD_MAIN_ACCOUNT_ID_NUMBER);

let robinhoodAccounts = { main: { id: robinhoodMainAccountIDNumber, }, traditional_IRA: { id: ``, } }
let robinhoodAccount = robinhoodAccounts?.main;

let robinhoodEndpoints = {
    positions: (robinhood_account_id_number: number | string = robinhoodAccount?.id) => `https://api.robinhood.com/positions/?account_number=${robinhood_account_id_number}&nonzero=true`,
}

export const GET = async () => {
  try {
    let robinhood: any = { id: robinhoodAccount?.id, stocks: { positions: [] } };
    let robinhoodAPIResponse = await fetch(robinhoodEndpoints?.positions(), {
        method: `GET`,
        headers: {
            [`Content-Type`]: `application/json`,
            Authorization: `Bearer ${robinhoodAuthorizationToken}`,
        }
    });
    if (robinhoodAPIResponse) {
      let robinhoodAPIResult = await robinhoodAPIResponse?.json();
      if (robinhoodAPIResult) {
        robinhood.stocks.positions = robinhoodAPIResult?.results;
        return NextResponse.json(robinhood);
      }
    }
  } catch (error) {
    return NextResponse.json({ error: `Robinhood` }, { status: 500 });
  }
};