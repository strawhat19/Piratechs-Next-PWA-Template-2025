import { Data } from './Data';
import { Item } from './Item';
import { List } from './List';
import { Board } from './Board';
import { Types } from '../types';
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

export enum Roles {
  Guests = `Guests`,
  Subscribers = `Subscribers`,
  Editors = `Editors`,
  Moderators = `Moderators`,
  Administrators = `Administrators`,
  Developers = `Developers`,
  Owners = `Owners`,
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

export class User extends Data {
  board?: Board;
  items?: Item[];
  color?: string;
  phone?: string;
  avatar?: string;
  listss?: List[];
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
  role: Roles | string = Roles.Subscribers;
  provider: Providers | string = Providers.Firebase;
  lastSignIn?: Date | string | any = getIDParts()?.date;
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
}