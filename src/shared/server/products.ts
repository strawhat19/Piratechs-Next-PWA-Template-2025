import { Types } from '../types/types';
import { db, Tables } from './firebase';
import { Product, ProductStatus } from '../types/models/Product';
import { archiveStripeProduct, syncStripeProduct } from './stripe-products';
import { customDate, getAppCollectionIDNumber, getNextCollectionNumber, isAppCollectionID } from '../scripts/constants';
import { arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';

const cleanFirestoreData = (value: any) => JSON.parse(JSON.stringify(value));
const attachmentKey = (attachment: any) => JSON.stringify({
  id: attachment?.id || ``,
  type: attachment?.type || ``,
  value: attachment?.value || ``,
  date: attachment?.date || ``,
});

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
  return new Product({ ...data, id: keepID ? data?.id : undefined, number, updated: customDate()?.update });
}

export const saveProduct = async (data: any, previousDocumentID?: string) => {
  const product = await normalizeProductForSave(data, previousDocumentID);
  const syncedProduct = await syncStripeProduct(product);
  const productRef = doc(db, Tables.products, String(syncedProduct?.id));
  await setDoc(productRef, cleanFirestoreData(syncedProduct), { merge: true });
  if (previousDocumentID && previousDocumentID != syncedProduct?.id) await deleteDoc(doc(db, Tables.products, previousDocumentID));
  return syncedProduct;
}

export const updateProduct = async (id: string, updates: any) => {
  const existingProductDocument = await findProductDocument(id);
  if (!existingProductDocument) throw new Error(`Product Not Found`);
  const mergedProduct = await normalizeProductForSave({ ...existingProductDocument?.data, ...updates, id: existingProductDocument?.data?.id || existingProductDocument?.documentID }, existingProductDocument?.documentID);
  const syncedProduct = await syncStripeProduct(mergedProduct);
  const productRef = doc(db, Tables.products, String(syncedProduct?.id));
  const existingAttachments = Array.isArray(existingProductDocument?.data?.attachments) ? existingProductDocument?.data?.attachments : [];
  const nextAttachments = Array.isArray(syncedProduct?.attachments) ? syncedProduct.attachments : [];
  const existingMap = new Map(existingAttachments.map((attachment: any) => [attachmentKey(attachment), attachment]));
  const nextMap = new Map(nextAttachments.map((attachment: any) => [attachmentKey(attachment), attachment]));
  const removedAttachments = existingAttachments.filter((attachment: any) => !nextMap.has(attachmentKey(attachment)));
  const addedAttachments = nextAttachments.filter((attachment: any) => !existingMap.has(attachmentKey(attachment)));
  const payload = cleanFirestoreData({ ...syncedProduct });
  delete payload.attachments;
  await setDoc(productRef, payload, { merge: true });
  if (removedAttachments?.length > 0) await updateDoc(productRef, { attachments: arrayRemove(...removedAttachments) });
  if (addedAttachments?.length > 0) await updateDoc(productRef, { attachments: arrayUnion(...addedAttachments) });
  if (nextAttachments.length == 0) await updateDoc(productRef, { attachments: [] });
  if (existingProductDocument?.documentID != syncedProduct?.id) await deleteDoc(doc(db, Tables.products, existingProductDocument?.documentID));
  return syncedProduct;
}

export const deleteProduct = async (id: string) => {
  const existingProductDocument = await findProductDocument(id);
  if (!existingProductDocument) throw new Error(`Product Not Found`);
  const product = new Product({ ...existingProductDocument?.data, status: ProductStatus.Archived });
  await archiveStripeProduct(product);
  await deleteDoc(doc(db, Tables.products, existingProductDocument?.documentID));
  return product;
}
