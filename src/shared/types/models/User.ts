import { Data } from './Data';
import { Types } from '../types';
import { capWords, countPropertiesInObject, genID, isValid } from '@/shared/scripts/constants';

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

export class User extends Data {
  avatar: any = ``;
  token: string = ``;
  type: Types = Types.User;
  phone: string | number = ``;
  password?: string = undefined;
  role: Roles | string = Roles.Subscribers;
  group: Groups | string = Groups.Production;
  provider: Providers | string = Providers.Firebase;

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