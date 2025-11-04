import { User } from './User';
import { List } from './List';
import { Item } from './Item';
import { Task } from './Task';
import { Types } from '../types';
import { Properties } from './Properties';
import { Status } from '@/app/components/board/status/status';

export class Board extends Properties { 
    onClick?: any;
    users?: User[];
    lists?: List[];
    items?: Item[];
    tasks?: Task[];
    boardID: string = ``;
    listIDs: string[] = [];
    type: Types | string = Types.Board;
    status: Status | string = Status.Active;
    constructor(data: Partial<Board>) {
        super(data);
        Object.assign(this, data);
    }
};