import { Data } from './Data';
import { Types } from '../types';
import { capWords, countPropertiesInObject, genID, isValid } from '@/shared/scripts/constants';

export enum Providers { 
  Google = `Google` ,
  Firebase = `Firebase`, 
}

export enum Groups { 
    Developers = `Developers`,
    Alpha = `Alpha`,
    Testers = `Testers`,
    Beta = `Beta`,
    Production = `Production`,
}

export enum Roles {
  Guests = `Guests`,
  Subscribers = `Subscribers`,
  Editors = `Editors`,
  Moderators = `Moderators`,
  Administrators = `Administrators`,
  Developers = `Developers`,
  Owners = `Owners`,
}

export class User extends Data {

    avatar: any = ``;
    token: string = ``;
    type: Types = Types.User;
    phone: string | number = ``;
    password?: string = undefined;
    role: Roles | string = Roles.Subscribers;
    group: Groups | string = Groups.Production;
    provider: Providers | string = Providers.Firebase;

    constructor(data: Partial<User>) {
        super(data);
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

// import { Data } from './Data';
// import { Types } from '../types/types';
// import { generateID, genID } from '../ID';
// import { capWords } from '../../pages/_app';
// import { countPropertiesInObject, isValid, removeNullAndUndefinedProperties, stringNoSpaces } from '../constants';

// export class Role {
//   name: any;
//   level: number;
//   constructor(level: number, role: string) {
//     this.name = role;
//     this.level = level;
//   }
// }
  
// export const ROLES = {
//   Guest: new Role(1, Roles.Guest),
//   Subscriber: new Role(2, Roles.Subscriber),
//   Editor: new Role(3, Roles.Editor),
//   Moderator: new Role(4, Roles.Moderator),
//   Administrator: new Role(5, Roles.Administrator),
//   Developer: new Role(6, Roles.Developer),
//   Owner: new Role(7, Roles.Owner),
// }

// export const userIsMinRole = (usr: User, role: Roles) => {
//   return parseFloat(RolesMap[usr?.role]) >= ROLES[role]?.level;
// }

// export class User extends Data {
//   ID: any;

//   creator: string;

//   owner: string;
//   ownerID: string;
//   ownerUID: string;
  
//   email: string = ``;
//   lastSelectedGridID: string = ``;

//   beta: boolean = false;
//   type: Types = Types.User;
//   showBeta: boolean = false;
//   role = ROLES.Subscriber.name;
  
//   color = `Default`;
//   description = ``;
//   theme = `dark`;
//   image = ``;

//   auth = {
//     attempts: 0,
//     lastSignIn: ``,
//     verified: false,
//     signedIn: false,
//     anonymous: false,
//     lastAuthenticated: ``,
//     lastAttempt: undefined,
//     provider: Providers.Firebase,
//   }

//   data?: { [key: string]: string[] } = {
//     users: [],
//     gridIDs: [],
//     itemIDs: [],
//     listIDs: [],
//     taskIDs: [],
//     boardIDs: [],
//     friendIDs: [],
//     selectedGridIDs: [],
//   }

//   constructor(data: Partial<User>) {
//     super(data);
//     Object.assign(this, data);

//     if (isValid(this.email) && !isValid(this.name)) this.name = capWords(this.email.split(`@`)[0]);

//     this.A = this.name;

//     let ID = genID(this.type, this.rank, this.name, this.uid);
//     let { id, date, title } = ID;
//     let uuid = generateID();

//     if (!isValid(this.id)) this.id = id;
//     if (!isValid(this.uuid)) this.uuid = uuid;
//     if (!isValid(this.title)) this.title = title;
//     if (!isValid(this.meta.created)) this.meta.created = date;
//     if (!isValid(this.meta.updated)) this.meta.updated = date;
//     if (!isValid(this.properties)) this.properties = countPropertiesInObject(this) + 1;
//   }
// }

// export const createUser = (
//   uid: string, 
//   rank: number, 
//   email: string, 
//   name: string, 
//   phone = ``, 
//   avatar = ``, 
//   token = ``, 
//   verified = false, 
//   anonymous = false, 
//   role = Roles.Subscriber,
//   color = `Default`,
//   description = ``,
//   image = ``,
//   type = Types.User,
// ) => {

//   let user: User = new User({
//     uid,
//     role,
//     rank,
//     type,
//     email,
//     token,
//     phone,
//     avatar,

//     image,
//     color,
//     description,

//     owner: email,
//     ownerUID: uid,
//     creator: email,

//     name: isValid(name) ? name : capWords(email.split(`@`)[0]),
//   }) as User;

//   let cleanedUser: any = removeNullAndUndefinedProperties(user);
//   let cleanedID = `${stringNoSpaces(cleanedUser?.title)}_${uid}`;

//   user = new User({ 
//     ...cleanedUser, 
//     ID: cleanedID, 
//     ownerID: cleanedUser?.id, 
//     auth: {
//       ...cleanedUser?.auth,
//       verified,
//       anonymous,
//     },
//   }) as User;

//   return user;
// }