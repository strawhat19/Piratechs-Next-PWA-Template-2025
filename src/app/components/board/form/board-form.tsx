import { useContext } from 'react';
import { Button } from '@mui/material';
import { State } from '../../container/container';

export default function BoardForm({ onClick }: any) {    
    const { boardForm, setBoardForm } = useContext<any>(State);

    const updateForm = (e: any) => {
        const formField = e?.target;
        setBoardForm((prevFormData: any) => ({ ...prevFormData, [formField?.name]: formField?.value }));
    }

    const onItemFormSubmit = (e: any) => {
        e?.preventDefault();
        const form = e?.target;
        const formData = new FormData(form);
        const formValues: any = Object.fromEntries(formData?.entries());
        setBoardForm(formValues);
    }

    return (
        <div className={`formRow boardListFormContainer boardFormContainer`} style={{ width: `95%`, padding: `10px 16px`, margin: `0 auto` }}>
            <form className={`boardListForm boardForm boardFormField`} onInput={(e) => updateForm(e)} onSubmit={(e) => onItemFormSubmit(e)}>
                <input name={`name`} type={`text`} className={`nameField`} placeholder={`Name`} style={{ maxHeight: 45, maxWidth: 300 }} required />
                <input name={`description`} type={`text`} className={`descriptionField`} placeholder={`Description`} style={{ maxHeight: 45 }} />
                <input name={`imageURL`} type={`url`} className={`imageURLField`} placeholder={`Image URL`} style={{ maxHeight: 45 }} />
                <Button
                    type={`submit`}
                    onClick={onClick}
                    disabled={boardForm?.name == ``}
                    className={`fontI boardFormField`}
                    style={{
                        width: `100%`,
                        maxWidth: `fit-content`,
                        padding: `10px 14px`, borderRadius: 8, border: `0px solid #444`,
                        background: `black`, color: `inherit`, cursor: `pointer`,
                        position: `relative`, top: 4,
                    }}
                >
                    Add
                </Button>
            </form>
        </div>
    )
}