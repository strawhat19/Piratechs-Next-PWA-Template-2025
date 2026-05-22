import { Data } from './Data';
import { DataSources, Types } from '../types';
import { capWords, countPropertiesInObject, genID, isAppCollectionID, isValid } from '@/shared/scripts/constants';

export enum AnnouncementStatus {
  Draft = `Draft`,
  Active = `Active`,
  Archived = `Archived`,
  Unavailable = `Unavailable`,
}

const defaultType = Types.Announcement;

export class Announcement extends Data {
  [key: string]: any;

  active: boolean = false;
  description?: string = ``;
  type: Types = defaultType;
  icon?: string = `Campaign`;
  dataSource?: DataSources | string = DataSources.firebase;
  metadata?: Record<string, string | number | boolean> = {};
  status: AnnouncementStatus | string = AnnouncementStatus.Draft;

  constructor(data: Partial<Announcement> = {}) {
    const announcementData = data as Partial<Announcement> & Record<string, any>;
    const announcementName = announcementData.name || ``;
    const hasAppAnnouncementID = isAppCollectionID(announcementData?.id, defaultType);
    
    super({
      ...announcementData,
      type: defaultType,
      name: announcementName,
      id: hasAppAnnouncementID ? announcementData?.id : undefined,
      created: announcementData.created ?? announcementData.created_at,
      updated: announcementData.updated ?? announcementData.updated_at,
    });

    const appID = this.id;
    const appUUID = this.uuid;
    const appTitle = this.title;
    Object.assign(this, announcementData);

    if (!hasAppAnnouncementID) {
      this.id = appID;
      this.uuid = appUUID;
      this.title = appTitle;
    }

    if (!isValid(this.name)) this.name = announcementName;
    if (!isValid(this.title)) this.title = this.name;
    if (isValid(announcementData.status)) {
      this.status = capWords(String(announcementData.status));
    } else if (announcementData.active !== undefined) {
      this.status = announcementData.active ? AnnouncementStatus.Active : AnnouncementStatus.Draft;
    }
    if (!isValid(this.status)) this.status = AnnouncementStatus.Draft;
    if (isValid(announcementData.active) && !isValid(announcementData.status)) {
      this.active = Boolean(announcementData.active);
    } else {
      this.active = String(this.status).toLowerCase() == AnnouncementStatus.Active.toLowerCase();
    }
    if (isValid(announcementData.icon)) this.icon = String(announcementData.icon);
    if (!isValid(this.icon)) this.icon = `Campaign`;
    if (!isValid(this.description) && isValid(announcementData.message)) this.description = String(announcementData.message);
    if (!isValid(this.description) && isValid(announcementData.body_html)) this.description = String(announcementData.body_html);
    if (!isValid(this.description) && isValid(announcementData.bodyHTML)) this.description = String(announcementData.bodyHTML);
    if (isValid(announcementData.created_at)) this.created = announcementData.created_at;
    if (isValid(announcementData.updated_at)) this.updated = announcementData.updated_at;
    if (!isValid(this.dataSource)) this.dataSource = DataSources.firebase;
    if (!isValid(this.metadata)) this.metadata = {};
    if (!isValid(this.properties)) this.properties = countPropertiesInObject(this) + 1;
  }
}
