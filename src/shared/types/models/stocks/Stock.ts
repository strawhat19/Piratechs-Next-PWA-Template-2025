import { average, isMarketOpen } from '@/shared/scripts/constants';
import { DataSources, RobinhoodAccountTypes, StockAPIs, Types } from '../../types';
import { appleCompanyDescription, stockImages } from '@/shared/server/database/samples/stocks/stocks';

export class Stock {
    score?: number = 0;
    points?: number = 0;
    number?: number = 1;
    updates?: number = 0;
    beta?: number = 1.199;
    loaded?: boolean = false;
    updated?: boolean = false;
    tracked_updates?: number = this.updates;
    api?: StockAPIs = StockAPIs.FinancialModelingPrep;
    tracked_last_updated?: Date | string = new Date()?.toLocaleString();
    
    type: Types = Types.Stock;
    source?: DataSources | string = DataSources.alpaca;
    account_type?: RobinhoodAccountTypes | string = RobinhoodAccountTypes.individual;

    created_at?: string | Date = `2026-03-06T22:59:51Z`;
    updated_at?: string | Date = `2026-03-06T22:59:51Z`;
    
    state: string = `CA`;
    country: string = `US`;
    changes: number = 0.12;
    price: number = 213.88;
    historical?: any[] = [];
    symbol: string = `AAPL`;
    currency: string = `USD`;
    city: string = `Cupertino`;
    exchange: string = `NASDAQ`;
    sector: string = `Technology`;
    ceo: string = `Timothy D. Cook`;
    phone: string = `(408) 996-1010`;
    original_price: number = this.price;
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
    divYield?: any = null;
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

    size?: number = 1;
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
    lastTradePrice?: number = this.price;
    volAvg?: number | string = this.volume;
    changePercentage?: number = this.change;
    exchangeFullName?: string = this.exchange;
    exchangeShortName?: string = this.exchange;
    lastNonRegTradePrice?: number = this.price;
    previousClose?: number | string = this.close;
    lastExtendedHoursTradePrice?: number = this.price;
    dataSource?: DataSources | string = DataSources.api;
    fullTimeEmployees?: number | string = this.employees;

    range?: string = `${this.low}-${this.high}`;

    // Real Time Updates
    lastTrade?: Date | string = new Date()?.toLocaleString();
    lastUpdate?: Date | string = new Date()?.toLocaleString();

    shares?: number | null = 0;
    dayLowPrice?: number | null = this.low;
    dayHighPrice?: number | null = this.high;
    dayOpenPrice?: number | null = this.open;
    dayClosePrice?: number | null = this.close;
    prevDayVolume?: number | null = 0;
    earningsPerShare?: number | null = 0;
    dayVolume?: number | null = Number(this.volume ?? 0);

    askPrice?: number = this.price;
    askSize?: number | string = this.size;
    askTime?: number = 0;
    bidPrice?: number = this.price;
    bidSize?: number | string = this.size;
    bidTime?: number = 0;
    midPrice?: number = this.price;

    dayTurnover?: number = 0;
    tickDirection?: string = ``;
    extendedTradingHours?: boolean = false;
    sequence?: number = 0;
    timeNanoPart?: number = 0;

    askExchangeCode?: string = ``;
    bidExchangeCode?: string = ``;

    tradingStatus?: string = ``;
    shortSaleRestriction?: string = ``;
    haltStartTime?: number = 0;
    haltEndTime?: number = 0;

    openInterest?: number = 0;
    dividendFrequency?: number = 0;
    exDividendAmount?: number = 0;
    exDividendDayId?: number = 0;

