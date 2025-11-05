import { User } from '../types/models/User';
import { List } from '../types/models/List';
import { Item } from '../types/models/Item';
import { Task } from '../types/models/Task';
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { Board } from '../types/models/Board';
import { getFirestore } from 'firebase/firestore';
import { apiRoutes, getIDParts, logToast } from '../scripts/constants';
import { GoogleAuthProvider, browserLocalPersistence, getAuth, getIdToken, setPersistence } from 'firebase/auth';

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
export const boardsAPI = apiRoutes.boards.url;
export const listsAPI = apiRoutes.lists.url;
export const itemsAPI = apiRoutes.items.url;

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
  const currentUser = auth?.currentUser;
  const token = currentUser ? await getIdToken(currentUser) : updates?.uid;
  const res = await fetch(usersAPI + `/` + id, {
    method: `PATCH`,
    body: JSON.stringify(updates),
    headers: { 
      Authorization: `Bearer ${token}`,
      [`Content-Type`]: `application/json`, 
    },
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

export const boardConverter = {
  toFirestore: (brd: Board) => {
    return JSON.parse(JSON.stringify(brd));
  },
  fromFirestore: (snapshot: any, options: any) => {
    const data = snapshot.data(options);
    return new Board(data);
  }
}

export const addBoardToDatabase = async (brd: Board, user: User) => {
  const currentUser = auth?.currentUser;
  const token = currentUser ? await getIdToken(currentUser) : user?.uid;
  const res = await fetch(boardsAPI, {
    method: `POST`,
    body: JSON.stringify(brd),
    headers: { 
      Authorization: `Bearer ${token}`,
      [`Content-Type`]: `application/json`, 
    },
  });
  if (!res.ok) {
    let message = `Error on Create Board (${res.status})`;
    logToast(`Error Adding Board to Database ${Tables.boards} - ${message}`, res, true);
    return;
  }
  return res.json();
}

export const deleteBoardFromDatabase = async (brd: Board, user: User) => {
  const { date } = getIDParts();
  const currentUser = auth?.currentUser;
  const token = currentUser ? await getIdToken(currentUser) : user?.uid;
  const filteredIDs = user?.boardIDs?.length > 0 ? user?.boardIDs?.filter(bid => bid != brd?.id) : [];
  const boardID = filteredIDs?.length > 0 ? filteredIDs[0] : ``;
  const res = await fetch(boardsAPI, {
    method: `DELETE`,
    body: JSON.stringify({ ...brd, boardID, updated: date }),
    headers: { 
      Authorization: `Bearer ${token}`,
      [`Content-Type`]: `application/json`, 
    },
  });
  if (!res.ok) {
    let message = `Error on Delete Board (${res.status})`;
    logToast(`Error Deleting Board from Database ${Tables.boards} - ${message}`, res, true);
    return;
  }
  return res.json();
}

export const listConverter = {
  toFirestore: (lst: List) => {
    return JSON.parse(JSON.stringify(lst));
  },
  fromFirestore: (snapshot: any, options: any) => {
    const data = snapshot.data(options);
    return new List(data);
  }
}

export const addListToDatabase = async (lst: List, user: User) => {
  const currentUser = auth?.currentUser;
  const token = currentUser ? await getIdToken(currentUser) : user?.uid;
  const res = await fetch(listsAPI, {
    method: `POST`,
    body: JSON.stringify(lst),
    headers: { 
      Authorization: `Bearer ${token}`,
      [`Content-Type`]: `application/json`, 
    },
  });
  if (!res.ok) {
    let message = `Error on Create List (${res.status})`;
    logToast(`Error Adding List to Database ${Tables.lists} - ${message}`, res, true);
    return;
  }
  return res.json();
}

export const updateListInDatabase = async (id: string, updates: Partial<List>) => {
  const currentUser = auth?.currentUser;
  const token = currentUser ? await getIdToken(currentUser) : updates?.uid;
  const res = await fetch(listsAPI + `/` + id, {
    method: `PATCH`,
    body: JSON.stringify(updates),
    headers: { 
      Authorization: `Bearer ${token}`,
      [`Content-Type`]: `application/json`, 
    },
  });
  if (!res.ok) {
    let message = `Error on Update List (${res.status})`;
    logToast(`Error Updating List in Database ${Tables.lists} - ${message}`, res, true);
    return;
  }
  return res.json();
}

export const deleteListFromDatabase = async (lst: List, user: User) => {
  const { date: updated } = getIDParts();
  const currentUser = auth?.currentUser;
  const token = currentUser ? await getIdToken(currentUser) : user?.uid;
  const id = lst?.id;
  const res = await fetch(listsAPI + `/` + id, {
    method: `DELETE`,
    body: JSON.stringify({ ...lst, updated }),
    headers: { 
      Authorization: `Bearer ${token}`,
      [`Content-Type`]: `application/json`, 
    },
  });
  if (!res.ok) {
    let message = `Error on Delete List (${res.status})`;
    logToast(`Error Deleting List from Database ${Tables.items} - ${message}`, res, true);
    return;
  }
  return res.json();
}

export const itemConverter = {
  toFirestore: (itm: Item) => {
    return JSON.parse(JSON.stringify(itm));
  },
  fromFirestore: (snapshot: any, options: any) => {
    const data = snapshot.data(options);
    return new Item(data);
  }
}

export const addItemToDatabase = async (itm: Item, user: User) => {
  const currentUser = auth?.currentUser;
  const token = currentUser ? await getIdToken(currentUser) : user?.uid;
  const res = await fetch(itemsAPI, {
    method: `POST`,
    body: JSON.stringify(itm),
    headers: { 
      Authorization: `Bearer ${token}`,
      [`Content-Type`]: `application/json`, 
    },
  });
  if (!res.ok) {
    let message = `Error on Create Item (${res.status})`;
    logToast(`Error Adding Item to Database ${Tables.items} - ${message}`, res, true);
    return;
  }
  return res.json();
}

export const deleteItemFromDatabase = async (itm: Item, user: User) => {
  const currentUser = auth?.currentUser;
  const token = currentUser ? await getIdToken(currentUser) : user?.uid;
  const res = await fetch(itemsAPI, {
    method: `DELETE`,
    body: JSON.stringify(itm),
    headers: { 
      Authorization: `Bearer ${token}`,
      [`Content-Type`]: `application/json`, 
    },
  });
  if (!res.ok) {
    let message = `Error on Delete Item (${res.status})`;
    logToast(`Error Deleting Item from Database ${Tables.items} - ${message}`, res, true);
    return;
  }
  return res.json();
}

export const taskConverter = {
  toFirestore: (tsk: Task) => {
    return JSON.parse(JSON.stringify(tsk));
  },
  fromFirestore: (snapshot: any, options: any) => {
    const data = snapshot.data(options);
    return new Task(data);
  }
}