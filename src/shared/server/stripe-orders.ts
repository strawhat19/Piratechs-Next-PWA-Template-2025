import { db, Tables } from './firebase';
import { customDate, getAppCollectionIDNumber, getNextCollectionNumber, isAppCollectionID } from '../scripts/constants';
import { Order, OrderLineItem, OrderStatus, PaymentMethodSummary } from '../types/models/Order';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';

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
export const defaultStripeOrderCustomer = { userID: `User_1_Rakib1_11_36_PM_10_22_25_fjOQm4OD8`, userEmail: `rakib1@rakib.com`, userName: `Rakib` };

export const getStripeServerKey = () => process.env.STRIPE_SECRET_KEY || process.env.STRIPE_RESTRICTED_KEY;
export const isStripeLikeID = (id?: any) => typeof id == `string` && [`pi_`, `cs_`, `ch_`, `txn_`, `cus_`, `pm_`].some(prefix => id?.startsWith(prefix));
export const getNextOrderNumber = async (excludeDocumentID?: string) => {
  const ordersSnap = await getDocs(collection(db, Tables.orders));
  const orderData = ordersSnap?.docs?.filter(orderDoc => orderDoc?.id != excludeDocumentID).map(orderDoc => orderDoc?.data()) || [];
  return getNextCollectionNumber(orderData);
}

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
  const number = await getNextOrderNumber();
  const orderCustomer = { ...defaultStripeOrderCustomer, ...customer };
  const order = new Order({ number, name: `${orderCustomer?.userName || orderCustomer?.userEmail || `Customer`} Order`, userID: orderCustomer?.userID, userEmail: orderCustomer?.userEmail, userName: orderCustomer?.userName, customerID: orderCustomer?.userID, amount: amountTotal, amountSubtotal: amountTotal, amountTotal, currency: `usd`, status: OrderStatus.Pending, paymentStatus: `pending`, source, lineItems, cartItems: lineItems, description: lineItems?.map(item => `${item?.name} x${item?.quantity}`).join(`, `) });
  await saveStripeOrder(order);
  return order;
}

