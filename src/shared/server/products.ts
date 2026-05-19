import { Types } from '../types/types';
import { db, Tables } from './firebase';
import { Product, ProductStatus } from '../types/models/Product';
import { archiveStripeProduct, syncStripeProduct } from './stripe-products';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { customDate, getAppCollectionIDNumber, getNextCollectionNumber, isAppCollectionID } from '../scripts/constants';

const cleanFirestoreData = (value: any) => JSON.parse(JSON.stringify(value));

export const getNextProductNumber = async (excludeDocumentID?: string) => {
  const productsSnap = await getDocs(collection(db, Tables.products));
  const products = productsSnap?.docs?.filter(productDoc => productDoc?.id != excludeDocumentID)?.map(productDoc => productDoc?.data()) || [];
  return getNextCollectionNumber(products);
}

export const findProductDocument = async (id?: string) => {
  if (!id) return null;
  const productSnap = await getDoc(doc(db, Tables.products, id));
  if (productSnap.exists()) return { documentID: productSnap.id, data: productSnap.data() };
  const productsSnap = await getDocs(query(collection(db, Tables.products), where(`id`, `==`, id)));
  const firstProductDoc = productsSnap?.docs?.[0];
  return firstProductDoc ? { documentID: firstProductDoc?.id, data: firstProductDoc?.data() } : null;
}

export const normalizeProductForSave = async (data: any, previousDocumentID?: string) => {
  const productsSnap = await getDocs(collection(db, Tables.products));
  const otherProducts = productsSnap?.docs?.filter(productDoc => productDoc?.id != previousDocumentID)?.map(productDoc => productDoc?.data()) || [];
  const productIDNumber = getAppCollectionIDNumber(data?.id, Types.Product);
  const requestedNumber = Number(data?.number || productIDNumber || 0);
  const numberAvailable = requestedNumber > 0 && !otherProducts.some(product => Number(product?.number || getAppCollectionIDNumber(product?.id, Types.Product)) == requestedNumber);
  const number = numberAvailable ? requestedNumber : getNextCollectionNumber(otherProducts);
  const keepID = isAppCollectionID(data?.id, Types.Product) && getAppCollectionIDNumber(data?.id, Types.Product) == number;
  return new Product({ ...data, id: keepID ? data?.id : undefined, number, updated: customDate()?.datetime });
}

export const saveProduct = async (data: any, previousDocumentID?: string) => {
  const product = await normalizeProductForSave(data, previousDocumentID);
  const syncedProduct = await syncStripeProduct(product);
  await setDoc(doc(db, Tables.products, String(syncedProduct?.id)), cleanFirestoreData(syncedProduct), { merge: true });
  if (previousDocumentID && previousDocumentID != syncedProduct?.id) await deleteDoc(doc(db, Tables.products, previousDocumentID));
  return syncedProduct;
}

export const updateProduct = async (id: string, updates: any) => {
  const existingProductDocument = await findProductDocument(id);
  if (!existingProductDocument) throw new Error(`Product Not Found`);
  return saveProduct({ ...existingProductDocument?.data, ...updates, id: existingProductDocument?.data?.id || existingProductDocument?.documentID }, existingProductDocument?.documentID);
}

export const deleteProduct = async (id: string) => {
  const existingProductDocument = await findProductDocument(id);
  if (!existingProductDocument) throw new Error(`Product Not Found`);
  const product = new Product({ ...existingProductDocument?.data, status: ProductStatus.Archived });
  await archiveStripeProduct(product);
  await deleteDoc(doc(db, Tables.products, existingProductDocument?.documentID));
  return product;
}
