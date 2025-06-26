'use client';

import './autocomplete.scss';

import * as React from 'react';
import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import useAutocomplete from '@mui/material/useAutocomplete';
import { capWords, devEnv } from '@/shared/scripts/constants';
import { movies } from '@/shared/server/database/samples/movies/movies';

export class AutoCompleteOption {
    [key: string]: any;
    id: string = ``;
    label: string = ``;
    value: string = ``;
    year: number = 9999;
    constructor(data: Partial<AutoCompleteOption>) {
        Object.assign(this, data);
    }
}

export class AutoCompleteProps {
    [key: string]: any;
    type?: string = `movies`;
    options?: AutoCompleteOption[] = movies;
    constructor(data: Partial<AutoCompleteProps>) {
        Object.assign(this, data);
    }
}

export default function AutoComplete(props: AutoCompleteProps) {
    const { type = `movies`, options = movies } = props;
    const [selectedOptions, setSelectedOptions] = useState<AutoCompleteOption[]>([]);
    const {
        focused,
        getTagProps,
        setAnchorEl,
        getRootProps,
        getInputProps,
        groupedOptions,
        getOptionProps,
        getListboxProps,
        getInputLabelProps,
    } = useAutocomplete({
        options,
        multiple: true,
        value: selectedOptions,
        id: `autoComplete_${type}`,
        onChange: (e, val: any) => onAutoCompleteChange(e, val),
        getOptionLabel: (option: AutoCompleteOption) => option.label,
        isOptionEqualToValue: (option, value) => option.id === value.id,
    });

    const onAutoCompleteChange = (e: any, selectedOpts: AutoCompleteOption[]) => {
        devEnv && console.log(`onAutoCompleteChange`, {e, selectedOpts});
        setSelectedOptions(selectedOpts);
    }

    return (
        <div className={`autocomplete-root`} {...getRootProps()}>
            <label className={`autocomplete-label`} {...getInputLabelProps()}>
                Select {capWords(type)}
            </label>
            <div ref={setAnchorEl} className={`autocomplete-input-wrapper ${focused ? `focused` : ``}`} >
                {selectedOptions.map((option: AutoCompleteOption, index) => {
                    const tagProps = getTagProps({ index });
                    const { key, onDelete, ...rest } = tagProps;
                    return (
                        <div id={`autocomplete-tag_${option?.id}`} key={option.id} className={`autocomplete-tag`} {...rest}>
                            <span>{option.label}</span>
                            <CloseIcon fontSize={`small`} onClick={onDelete} />
                        </div>
                    )
                })}
                <input placeholder={selectedOptions?.length > 0 ? `` : `Select ${capWords(type)}`} className={`autocomplete-input`} {...getInputProps()} />
            </div>
            {groupedOptions.length > 0 && (
                <ul className={`autocomplete-listbox`} {...getListboxProps()}>
                    {groupedOptions.map((option: AutoCompleteOption, index) => {
                        const optionProps = getOptionProps({ option, index });
                        const { key, ...rest } = optionProps;
                        return (
                            <li id={`autocomplete-option_${option?.id}`} key={option?.id} className={`autocomplete-option`} {...rest}>
                                <span>{option.label}</span>
                                <CheckIcon fontSize={`small`} />
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    );
}