    constructor(data: Partial<Stock> = {}) {
        Object.assign(this, data);
        if (data?.source && data?.source == Types.Robinhood) {
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
        this.image = (stockImages as any)[this.symbol] ?? this.image;
        this.id = this.symbol;
        this.logo = this.image;
        this.url = this.website;
        this.label = this.symbol;
        this.companyName = this.name;
        this.company = this.companyName;
    }

    updateUpdates() {
        let d = new Date();
        this.updated = true;
        this.api = StockAPIs.Robinhood;
        this.source = DataSources.robinhood;
        this.lastUpdate = d?.toLocaleString();
        if (typeof this.updates == `number`) {
            this.updates = this.updates + 1;
        }
        if (typeof this.points == `number`) {
            this.points = Number(this.updates) * Number(this.tracked_updates);
        }
        if (typeof this.score == `number`) {
            let newScore = (Number(this.points) / 2) * (Number(this.price) / 2);
            if (newScore > this.score) this.score = newScore;
        }
    }

    updateStats() {
        let d = new Date();
        this.updateUpdates();
        this.updated_at = d?.toISOString();
        this.tracked_last_updated = d?.toLocaleString();
        if (typeof this.tracked_updates == `number`) {
            this.tracked_updates = this.tracked_updates + 1;
        }
    }

    logUpdate(key: string = `Default`, extraData: any = {}) {
        let trackedKeys = [`Price`];
        if (trackedKeys?.includes(key)) {
            this.updateStats();
            // let updates = this.updates;
            let marketOpen = isMarketOpen();
            let updates = this.tracked_updates;
            let updated = this.tracked_last_updated;
            console.log(`${this?.symbol} "${key}" Upd #`, updates, {
                ...extraData,
                updates,
                stock: this,
                price: this.price,
                symbol: this.symbol,
                z_last_updated: updated, 
                z_is_market_open: marketOpen,
                z_total_updates: this.updates,
            });
        }
    }

    setPrice(price: number, eventType: string) {
        this.price = price;
        this.last = price;
        this.value = price;
        this.equity = price;
        this.lastTradePrice = price;
        if (typeof this.high == `number`) {
            if (price > this.high) {
                this.logUpdate(`High`, { high: price, currentHigh: this?.high, eventType, });
                this.high = price;
                this.dayHighPrice = price;
            }
        }
        if (typeof this.low == `number`) {
            if (price < this.low) {
                this.logUpdate(`Low`, { low: price, currentLow: this?.low, eventType, });
                this.low = price;
                this.dayLowPrice = price;
            }
        }
        let d = new Date();
        let dt = d?.toISOString();
        let historicalPrices = this.historical && this.historical?.length > 0 ? this.historical?.map(h => h?.price) : [price];
        let historicalAvg = average(historicalPrices);
        this.historical?.push({ dt, price, average: historicalAvg, low: this.low, high: this.high });
    }

    updateFromLiveEvent(event: any = {}) {
        let priceUpdated = false;
        let marketOpen = isMarketOpen();
        let eventType = event?.eventType;

        const eventSymbol = event?.eventSymbol ?? event?.symbol ?? event?.stock_id ?? event?.id;
        if (!eventSymbol || String(eventSymbol).toUpperCase() !== String(this.symbol).toUpperCase()) return this;

        const toNum = (value: any): number | undefined => {
            if (value === null || value === undefined || value === `` || value === `NaN`) return undefined;
            const num = Number(value);
            return Number.isFinite(num) ? num : undefined;
        };

        const toDateString = (value: any): string | undefined => {
            const num = toNum(value);
            if (!num || num <= 0) return undefined;
            return new Date(num).toLocaleString();
        };

        const updateCommon = () => {
            const sequence = toNum(event?.sequence);
            if (sequence !== undefined) this.sequence = sequence;
            const timeNanoPart = toNum(event?.timeNanoPart);
            if (timeNanoPart !== undefined) this.timeNanoPart = timeNanoPart;
            this.updateUpdates();
        };

        updateCommon();

        switch (event?.eventType) {
            case `Trade`: {
                const price = toNum(event?.price);
                const size = toNum(event?.size);
                const dayVolume = toNum(event?.dayVolume);
                const dayTurnover = toNum(event?.dayTurnover);
                const time = toNum(event?.time);

                if (price !== undefined) {
                    if (this.price != price) {
                        this.logUpdate(`Price`, { price, currentPrice: this.price, eventType, });
                        this.setPrice(price, eventType);
                        priceUpdated = true;
                    }
                }

                if (size !== undefined) this.size = size;
                if (dayVolume !== undefined) {
                    this.dayVolume = dayVolume;
                    this.volume = dayVolume;
                }
                if (dayTurnover !== undefined) this.dayTurnover = dayTurnover;
                if (event?.tickDirection !== undefined) this.tickDirection = event.tickDirection;
                if (event?.extendedTradingHours !== undefined) this.extendedTradingHours = !!event.extendedTradingHours;

                if (time !== undefined) {
                    this.timestamp = Math.floor(time / 1000);
                    this.lastTrade = toDateString(time) ?? this.lastTrade;
                }

                if (this.previousClose !== undefined && this.previousClose !== null) {
                    const prevClose = toNum(this.previousClose);
                    if (price !== undefined && prevClose !== undefined && prevClose !== 0) {
                        const changes = price - prevClose;
                        if (changes != this.changes) {
                            // this.logUpdate(`Price`, { changes, currentChanges: this.changes, eventType, });
                            this.changes = changes;
                            this.change = changes;
                            this.changePercentage = (changes / prevClose) * 100;
                        }
                    }
                }

                if (this.bidPrice !== undefined && this.askPrice !== undefined) {
                    const bid = toNum(this.bidPrice);
                    const ask = toNum(this.askPrice);
                    if (bid !== undefined && ask !== undefined) {
                        let midPrice = (bid + ask) / 2;
                        if (midPrice != this.midPrice) {
                            this.logUpdate(`Mid`, { midPrice, currentMid: this.midPrice, eventType });
                            this.midPrice = midPrice;
                            if (!marketOpen) {
                                if (midPrice != this.price) {
                                    this.setPrice(midPrice, eventType);
                                }
                            }
                        }
                    }
                }

                break;
            }

            case `Quote`: {
                const askPrice = toNum(event?.askPrice);
                const askSize = toNum(event?.askSize);
                const askTime = toNum(event?.askTime);
                const bidPrice = toNum(event?.bidPrice);
                const bidSize = toNum(event?.bidSize);
                const bidTime = toNum(event?.bidTime);

                if (askPrice !== undefined) this.askPrice = askPrice;
                if (askSize !== undefined) this.askSize = askSize;
                if (askTime !== undefined) this.askTime = askTime;

                if (bidPrice !== undefined) this.bidPrice = bidPrice;
                if (bidSize !== undefined) this.bidSize = bidSize;
                if (bidTime !== undefined) this.bidTime = bidTime;

                if (event?.askExchangeCode !== undefined) this.askExchangeCode = event.askExchangeCode;
                if (event?.bidExchangeCode !== undefined) this.bidExchangeCode = event.bidExchangeCode;

                const bid = toNum(this.bidPrice);
                const ask = toNum(this.askPrice);
                if (bid !== undefined && ask !== undefined) {
                    let midPrice = (bid + ask) / 2;
                    if (midPrice != this.midPrice) {
                        this.logUpdate(`Mid`, { midPrice, currentMid: this.midPrice, eventType });
                        this.midPrice = midPrice;
                        if (!marketOpen) {
                            if (midPrice != this.price) {
                                this.setPrice(midPrice, eventType);
                            }
                        }
                    }
                }

                break;
            }

            case `Summary`: {
                const dayClosePrice = toNum(event?.dayClosePrice);
                const dayOpenPrice = toNum(event?.dayOpenPrice);
                const dayHighPrice = toNum(event?.dayHighPrice);
                const dayLowPrice = toNum(event?.dayLowPrice);
                const prevDayClosePrice = toNum(event?.prevDayClosePrice);
                const prevDayVolume = toNum(event?.prevDayVolume);
                const openInterest = toNum(event?.openInterest);

                if (dayClosePrice !== undefined) {
                    this.close = dayClosePrice;
                    this.dayClosePrice = dayClosePrice as any;
                }

                if (dayOpenPrice !== undefined) {
                    this.open = dayOpenPrice;
                    this.dayOpenPrice = dayOpenPrice as any;
                }

                if (dayHighPrice !== undefined) {
                    if (dayHighPrice != this?.dayHighPrice) {
                        this.logUpdate(`Day High`, { dayHighPrice, currentDayHighPrice: this?.dayHighPrice, eventType, });
                        this.high = dayHighPrice;
                        this.dayHighPrice = dayHighPrice as any;
                    }
                }

                if (dayLowPrice !== undefined) {
                    if (dayLowPrice != this?.dayLowPrice) {
                        this.logUpdate(`Day Low`, { dayLowPrice, currentDayLowPrice: this?.dayLowPrice, eventType, });
                        this.low = dayLowPrice;
                        this.dayLowPrice = dayLowPrice as any;
                    }
                }

                if (prevDayClosePrice !== undefined) {
                    this.previousClose = prevDayClosePrice;
                }

                if (prevDayVolume !== undefined) {
                    this.prevDayVolume = prevDayVolume as any;
                    if (!this.volume) this.volume = prevDayVolume;
                }

                if (openInterest !== undefined) this.openInterest = openInterest;

                const livePrice = toNum(this.price);
                if (livePrice !== undefined && prevDayClosePrice !== undefined && prevDayClosePrice !== 0) {
                    const changes = livePrice - prevDayClosePrice;
                    if (changes != this.changes) {
                        // this.logUpdate(`Price`, { changes, currentChanges: this.changes, eventType, });
                        this.changes = changes;
                        this.change = changes;
                        this.changePercentage = (changes / prevDayClosePrice) * 100;
                    }
                }

                let range = `${this.low}-${this.high}`;
                if (range != this.range) {
                    // this.logUpdate(`Range`, { range, currentRange: this.range, eventType, });
                    this.range = range;
                }

                break;
            }

            case `Profile`: {
                // if (event?.description !== undefined) {
                //     this.description = event.description;
                //     this.name = event.description;
                //     this.companyName = event.description;
                //     this.company = event.description;
                // }

                if (event?.shortSaleRestriction !== undefined) this.shortSaleRestriction = event.shortSaleRestriction;
                if (event?.tradingStatus !== undefined) this.tradingStatus = event.tradingStatus;

                const haltStartTime = toNum(event?.haltStartTime);
                const haltEndTime = toNum(event?.haltEndTime);
                const high52WeekPrice = toNum(event?.high52WeekPrice);
                const low52WeekPrice = toNum(event?.low52WeekPrice);
                const shares = toNum(event?.shares);
                const beta = toNum(event?.beta);
                const earningsPerShare = toNum(event?.earningsPerShare);
                const dividendFrequency = toNum(event?.dividendFrequency);
                const exDividendAmount = toNum(event?.exDividendAmount);
                const exDividendDayId = toNum(event?.exDividendDayId);

                if (haltStartTime !== undefined) this.haltStartTime = haltStartTime;
                if (haltEndTime !== undefined) this.haltEndTime = haltEndTime;

                if (high52WeekPrice !== undefined) {
                    if (high52WeekPrice != this.yearHigh) {
                        this.logUpdate(`Year High`, { high52WeekPrice, currentYearHigh: this.yearHigh, eventType, });
                        this.yearHigh = high52WeekPrice;
                    }
                }
                if (low52WeekPrice !== undefined) {
                    if (low52WeekPrice != this.yearLow) {
                        this.logUpdate(`Year Low`, { low52WeekPrice, currentYearLow: this.yearLow, eventType, });
                        this.yearLow = low52WeekPrice;
                    }
                }

                if (shares !== undefined) this.shares = shares;
                if (beta !== undefined) this.beta = beta;
                if (earningsPerShare !== undefined) this.earningsPerShare = earningsPerShare as any;
                if (dividendFrequency !== undefined) this.dividendFrequency = dividendFrequency;
                if (exDividendAmount !== undefined) {
                    if (exDividendAmount != this?.dividend) {
                        this.logUpdate(`Div`, { exDividendAmount, currentDiv: this?.dividend, eventType, });
                        this.exDividendAmount = exDividendAmount;
                        this.dividend = exDividendAmount;
                        this.lastDividend = exDividendAmount;
                        this.paysDividends = exDividendAmount > 0;
                    }
                }
                if (exDividendDayId !== undefined) this.exDividendDayId = exDividendDayId;

                this.isActivelyTrading = this.tradingStatus !== `HALTED`;

                break;
            }

            default: {
                for (const key of Object.keys(event)) {
                    if (key === `eventType` || key === `eventSymbol`) continue;
                    if (key in this) {
                        const maybeNum = toNum(event[key]);
                        let value = maybeNum !== undefined ? maybeNum : event[key];
                        this.logUpdate(`${key}`, { key, value, eventType, });
                        (this as any)[key] = value;
                    }
                }
                break;
            }
        }

        let range = `${this.low}-${this.high}`;
        if (range != this.range) {
            this.range = range;
            if (!priceUpdated) {
                this.logUpdate(`Price Range`, { z_range: range, eventType, });
            }
        }

        return this;
    }

    updateFromLiveEventsArray(events: any[] = []) {
        if (!Array.isArray(events) || !events.length) return this;

        const thisSymbol = String(this.symbol ?? ``).toUpperCase();
        if (!thisSymbol) return this;

        const latestByType: Record<string, any> = {};

        for (const event of events) {
            const eventSymbol = String(event?.eventSymbol ?? event?.symbol ?? event?.stock_id ?? event?.id ?? ``).toUpperCase();
            if (eventSymbol !== thisSymbol) continue;

            const eventType = String(event?.eventType ?? ``);
            if (!eventType) continue;

            latestByType[eventType] = event;
        }

        let eventsArr = Object.values(latestByType);

        if (eventsArr?.length > 1) {
            console.log({ eventsArr });
        }

        eventsArr?.forEach((event: any) => {
            this.updateFromLiveEvent(event);
        });

        return this;
    }
}