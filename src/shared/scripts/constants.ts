import { Roles, Types } from "../types/types";

export const constants = {
    breakpoints: {
        mobile: 768,
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
    },
}

export const capWords = (str: string) => str.replace(/\b\w/g, (match: string) => match.toUpperCase());
export const stringNoSpaces = (string: string) => string?.replaceAll(/[\s,:/]/g, `_`)?.replaceAll(/[\s,:/]/g, `-`).replaceAll(/-/g, `_`);

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

  let seconds = date.getSeconds();
  let milliseconds = date.getMilliseconds();
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
    datetime: time + ` ` + dateSlashes(),
  }

  return datesObject;
}