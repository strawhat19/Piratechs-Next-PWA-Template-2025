import { toast } from 'react-toastify';
import { NextResponse } from 'next/server';
import { Roles, Types } from '../types/types';

export const constants = {
  breakpoints: {
    xsDevice: 435,
    smallPhone: 678,
    mobile: 768,
    tabletSmall: 875,
    tablet: 992,
    tabletMed: 1045,
    tabletLarge: 1092,
    notebook: 1200,
    laptop: 1366,
    smallpc: 1500,
    pc: 1540,
    computer: 1600,
    desktop: 1920,
  },
  titles: {
    default:  `Next PWA`,
    extended: `Next PWA`,
  },
  fonts: {
    sansSerif: {
      plusJakartaSans: `Plus Jakarta Sans`,
    }
  },
  images: {
    icons: {
      // logo: `icon-512x512.png`,
      // logo: `assets/icons/ico.svg`,
      logo: `assets/icons/Piratechs-Icon-Blue-Neon.svg`,
    },
    logos: {
      Alpaca: `assets/logos/svgs/Alpaca.svg`,
      Robinhood: `assets/logos/svgs/Robinhood.svg`,
    }
  },
}

export const apiRoutes = {
  users: {
    url: `/api/users`,
  },
  boards: {
    url: `/api/boards`,
  },
  lists: {
    url: `/api/lists`,
  },
  items: {
    url: `/api/items`,
  },
  stocks: {
    url: `/api/stocks`,
    routes: {
      orders: `/api/stocks/orders`,
      account: `/api/stocks/account`,
      positions: `/api/stocks/positions`,
      robinhood: `/api/stocks/robinhood`,
      robinhoodLogin: `/api/stocks/robinhood/login`,
      robinhoodStocks: `/api/stocks/robinhood/stocks`,
      robinhoodLoginOfficial: `https://api.robinhood.com/oauth2/token/`,
    }
  }
}

export const average = (numbers: (number | null | undefined)[]): number => {
  const valid = numbers.filter((n): n is number => typeof n === 'number' && !isNaN(n));
  if (valid.length === 0) return 0;
  const avg = valid.reduce((sum, n) => sum + n, 0) / valid.length;
  return avg;
}

export const isOdd = (number: number) => number % 2 != 0;
export const isEven = (number: number) => number % 2 == 0;
export const randomNumber = (max: number): number => Math.floor(Math.random() * max);
export const getRandomArrayIndex = (array: any[]) => Math.floor(Math.random() * array.length);
export const getRandomArrayValue = (array: any[]) => array[getRandomArrayIndex(array)];
export const arraySum = (arr: number[]): number => arr.reduce((total, val) => total + Number(val), 0);
export const capWords = (str: string) => str.replace(/\b\w/g, (match: string) => match.toUpperCase());
export const is_valid_date_time_str = (date_time_str: Date | string | null) => !isNaN(Date.parse(String(date_time_str)));
export const arraysMatch = (a: string[], b: string[]): boolean => a.length === b.length && a.every((val, idx) => val === b[idx]);
export const normalizeDateString = (dateStr: string) => !dateStr ? null : dateStr.replace(` `, `T`).replace(/\.(\d{3})\d+/, `.$1`);
export const stringNoSpaces = (string: string) => string?.replaceAll(/[\s,:/]/g, `_`)?.replaceAll(/[\s,:/]/g, `-`).replaceAll(/-/g, `_`);
export const isObject = (possibleObj: any) => possibleObj != null && typeof possibleObj === `object` && Object.keys(possibleObj)?.length > 0;

export const isInStandaloneMode = () => {
  if (typeof window === `undefined`) return false;
  return window.matchMedia(`(display-mode: standalone)`).matches;
}

export const isDate = (str: string): boolean => {
  const timestamp = Date.parse(str);
  return !isNaN(timestamp);
}

export const unauthorized = (req: Request, returnResponse: boolean = true, message: string = `Unauthorized`) => {
  if (returnResponse) {
    return NextResponse.json({ code: 401, error: message }, { status: 401 });
  }
  return null;
}

