import { Data } from './Data';
import { DataSources, Types } from '../types';
import { capWords, countPropertiesInObject, genID, isAppCollectionID, isValid } from '@/shared/scripts/constants';

export enum ProductStatus {
  Draft = `Draft`,
  Active = `Active`,
  Archived = `Archived`,
  Backorder = `Backorder`,
  OutOfStock = `Out of Stock`,
}

export enum ProductType {
  Pin = `Pin`,
  Print = `Print`,
  Shirt = `Shirt`,
  Poster = `Poster`,
  Sticker = `Sticker`,
  Graphic = `Graphic`,
  Service = `Service`,
  Digital = `Digital`,
  Painting = `Painting`,
  Physical = `Physical`,
  Commission = `Commission`,
  Subscription = `Subscription`,
  DigitalDownload = `Digital Download`,
}

export enum ProductCategory {
  Art = `Art`,
  Apparel = `Apparel`,
  Stickers = `Stickers`,
  Paintings = `Paintings`,
  Prints = `Prints`,
  Posters = `Posters`,
  Graphics = `Graphics`,
  Commissions = `Commissions`,
  Accessories = `Accessories`,
  DigitalArt = `Digital Art`,
  OriginalArt = `Original Art`,
  CustomArt = `Custom Art`,
  Merchandise = `Merchandise`,
}

export interface ProductOption {
  id?: number | string;
  product_id?: number | string;
  productID?: number | string;
  name: string;
  position?: number;
  values: string[];
}

export interface ProductImage {
  id?: number | string;
  alt?: string | null;
  position?: number;
  product_id?: number | string;
  productID?: number | string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  admin_graphql_api_id?: string;
  adminGraphqlApiID?: string;
  width?: number;
  height?: number;
  src?: string;
  url?: string;
  storagePath?: string;
  variant_ids?: Array<number | string>;
  variantIDs?: Array<number | string>;
}

export interface ProductVariant {
  id?: number | string;
  title?: string;
  option1?: string;
  option2?: string;
  option3?: string;
  sku?: string;
  requires_shipping?: boolean;
  requiresShipping?: boolean;
  taxable?: boolean;
  featured_image?: ProductImage;
  featuredImage?: ProductImage;
  available?: boolean;
  price?: string | number;
  priceCents?: number;
  grams?: number;
  compare_at_price?: string | number | null;
  compareAtPrice?: string | number | null;
  inventory_quantity?: number;
  inventoryQuantity?: number;
  position?: number;
  product_id?: number | string;
  productID?: number | string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

const toSlug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, `-`).replace(/^-|-$/g, ``);
const toPriceCents = (value: string | number | null | undefined, fallback = 0) => {
  if (value == undefined || value == null || value == ``) return fallback;
  if (typeof value == `number`) return Number.isInteger(value) ? value : Math.round(value * 100);
  const cleanValue = value.replace(/[^0-9.-]/g, ``);
  if (cleanValue == ``) return fallback;
  return cleanValue.includes(`.`) ? Math.round(Number(cleanValue) * 100) : Number(cleanValue);
}
const normalizeTags = (tags?: string[] | string) => Array.isArray(tags) ? tags : String(tags || ``).split(`,`).map(tag => tag.trim()).filter(Boolean);
const sumInventory = (variants: ProductVariant[] = []) => variants.reduce((total, variant) => total + Number(variant.inventoryQuantity ?? variant.inventory_quantity ?? 0), 0);

export class Product extends Data {
  [key: string]: any;

  sku: string = ``;
  slug: string = ``;
  label?: string = ``;
  bodyHTML?: string = ``;
  imageURL?: string = ``;
  imageURLs?: string[] = [];
  description?: string = ``;
  shortDescription?: string = ``;

  created_by?: string = ``;
  updated_by?: string = ``;

  price: number = 0;
  cost?: number = 0;
  currency: string = `usd`;
  compareAtPrice?: number = 0;

