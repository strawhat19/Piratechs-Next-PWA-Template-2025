import { Data } from './Data';
import { Item } from './Item';
import { List } from './List';
import { Board } from './Board';
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

export class User extends Data {
  board?: Board;
  items?: Item[];
  color?: string;
  lists?: List[];
  phone?: string;
  avatar?: string;
  z_token?: string;
  boards?: Board[];
  boardID: string = ``;
  boardIDs: string[] = [];
  userIDs?: string[] = [];
  type: Types = Types.User;
  verified?: boolean = true;
  signedIn?: boolean = false;
  anonymous?: boolean = false;
  data?: any = defaultUserData;
  z_token_robinhood?: string = ``;
  role: Roles | string = Roles.Customer;
  z_token_robinhood_socket?: string = ``;
  provider: Providers | string = Providers.Firebase;
  lastSignIn?: Date | string | any = getIDParts()?.date;
  dataSource?: DataSources | string = DataSources.firebase;
  lastAuthenticated?: Date | string | any = getIDParts()?.date;

  constructor(data: Partial<User>) {
    super(data);
    Object.assign(this, data);
    if (isValid(this.email) && !isValid(this.name)) this.name = capWords(this.email.split(`@`)[0]);
    let ID = genID(this.type, this.number, this.name);
    let { id, title, uuid } = ID;
    if (!isValid(this.id)) this.id = id;
    if (!isValid(this.uuid)) this.uuid = uuid;
    if (!isValid(this.title)) this.title = title;
    if (!isValid(this.properties)) this.properties = countPropertiesInObject(this) + 1;
  }

  // isMinRole(role: Roles | string) {
  //   return minRole(this.role, role);
  // }
}