export const isMarketOpen = (): boolean => {
  const now = new Date();
  // Convert to New York time
  const nyTime = new Date(
    now.toLocaleString(`en-US`, { timeZone: `America/New_York` })
  );
  const hours = nyTime.getHours();
  const minutes = nyTime.getMinutes();
  const day = nyTime.getDay(); // 0 = Sunday, 6 = Saturday
  // Weekend check
  if (day === 0 || day === 6) return false;
  const currentMinutes = hours * 60 + minutes;
  const marketOpen = 9 * 60 + 30;  // 9:30 AM
  const marketClose = 16 * 60;     // 4:00 PM
  return currentMinutes >= marketOpen && currentMinutes < marketClose;
};

export const tokenRequired = (req: Request, returnResponse: boolean = true) => {
  const authHeader = req.headers.get(`authorization`) || req.headers.get(`Authorization`);
  if (!authHeader?.startsWith(`Bearer `)) return unauthorized(req, returnResponse, `Missing Bearer Token`);
  const token = authHeader.slice(`Bearer `.length).trim();
  if (!token) return unauthorized(req, returnResponse);
  return { token, header: authHeader };
}

export const errorToast = (errorMessage: string, data: any, duration: number = 5_000, type: `warn` | `error` = `error`) => {
  console.log(errorMessage, data);
  toast?.[type]?.(errorMessage, { autoClose: duration });
}

export const withinXSeconds = (datetime: Date | string, seconds: number = 1) => {
  // let now_dt = new Date()?.toLocaleString();
  let datetime_time = new Date(datetime)?.getTime();
  if (isNaN(datetime_time)) return false;
  let now = Date.now();
  let difference = Math.abs(now - datetime_time);
  let isWithinXSeconds = difference <= (seconds * 1000);
  // console.log({ now: now_dt, datetime });
  return isWithinXSeconds;
}

export const overWriteObject = (a: any = {}, b: any = {}) =>
  Object.keys(a).reduce((acc, key) => {
      acc[key] = key in b ? b[key] : a[key];
      return acc;
  }, {} as any);

export const sortArrayAlphabeticallyByName = (arrayWithObjectNames: any[] = [], toLowerCased: boolean = false): any[] => {
  let sortedArrayWithObjectIDs = arrayWithObjectNames;
  if (arrayWithObjectNames?.length > 0 && arrayWithObjectNames?.[0]?.name && typeof arrayWithObjectNames?.[0]?.name == `string`) {
    sortedArrayWithObjectIDs = sortedArrayWithObjectIDs?.sort((a, b) => {
      if (toLowerCased) {
          return a?.name?.toLowerCae()?.localeCompare(b?.name?.toLowerCase());
      } else return a?.name?.localeCompare(b?.name);
    });
  }
  return sortedArrayWithObjectIDs;
}

export const sortArrayAlphabeticallyByObjectNameKeys = (arrayWithObjectNames: any[] = [], toLowerCased: boolean = false): any[] => {
  let objectsDict = {};
  let sortedArrayWithObjectNames = arrayWithObjectNames;
  if (arrayWithObjectNames?.length > 0 && arrayWithObjectNames?.[0]?.id && typeof arrayWithObjectNames?.[0]?.name == `string`) {
    arrayWithObjectNames?.forEach(obj => {
      let objName = toLowerCased ? obj?.name?.toLowerCase() : obj?.name;
      let objKey = stringNoSpaces(objName);
      Object.assign(objectsDict, { 
        [objKey]: obj, 
      });
    });
  }
  if (Object.values(objectsDict)?.length > 0) {
    sortedArrayWithObjectNames = Object.values(objectsDict);
  }
  return sortedArrayWithObjectNames;
}

export const getUniqueArrayByID = (arrayWithObjectIDs: any[] = []): any[] => {
  let objectsDict = {};
  let uniqueArrayWithObjectIDs = arrayWithObjectIDs;
  if (arrayWithObjectIDs?.length > 0 && arrayWithObjectIDs?.[0]?.id && typeof arrayWithObjectIDs?.[0]?.id == `string`) {
    arrayWithObjectIDs?.forEach(obj => {
      Object.assign(objectsDict, { 
        [obj?.id]: obj, 
      });
    });
  }
  if (Object.values(objectsDict)?.length > 0) {
    uniqueArrayWithObjectIDs = Object.values(objectsDict);
  }
  return uniqueArrayWithObjectIDs;
}

