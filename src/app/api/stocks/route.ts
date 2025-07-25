import { NextResponse } from 'next/server';

export const GET = async () => {
  try {
    const limit = 100;
    const fmpAPIKey = process.env.FINANCIAL_MODELING_PREP_KEY;
    const fmpAPIStocksURL = `https://financialmodelingprep.com/api/v3/available-traded/list?limit=${limit}&apikey=${fmpAPIKey}`;

    const fmpAPIStocksResponse = await fetch(fmpAPIStocksURL);
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