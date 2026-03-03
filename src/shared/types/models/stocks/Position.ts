import { Types } from '../../types';
import { popularStocks } from '@/shared/server/database/samples/stocks/stocks';

export class Position {
    change?: number = 0;
    equity?: number = 6.56;
    cost?: number = 425.38;
    last?: number = 658.08;
    price?: number = 658.08;
    value?: number = 65.808;
    quantity?: number = 0.1;
    profitLoss?: number = 500;
    average?: number = 425.38;
    totalProfitLoss?: number = 500;
    quantity_available?: number = 0.1;
    type?: Types | string = Types.Position;
    id?: string = `6ae1929e-adcd-4de1-9647-25763c8a4548`;
    name?: keyof typeof popularStocks | string | any = popularStocks.LMT;

    side: string = `long`;
    exchange: string = `NYSE`;
    qty: string | number = `0.1`;
    asset_marginable: boolean = true;
    asset_class: string = `us_equity`;
    change_today: string | number = `0`;
    qty_available: string | number = `0.1`;
    cost_basis: string | number = `42.538`;
    market_value: string | number = `65.808`;
    unrealized_pl: string | number = `23.27`;
    current_price: string | number = `658.08`;
    lastday_price: string | number = `658.08`;
    avg_entry_price: string | number = `425.38`;
    unrealized_plpc: string | number = `0.54704`;
    unrealized_intraday_pl: string | number = `0`;
    unrealized_intraday_plpc: string | number = `0`;
    asset_id: string = `6ae1929e-adcd-4de1-9647-25763c8a4548`;
    symbol: string | keyof typeof popularStocks = popularStocks.LMT;

    constructor(data: Partial<Position>) {
        Object.assign(this, data);
        this.id = this.asset_id;
        this.quantity = Number(this.qty);
        this.cost = Number(this.cost_basis);
        this.last = Number(this.lastday_price);
        this.value = Number(this.market_value);
        this.price = Number(this.current_price);
        this.change = Number(this.change_today);
        this.average = Number(this.avg_entry_price);
        this.equity = this?.quantity * this?.average;
        this.profitLoss = this?.price - this?.average;
        this.quantity_available = Number(this.qty_available);
        this.totalProfitLoss = this?.equity - this?.profitLoss;
        this.name = String(popularStocks[this.symbol as keyof typeof popularStocks]);
    }
}