import { Types } from '../types';
import { capWords, genID } from '@/shared/scripts/constants';

export class Properties { 
    uid?: string;
    index?: number; 
    tags?: string[]; 
    id: string = ``; 
    name: string = ``; 
    uuid: string = ``;
    number: number = 1; 
    userID: string = ``;
    description?: string; 
    userIDs: string[] = [];
    properties: number = 1; 
    createdBy: | string = ``;
    updatedBy: | string = ``;
    created: Date | string = ``;
    updated: Date | string = ``;
    constructor(data: Partial<Properties>) {
        Object.assign(this, data);
    }
};

export const generateProperties = (name: string, type = Types.Data, array: any[] = []) => {
    let number = array.length + 1;
    let props = genID(type, number, name);
    let { id, date, uuid } = props;
    let rtn = { id, date, uuid };
    return rtn;
}

export const createData = (name: string, type: Types = Types.Data, user: any, array: any[] = []) => {
    name = capWords(name);
    let props = generateProperties(name, type, array);
    let { id, date, uuid } = props;
    let newData = { 
        id, 
        name, 
        uuid, 
        updated: date,
        created: date, 
        userID: user?.id,
        userIDs: [user?.id], 
        createdBy: user?.id,
        updatedBy: user?.id,
    };
    return newData;
}