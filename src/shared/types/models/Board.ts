import { Types } from '../types';
import { Properties } from './Properties';
import { Status } from '@/app/components/board/status/status';

export class Board extends Properties { 
    onClick: any;
    lists?: any[];
    listIDs: string[] = [];
    type: Types | string = Types.Board;
    status: Status | string = Status.Active;
    constructor(data: Partial<Board>) {
        super(data);
        Object.assign(this, data);
    }
};