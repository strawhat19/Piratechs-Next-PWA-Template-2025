import { Types } from '../types';
import { capWords, countPropertiesInObject, genID, isValid } from '@/shared/scripts/constants';

export class Data {
  id!: string;
  uid!: string;
  name!: string;
  uuid!: string;
  email!: string;
  title?: string;
  password?: string;
  number: number = 1;
  properties?: number;

  type: Types = Types.Data;

  created: Date | string = new Date()?.toLocaleString();
  updated: Date | string = new Date()?.toLocaleString();

  constructor(data: Partial<Data>) {
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