import { DataSources, Types } from '../../types';
import { popularStocks } from '@/shared/server/database/samples/stocks/stocks';

export class Order {
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
    type?: Types | string = Types.Order;
    id?: string = `6ae1929e-adcd-4de1-9647-25763c8a4548`;
    name?: keyof typeof popularStocks | string | any = popularStocks.LMT;

    qty: string = `100`;
    side: string = `buy`;
    order_class: string = ``;
    status: string = `filled`;
    hwm: unknown | null = null;
    legs: unknown | null = null;
    api_type: string = `market`;
    source: string | null = null;
    subtag: string | null = null;
    time_in_force: string = `day`;
    order_type: string = `market`;
    replaces: string | null = null;
    notional: unknown | null = null;
    failed_at: string | null = null;
    expired_at: string | null = null;
    stop_price: string | null = null;
    canceled_at: string | null = null;
    asset_class: string = `us_equity`;
    replaced_by: string | null = null;
    replaced_at: string | null = null;
    trail_price: string | null = null;
    limit_price: string | null = null;
    filled_qty: string | null = `100`;
    trail_percent: string | null = null;
    position_intent: string = `buy_to_open`;
    filled_avg_price: string | null = `23.91`;
    created_at: string = `2025-08-29T14:52:50.091863Z`;
    expires_at: string | null = `2025-08-29T20:00:00Z`;
    dataSource?: DataSources | string = DataSources.api;
    filled_at: string | null = `2025-08-29T14:52:51.397299Z`;
    asset_id: string = `b02df0cc-0a0a-4ecb-8e92-201b1044ea21`;
    updated_at: string | null = `2025-08-29T14:52:51.399118Z`;
    submitted_at: string | null = `2025-08-29T14:52:50.100507Z`;
    symbol: string | keyof typeof popularStocks = popularStocks.LMT;
    client_order_id: string = `6891effa-9f0f-4967-9e01-25cacf544a2c`;

    constructor(data: Partial<Order>) {
        Object.assign(this, data);
        if (data.id) this.id = data.id;
        this.quantity = Number(this.qty);
        if (this.filled_avg_price != null) {
            this.average = Number(this.filled_avg_price);
            this.price = this.average;
        }
        if (this.symbol) {
            let key: keyof typeof popularStocks = this.symbol as keyof typeof popularStocks;
            this.name = popularStocks[key] ? String(popularStocks[key]) : String(this.symbol);
        }
    }
}