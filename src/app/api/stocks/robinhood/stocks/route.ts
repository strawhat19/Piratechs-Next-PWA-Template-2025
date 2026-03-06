import { NextResponse } from 'next/server';
import { getStocksFromSymbols } from '../route';

const untrackedSymbols = [ `MSTR`, `MIELY`, `ABNB`, `ABSI`, `ABT`, `ADSK`, `AMC`, `AMCX`, `AMKBY`, `ANF`, `APP`, `ATLN`, `AUID`, `AVAX`, `AVD`, `AVGO`, `BATRK`, `BB`, `BBWI`, `BBY`, `BCH`, `BGL`, `BIIB`, `BMY`, `BOE`, `BRK.A`, `BRK.B`, `BROS`, `BRR`, `BTG`, `CCEP`, `CDXS`, `CISO`, `CL`, `CMCSA`, `CMG`, `CNXC`, `COKE`, `COMP`, `CRVO`, `CRWD`, `CTM`, `CYN`, `DG`, `DGNX`, `DJT`, `DNA`, `DOGE`, `EQX`, `FGL`, `FUN`, `GLOB`, `GME`, `GNLN`, `GRPN`, `GRRR`, `H`, `HAL`, `HTCO`, `HUHU`, `IBO`, `ICON`, `IRT`, `JHX`, `KDP`, `KHC`, `KR`, `LLY`, `LOW`, `LYFT`, `M`, `MARA`, `MCD`, `MDLZ`, `NAKA`, `NAMM`, `NGG`, `NSRGY`, `NU`, `NVO`, `ORKLY`, `ORLY`, `PEPE`, `PHUN`, `PLNT`, `QBTS`, `QS`, `QSR`, `RCT`, `S`, `SHEL`, `SHIB`, `SMCI`, `SPCE`, `STRA`, `TEAM`, `TMC`, `TOI`, `TRIP`, `UAA`, `UCAR`, `UNP`, `UPS`, `VIA`, `VLRS`, `VOYG`, `VSNT`, `W`, `WDFC`, `WEN`, `WING`, `XELB` ];

export const GET = async (req: Request) => {
let stocks: any[] = [];
  try {
    stocks = await getStocksFromSymbols(untrackedSymbols);
    return NextResponse.json(stocks);
  } catch (error) {
    return NextResponse.json({ error: `Robinhood` }, { status: 500 });
  }
}
