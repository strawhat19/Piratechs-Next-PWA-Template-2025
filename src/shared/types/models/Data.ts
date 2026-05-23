import { Types } from '../types';
import { capWords, countPropertiesInObject, customDate, genID, getRandomUnusedColor, isValid } from '@/shared/scripts/constants';

export class Data {
  id!: string | number | any;
  uid!: string;
  name!: string;
  uuid!: string;
  email!: string;
  color?: any;
  title?: string;
  password?: string;
  number: number = 1;
  properties?: number;
  type: Types = Types.Data;
  description?: string = ``;
  updated: Date | string | any = customDate()?.datetime;
  created: Date | string | any = customDate()?.datetime;
  constructor(data: Partial<Data>) {
    Object.assign(this, data);
    if (isValid(this.email) && !isValid(this.name)) this.name = capWords(this.email.split(`@`)[0]);
    let ID = genID(this.type, this.number, String(this.name == `` ? this.description : this.name));
    let { id, title, uuid } = ID;
    if (!isValid(this.id)) this.id = id;
    if (!isValid(this.uuid)) this.uuid = uuid;
    if (!isValid(this.title)) this.title = title;
    if (!isValid(this.properties)) this.properties = countPropertiesInObject(this) + 1;
    if (!isValid(this.color)) {
      this.color = getRandomUnusedColor();
    }
  }
}