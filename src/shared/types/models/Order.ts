import { Data } from './Data';
import { DataSources, Types } from '../types';
import { countPropertiesInObject, genID, isValid } from '@/shared/scripts/constants';

export enum OrderStatus {
  Pending = `Pending`,
  Paid = `Paid`,
  Processing = `Processing`,
  Failed = `Failed`,
  Canceled = `Canceled`,
  Refunded = `Refunded`,
}

export interface PaymentMethodSummary {
  id?: string;
  type?: string;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  wallet?: string;
  country?: string;
  updated?: Date | string | any;
}

export interface OrderLineItem {
  id?: string | number;
  productID?: string | number;
  name: string;
  sku?: string;
  category?: string;
  price: number;
  quantity: number;
  amount: number;
  currency?: string;
}

export class Order extends Data {
  [key: string]: any;

  userID?: string = ``;
  userEmail?: string = ``;
  userName?: string = ``;
  customerID?: string = ``;
  stripeCustomerID?: string = ``;
  stripePaymentIntentID?: string = ``;
  stripeCheckoutSessionID?: string = ``;
  stripeChargeID?: string = ``;
  stripeBalanceTransactionID?: string = ``;
  stripeCreated?: string = ``;
  stripeStatus?: string = ``;
  stripeLivemode?: boolean = false;
  receiptURL?: string = ``;
  amount: number = 0;
  amountSubtotal: number = 0;
  amountTax: number = 0;
  amountShipping: number = 0;
  amountDiscount: number = 0;
  amountTotal: number = 0;
  currency: string = `usd`;
  status: OrderStatus | string = OrderStatus.Pending;
  paymentStatus?: string = `pending`;
  fulfillmentStatus?: string = `Unfulfilled`;
  paymentMethod?: PaymentMethodSummary = {};
  lineItems: OrderLineItem[] = [];
  cartItems: OrderLineItem[] = [];
  source?: string = `Stripe`;
  type: Types = Types.Order;
  dataSource?: DataSources | string = DataSources.firebase;
  metadata?: Record<string, string | number | boolean> = {};

  constructor(data: Partial<Order> = {}) {
    super({ ...data, type: Types.Order });
    Object.assign(this, data);

    if (!isValid(this.name)) this.name = `Order`;
    if (!isValid(this.lineItems) && isValid(this.cartItems)) this.lineItems = this.cartItems;
    if (!isValid(this.cartItems) && isValid(this.lineItems)) this.cartItems = this.lineItems;
    if (!isValid(this.amountTotal) && isValid(this.amount)) this.amountTotal = this.amount;
    if (!isValid(this.amount) && isValid(this.amountTotal)) this.amount = this.amountTotal;
    if (!isValid(this.amountSubtotal) && isValid(this.lineItems)) this.amountSubtotal = this.lineItems.reduce((total, item) => total + Number(item.amount || 0), 0);
    if (!isValid(this.amountTotal)) this.amountTotal = this.amountSubtotal + this.amountTax + this.amountShipping - this.amountDiscount;
    if (!isValid(this.amount)) this.amount = this.amountTotal;

    let ID = genID(this.type, this.number, this.name || `Order`);
    let { id, title, uuid } = ID;
    if (!isValid(this.id)) this.id = id;
    if (!isValid(this.uuid)) this.uuid = uuid;
    if (!isValid(this.title)) this.title = title;
    if (!isValid(this.properties)) this.properties = countPropertiesInObject(this) + 1;
  }
}
