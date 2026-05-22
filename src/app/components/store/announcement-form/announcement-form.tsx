'use client';

import { toast } from 'react-toastify';
import { Button } from '@mui/material';
import { Close, DoDisturb, OpenInFull, Save } from '@mui/icons-material';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import RichTextEditorField from '@/app/components/rich-text/rich-text';
import { richTextToPlainText } from '@/app/components/rich-text/rich-text';
import { StateGlobals } from '@/shared/global-context';
import { Roles, Types } from '@/shared/types/types';
import { Announcement, AnnouncementStatus } from '@/shared/types/models/Announcement';
import { addAnnouncementToDatabase, updateAnnouncementInDatabase } from '@/shared/server/firebase';
import { capWords, getNextCollectionNumber, minRole } from '@/shared/scripts/constants';
import AnnouncementSelectField, {
    announcementIconColors,
    announcementIconOptions,
    announcementIcons,
    announcementStatusColors,
    announcementStatusIcons,
} from './announcement-select-field';

export const defaultAnnouncementForm = {
    number: 1,
    name: ``,
    description: ``,
    status: AnnouncementStatus.Draft,
    icon: `Campaign`,
};

type AnnouncementFormProps = {
    full?: boolean;
    widget?: boolean;
    formId?: string;
    funsized?: boolean;
    className?: string;
    onClose?: () => void;
    onCancelEdit?: () => void;
    announcement?: Announcement | null;
    onSaved?: (announcement: Announcement) => void;
    onFullEdit?: (announcement: Announcement | null) => void;
};

const comparableFields = [`number`, `name`, `description`, `status`, `icon`] as const;

const getAnnouncementForm = (announcement: Announcement | null | undefined, number: number) => {
    const editing = Boolean(announcement?.id);
    const status = String(announcement?.status || (announcement?.active ? AnnouncementStatus.Active : AnnouncementStatus.Draft) || AnnouncementStatus.Draft);
    return {
        status,
        editing,
        id: announcement?.id,
        title: announcement?.title,
        created: announcement?.created,
        updated: announcement?.updated,
        icon: announcement?.icon || `Campaign`,
        description: announcement?.description || ``,
        number: Number(announcement?.number || number),
        name: announcement?.name || announcement?.title || ``,
    };
};

const getComparableAnnouncementForm = (source: any) => comparableFields.reduce((acc: any, key) => ({
    ...acc,
    [key]: source?.[key] ?? ``,
}), {});

const AnnouncementField = ({ label, funsized = false, showInput = true, ...props }: any) => (
    <label className={`productField`}>
        {!funsized && <span>{label}</span>}
        {showInput && <input placeholder={label} {...props} />}
    </label>
);

