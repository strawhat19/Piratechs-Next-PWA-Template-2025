import { Stock } from './Stock';
import { RobinhoodStockPosition } from './robinhood/RobinhoodStockPosition';
import { popularStocks } from '@/shared/server/database/samples/stocks/stocks';
import { DataSources, RobinhoodAccountTypes, StockAPIs, Types } from '../../types';

export class Position {
    change?: number = 0;
    merged?: any[] = [];
    updates?: number = 0;
    quantity: number = 0.1;
    equity?: number = 6.56;
    cost?: number = 425.38;
    last?: number = 658.08;
    price?: number = 658.08;
    value?: number = 65.808;
    profitLoss?: number = 500;
    stock?: Stock | null = null;
    totalProfitLoss?: number = 500;
    quantity_available?: number = 0.1;
    api?: StockAPIs = StockAPIs.Alpaca;
    type?: Types | string = Types.Position;
    average?: number = 425.38; // Average Equity
    current?: number = 525.25; // Current Equity
    id?: string = `6ae1929e-adcd-4de1-9647-25763c8a4548`;
    name?: keyof typeof popularStocks | string | any = popularStocks.LMT;

    // Robinhood
    url?: string;
    created_at?: string | Date;
    updated_at?: string | Date;
    account_type?: RobinhoodAccountTypes | string = RobinhoodAccountTypes.individual;

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
    dataSource?: DataSources | string = DataSources.api;
    lastTrade?: Date | string = new Date()?.toLocaleString();
    lastUpdate?: Date | string = new Date()?.toLocaleString();
    asset_id: string = `6ae1929e-adcd-4de1-9647-25763c8a4548`;
    symbol: string | keyof typeof popularStocks = popularStocks.LMT;

    constructor(data: Partial<Position> | Partial<RobinhoodStockPosition> | any, stock?: Stock) {
        if (data?.type != Types.RobinhoodStockPosition) {
            Object.assign(this, data);
        }
        this.id = this.asset_id;
        if (data?.type == Types.RobinhoodStockPosition) {
            let d: RobinhoodStockPosition = data;
            this.url = d?.url;
            this.side = d?.side;
            this.type = d?.type;
            this.symbol = d?.symbol;
            this.id = d?.instrument_id;
            this.created_at = d?.created_at;
            this.updated_at = d?.updated_at;
            this.asset_id = d?.instrument_id;
            this.cost_basis = d?.clearing_cost_basis;
            this.current_price = Number(stock?.price);
            this.account_type = d?.brokerage_account_type;
            // this.avg_entry_price = d?.average_buy_price;
            this.avg_entry_price = d?.clearing_average_cost;
            this.qty_available = d?.shares_available_for_sells;
            this.qty = String(d?.quantity)?.split(``).slice(0, 5)?.join(``);
        }
        this.quantity = Number(Number(this.qty)?.toFixed(2));
        this.cost = Number(this.cost_basis);
        this.last = Number(this.lastday_price);
        this.value = Number(this.market_value);
        this.price = Number(this.current_price);
        this.change = Number(this.change_today);
        this.average = Number(this.avg_entry_price);
        this.quantity_available = Number(this.qty_available);
        let foundSymbolName = popularStocks[this.symbol as keyof typeof popularStocks];
        this.name = foundSymbolName ? String(foundSymbolName) : this.name;
        this.account_type = data?.account_type ?? (RobinhoodAccountTypes as any)[this.account_type as any] ?? this.account_type;
        this.updateFromPrices();
    }

    updateFromPrices(price = this?.price, average = this?.average, quantity = this?.quantity) {
        if (typeof price == `number` && typeof average == `number`) {
            this.price = price;
            this.current_price = price;
            this.equity = quantity * average;
            this.profitLoss = price - average;
            if (this?.type == Types.RobinhoodStockPosition) {
                this.unrealized_pl = Number(this.qty) * Number(this.price);
            }
            this.current = this.quantity * price;
            this.totalProfitLoss = this.current - this.equity;
            this.lastUpdate = new Date()?.toLocaleString();
            if (this.updates) this.updates = this.updates + 1;
        }
        return this;
    }

    getStock(stocksArr: Stock[]) {
        let positionStock = stocksArr?.find(s => s?.symbol == this.symbol);
        this.stock = positionStock;
        return positionStock;
    }
}