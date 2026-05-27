import { useContext } from 'react';
import { Roles } from '@/shared/types/types';
import { minRole } from '@/shared/scripts/constants';
import { StateGlobals } from '@/shared/global-context';
import { richTextToPlainText } from '../../rich-text/rich-text';

export default function Notification({
    announcement,
    className = `notificationComponentClass`,
}: any) {
    const { user } = useContext<any>(StateGlobals);
    const title = String(announcement?.name || announcement?.title || `Announcement`).trim();
    const description = richTextToPlainText(announcement?.description).trim();
    const details = richTextToPlainText(announcement?.details).trim();
    return (
        <div id={announcement?.id} className={`notificationComponent notificationMenuItemLabel ${className}`}>
            <strong>{title}</strong>
            {description ? <span>{description}</span> : <></>}
            {details ? <small>{details}</small> : <></>}
            <div className={`notificationFooter`}>
                {user != null && minRole(user?.role, Roles.Editor) ? <>
                    <div className={`notificationMeta`}>
                        <small>
                            <i>Cre. {announcement?.created}</i>
                        </small>
                    </div>
                    <div className={`notificationMeta`}>
                        <small>
                            <i>Upd. {announcement?.updated}</i>
                        </small>
                    </div>
                </> : <>
                    <div className={`notificationMeta`} />
                    <div className={`notificationMeta`}>
                        <small>
                            <i>{announcement?.created}</i>
                        </small>
                    </div>
                </>}
            </div>
        </div>
    )
}