export default function AnnouncementForm({
    full = false,
    widget = false,
    className = ``,
    funsized = false,
    onSaved = () => {},
    onClose = undefined,
    announcement = null,
    onFullEdit = undefined,
    onCancelEdit = undefined,
    formId = `announcement-form`,
}: AnnouncementFormProps) {
    const formRef = useRef<HTMLFormElement | null>(null);
    const { user, announcements = [] } = useContext<any>(StateGlobals);
    const canManageAnnouncements = minRole(user?.role, Roles.Administrator);
    const nextAnnouncementNumber = useMemo(() => getNextCollectionNumber(announcements), [announcements]);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(() => getAnnouncementForm(announcement, nextAnnouncementNumber));
    const formValueRef = useRef<any>(getAnnouncementForm(announcement, nextAnnouncementNumber));
    const compact = widget || !full;

    const setFormValue = (nextForm: any) => {
        const resolvedForm = typeof nextForm == `function`
            ? nextForm(formValueRef.current || form)
            : nextForm;
        formValueRef.current = resolvedForm;
        setForm(resolvedForm);
        return resolvedForm;
    };

    useEffect(() => {
        const nextForm = getAnnouncementForm(announcement, nextAnnouncementNumber);
        formValueRef.current = nextForm;
        setForm(nextForm);
    }, [
        announcement?.description,
        announcement?.id,
        announcement?.name,
        announcement?.number,
        announcement?.status,
        announcement?.icon,
        announcement?.active,
        nextAnnouncementNumber,
    ]);

    const updateFormValue = (name: string, value: any) => {
        setFormValue((prevFormData: any) => ({ ...prevFormData, [name]: value }));
    };

    const updateForm = (e: any) => {
        const formField = e?.target;
        if (!formField?.name) return;
        const nextValue = formField?.type == `checkbox` ? formField?.checked : formField?.value;
        updateFormValue(formField?.name, nextValue);
    };

    const isFormDirty = () => {
        const currentComparable = JSON.stringify(getComparableAnnouncementForm(form));
        const initialComparable = JSON.stringify(getComparableAnnouncementForm(getAnnouncementForm(announcement, nextAnnouncementNumber)));
        return currentComparable != initialComparable;
    };

    const clearAnnouncementForm = () => {
        const nextForm = getAnnouncementForm(null, nextAnnouncementNumber);
        formValueRef.current = nextForm;
        setForm(nextForm);
        formRef.current?.reset?.();
    };

    const saveAnnouncement = async (e?: any) => {
        e?.preventDefault?.();
        if (!canManageAnnouncements || saving) return;
        const currentForm = formValueRef.current || form;
        const safeName = capWords(String(currentForm?.name || ``).trim() || `Announcement ${currentForm?.number || nextAnnouncementNumber}`);
        const number = Number(currentForm?.number || nextAnnouncementNumber);
        const status = String(currentForm?.status || AnnouncementStatus.Draft);
        const icon = String(currentForm?.icon || `Campaign`);
        const announcementToSave = {
            ...(announcement || {}),
            ...currentForm,
            icon,
            status,
            number,
            name: safeName,
            active: status == AnnouncementStatus.Active,
            description: currentForm?.description || ``,
        };
        const safeAnnouncementToSave = JSON.parse(JSON.stringify(announcementToSave));
        const announcementModel = new Announcement(safeAnnouncementToSave);
        try {
            setSaving(true);
            const savedAnnouncement = announcement?.id
                ? await updateAnnouncementInDatabase(String(announcement?.id), safeAnnouncementToSave)
                : await addAnnouncementToDatabase(announcementModel);
            toast.success(announcement?.id ? `Announcement Updated` : `Announcement Added`);
            onSaved(savedAnnouncement as Announcement);
            if (!announcement?.id) clearAnnouncementForm();
            if (announcement?.id) onCancelEdit?.();
        } catch (error) {
            toast.error(`Announcement Save Failed`);
            console.error(`Announcement Save Failed`, error);
        } finally {
            setSaving(false);
        }
    };

    if (!canManageAnnouncements) return compact ? null : (
        <div className={`productFormRestricted`}>
            Announcement Form Restricted
        </div>
    );

    const actionDisabled = saving || !String(form?.name || ``).trim() || !isFormDirty();
    const showWidgetDirtyActions = !(widget && funsized) || isFormDirty();

    return (
        <div className={`productFormContainer ${className} ${funsized ? `funsized` : ``} ${compact ? `productFormWidget` : `productFormFull`} ${announcement?.id ? `productFormEditing pulsate` : ``}`}>
            <form ref={formRef} id={formId} onSubmit={saveAnnouncement}>
                <div className={`productFormHeader ${showWidgetDirtyActions ? `dirtied` : `notDirtied`}`}>
                    {!funsized && (
                        <div className={`productFormTitle`}>
                            <h3>
                                {announcement?.id ? `Editing Announcement #${form?.number} "${form?.name}"` : (
                                    compact ? `Create Announcement (${form?.number})` : `Announcement Form`
                                )}
                            </h3>
                            {!compact ? (
                                <p>Messages here flow to the store ticker.</p>
                            ) : <></>}
                        </div>
                    )}
                    <div className={`productFormActions`}>
                        {announcement?.id && onCancelEdit && compact ? (
                            <Button type={`button`} className={`productFormButton productCancelButton`} onClick={onCancelEdit}>
                                <Close fontSize={`small`} /> Cancel
                            </Button>
                        ) : <></>}
                        {showWidgetDirtyActions ? <>
                            <Button
                                type={`submit`}
                                disabled={actionDisabled}
                                className={`productFormButton productSaveButton ${actionDisabled ? `disabled` : ``}`}
                            >
                                <Save fontSize={`small`} /> {saving ? `Saving` : `Save`}
                            </Button>
                            {announcement == null ? (
                                <Button
                                    type={`button`}
                                    disabled={actionDisabled}
                                    onClick={clearAnnouncementForm}
                                    className={`productFormButton productCancelButton ${actionDisabled ? `disabled` : ``}`}
                                >
                                    <DoDisturb fontSize={`small`} /> Cancel
                                </Button>
                            ) : <></>}
                            {announcement?.id && onFullEdit ? (
                                <Button
                                    type={`button`}
                                    className={`productFormButton`}
                                    onClick={() => onFullEdit(new Announcement({ ...(announcement || {}), ...formValueRef.current, name: formValueRef.current?.name || announcement?.name || Types.Announcement }))}
                                >
                                    <OpenInFull fontSize={`small`} /> Full
                                </Button>
                            ) : <></>}
                        </> : <></>}
                    </div>
                </div>

                {compact ? (
                    <div className={`productFormGrid productTextGrid`}>
                        <AnnouncementField 
                            required 
                            name={`name`} 
                            type={`text`} 
                            value={form?.name} 
                            funsized={funsized} 
                            onChange={updateForm} 
                            label={`Announcement Title`} 
                        />
                        <AnnouncementField 
                            type={`text`} 
                            label={`Message`} 
                            funsized={funsized} 
                            name={`description`} 
                            onChange={updateForm} 
                            value={richTextToPlainText(form?.description) || form?.description} 
                        />
                    </div>
                ) : (
                    <div className={`productFormGrid`}>
                        <AnnouncementField 
                            disabled={true} 
                            name={`number`} 
                            type={`number`} 
                            label={`Number`} 
                            funsized={funsized} 
                            value={form?.number} 
                            onChange={updateForm} 
                        />
                        <AnnouncementField 
                            required 
                            name={`name`} 
                            type={`text`} 
                            value={form?.name} 
                            funsized={funsized} 
                            onChange={updateForm} 
                            label={`Announcement Title`} 
                        />
                        <AnnouncementSelectField
                            search={false}
                            label={`Status`}
                            value={form?.status}
                            showLabel={!funsized}
                            icons={announcementStatusIcons}
                            colors={announcementStatusColors}
                            className={`announcementStatusSelectField`}
                            options={Object.values(AnnouncementStatus)}
                            onChange={(value: string) => updateFormValue(`status`, value)}
                        />
                        <AnnouncementSelectField
                            search={false}
                            label={`Icon`}
                            value={form?.icon}
                            showLabel={!funsized}
                            icons={announcementIcons}
                            colors={announcementIconColors}
                            options={announcementIconOptions}
                            className={`announcementIconSelectField`}
                            onChange={(value: string) => updateFormValue(`icon`, value)}
                        />
                </div>
                )}

                {!compact ? (
                    <div className={`productFormGrid productTextGrid`}>
                        <RichTextEditorField
                            minHeight={220}
                            label={`Message`}
                            value={form?.description}
                            className={`productTextAreaField announcementTextAreaField`}
                            onChange={(value: string) => updateFormValue(`description`, value)}
                        />
                    </div>
                ) : <></>}
            </form>
        </div>
    );
}
