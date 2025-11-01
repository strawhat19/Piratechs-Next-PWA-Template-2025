import { Types } from '../types';
import { Properties } from './Properties';
import { Status } from '@/app/components/board/status/status';

export class Item extends Properties { 
    onClick: any;
    urls: string[] = []; 
    taskIDs: string[] = [];
    imageURLs: string[] = []; 
    type: Types | string = Types.Item;
    status: Status | string = Status.ToDo;
    constructor(data: Partial<Item>) {
        super(data);
        Object.assign(this, data);
    }
};