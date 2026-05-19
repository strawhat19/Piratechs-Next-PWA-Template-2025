import { Data } from './Data';
import { Item } from './Item';
import { List } from './List';
import { Board } from './Board';
import type { PaymentMethodSummary } from './Order';
import { DataSources, Roles, Types } from '../types';
import { capWords, countPropertiesInObject, genID, getIDParts, isValid } from '@/shared/scripts/constants';

export enum Providers { 
  Google = `Google` ,
  Firebase = `Firebase`, 
}

export enum Groups { 
  Developers = `Developers`,
  Alpha = `Alpha`,
  Testers = `Testers`,
  Beta = `Beta`,
  Production = `Production`,
}

export const item = { tasks: [] };
export const board = { 
  lists: [],
  name: `Board`,
  default: true,
  type: Types.Board,
};

export const defaultLists = [{ name: `To Do` }, { name: `Active` }, { name: `Blocked` }, { name: `Complete` }];

export const defaultUserData = { 
  item, 
  board, 
  tags: [], 
  items: [], 
  teams: [], 
  tasks: [], 
  lists: [], 
  shared: [], 
  boards: [], 
  friends: [], 
};

export const minRole = (currRole: Roles | string, role: Roles | string) => {
  let indexOfRole = Object.values(Roles).indexOf(currRole as Roles);
  let indexOfMinRole = Object.values(Roles).indexOf(role as Roles);
  let userIsMinRole: boolean = indexOfRole >= indexOfMinRole;
  return userIsMinRole;
}

const providerFromID = (providerID?: string) => {
  const provider = String(providerID || ``).toLowerCase();
  if (provider.includes(`google`)) return Providers.Google;
  return Providers.Firebase;
}

export class User extends Data {
  [key: string]: any;

  board?: Board;
  items?: Item[];
  color?: string;
  lists?: List[];
  phone?: string;
  image?: string;
  avatar?: string;
  z_token?: string;
  boards?: Board[];
  boardID: string = ``;
  boardIDs: string[] = [];
  userIDs?: string[] = [];
  type: Types = Types.User;
  active?: boolean = true;
  source?: string = ``;
  verified?: boolean = true;
  roles?: Array<Roles | string> = [];
  signedIn?: boolean = false;
  anonymous?: boolean = false;
  data?: any = defaultUserData;
  photoURL?: string = ``;
  metadata?: any = {};
  providerId?: string = ``;
  validSince?: string = ``;
  customerData?: any = {};
  customerID?: number | string;
  shopifyID?: number | string;
  paymentMethods?: PaymentMethodSummary[] = [];
  displayName?: string = ``;
  creationTime?: string = ``;
  lastRefresh?: string = ``;
  emailVerified?: boolean;
  lastUpdated?: Date | string | any;
  lastSignInTime?: string = ``;
  lastRefreshAt?: string = ``;
  shopifyCustomerID?: number | string;
  z_token_robinhood?: string = ``;
  role: Roles | string = Roles.Customer;
  z_token_robinhood_socket?: string = ``;
  provider: Providers | string = Providers.Firebase;
  lastSignIn?: Date | string | any = getIDParts()?.date;
  dataSource?: DataSources | string = DataSources.firebase;
  lastAuthenticated?: Date | string | any = getIDParts()?.date;

  constructor(data: Partial<User> = {}) {
    const userData = data as Partial<User> & Record<string, any>;
    const authUser = userData.userCredential?.user || userData.firebaseUser || userData.user || {};
    const email = String(userData.email || authUser.email || ``).toLowerCase();
    const name = userData.name || userData.displayName || authUser.displayName || (isValid(email) ? capWords(email.split(`@`)[0]) : undefined);
    super({ ...userData, email, name, type: Types.User });
    Object.assign(this, userData);

    if (isValid(email)) this.email = email;
    if (!isValid(this.uid) && isValid(authUser.uid)) this.uid = authUser.uid;
    if (!isValid(this.name) && isValid(name)) this.name = name;
    if (!isValid(this.displayName) && isValid(this.name)) this.displayName = this.name;
    if (isValid(this.displayName) && !isValid(this.name)) this.name = String(this.displayName);
    if (!isValid(this.providerId) && isValid(authUser.providerId)) this.providerId = authUser.providerId;
    if (isValid(this.providerId) && !isValid(userData.provider)) this.provider = providerFromID(this.providerId);
    if (!isValid(this.source)) this.source = String(this.provider || this.dataSource || Providers.Firebase);
    if (!isValid(userData.emailVerified) && authUser.emailVerified !== undefined) this.emailVerified = authUser.emailVerified;
    if (userData.emailVerified !== undefined) this.verified = userData.emailVerified;
    if (this.emailVerified == undefined) this.emailVerified = this.verified;
    if (!isValid(this.metadata) && isValid(authUser.metadata)) this.metadata = authUser.metadata;
    if (!isValid(this.photoURL) && isValid(authUser.photoURL)) this.photoURL = authUser.photoURL;
    if (!isValid(this.avatar) && isValid(this.photoURL)) this.avatar = this.photoURL;
    if (!isValid(this.image) && isValid(this.avatar)) this.image = this.avatar;
    if (!isValid(this.roles) && isValid(this.role)) this.roles = [this.role];
    const firstRole = this.roles?.[0];
    if (isValid(firstRole) && !isValid(userData.role)) this.role = String(firstRole);
    if (isValid(this.customerData?.id) && !isValid(this.shopifyID)) this.shopifyID = this.customerData.id;
    if (isValid(this.shopifyID) && !isValid(this.shopifyCustomerID)) this.shopifyCustomerID = this.shopifyID;
    if (isValid(this.shopifyCustomerID) && !isValid(this.customerID)) this.customerID = this.shopifyCustomerID;
    if (isValid(this.metadata?.creationTime) && !isValid(this.creationTime)) this.creationTime = this.metadata.creationTime;
    if (isValid(this.metadata?.lastSignInTime) && !isValid(this.lastSignInTime)) this.lastSignInTime = this.metadata.lastSignInTime;
    if (isValid(this.lastSignInTime) && !isValid(userData.lastSignIn)) this.lastSignIn = this.lastSignInTime;
    if (!isValid(this.lastUpdated)) this.lastUpdated = this.updated;
    if (isValid(this.email) && !isValid(this.name)) this.name = capWords(this.email.split(`@`)[0]);

    delete this.auth;
    delete this.password;
    delete this.passwordHash;
    delete this.firebaseUser;
    delete this.userCredential;
    delete this.reloadUserInfo;
    delete this.passwordUpdatedAt;

    let ID = genID(this.type, this.number, this.name);
    let { id, title, uuid } = ID;
    if (!isValid(this.id)) this.id = id;
    if (!isValid(this.uuid)) this.uuid = uuid;
    if (!isValid(this.title)) this.title = title;
    if (!isValid(this.properties)) this.properties = countPropertiesInObject(this) + 1;
  }
}
