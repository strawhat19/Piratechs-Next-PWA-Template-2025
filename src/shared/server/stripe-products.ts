import { stripePaymentsEnabled } from '../scripts/payments';
import { Product, ProductStatus } from '../types/models/Product';
import { getStripeServerKey, stripeApiVersion } from './stripe-orders';

const postStripeForm = async (stripeServerKey: string, path: string, params: URLSearchParams) => {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: `POST`,
    headers: {
      Authorization: `Bearer ${stripeServerKey}`,
      [`Content-Type`]: `application/x-www-form-urlencoded`,
      [`Stripe-Version`]: stripeApiVersion,
    },
    body: params,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `Unable to sync Stripe product.`);
  return data;
}

const setStripeMetadata = (params: URLSearchParams, metadata: Record<string, any>) => {
  Object.entries(metadata)?.forEach(([key, value]) => {
    if (value == undefined || value == null || value == ``) return;
    const metadataValue = Array.isArray(value) ? value.join(`, `) : String(value);
    params.set(`metadata[${key}]`, metadataValue.slice(0, 500));
  });
}

const getStripeProductParams = (product: Product) => {
  const status = String(product?.status || ``).toLowerCase();
  const inactiveStatuses = [ProductStatus.Archived, ProductStatus.Unavailable].map(status => status.toLowerCase());
  const active = !inactiveStatuses.includes(status);
  const params = new URLSearchParams({
    active: String(active),
    name: product?.name || product?.title || `Product`,
  });
  setStripeMetadata(params, {
    sku: product?.sku,
    tags: product?.tags,
    number: product?.number,
    ratings: product?.ratings,
    reviews: product?.reviews,
    category: product?.category,
    purchases: product?.purchases,
    created_by: product?.created_by,
    updated_by: product?.updated_by,
    product_type: product?.productType,
    app_product_id: product?.id,
  });
  if (product?.description) params.set(`description`, String(product?.description).slice(0, 500));
  product?.imageURLs?.slice(0, 8)?.forEach((imageURL, index) => params.set(`images[${index}]`, imageURL));
  return params;
}

export const syncStripeProduct = async (product: Product) => {
  if (!stripePaymentsEnabled) return new Product({ ...product, stripeSyncStatus: `Disabled` });
  const stripeServerKey = getStripeServerKey();
  if (!stripeServerKey) return new Product({ ...product, stripeSyncStatus: `Missing Key` });

  const productParams = getStripeProductParams(product);
  const stripeProduct = product?.stripeProductID
    ? await postStripeForm(stripeServerKey, `products/${product.stripeProductID}`, productParams)
    : await postStripeForm(stripeServerKey, `products`, productParams);

  let stripePriceID = product?.stripePriceID || ``;
  const priceAmount = Number(product?.price || 0);
  const priceCurrency = product?.currency || `usd`;
  const shouldCreatePrice = priceAmount > 0 && (!stripePriceID || product?.stripePriceAmount != priceAmount || product?.stripePriceCurrency != priceCurrency);

  if (shouldCreatePrice) {
    const priceParams = new URLSearchParams({
      currency: priceCurrency,
      unit_amount: String(priceAmount),
      product: stripeProduct?.id,
    });
    setStripeMetadata(priceParams, { sku: product?.sku, number: product?.number, app_product_id: product?.id });
    const stripePrice = await postStripeForm(stripeServerKey, `prices`, priceParams);
    stripePriceID = stripePrice?.id || stripePriceID;
    const defaultPriceParams = new URLSearchParams({ default_price: stripePriceID });
    await postStripeForm(stripeServerKey, `products/${stripeProduct?.id}`, defaultPriceParams);
  }

  return new Product({
    ...product,
    stripePriceID,
    stripeProductID: stripeProduct?.id || product?.stripeProductID,
    stripeSyncStatus: `Synced`,
    stripePriceAmount: priceAmount,
    stripePriceCurrency: priceCurrency,
  });
}

export const archiveStripeProduct = async (product: Product) => {
  if (!stripePaymentsEnabled || !product?.stripeProductID) return;
  const stripeServerKey = getStripeServerKey();
  if (!stripeServerKey) return;
  await postStripeForm(stripeServerKey, `products/${product.stripeProductID}`, new URLSearchParams({ active: `false` }));
}
