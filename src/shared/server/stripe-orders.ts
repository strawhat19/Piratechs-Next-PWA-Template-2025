import { db, Tables } from './firebase';
import { customDate } from '../scripts/constants';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Order, OrderLineItem, OrderStatus, PaymentMethodSummary } from '../types/models/Order';

export type StripeOrderCustomer = {
  userID?: string;
  userEmail?: string;
  userName?: string;
}

export type StripeCartItem = {
  id?: string | number;
  productID?: string | number;
  name?: string;
  sku?: string;
  category?: string;
  price?: number;
  quantity?: number;
}

export const stripeApiVersion = `2025-04-30.basil`;

export const getStripeServerKey = () => process.env.STRIPE_SECRET_KEY || process.env.STRIPE_RESTRICTED_KEY;

export const normalizeStripeLineItems = (items?: StripeCartItem[], currency = `usd`): OrderLineItem[] => {
  if (!Array.isArray(items) || items.length == 0) throw new Error(`Add at least one cart item before checkout.`);
  return items.slice(0, 20).map((item) => {
    const price = Number(item?.price);
    const quantity = Math.max(1, Math.min(99, Number(item?.quantity ?? 1)));
    if (!Number.isInteger(price) || price < 50 || price > 999999) throw new Error(`Each item price must be a whole number of cents between 50 and 999999.`);
    return { id: item?.id, productID: item?.productID || item?.id, name: item?.name?.trim() || `Piratechs Store Item`, sku: item?.sku || ``, category: item?.category || ``, price, quantity, amount: price * quantity, currency };
  });
}

export const createPendingStripeOrder = async (items?: StripeCartItem[], customer: StripeOrderCustomer = {}, source = `Stripe`) => {
  const lineItems = normalizeStripeLineItems(items);
  const amountTotal = lineItems.reduce((total, item) => total + item.amount, 0);
  const order = new Order({ name: `${customer.userName || customer.userEmail || `Guest`} Order`, userID: customer.userID || ``, userEmail: customer.userEmail || ``, userName: customer.userName || ``, amount: amountTotal, amountSubtotal: amountTotal, amountTotal, currency: `usd`, status: OrderStatus.Pending, paymentStatus: `pending`, source, lineItems, cartItems: lineItems });
  await saveStripeOrder(order);
  return order;
}

export const saveStripeOrder = async (order: Order) => {
  await setDoc(doc(db, Tables.orders, String(order.id)), JSON.parse(JSON.stringify(order)), { merge: true });
  return order;
}

export const stripeOrderMetadata = (order: Order) => ({
  order_id: String(order.id || ``).slice(0, 500),
  user_id: String(order.userID || ``).slice(0, 500),
  user_email: String(order.userEmail || ``).slice(0, 500),
  cart_items: JSON.stringify(order.lineItems.map((item) => ({ id: item.id, name: item.name, quantity: item.quantity, amount: item.amount }))).slice(0, 500),
});

export const setStripeMetadataParams = (params: URLSearchParams, metadata: Record<string, string>, prefix = `metadata`) => {
  Object.entries(metadata).forEach(([key, value]) => params.set(`${prefix}[${key}]`, value));
}

