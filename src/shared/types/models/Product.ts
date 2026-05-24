import { Data } from './Data';
import { DataSources, Types } from '../types';
import { capWords, customDate, countPropertiesInObject, genID, isAppCollectionID, isValid } from '@/shared/scripts/constants';

export enum ProductStatus {
  Draft = `Draft`,
  Active = `Active`,
  Archived = `Archived`,
  // Pending = `Pending`,
  // Backorder = `Backorder`,
  Unavailable = `Unavailable`,
}

export enum ProductType {
  Pin = `Pin`,
  Digital = `Digital`,
  Sticker = `Sticker`,
  Print = `Print`,
  Shirt = `Shirt`,
  Painting = `Painting`,
  Poster = `Poster`,
  Service = `Service`,
  Download = `Download`,
  Physical = `Physical`,
  Commission = `Commission`,
  Subscription = `Subscription`,
}

export enum ProductCategory {
  Art = `Art`,
  Apparel = `Apparel`,
  Stickers = `Stickers`,
  Prints = `Prints`,
  Accessories = `Accessories`,
  Posters = `Posters`,
  Digital = `Digital Art`,
  OriginalArt = `Original Art`,
  CustomArt = `Custom Art`,
  Merchandise = `Merchandise`,
  Commissions = `Commissions`,
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

export interface ProductAttachment {
  id: string;
  type: string;
  value: string;
  date: string;
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
const toNumber = (value: any, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
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
  attachments?: ProductAttachment[] = [];
  description?: string = ``;
  shortDescription?: string = ``;

  created_by?: string = ``;
  updated_by?: string = ``;

  price: number = 0;
  cost?: number = 0;
  currency: string = `usd`;
  compareAtPrice?: number = 0;

  ratings?: number = 0;
  reviews?: number = 0;
  purchases?: number = 0;

  stock: number = 0;
  lowStockThreshold?: number = 5;
  trackInventory: boolean = true;
  allowBackorder: boolean = false;

  tags: string[] = [];
  brand?: string = ``;
  vendor?: string = ``;
  featured: boolean = false;
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
  status: ProductStatus | string = ProductStatus.Draft;
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
    const attachments = Array.isArray(this.attachments) ? this.attachments : [];
    let variants = Array.isArray(this.variants) ? this.variants : [];
    let firstVariant = this.variant || variants?.[0];
    const firstImage = this.image || images?.[0];
    const firstAttachment = attachments?.[0];

    if (isValid(productData.id) && !isValid(this.shopifyID) && typeof productData.id == `number`) this.shopifyID = productData.id;
    if (isValid(productData.title) && !isValid(this.name)) this.name = String(productData.title);
    if (isValid(productData.body_html) && !isValid(this.description)) this.description = String(productData.body_html);
    if (isValid(productData.body_html) && !isValid(this.bodyHTML)) this.bodyHTML = String(productData.body_html);
    if (isValid(productData.product_type)) this.productType = String(productData.product_type);
    if (isValid(productData.product_type) && !isValid(this.category)) this.category = String(productData.product_type);
    if (isValid(productData.createdBy) && !isValid(this.created_by)) this.created_by = String(productData.createdBy);
    if (isValid(productData.updatedBy) && !isValid(this.updated_by)) this.updated_by = String(productData.updatedBy);
    if (!isValid(this.productType)) this.productType = ProductType.Sticker;
    if (isValid(productData.status)) this.status = capWords(String(productData.status));
    if (!isValid(this.status)) this.status = ProductStatus.Draft;
    if (isValid(productData.handle) && !isValid(this.handle)) this.handle = String(productData.handle);
    if (isValid(productData.handle) && !isValid(this.slug)) this.slug = String(productData.handle);
    if (isValid(productData.admin_graphql_api_id) && !isValid(this.adminGraphqlApiID)) this.adminGraphqlApiID = String(productData.admin_graphql_api_id);
    if (isValid(productData.published_at) && !isValid(this.publishedAt)) this.publishedAt = String(productData.published_at);
    if (productData.template_suffix !== undefined && !isValid(this.templateSuffix)) this.templateSuffix = productData.template_suffix;
    if (isValid(productData.published_scope) && !isValid(this.publishedScope)) this.publishedScope = productData.published_scope;
    if (isValid(productData.created_at)) this.created = productData.created_at;
    if (isValid(productData.updated_at)) this.updated = productData.updated_at;
    this.tags = normalizeTags(this.tags || productData.tags);
    this.ratings = toNumber(this.ratings, 0);
    this.reviews = toNumber(this.reviews, 0);
    this.purchases = toNumber(this.purchases, 0);
    this.featured = productData.featured == true || String(productData.featured || ``).toLowerCase() == `true`;
    const categoryInput = productData.category || productData.product_type || productData.productType;
    this.categories = normalizeTags(this.categories || productData.categories);
    if (isValid(categoryInput)) this.category = String(categoryInput);
    else if (isValid(this.categories)) this.category = this.categories?.[0] || ProductCategory.Art;
    if (!isValid(this.category)) this.category = ProductCategory.Art;
    if (isValid(this.category) && !this.categories?.includes(this.category)) this.categories = [this.category, ...(this.categories || [])];
    if (!isValid(this.label)) this.label = this.name || productData.title || this.sku;
    if (!isValid(this.imageURL) && isValid(firstImage?.url)) this.imageURL = firstImage?.url;
    if (!isValid(this.image) && firstImage) this.image = firstImage;
    if (!isValid(this.imageURL) && isValid(firstImage?.src)) this.imageURL = firstImage?.src;
    if (!isValid(this.imageURLs) && images.length > 0) this.imageURLs = images.map(image => image.src || image.url || ``).filter(Boolean);
    if (!isValid(this.imageURL) && isValid(firstAttachment?.value)) this.imageURL = String(firstAttachment?.value);
    if (!isValid(this.attachments) && isValid(this.imageURL)) {
      this.attachments = [{
        id: `${this.id}_Attachment_1`,
        type: `image`,
        value: this.imageURL || ``,
        date: customDate()?.update,
      }];
    }
    if (!isValid(this.imageURLs) && Array.isArray(this.attachments) && this.attachments.length > 0) {
      this.imageURLs = this.attachments.map(attachment => attachment?.value || ``).filter(Boolean);
    }
    if (variants.length == 0) {
      firstVariant = {
        id: `${this.id || Types.Product}_Variant_1`,
        sku: this.sku,
        title: `Default`,
        price: this.price,
        position: 1,
        productID: this.id,
        available: this.status == ProductStatus.Active && Number(this.stock || 0) > 0,
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
    if (productData.available == undefined) this.available = this.status == ProductStatus.Active && (this.stock > 0 || variants.some(variant => variant.available == true));
    const archivedValue = ProductStatus.Archived.toLowerCase();
    const unavailableValue = ProductStatus.Unavailable.toLowerCase();
    // const backorderValue = ProductStatus.Backorder.toLowerCase();
    const statusValue = String(this.status || ``).toLowerCase();
    const hasNoStock = Number(this.stock || 0) <= 0;
    const isArchived = statusValue == archivedValue;
    if (hasNoStock && !isArchived) this.status = ProductStatus.Unavailable;
    const normalizedStatusValue = String(this.status || ``).toLowerCase();
    const unavailableStatuses = [archivedValue, unavailableValue, ProductStatus.Draft.toLowerCase()];
    if (unavailableStatuses.includes(normalizedStatusValue)) this.available = false;
    // if (normalizedStatusValue == backorderValue) this.available = this.allowBackorder;
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