export const saveStripeOrder = async (order: Order, previousDocumentID?: string) => {
  await setDoc(doc(db, Tables.orders, String(order.id)), JSON.parse(JSON.stringify(order)), { merge: true });
  if (previousDocumentID && previousDocumentID != order?.id) await deleteDoc(doc(db, Tables.orders, previousDocumentID));
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
const getStripeStringID = (value: any) => typeof value == `string` ? value : value?.id || ``;
const getStripeOrderID = (paymentIntent: any, checkoutSession: any = null) => paymentIntent?.id || getStripeStringID(checkoutSession?.payment_intent) || checkoutSession?.id || ``;
const getStripeCustomerID = (paymentIntent: any, checkoutSession: any = null) => getStripeStringID(paymentIntent?.customer) || getStripeStringID(checkoutSession?.customer) || ``;
const getMetadataLineItemsDescription = (metadata: any) => {
  try {
    const lineItems = JSON.parse(metadata?.cart_items || `[]`);
    return Array.isArray(lineItems) ? lineItems?.map((item: OrderLineItem) => `${item?.name} x${item?.quantity}`).join(`, `) : ``;
  } catch {
    return ``;
  }
}
const getOrderLineItemsDescription = (order: any) => order?.lineItems?.map((item: OrderLineItem) => `${item?.name} x${item?.quantity}`).join(`, `) || order?.cartItems?.map((item: OrderLineItem) => `${item?.name} x${item?.quantity}`).join(`, `) || ``;
const getStripeDescription = (paymentIntent: any, existingOrder: any, metadata: any = {}) => paymentIntent?.description || existingOrder?.stripeDescription || existingOrder?.description || getOrderLineItemsDescription(existingOrder) || getMetadataLineItemsDescription(metadata) || `Stripe payment ${paymentIntent?.id || existingOrder?.stripe_order_id || existingOrder?.stripePaymentIntentID || ``}`.trim();
const removeUndefinedValues = (value: any): any => {
  if (Array.isArray(value)) return value.map(item => removeUndefinedValues(item)).filter(item => item !== undefined);
  if (value && typeof value == `object`) return Object.entries(value).reduce((cleanValue, [key, entry]) => entry === undefined ? cleanValue : { ...cleanValue, [key]: removeUndefinedValues(entry) }, {});
  return value;
}

const findOrderDocumentByID = async (id?: string) => {
  if (!id) return null;
  const orderSnap = await getDoc(doc(db, Tables.orders, id));
  return orderSnap.exists() ? { documentID: orderSnap.id, data: orderSnap.data() } : null;
}

const findOrderDocumentByField = async (field: string, value?: string) => {
  if (!value) return null;
  const ordersSnap = await getDocs(query(collection(db, Tables.orders), where(field, `==`, value)));
  const firstOrderDoc = ordersSnap?.docs?.[0];
  return firstOrderDoc ? { documentID: firstOrderDoc?.id, data: firstOrderDoc?.data() } : null;
}

const findExistingStripeOrderDocument = async (paymentIntent: any, checkoutSession: any = null, metadata: any = {}, charge: any = {}) => {
  const stripeOrderID = getStripeOrderID(paymentIntent, checkoutSession);
  const lookupIDs = [metadata?.order_id, checkoutSession?.client_reference_id, stripeOrderID, paymentIntent?.id, checkoutSession?.id, charge?.id].filter(Boolean);
  for (const id of lookupIDs) {
    const orderDoc = await findOrderDocumentByID(String(id));
    if (orderDoc) return orderDoc;
  }
  const lookupFields = [`stripe_order_id`, `stripe_payment_intent_id`, `stripePaymentIntentID`, `stripe_checkout_session_id`, `stripeCheckoutSessionID`, `stripe_charge_id`, `stripeChargeID`];
  const lookupValues = [stripeOrderID, paymentIntent?.id, checkoutSession?.id, charge?.id].filter(Boolean);
  for (const field of lookupFields) {
    for (const value of lookupValues) {
      const orderDoc = await findOrderDocumentByField(field, String(value));
      if (orderDoc) return orderDoc;
    }
  }
  return null;
}

const resolveOrderCustomer = (existingOrder: any, metadata: any, paymentIntent: any, checkoutSession: any, charge: any) => {
  const stripeEmail = checkoutSession?.customer_details?.email || paymentIntent?.receipt_email || charge?.billing_details?.email || ``;
  const userEmail = existingOrder?.userEmail || metadata?.user_email || stripeEmail || defaultStripeOrderCustomer?.userEmail;
  const userID = existingOrder?.userID || metadata?.user_id || defaultStripeOrderCustomer?.userID;
  const userName = existingOrder?.userName || metadata?.user_name || userEmail?.split(`@`)?.[0] || defaultStripeOrderCustomer?.userName;
  return { userID, userEmail, userName };
}

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
  const cleanPaymentMethod = removeUndefinedValues(paymentMethod);
  const nextPaymentMethods = [cleanPaymentMethod, ...paymentMethods.filter((method: PaymentMethodSummary) => method?.id != paymentMethod.id)].map(method => removeUndefinedValues(method)).slice(0, 20);
  await setDoc(userRef, removeUndefinedValues({ paymentMethods: nextPaymentMethods, updated: customDate()?.datetime }), { merge: true });
}

