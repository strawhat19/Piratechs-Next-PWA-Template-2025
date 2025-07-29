import { Types } from '../types';
import { appleCompanyDescription } from '@/shared/server/database/samples/stocks/stocks';

// changes = 0,
// zip = 95014,
// state = `CA`, 
// country = `US`,
// children = null,
// symbol = `AAPL`, 
// linkable = true,
// currency = `USD`,
// price = 99999.99, 
// low = price,
// high = price,
// volume = 53248283,
// employees = 164000,
// exchange = `NASDAQ`,
// name = `Apple Inc.`,
// lastDividend = 1.01,
// sector = `Technology`,
// range = `169.21-260.1`,
// IPODate = `1980-12-12`,
// ceo = `Timothy D. Cook`,
// showCompanyName = true,
// phone = `(408) 996-1010`,
// marketCap = 3195217187580,
// className = `stockComponent`, 
// address = `One Apple Park Way`,
// industry = `Consumer Electronics`,
// website = `https://www.apple.com`,
// description = appleCompanyDescription,
// logo = `https://images.financialmodelingprep.com/symbol/${symbol}.png`, 

export class Stock {
    id?: string;
    name?: string;
    label?: string;
    value?: string;
    number?: number;
    type: Types = Types.Stock;

    state: string = `CA`;
    country: string = `US`;
    symbol: string = `AAPL`;
    changes: number = 0.12;
    price: number = 213.88;
    currency: string = `USD`;
    city: string = `Cupertino`;
    exchange: string = `NASDAQ`;
    sector: string = `Technology`;
    ceo: string = `Timothy D. Cook`;
    phone: string = `(408) 996-1010`;
    address: string = `One Apple Park Way`;
    website: string = `https://www.apple.com`;
    industry: string = `Consumer Electronics`;
    description: string = appleCompanyDescription;
    image: string = `https://images.financialmodelingprep.com/symbol/AAPL.png`;

    zip?: number = 95014;
    high?: number = 260.1;
    low?: number = 169.21;
    active?: boolean = true;
    volume?: number = 53273073;
    employees?: number = 164000;
    lastDividend?: number = 1.01;
    wentPublic?: string = `1980-12-12`;
    marketCap?: number = 3194468904000;

    constructor(data: Partial<Stock>) {
        Object.assign(this, data);
    }
}