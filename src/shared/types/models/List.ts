import { User } from './User';
import { Item } from './Item';
import { Task } from './Task';
import { Board } from './Board';
import { Types } from '../types';
import { Properties } from './Properties';
import { Status } from '@/app/components/board/status/status';

export class List extends Properties { 
    onClick?: any;
    board?: Board;
    users?: User[];
    items?: Item[];
    tasks?: Task[];
    boardID: string = ``;
    itemIDs: string[] = [];
    boardIDs: string[] = [];
    type: Types | string = Types.List;
    status: Status | string = Status.Active;
    constructor(data: Partial<List>) {
        super(data);
        Object.assign(this, data);
    }
};