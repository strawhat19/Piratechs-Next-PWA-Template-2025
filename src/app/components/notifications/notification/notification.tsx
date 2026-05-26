import { richTextToPlainText } from '../../rich-text/rich-text';

export default function Notification({
    announcement,
    className = `notificationComponentClass`,
}: any) {
    const title = String(announcement?.name || announcement?.title || `Announcement`).trim();
    const description = richTextToPlainText(announcement?.description).trim();
    const details = richTextToPlainText(announcement?.details).trim();
    return (
        <div id={announcement?.id} className={`notificationComponent notificationMenuItemLabel ${className}`}>
            <strong>{title}</strong>
            {description ? <span>{description}</span> : <></>}
            {details ? <small>{details}</small> : <></>}
            <div className={`notificationFooter`}>
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
            </div>
        </div>
    )
}