export const syncStripeOrderFromPaymentIntent = async (paymentIntent: any, checkoutSession: any = null) => {
  const metadata = paymentIntent?.metadata || checkoutSession?.metadata || {};
  const charge = getStripeObject(paymentIntent?.latest_charge);
  const existingOrderDocument = await findExistingStripeOrderDocument(paymentIntent, checkoutSession, metadata, charge);
  const existingOrder = existingOrderDocument?.data || {};
  const existingOrderNumber = Number(existingOrder?.number || getAppCollectionIDNumber(existingOrder?.id, `Order`) || getAppCollectionIDNumber(existingOrderDocument?.documentID, `Order`) || 0);
  const existingIDNumber = getAppCollectionIDNumber(existingOrder?.id, `Order`) || getAppCollectionIDNumber(existingOrderDocument?.documentID, `Order`);
  const existingAppOrderID = isAppCollectionID(existingOrder?.id, `Order`) && existingOrderNumber == existingIDNumber ? existingOrder?.id : isAppCollectionID(existingOrderDocument?.documentID, `Order`) && existingOrderNumber == existingIDNumber ? existingOrderDocument?.documentID : undefined;
  const number = existingAppOrderID && existingOrderNumber > 0 ? existingOrderNumber : await getNextOrderNumber(existingOrderDocument?.documentID);
  const stripeOrderID = getStripeOrderID(paymentIntent, checkoutSession);
  const stripeCustomerID = getStripeCustomerID(paymentIntent, checkoutSession) || existingOrder?.stripe_customer_id || existingOrder?.stripeCustomerID || ``;
  const orderCustomer = resolveOrderCustomer(existingOrder, metadata, paymentIntent, checkoutSession, charge);
  const paymentMethod = getStripePaymentMethodSummary(paymentIntent);
  const amountTotal = Number(paymentIntent?.amount_received || paymentIntent?.amount || existingOrder?.amountTotal || 0);
  const stripeCreated = paymentIntent?.created ? new Date(paymentIntent.created * 1000).toISOString() : existingOrder?.stripeCreated || ``;
  const stripeDescription = getStripeDescription(paymentIntent, existingOrder, metadata);
  const order = new Order({ ...existingOrder, id: existingAppOrderID, number, name: existingOrder?.name || `${orderCustomer?.userName || orderCustomer?.userEmail} Order`, userID: orderCustomer?.userID, userEmail: orderCustomer?.userEmail, userName: orderCustomer?.userName, customerID: orderCustomer?.userID, stripe_order_id: stripeOrderID, stripe_customer_id: stripeCustomerID, stripe_payment_method_id: paymentMethod?.id || existingOrder?.stripe_payment_method_id || ``, stripe_payment_intent_id: paymentIntent?.id || existingOrder?.stripe_payment_intent_id || ``, stripe_checkout_session_id: checkoutSession?.id || existingOrder?.stripe_checkout_session_id || ``, stripe_charge_id: charge?.id || existingOrder?.stripe_charge_id || ``, stripe_balance_transaction_id: charge?.balance_transaction || existingOrder?.stripe_balance_transaction_id || ``, stripe_receipt_url: charge?.receipt_url || existingOrder?.stripe_receipt_url || ``, stripe_created: stripeCreated, stripe_status: paymentIntent?.status || ``, stripe_livemode: Boolean(paymentIntent?.livemode), stripeCustomerID, stripePaymentIntentID: paymentIntent?.id || ``, stripeCheckoutSessionID: checkoutSession?.id || existingOrder?.stripeCheckoutSessionID || ``, stripeChargeID: charge?.id || existingOrder?.stripeChargeID || ``, stripeBalanceTransactionID: charge?.balance_transaction || existingOrder?.stripeBalanceTransactionID || ``, stripeCreated, stripeStatus: paymentIntent?.status || ``, stripeLivemode: Boolean(paymentIntent?.livemode), stripeDescription, description: stripeDescription, receiptURL: charge?.receipt_url || existingOrder?.receiptURL || ``, amount: amountTotal, amountTotal, currency: paymentIntent?.currency || existingOrder?.currency || `usd`, status: stripeStatusToOrderStatus(paymentIntent?.status), paymentStatus: paymentIntent?.status || existingOrder?.paymentStatus || `pending`, paymentMethod, updated: customDate()?.datetime });
  const previousDocumentID = existingOrderDocument?.documentID && existingOrderDocument?.documentID != order?.id ? existingOrderDocument?.documentID : undefined;
  await saveStripeOrder(order, previousDocumentID);
  await saveUserPaymentMethod(order?.userID, paymentMethod);
  return order;
}