export const objectsAreEqual = (obj1: any, obj2: any) => {
  const obj1Keys = Object.keys(obj1);
  const obj2Keys = Object.keys(obj2);
  if (obj1Keys.length !== obj2Keys.length) {
    return false;
  }
  for (const key of obj1Keys) {
    const val1 = obj1[key];
    const val2 = obj2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (areObjects && !objectsAreEqual(val1, val2) || !areObjects && val1 !== val2) {
      return false;
    }
  }
  return JSON.stringify(obj1) == JSON.stringify(obj2);
}

export const getDefaultDateTime = () => {
  let now = new Date();
  let day = now.getDate();
  let hour = now.getHours();
  let minute = now.getMinutes();
  let month = now.getMonth() + 1;
  let xm = hour >= 12 ? `PM` : `AM`;
  let year = now.getFullYear() % 100;
  hour = hour % 12 || 12;
  return {
    time: { xm, hour, minute, },
    date: { day, year, month, },
  };
}

export const parseDateFromStr = (dateStr: string) => {
  let rtn: any = getDefaultDateTime();
  let validDateStr = isDate(dateStr);
  if (validDateStr) {
    let [time, xm, date] = dateStr?.split(` `);
    if (xm) rtn.time.xm = xm;
    if (time) {
      let [hour, minute] = time?.split(`:`);
      if (hour) rtn.time.hour = hour;
      if (minute) rtn.time.minute = minute;
    }
    if (date) {
      let [month, day, year] = date?.split(`/`);
      if (month) rtn.date.month = month;
      if (day) rtn.date.day = day;
      if (year) rtn.date.year = year;
    }
  }
  return rtn;
}

export const shuffleArray = (array: any[]): any[] => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

export const logToast = (message: string, content: any, error = false, data: any = null, duration?: any, info?: any) => {
  let props = {};
  let sendMsg = typeof content == `string` ? content : ``;
  if (dev()) {
    if (data != null) console.log(message, content, data);
    else console.log(message, content);
  }
  if (duration) {
    props = { autoClose: duration };
  }
  let toastMsg;
  if (info) {
    toastMsg = toast.info(message + ` ` + sendMsg, props);
  } else {
    if (error == false) {
      toastMsg = toast.success(message + ` ` + sendMsg, props);
    } else {
      toastMsg = toast.error(message + ` ` + sendMsg, props);
    }
  }
  return toastMsg;
}

export const getAPIServerData = async (APIServerRoute = apiRoutes.stocks.url, queryParams = ``, withErrorToast: boolean = false) => {
  let APIServerRouteResult: any = {};
  try {
    let APIServerRouteResponse = await fetch(APIServerRoute + queryParams);
    if (APIServerRouteResponse) {
      APIServerRouteResult = await APIServerRouteResponse?.json();
      return APIServerRouteResult;
    }
  } catch (errorOnGetAPIServerData) {
    APIServerRouteResult = errorOnGetAPIServerData;
    let errorMessage = `Error on Get ${APIServerRoute}`;
    console.log(errorMessage, errorOnGetAPIServerData);
    if (withErrorToast) errorToast(errorMessage, errorOnGetAPIServerData);
    return APIServerRouteResult;
  }
}

export const generateArray = (length: number, itemData: any, includeIndexData = false, Model: any = undefined): any[] => {
  let generatedArray: any[] = [];
  if (!length || typeof length != `number` || length == 0) return generatedArray;
  generatedArray = Array.from({ length }, (_, index) => {
    if (includeIndexData) {
      let number = index + 1;
      let name = `${itemData?.type ?? Types.Data} ${number}`;
      let id = stringNoSpaces(name);
      let baseObj = { ...itemData, id, name, number };
      let modelObj = new Model(baseObj);
      // let updatedModelObj = new Model({ ...modelObj, id: id + `_` + modelObj?.uuid });
      let obj = Model ? modelObj : baseObj;
      return obj;
    } else {
      return itemData;
    }
  });
  return generatedArray;
}

export const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: any;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export const urlHostMatches = (envs: string[]) => {
  let hostMatched = false;
  let windowEnabled = typeof window !== `undefined`;
  if (windowEnabled) {
    hostMatched = envs.some(env => window?.location?.host?.includes(env));
  }
  return hostMatched;
}

