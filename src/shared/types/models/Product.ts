import { Data } from './Data';
import { DataSources, Types } from '../types';
import { capWords, countPropertiesInObject, genID, isValid } from '@/shared/scripts/constants';

export enum ProductStatus {
  Draft = `Draft`,
  Active = `Active`,
  Archived = `Archived`,
  Backorder = `Backorder`,
  OutOfStock = `Out of Stock`,
}

export enum ProductType {
  Digital = `Digital`,
  Physical = `Physical`,
  Service = `Service`,
  Subscription = `Subscription`,
}

export class Product extends Data {
  sku: string = ``;
  slug: string = ``;
  imageURL?: string = ``;
  imageURLs?: string[] = [];
  description?: string = ``;
  shortDescription?: string = ``;

  price: number = 0;
  compareAtPrice?: number = 0;
  cost?: number = 0;
  currency: string = `usd`;

  stock: number = 0;
  lowStockThreshold?: number = 5;
  trackInventory: boolean = true;
  allowBackorder: boolean = false;

  brand?: string = ``;
  vendor?: string = ``;
  category: string = ``;
  categories: string[] = [];
  tags: string[] = [];

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

  type: Types = Types.Product;
  productType: ProductType | string = ProductType.Digital;
  status: ProductStatus | string = ProductStatus.Draft;
  dataSource?: DataSources | string = DataSources.firebase;
  metadata?: Record<string, string | number | boolean> = {};

  constructor(data: Partial<Product>) {
    super({ ...data, type: Types.Product });
    Object.assign(this, data);

    if (isValid(this.name) && !isValid(this.slug)) {
      this.slug = this.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, `-`).replace(/^-|-$/g, ``);
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
