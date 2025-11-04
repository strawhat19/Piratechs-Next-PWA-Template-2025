import { List } from './List';
import { User } from './User';
import { Task } from './Task';
import { Board } from './Board';
import { Types } from '../types';
import { Properties } from './Properties';
import { Status } from '@/app/components/board/status/status';

export class Item extends Properties { 
    list?: List;
    onClick?: any;
    board?: Board;
    users?: User[];
    tasks?: Task[];
    urls: string[] = []; 
    boardID: string = ``;
    taskIDs: string[] = [];
    listIDs?: string[] = [];
    boardIDs: string[] = [];
    imageURLs: string[] = []; 
    type: Types | string = Types.Item;
    status: Status | string = Status.ToDo;
    constructor(data: Partial<Item>) {
        super(data);
        Object.assign(this, data);
    }
};