export const getRealStocks = true;
export const development = process?.env?.NODE_ENV == `development`;
export const devEnv = urlHostMatches([`local`, `:3000`]) || development;

export const dev = (item?: any, source?: any) => {
  if (item) {
    console.log(`Dev Log`, item);
  } else if (item && source) {
    console.log(`Dev Log`, item, `From`, source);
  }
  return devEnv;
}

// Check if Item is Not Null, Not Undefined, Not a Zero Value, etc.
export const isValid = (item: any) => {
  if (typeof item == `string`) {
    let isInvalidString = !item || item == `` || item.trim() == `` || item == undefined || item == null;
    return !isInvalidString;
  } else if (typeof item == `number`) {
    let isInvalidNumber = isNaN(item) || item == undefined || item == null;
    return !isInvalidNumber;
  } else if (typeof item == `object` && item != undefined && item != null) {
    let isInvalidObject = Object.keys(item).length == 0 || item == undefined || item == null;
    return !isInvalidObject;
  } else {
    let isUndefined = item == undefined || item == null;
    return !isUndefined;
  }
}

export const minRole = (roleOfUser: Roles, minimumRole: Roles): boolean => {
  const roleHierarchy: Roles[] = Object.values(Roles);
  const userIndex = roleHierarchy.indexOf(roleOfUser);
  const minIndex = roleHierarchy.indexOf(minimumRole);
  return userIndex >= minIndex;
}

export const generateID = () => {
  let id = Math.random().toString(36).substr(2, 9);
  return Array.from(id).map(char => {
    return Math.random() > 0.5 ? char.toUpperCase() : char;
  }).join(``);
}

export const getIDParts = () => {
  let uuid = generateID();
  let date = customDate()?.datetime;
  return { uuid, date };
}

export const genID = (type: Types = Types.Data, number = 1, name: string) => {
  let { uuid, date } = getIDParts();
  let generatedUUID = uuid;
  let title = `${type} ${number} ${name}`;
  let idTitle = `${title} ${uuid}`;
  let id_Title = stringNoSpaces(idTitle);
  let idString = `${title} ${stringNoSpaces(date)} ${uuid}`;
  let id = stringNoSpaces(idString);
  return { id, date, uuid, title, id_Title, generatedUUID };
}

export const findHighestNumberInArrayByKey = async ( arrayOfObjects: any[], key: string ): Promise<number> => {
  try {
    const filteredNumbers = arrayOfObjects
      .map(obj => obj[key])
      .filter(value => typeof value === `number`);
    if (filteredNumbers.length === 0) return 0;
    const highestNumber = Math.max(...filteredNumbers) ?? 0;
    return highestNumber;
  } catch (error) {
    console.log(`Error while finding the highest number for key "${key}"`, error);
    return 0;
  }
}

export const countPropertiesInObject = (obj: any) => {
  let count = 0;
  if (typeof obj === `object` && obj !== null) {
    for (const key in obj) {
      count++;
      count += countPropertiesInObject(obj[key]);
    }
    if (Array.isArray(obj)) {
      obj.forEach(item => {
        count += countPropertiesInObject(item);
      });
    }
  }
  return count;
}

export const customDate = (date: Date = new Date()) => {
  let hours = date.getHours();
  let ampm = hours >= 12 ? `PM` : `AM`;
  let minutes: string | number = date.getMinutes();

  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? `0` + minutes : minutes;

  let time = hours + `:` + minutes + ` ` + ampm;
  let dateSlashes = (slice: number = 0) => (date.getMonth() + 1) + `/` + date.getDate() + `/` + String(date.getFullYear()).slice(slice);

  let milliseconds = date.getMilliseconds();
  let seconds = String(milliseconds * 1000)?.slice(0, 2);
  let ms = Math.round(milliseconds / 10).toString().padStart(2, `0`);

  let secondsTime = `${hours}:${minutes}:${seconds} ${ampm}`;
  let update = `${secondsTime} ${dateSlashes(2)}`;

  let datesObject = {
    ms,
    ampm,
    time,
    hours,
    update,
    minutes,
    seconds,
    secondsTime,
    milliseconds,
    date: dateSlashes(),
    datetime: time + ` ` + dateSlashes(2),
  }

  return datesObject;
}