import { useContext } from 'react';
import { Button, Tooltip } from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { StateGlobals } from '@/shared/global-context';

export const defaultBoardForm = { name: ``, description: ``, imageURL: `` };

export default function BoardForm({ 
    onClick, 
    disabled = false,
    autoFocus = false,
    boardSearch = false, 
    newDataForm = false, 
    placeholder = `Name`, 
    showIconButton = true,  
    className = `boardFormComponent`, 
}: any) {    
    const { width, boardItems, boardForm, setBoardForm } = useContext<any>(StateGlobals);

    const submitButtonShowing = () => showIconButton && (!boardSearch || (boardSearch && width > 768));

    const updateForm = (e: any) => {
        const formField = e?.target;
        setBoardForm((prevFormData: any) => ({ ...prevFormData, form: className, [formField?.name]: formField?.value }));
    }

    const isDisabled = () => {
        let isDisabled = false;
        isDisabled = disabled || (!boardSearch && boardForm?.name == ``);
        return isDisabled;
    }

    const onItemFormSubmit = (e: any) => {
        e?.preventDefault();
        const dsbld = isDisabled();
        if (dsbld) return;
        const form = e?.target;
        const formData = new FormData(form);
        const hasSubmitBtn = submitButtonShowing();
        const formValues: any = Object.fromEntries(formData?.entries());
        setBoardForm(formValues);
        if (!hasSubmitBtn) {
            onClick();
        }
        setBoardForm(defaultBoardForm);
        form?.reset();
    }

    return (
        <div className={`formRow boardListFormContainer boardFormContainer ${className} ${newDataForm ? `newDataForm` : ``}`}>
            <form className={`boardListForm boardForm boardFormField`} onInput={(e) => updateForm(e)} onSubmit={(e) => onItemFormSubmit(e)}>
                {boardSearch ? <>
                    <input name={`search`} type={`search`} className={`searchField`} placeholder={`Search...`} autoFocus={autoFocus} required />
                </> : <>
                    <input name={`name`} type={`text`} className={`nameField`} placeholder={placeholder} required />
                    {!newDataForm && <>
                        <input name={`description`} type={`text`} className={`descriptionField`} placeholder={`Description`} />
                        <input name={`imageURL`} type={`url`} className={`imageURLField`} placeholder={`Image URL`} />
                    </>}
                </>}
                {submitButtonShowing() && (
                    <Tooltip placement={`top`} title={(boardSearch || isDisabled()) ? `` : `+ Add Item #${boardItems.length + 1}`} arrow>
                        <Button
                            type={`submit`}
                            onClick={onClick}
                            disabled={isDisabled()}
                            className={`fontI boardFormField ${boardSearch ? `boardSearchButton` : ``} ${isDisabled() ? `disabled` : ``}`}
                            style={{
                                width: `100%`,
                                maxWidth: `fit-content`,
                                padding: `0 7px`, border: `0px solid #444`,
                                background: `black`, color: `inherit`, cursor: `pointer`,
                                position: `relative`, top: 4,
                            }}
                        >
                            {boardSearch ? <Search style={{ fontSize: 20 }} /> : <Add style={{ fontSize: 20 }} />}
                        </Button>   
                    </Tooltip>
                )}
            </form>
        </div>
    )
}