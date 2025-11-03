import { Types } from '../types';
import { Properties } from './Properties';
import { Status } from '@/app/components/board/status/status';

export class List extends Properties { 
    onClick: any;
    items?: any[];
    itemIDs: string[] = [];
    type: Types | string = Types.List;
    status: Status | string = Status.Active;
    constructor(data: Partial<List>) {
        super(data);
        Object.assign(this, data);
    }
};