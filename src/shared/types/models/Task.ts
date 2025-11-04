import { List } from './List';
import { Item } from './Item';
import { Board } from './Board';
import { Types } from '../types';
import { Properties } from './Properties';
import { Status } from '@/app/components/board/status/status';

export class Task extends Properties { 
    item?: Item;
    list?: List;
    onClick?: any;
    board?: Board;
    urls: string[] = []; 
    boardID: string = ``;
    itemIDs?: string[] = [];
    boardIDs: string[] = [];
    imageURLs: string[] = []; 
    type: Types | string = Types.Task;
    status: Status | string = Status.ToDo;
    constructor(data: Partial<Task>) {
        super(data);
        Object.assign(this, data);
    }
};