export const normalizeExistingFirestoreOrders = async () => {
  const ordersSnap = await getDocs(collection(db, Tables.orders));
  const normalizedOrders = [];
  const usedNumbers = new Set<number>();
  let nextNumber = 1;
  const getNextAvailableNumber = () => {
    while (usedNumbers.has(nextNumber)) nextNumber++;
    usedNumbers.add(nextNumber);
    return nextNumber++;
  }
  const sortedOrderDocs = [...(ordersSnap?.docs || [])].sort((a, b) => new Date(a?.data()?.stripe_created || a?.data()?.stripeCreated || a?.data()?.created || 0).getTime() - new Date(b?.data()?.stripe_created || b?.data()?.stripeCreated || b?.data()?.created || 0).getTime());
  for (const orderDoc of sortedOrderDocs) {
    const orderData = orderDoc?.data();
    const idNumber = getAppCollectionIDNumber(orderData?.id, `Order`) || getAppCollectionIDNumber(orderDoc?.id, `Order`);
    const storedNumber = Number(orderData?.number || 0);
    const currentNumber = storedNumber || idNumber;
    const canKeepCurrentNumber = Number.isInteger(currentNumber) && currentNumber > 0 && !usedNumbers.has(currentNumber);
    const number = canKeepCurrentNumber ? currentNumber : getNextAvailableNumber();
    if (canKeepCurrentNumber) usedNumbers.add(number);
    const appOrderID = isAppCollectionID(orderData?.id, `Order`) && idNumber == number ? orderData?.id : isAppCollectionID(orderDoc?.id, `Order`) && idNumber == number ? orderDoc?.id : undefined;
    const stripeOrderID = orderData?.stripe_order_id || orderData?.stripePaymentIntentID || orderData?.stripe_payment_intent_id || (isStripeLikeID(orderData?.id) ? orderData?.id : ``) || (isStripeLikeID(orderDoc?.id) ? orderDoc?.id : ``);
    const description = orderData?.description || orderData?.stripeDescription || getOrderLineItemsDescription(orderData) || `Stripe payment ${stripeOrderID || orderData?.stripe_payment_intent_id || orderData?.stripePaymentIntentID || orderDoc?.id}`.trim();
    const order = new Order({ ...orderData, id: appOrderID, number, description, stripeDescription: description, userID: orderData?.userID || defaultStripeOrderCustomer?.userID, userEmail: orderData?.userEmail || defaultStripeOrderCustomer?.userEmail, userName: orderData?.userName || defaultStripeOrderCustomer?.userName, customerID: orderData?.customerID || orderData?.userID || defaultStripeOrderCustomer?.userID, stripe_order_id: stripeOrderID, stripe_payment_intent_id: orderData?.stripe_payment_intent_id || orderData?.stripePaymentIntentID || (String(stripeOrderID)?.startsWith(`pi_`) ? stripeOrderID : ``), stripe_checkout_session_id: orderData?.stripe_checkout_session_id || orderData?.stripeCheckoutSessionID || (String(stripeOrderID)?.startsWith(`cs_`) ? stripeOrderID : ``), stripe_charge_id: orderData?.stripe_charge_id || orderData?.stripeChargeID || (String(stripeOrderID)?.startsWith(`ch_`) ? stripeOrderID : ``), stripe_receipt_url: orderData?.stripe_receipt_url || orderData?.receiptURL || `` });
    const previousDocumentID = orderDoc?.id != order?.id ? orderDoc?.id : undefined;
    const needsNormalization = Boolean(previousDocumentID || orderDoc?.id != order?.id || orderData?.id != order?.id || orderData?.number != number || !orderData?.userID || !orderData?.userEmail || !orderData?.description || stripeOrderID && !orderData?.stripe_order_id);
    if (needsNormalization) {
      await saveStripeOrder(order, previousDocumentID);
      normalizedOrders.push(order);
    }
  }
  return normalizedOrders;
}

export const syncRecentStripeOrders = async (stripeServerKey: string, limit = 25) => {
  const paymentIntents = await retrieveRecentStripePaymentIntents(stripeServerKey, limit);
  const orders = [];
  for (const paymentIntent of paymentIntents?.data || []) {
    orders.push(await syncStripeOrderFromPaymentIntent(paymentIntent));
  }
  return orders;
}