export const fetchStripeAPI = async (stripeServerKey: string, path: string, params?: URLSearchParams) => {
  const query = params?.toString();
  const response = await fetch(`https://api.stripe.com/v1/${path}${query ? `?${query}` : ``}`, {
    headers: { Authorization: `Bearer ${stripeServerKey}`, [`Stripe-Version`]: stripeApiVersion },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `Unable to fetch Stripe data.`);
  return data;
}

export const retrieveStripePaymentIntent = (stripeServerKey: string, paymentIntentID: string) => {
  const params = new URLSearchParams();
  params.append(`expand[]`, `latest_charge`);
  params.append(`expand[]`, `payment_method`);
  return fetchStripeAPI(stripeServerKey, `payment_intents/${paymentIntentID}`, params);
}

export const retrieveStripeCheckoutSession = (stripeServerKey: string, checkoutSessionID: string) => {
  const params = new URLSearchParams();
  params.append(`expand[]`, `payment_intent`);
  params.append(`expand[]`, `payment_intent.latest_charge`);
  params.append(`expand[]`, `payment_intent.payment_method`);
  return fetchStripeAPI(stripeServerKey, `checkout/sessions/${checkoutSessionID}`, params);
}

export const retrieveRecentStripePaymentIntents = (stripeServerKey: string, limit = 25) => {
  const params = new URLSearchParams();
  params.set(`limit`, String(Math.max(1, Math.min(100, limit))));
  params.append(`expand[]`, `data.latest_charge`);
  params.append(`expand[]`, `data.payment_method`);
  return fetchStripeAPI(stripeServerKey, `payment_intents`, params);
}

const getStripeObject = (value: any) => value && typeof value == `object` ? value : {};
const stripeStatusToOrderStatus = (status?: string) => status == `succeeded` ? OrderStatus.Paid : status == `processing` ? OrderStatus.Processing : status == `canceled` ? OrderStatus.Canceled : status == `requires_payment_method` ? OrderStatus.Failed : OrderStatus.Pending;

export const getStripePaymentMethodSummary = (paymentIntent: any): PaymentMethodSummary => {
  const charge = getStripeObject(paymentIntent?.latest_charge);
  const paymentMethod = getStripeObject(paymentIntent?.payment_method);
  const card = paymentMethod?.card || charge?.payment_method_details?.card || {};
  return {
    id: typeof paymentIntent?.payment_method == `string` ? paymentIntent.payment_method : paymentMethod?.id,
    type: paymentMethod?.type || charge?.payment_method_details?.type || ``,
    brand: card?.brand || ``,
    last4: card?.last4 || ``,
    expMonth: card?.exp_month,
    expYear: card?.exp_year,
    wallet: card?.wallet?.type || ``,
    country: card?.country || ``,
    updated: customDate()?.datetime,
  };
}

export const saveUserPaymentMethod = async (userID?: string, paymentMethod?: PaymentMethodSummary) => {
  if (!userID || !paymentMethod?.id) return;
  const userRef = doc(db, Tables.users, userID);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.exists() ? userSnap.data() : {};
  const paymentMethods = Array.isArray(userData?.paymentMethods) ? userData.paymentMethods : [];
  const nextPaymentMethods = [paymentMethod, ...paymentMethods.filter((method: PaymentMethodSummary) => method?.id != paymentMethod.id)].slice(0, 20);
  await setDoc(userRef, { paymentMethods: nextPaymentMethods, updated: customDate()?.datetime }, { merge: true });
}

export const syncStripeOrderFromPaymentIntent = async (paymentIntent: any, checkoutSession: any = null) => {
  const metadata = paymentIntent?.metadata || checkoutSession?.metadata || {};
  const orderID = metadata?.order_id || checkoutSession?.client_reference_id || paymentIntent?.id;
  const orderRef = doc(db, Tables.orders, String(orderID));
  const orderSnap = await getDoc(orderRef);
  const existingOrder = orderSnap.exists() ? orderSnap.data() : {};
  const charge = getStripeObject(paymentIntent?.latest_charge);
  const paymentMethod = getStripePaymentMethodSummary(paymentIntent);
  const amountTotal = Number(paymentIntent?.amount_received || paymentIntent?.amount || existingOrder?.amountTotal || 0);
  const stripeCreated = paymentIntent?.created ? new Date(paymentIntent.created * 1000).toISOString() : existingOrder?.stripeCreated || ``;
  const order = new Order({ ...existingOrder, id: orderID, name: existingOrder?.name || `Stripe Order`, userID: existingOrder?.userID || metadata?.user_id || ``, userEmail: existingOrder?.userEmail || metadata?.user_email || ``, stripePaymentIntentID: paymentIntent?.id || ``, stripeCheckoutSessionID: checkoutSession?.id || existingOrder?.stripeCheckoutSessionID || ``, stripeChargeID: charge?.id || existingOrder?.stripeChargeID || ``, stripeBalanceTransactionID: charge?.balance_transaction || existingOrder?.stripeBalanceTransactionID || ``, stripeCreated, stripeStatus: paymentIntent?.status || ``, stripeLivemode: Boolean(paymentIntent?.livemode), receiptURL: charge?.receipt_url || existingOrder?.receiptURL || ``, amount: amountTotal, amountTotal, currency: paymentIntent?.currency || existingOrder?.currency || `usd`, status: stripeStatusToOrderStatus(paymentIntent?.status), paymentStatus: paymentIntent?.status || existingOrder?.paymentStatus || `pending`, paymentMethod, updated: customDate()?.datetime });
  await saveStripeOrder(order);
  await saveUserPaymentMethod(order.userID, paymentMethod);
  return order;
}

export const syncRecentStripeOrders = async (stripeServerKey: string, limit = 25) => {
  const paymentIntents = await retrieveRecentStripePaymentIntents(stripeServerKey, limit);
  const orders = [];
  for (const paymentIntent of paymentIntents?.data || []) {
    orders.push(await syncStripeOrderFromPaymentIntent(paymentIntent));
  }
  return orders;
}
