import { Data } from './Data';
import { DataSources, Types } from '../types';
import { countPropertiesInObject, genID, isAppCollectionID, isValid } from '@/shared/scripts/constants';

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
  stripe_order_id?: string = ``;
  stripe_customer_id?: string = ``;
  stripe_payment_method_id?: string = ``;
  stripe_payment_intent_id?: string = ``;
  stripe_checkout_session_id?: string = ``;
  stripe_charge_id?: string = ``;
  stripe_balance_transaction_id?: string = ``;
  stripe_receipt_url?: string = ``;
  stripe_created?: string = ``;
  stripe_status?: string = ``;
  stripe_livemode?: boolean = false;
  stripeCustomerID?: string = ``;
  stripePaymentIntentID?: string = ``;
  stripeCheckoutSessionID?: string = ``;
  stripeChargeID?: string = ``;
  stripeBalanceTransactionID?: string = ``;
  stripeCreated?: string = ``;
  stripeStatus?: string = ``;
  stripeLivemode?: boolean = false;
  stripeDescription?: string = ``;
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
    const orderData = data as Partial<Order> & Record<string, any>;
    const hasAppOrderID = isAppCollectionID(orderData?.id, Types.Order);
    const possibleStripeOrderID = !hasAppOrderID && isValid(orderData?.id) ? String(orderData?.id) : orderData?.stripe_order_id || orderData?.stripe_payment_intent_id || orderData?.stripePaymentIntentID || orderData?.stripe_checkout_session_id || orderData?.stripeCheckoutSessionID || orderData?.stripe_charge_id || orderData?.stripeChargeID;
    super({ ...data, id: hasAppOrderID ? orderData?.id : undefined, type: Types.Order });
    const appID = this.id;
    const appUUID = this.uuid;
    const appTitle = this.title;
    Object.assign(this, data);

    if (!hasAppOrderID) {
      this.id = appID;
      this.uuid = appUUID;
      this.title = appTitle;
      if (!isValid(this.stripe_order_id) && isValid(possibleStripeOrderID)) this.stripe_order_id = possibleStripeOrderID;
    }
    if (!isValid(this.stripePaymentIntentID) && isValid(this.stripe_payment_intent_id)) this.stripePaymentIntentID = this.stripe_payment_intent_id;
    if (!isValid(this.stripe_payment_intent_id) && isValid(this.stripePaymentIntentID)) this.stripe_payment_intent_id = this.stripePaymentIntentID;
    if (!isValid(this.stripeCheckoutSessionID) && isValid(this.stripe_checkout_session_id)) this.stripeCheckoutSessionID = this.stripe_checkout_session_id;
    if (!isValid(this.stripe_checkout_session_id) && isValid(this.stripeCheckoutSessionID)) this.stripe_checkout_session_id = this.stripeCheckoutSessionID;
    if (!isValid(this.stripeChargeID) && isValid(this.stripe_charge_id)) this.stripeChargeID = this.stripe_charge_id;
    if (!isValid(this.stripe_charge_id) && isValid(this.stripeChargeID)) this.stripe_charge_id = this.stripeChargeID;
    if (!isValid(this.stripeCustomerID) && isValid(this.stripe_customer_id)) this.stripeCustomerID = this.stripe_customer_id;
    if (!isValid(this.stripe_customer_id) && isValid(this.stripeCustomerID)) this.stripe_customer_id = this.stripeCustomerID;
    if (!isValid(this.stripeCreated) && isValid(this.stripe_created)) this.stripeCreated = this.stripe_created;
    if (!isValid(this.stripe_created) && isValid(this.stripeCreated)) this.stripe_created = this.stripeCreated;
    if (!isValid(this.stripeStatus) && isValid(this.stripe_status)) this.stripeStatus = this.stripe_status;
    if (!isValid(this.stripe_status) && isValid(this.stripeStatus)) this.stripe_status = this.stripeStatus;
    if (!isValid(this.receiptURL) && isValid(this.stripe_receipt_url)) this.receiptURL = this.stripe_receipt_url;
    if (!isValid(this.stripe_receipt_url) && isValid(this.receiptURL)) this.stripe_receipt_url = this.receiptURL;
    if (!isValid(this.stripe_order_id)) this.stripe_order_id = this.stripePaymentIntentID || this.stripeCheckoutSessionID || this.stripeChargeID || ``;
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