  stock: number = 0;
  lowStockThreshold?: number = 5;
  trackInventory: boolean = true;
  allowBackorder: boolean = false;

  tags: string[] = [];
  brand?: string = ``;
  vendor?: string = ``;
  categories: string[] = [];
  category: string = ProductCategory.Art;

  weight?: number = 0;
  dimensions?: {
    width?: number;
    height?: number;
    length?: number;
    unit?: string;
  } = { unit: `in` };

  taxCode?: string = ``;
  taxable: boolean = true;
  stripePriceID?: string = ``;
  stripeProductID?: string = ``;
  stripePriceAmount?: number = 0;
  stripeSyncStatus?: string = ``;
  stripePriceCurrency?: string = `usd`;

  externalProductID?: string = ``;
  shopifyID?: number | string;
  adminGraphqlApiID?: string = ``;
  handle?: string = ``;
  publishedAt?: string = ``;
  templateSuffix?: string | null = ``;
  publishedScope?: string = ``;
  options?: ProductOption[] = [];
  images?: ProductImage[] = [];
  image?: ProductImage;
  altImage?: ProductImage;
  variants?: ProductVariant[] = [];
  variantIDs?: Array<number | string> = [];
  variantID?: number | string;
  variant?: ProductVariant;
  selectedOptions?: Record<string, string> = {};
  inventoryQuantity?: number = 0;
  totalInventory?: number = 0;
  available?: boolean = false;
  requiresShipping?: boolean = false;
  grams?: number = 0;
  cartID?: string = ``;
  rawShopify?: Record<string, any> = {};

  type: Types = Types.Product;
  status: ProductStatus | string = ProductStatus.Active;
  productType: ProductType | string = ProductType.Sticker;
  dataSource?: DataSources | string = DataSources.firebase;
  metadata?: Record<string, string | number | boolean> = {};

