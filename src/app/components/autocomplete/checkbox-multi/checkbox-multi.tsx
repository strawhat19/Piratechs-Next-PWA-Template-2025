'use client';

import './checkbox-multi.scss';

// import Img from '../../image/image';
import { useContext, useState } from 'react';
import { State } from '../../container/container';
import { AutoCompleteOption } from '../autocomplete';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Autocomplete, Checkbox, TextField } from '@mui/material';
import { movies } from '@/shared/server/database/samples/movies/movies';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

const checkedIcon = <CheckBoxIcon fontSize={`small`} />;
const icon = <CheckBoxOutlineBlankIcon fontSize={`small`} />;

export default function CheckboxMulti() {
    const { loaded } = useContext<any>(State);
    const [selectedOptions, setSelectedOptions] = useState<AutoCompleteOption[]>([]);

    const onCheckboxMultiChange = (e: any, selectedOpts: AutoCompleteOption[]) => {
        console.log(`onCheckboxMultiChange`, selectedOpts);
        setSelectedOptions(selectedOpts);
    }

    return (
        <Autocomplete
            multiple
            options={movies}
            id={`checkboxMulti`}
            disableCloseOnSelect
            getOptionLabel={(option: AutoCompleteOption) => `${option.emojis[0]} ${option.label}`}
            onChange={(e, selectedOpts: AutoCompleteOption[]) => onCheckboxMultiChange(e, selectedOpts)}
            className={`checkboxMultiComponent w100 ${selectedOptions?.length > 0 ? `hasValue` : `noValue`}`}
            renderInput={(params) => (
                <TextField {...params} label={`Checkboxes`} placeholder={loaded ? `Favorites` : ``} className={`checkboxMultiField`} />
            )}
            renderOption={(props, option: AutoCompleteOption, { selected }) => {
                const { key, ...optionProps } = props;
                return (
                    <li key={option?.id} data-option={`checkboxMultiLi`} {...optionProps}>
                        <Checkbox
                            icon={icon}
                            checked={selected}
                            checkedIcon={checkedIcon}
                            style={{ marginRight: 0 }}
                        />
                        {option.emojis[0]}
                        {/* <Img src={option.image} alt={option.label} className={`autocomplete-poster`} width={100} height={150} /> */}
                        <span className={`font`} style={{ color: `black`, marginLeft: 8 }}>
                            {option.label}
                        </span>
                    </li>
                );
            }}
        />
    );
}