export const constants = {
    titles: {
        default:  `Next PWA`,
        extended: `Next PWA w/ Typescript & Sass`,
    },
    fonts: {
        sansSerif: {
            plusJakartaSans: `Plus Jakarta Sans`,
        }
    },
    images: {
        icons: {
            logo: `icon-512x512.png`,
            // logo: `assets/icons/ico.svg`,
        },
    },
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