  constructor(data: Partial<Product> = {}) {
    const productData = data as Partial<Product> & Record<string, any>;
    const productName = productData.name || productData.title;
    const hasAppProductID = isAppCollectionID(productData?.id, Types.Product);
    super({ ...productData, id: hasAppProductID ? productData?.id : undefined, name: productName, type: Types.Product, created: productData.created ?? productData.created_at, updated: productData.updated ?? productData.updated_at });
    const appID = this.id;
    const appUUID = this.uuid;
    const appTitle = this.title;
    Object.assign(this, productData);
    if (!hasAppProductID) {
      this.id = appID;
      this.uuid = appUUID;
      this.title = appTitle;
      if (isValid(productData?.id) && !isValid(this.externalProductID)) this.externalProductID = String(productData?.id);
    }

    const images = Array.isArray(this.images) ? this.images : [];
    let variants = Array.isArray(this.variants) ? this.variants : [];
    let firstVariant = this.variant || variants?.[0];
    const firstImage = this.image || images?.[0];

    if (isValid(productData.id) && !isValid(this.shopifyID) && typeof productData.id == `number`) this.shopifyID = productData.id;
    if (isValid(productData.title) && !isValid(this.name)) this.name = String(productData.title);
    if (isValid(productData.body_html) && !isValid(this.description)) this.description = String(productData.body_html);
    if (isValid(productData.body_html) && !isValid(this.bodyHTML)) this.bodyHTML = String(productData.body_html);
    if (isValid(productData.product_type)) this.productType = String(productData.product_type);
    if (isValid(productData.product_type) && !isValid(this.category)) this.category = String(productData.product_type);
    if (!isValid(this.productType)) this.productType = ProductType.Sticker;
    if (!isValid(this.category)) this.category = ProductCategory.Art;
    if (isValid(productData.status)) this.status = capWords(String(productData.status));
    if (isValid(productData.handle) && !isValid(this.handle)) this.handle = String(productData.handle);
    if (isValid(productData.handle) && !isValid(this.slug)) this.slug = String(productData.handle);
    if (isValid(productData.admin_graphql_api_id) && !isValid(this.adminGraphqlApiID)) this.adminGraphqlApiID = String(productData.admin_graphql_api_id);
    if (isValid(productData.published_at) && !isValid(this.publishedAt)) this.publishedAt = String(productData.published_at);
    if (productData.template_suffix !== undefined && !isValid(this.templateSuffix)) this.templateSuffix = productData.template_suffix;
    if (isValid(productData.published_scope) && !isValid(this.publishedScope)) this.publishedScope = productData.published_scope;
    if (isValid(productData.created_at)) this.created = productData.created_at;
    if (isValid(productData.updated_at)) this.updated = productData.updated_at;
    if (!isValid(this.tags)) this.tags = normalizeTags(productData.tags);
    if (!isValid(this.label)) this.label = this.name || productData.title || this.sku;
    if (!isValid(this.imageURL) && isValid(firstImage?.url)) this.imageURL = firstImage?.url;
    if (!isValid(this.image) && firstImage) this.image = firstImage;
    if (!isValid(this.imageURL) && isValid(firstImage?.src)) this.imageURL = firstImage?.src;
    if (!isValid(this.imageURLs) && images.length > 0) this.imageURLs = images.map(image => image.src || image.url || ``).filter(Boolean);
    if (variants.length == 0) {
      firstVariant = {
        id: `${this.id || Types.Product}_Variant_1`,
        sku: this.sku,
        title: `Default`,
        price: this.price,
        position: 1,
        productID: this.id,
        available: this.status != ProductStatus.Archived,
        taxable: this.taxable,
        inventoryQuantity: this.stock,
        requiresShipping: this.requiresShipping,
      };
      variants = [firstVariant];
      this.variants = variants;
    }
    if (!isValid(this.variant) && firstVariant) this.variant = firstVariant;
    if (!isValid(this.variantID) && isValid(firstVariant?.id)) this.variantID = firstVariant?.id;
    if (!isValid(this.variantIDs) && variants.length > 0) this.variantIDs = variants.map(variant => variant.id || ``).filter(Boolean);
    if (!isValid(this.sku) && isValid(firstVariant?.sku)) this.sku = firstVariant?.sku || ``;
    if (!isValid(productData.price) && isValid(firstVariant?.price)) this.price = toPriceCents(firstVariant?.price, this.price);
    else this.price = toPriceCents(this.price, 0);
    if (!isValid(productData.compareAtPrice) && isValid(firstVariant?.compare_at_price)) this.compareAtPrice = toPriceCents(firstVariant?.compare_at_price, this.compareAtPrice || 0);
    else this.compareAtPrice = toPriceCents(this.compareAtPrice, 0);
    if (variants.length > 0) {
      this.totalInventory = sumInventory(variants);
      if (!isValid(productData.stock)) this.stock = this.totalInventory;
      if (productData.inventoryQuantity == undefined && productData.inventory_quantity == undefined) this.inventoryQuantity = this.totalInventory;
    }
    if (productData.available == undefined) this.available = this.stock > 0 || variants.some(variant => variant.available == true);
    if (productData.requiresShipping == undefined && productData.requires_shipping == undefined && firstVariant?.requires_shipping !== undefined) this.requiresShipping = firstVariant.requires_shipping;
    if (productData.grams == undefined && isValid(firstVariant?.grams)) this.grams = firstVariant?.grams;

    if (isValid(this.name) && !isValid(this.slug)) {
      this.slug = toSlug(this.name);
    }

    if (isValid(this.name) && !isValid(this.sku)) {
      this.sku = `PRD-${String(this.number).padStart(4, `0`)}`;
    }

    if (isValid(this.name)) {
      this.name = capWords(this.name);
    }

    let ID = genID(this.type, this.number, this.name || this.sku || `Product`);
    let { id, title, uuid } = ID;
    if (!isValid(this.id)) this.id = id;
    if (!isValid(this.uuid)) this.uuid = uuid;
    if (!isValid(this.title)) this.title = title;
    if (!isValid(this.properties)) this.properties = countPropertiesInObject(this) + 1;
  }
}
