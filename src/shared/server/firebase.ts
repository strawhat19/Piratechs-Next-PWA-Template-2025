import { User } from '../types/models/User';
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { apiRoutes, logToast } from '../scripts/constants';
import { GoogleAuthProvider, browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth';

export enum Tables {
  users = `users`,
  items = `items`,
  lists = `lists`,
  tasks = `tasks`,
  boards = `boards`,
  features = `features`,
  notifications = `notifications`,
}

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: `select_account` });
export const googleProvider = provider;

const firebaseConfig = {
  appId: process.env.NEXT_PUBLIC_appId,
  apiKey: process.env.NEXT_PUBLIC_apiKey,
  projectId: process.env.NEXT_PUBLIC_projectId,
  authDomain: process.env.NEXT_PUBLIC_authDomain,
  storageBucket: process.env.NEXT_PUBLIC_storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_messagingSenderId,
};

const firebaseApp = initializeApp(firebaseConfig);
export const storage = getStorage(firebaseApp);
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);

setPersistence(auth, browserLocalPersistence);

export const usersAPI = apiRoutes.users.url;

export const userConverter = {
  toFirestore: (usr: User) => {
    return JSON.parse(JSON.stringify(usr));
  },
  fromFirestore: (snapshot: any, options: any) => {
    const data = snapshot.data(options);
    return new User(data);
  }
}

export const addUserToDatabase = async (usr: User) => {
  const res = await fetch(usersAPI, {
    method: `POST`,
    body: JSON.stringify(usr),
    headers: { [`Content-Type`]: `application/json` },
  });
  if (!res.ok) {
    let message = `Error on Create User (${res.status})`;
    logToast(`Error Adding User to Database ${Tables.users} - ${message}`, res, true);
    return;
  }
  return res.json();
}

export const updateUserInDatabase = async (id: string, updates: Partial<User>) => {
  const res = await fetch(usersAPI + `/` + id, {
    method: `PATCH`,
    body: JSON.stringify(updates),
    headers: { [`Content-Type`]: `application/json` },
  });
  if (!res.ok) {
    let message = `Error on Update User (${res.status})`;
    logToast(`Error Updating User in Database ${Tables.users} - ${message}`, res, true);
    return;
  }
  return res.json();
}

export const renderFirebaseAuthErrorMessage = (erMsg: string) => {
  let erMsgQuery = erMsg?.toLowerCase();
  if (erMsgQuery.includes(`invalid-email`)) {
    return `Please use a valid email.`;
  } else if (erMsgQuery?.includes(`email-already-in-use`)) {
    return `Existing Email or Username, Switching to Sign In`;
  } else if (erMsgQuery?.includes(`weak-password`)) {
    return `Password should be at least 6 characters`;
  } else if (erMsgQuery?.includes(`wrong-password`) || erMsgQuery?.includes(`invalid-login-credentials`)) {
    return `Incorrect Password`;
  } else if (erMsgQuery?.includes(`user-not-found`)) {
    return `User Not Found`;
  } else if (erMsgQuery?.includes(`too-many-requests`)) {
    return `Too Many Requests, Try Again Later`;
  } else {
    return erMsg;
  }
}

// export const boardConverter = {
//   toFirestore: (brd: Board) => {
//     return JSON.parse(JSON.stringify(brd));
//   },
//   fromFirestore: (snapshot: any, options: any) => {
//     const data = snapshot.data(options);
//     return new Board(data);
//   }
// }

// export const listConverter = {
//   toFirestore: (lst: List) => {
//     return JSON.parse(JSON.stringify(lst));
//   },
//   fromFirestore: (snapshot: any, options: any) => {
//     const data = snapshot.data(options);
//     return new List(data);
//   }
// }

// export const itemConverter = {
//   toFirestore: (itm: Item) => {
//     return JSON.parse(JSON.stringify(itm));
//   },
//   fromFirestore: (snapshot: any, options: any) => {
//     const data = snapshot.data(options);
//     return new Item(data);
//   }
// }