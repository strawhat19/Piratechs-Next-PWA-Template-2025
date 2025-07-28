import { Types } from '../types';

export class Stock {
    id?: string;
    low?: number;
    name?: string;
    high?: number;
    range?: string;
    label?: string;
    value?: string;
    number?: number;
    volume?: number;
    website?: string;
    exchange?: string;
    employees?: number;
    lastDividend?: number;
    type: Types = Types.Stock;
    constructor(data: Partial<Stock>) {
        Object.assign(this, data);
    }
}