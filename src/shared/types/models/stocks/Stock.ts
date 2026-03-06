import { Types } from '../../types';
import { appleCompanyDescription } from '@/shared/server/database/samples/stocks/stocks';

export class Stock {
    number?: number = 1;
    beta?: number = 1.199;
    
    type: Types = Types.Stock;
    source?: string = `Alpaca`;
    account_type?: string = `individual`;

    created_at?: string | Date = `2026-03-06T22:59:51Z`;
    updated_at?: string | Date = `2026-03-06T22:59:51Z`;
    
    state: string = `CA`;
    country: string = `US`;
    changes: number = 0.12;
    price: number = 213.88;
    symbol: string = `AAPL`;
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

    cik?: string = `0001682852`;
    priceAvg50?: number = 42.0246;
    isin?: string = `US60770K1079`;
    priceAvg200?: number = 30.85708;
    timestamp?: number = 1772744402;
    
    zip?: number = 95014;
    dividend?: number = 0;
    high?: number = 260.1;
    low?: number = 169.21;
    active?: boolean = true;
    lastDividend?: number = 1.01;
    ipoDate?: string = `1980-12-12`;
    paysDividends?: boolean = false;
    founded?: string | number = 1980;
    quantity?: string | number = 95014;
    volume?: number | string = 53273073;
    employees?: number | string = 164000;
    isActivelyTrading?: boolean = this.active;
    float?: number | string = 313409959.680000;
    marketCap?: number | string = 3194468904000;

    id?: string = this.symbol;
    name?: string = this.symbol;
    stock_id?: string = this.symbol;

    label?: string = this.name;
    yearLow?: number = this.low;
    company?: string = this.name;
    yearHigh?: number = this.high;
    companyName?: string = this.name;

    open?: number = this.price;
    last?: number = this.price;
    logo?: string = this.image;
    value?: number = this.price;
    close?: number = this.price;
    url?: string = this.website;
    change?: any = this.changes;
    equity?: number = this.price;
    wentPublic?: string = this.ipoDate;
    volAvg?: number | string = this.volume;
    changePercentage?: number = this.change;
    exchangeFullName?: string = this.exchange;
    exchangeShortName?: string = this.exchange;
    previousClose?: number | string = this.close;
    fullTimeEmployees?: number | string = this.employees;

    range?: string = `${this.low}-${this.high}`;

    constructor(data: Partial<Stock> = {}) {
        Object.assign(this, data);
        if (data?.source && data?.source == `Robinhood`) {
            this.source = data?.source;
            let dividend: any = data?.lastDividend ? data?.lastDividend : this.dividend;
            this.paysDividends = dividend > 0;
            let employees = data?.fullTimeEmployees ? Number(data?.fullTimeEmployees) : this.employees;
            this.employees = employees;
            let active = data?.isActivelyTrading ? data?.isActivelyTrading : this.active;
            this.active = active;
            let wentPublic = data?.ipoDate ? data?.ipoDate : this.ipoDate;
            this.ipoDate = wentPublic;
            this.wentPublic = wentPublic;
        } else {
            for (const key of Object.keys(this) as (keyof Stock)[]) {
                if (key in data) {
                    (this as any)[key] = data[key];
                }
            }
        }
        this.id = this.symbol;
        this.logo = this.image;
        this.url = this.website;
        this.label = this.symbol;
        this.companyName = this.name;
        this.company = this.companyName;
    }
}