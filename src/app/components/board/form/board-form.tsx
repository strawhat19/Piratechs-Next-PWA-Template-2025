import { useContext } from 'react';
import { Button, Tooltip } from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { StateGlobals } from '@/shared/global-context';

export default function BoardForm({ 
    onClick, 
    boardSearch = false,
    newBoardForm = false,
    showIconButton = true,
}: any) {    
    const { width, boardItems, boardForm, setBoardForm } = useContext<any>(StateGlobals);

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
        <div className={`formRow boardListFormContainer boardFormContainer ${newBoardForm ? `newBoardForm` : ``}`}>
            <form className={`boardListForm boardForm boardFormField`} onInput={(e) => updateForm(e)} onSubmit={(e) => onItemFormSubmit(e)}>
                {boardSearch ? <>
                    <input name={`search`} type={`search`} className={`searchField`} placeholder={`Search...`} required />
                </> : <>
                    <input name={`name`} type={`text`} className={`nameField`} placeholder={`Name`} required />
                    {!newBoardForm && <>
                        <input name={`description`} type={`text`} className={`descriptionField`} placeholder={`Description`} />
                        <input name={`imageURL`} type={`url`} className={`imageURLField`} placeholder={`Image URL`} />
                    </>}
                </>}
                {(showIconButton && (!boardSearch || (boardSearch && width > 768))) && (
                    <Tooltip placement={`top`} title={boardSearch ? `` : `+ Add Item #${boardItems.length + 1}`} arrow>
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
                            {boardSearch ? <Search style={{ fontSize: 20 }} /> : <Add style={{ fontSize: 20 }} />}
                        </Button>   
                    </Tooltip>
                )}
            </form>
        </div>
    )
}