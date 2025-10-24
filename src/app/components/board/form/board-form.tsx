import { useContext } from 'react';
import { Add } from '@mui/icons-material';
import { Button, Tooltip } from '@mui/material';
import { StateGlobals } from '@/shared/global-context';

export default function BoardForm({ onClick }: any) {    
    const { boardItems, boardForm, setBoardForm } = useContext<any>(StateGlobals);

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
        form?.reset();
    }

    return (
        <div className={`formRow boardListFormContainer boardFormContainer`}>
            <form className={`boardListForm boardForm boardFormField`} onInput={(e) => updateForm(e)} onSubmit={(e) => onItemFormSubmit(e)}>
                <input name={`name`} type={`text`} className={`nameField`} placeholder={`Name`} required />
                <input name={`description`} type={`text`} className={`descriptionField`} placeholder={`Description`} />
                <input name={`imageURL`} type={`url`} className={`imageURLField`} placeholder={`Image URL`} />
                <Tooltip placement={`top`} title={`+ Add Item #${boardItems.length + 1}`} arrow>
                    <Button
                        type={`submit`}
                        onClick={onClick}
                        disabled={boardForm?.name == ``}
                        className={`fontI boardFormField ${boardForm?.name == `` ? `disabled` : ``}`}
                        style={{
                            width: `100%`,
                            maxWidth: `fit-content`,
                            padding: `0 7px`, border: `0px solid #444`,
                            background: `black`, color: `inherit`, cursor: `pointer`,
                            position: `relative`, top: 4,
                        }}
                    >
                        <Add style={{ fontSize: 20 }} />
                    </Button>   
                </Tooltip>
            </form>
        </div>
    )
}