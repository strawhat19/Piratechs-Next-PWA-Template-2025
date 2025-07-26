'use client';

import './checkbox-multi.scss';

import Img from '../../image/image';
import { Cancel } from '@mui/icons-material';
import Stock from '../../stocks/stock/stock';
import { useContext, useState } from 'react';
import IconText from '../../icon-text/icon-text';
import { State } from '../../container/container';
import { AutoCompleteOption } from '../autocomplete';
import { constants } from '@/shared/scripts/constants';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { movies } from '@/shared/server/database/samples/movies/movies';
import { Autocomplete, Checkbox, IconButton, TextField } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

const checkedIcon = <CheckBoxIcon fontSize={`small`} />;
const icon = <CheckBoxOutlineBlankIcon fontSize={`small`} />;

export default function CheckboxMulti({
    optionsToUse = movies,
    placeholder = `Movies`,
}) {
    const { width, loaded } = useContext<any>(State);
    const [options, ] = useState<AutoCompleteOption[]>(optionsToUse);
    const [selectedOptions, setSelectedOptions] = useState<AutoCompleteOption[]>([]);

    const onCheckboxMultiChange = (e: any, selectedOpts: AutoCompleteOption[]) => {
        setSelectedOptions(selectedOpts);
    }

    return (
        <Autocomplete
            multiple
            options={options}
            disableCloseOnSelect
            onChange={(e, selectedOpts: AutoCompleteOption[]) => onCheckboxMultiChange(e, selectedOpts)}
            className={`checkboxMultiComponent w100 ${selectedOptions?.length > 0 ? `hasValue` : `noValue`}`}
            getOptionLabel={(option: AutoCompleteOption) => option?.emojis && option.emojis?.length > 0 ? (
                `${option?.emojis[0]} ${option?.label}`
            ) : option?.type == `Stock` ? (
                `${option?.symbol} ${option?.label} ${option?.ceo} ${option?.employees} ${option?.city} ${option?.state} ${option?.country}`
            ) : option?.label}
            slotProps={options[0]?.type == `Stock` ? {
                paper: {
                    sx: {
                        background: `var(--bg)`,
                    }
                }
            } : {}}
            renderTags={options[0]?.type == `Stock` ? (selected: AutoCompleteOption[], getTagProps) => (
                selected.map((option, index) => {
                    const { key, onDelete, ...tagProps } = getTagProps({ index });
                    return (
                        <div
                            key={option.id}
                            {...tagProps}
                            style={{ background: `var(--bg)`, padding: `3px 0 10px`, borderRadius: 15 }}
                        >
                            <Stock {...option} linkable={false} showCompanyName={width >= constants.breakpoints.mobile}>
                                <IconButton onClick={onDelete} style={{ padding: 0, maxHeight: 30 }}>
                                    <Cancel />
                                </IconButton>
                            </Stock>
                        </div>
                    );
                })
            ) : undefined}
            renderInput={(params) => (
                <TextField 
                    {...params} 
                    label={placeholder} 
                    placeholder={loaded ? placeholder : ``} 
                    className={`checkboxMultiField ${selectedOptions?.length > 0 ? `input_hasValue` : `input_noValue`}`} 
                />
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
                            sx={option?.type == `Stock` ? {
                                color: `white`,
                                [`&.Mui-checked`]: {
                                    color: `white`,
                                },
                            } : {}}
                        />
                        {option?.emojis && option.emojis?.length > 0 ? option?.emojis[0] : (
                            option?.image && option?.image != `` ? (
                                option?.type == `Stock` ? (
                                    <Stock {...option} linkable={false} showCompanyName={width >= constants.breakpoints.mobile} />
                                ) : (
                                    <Img 
                                        height={25} 
                                        width={`auto`} 
                                        src={option?.image} 
                                        alt={option?.label} 
                                        className={`autocomplete-poster`} 
                                    />
                                )
                            ) : <></>
                        )}
                        {option?.type == `Stock` ? <>
                            {width >= constants.breakpoints.mobile && <>
                                <span style={{ color: `var(--links)` }}> - </span>
                                <span className={`font`} style={{ color: `white`, fontWeight: `bolder`, marginLeft: 8 }}>
                                    {width >= constants.breakpoints.notebook ? `CEO: ` : ``}{option?.ceo && option?.ceo != `` ? option?.ceo : `Unknown`}
                                </span>
                                <span style={{ color: `var(--links)`, marginLeft: 8 }}> - </span>
                                <span className={`font`} style={{ color: `white`, fontWeight: `bolder`, marginLeft: 8 }}>
                                    {width >= constants.breakpoints.notebook ? `Employees: ` : ``}<IconText number={option?.employees} showIcon={false} decimalPlaces={0} />
                                </span>
                                <span style={{ color: `var(--links)`, marginLeft: 8 }}> - </span>
                                <span className={`font`} style={{ color: `white`, fontWeight: `bolder`, marginLeft: 8 }}>
                                    {option?.city ? `${option?.city}` : ``}{option?.state ? `, ${option?.state}` : ``}{width >= constants.breakpoints.notebook ? `, ${option?.country}` : ``}
                                </span>
                            </>}
                        </> : (
                            <span className={`font`} style={{ color: `black`, marginLeft: 8 }}>
                                {option?.label}
                            </span>
                        )}
                    </li>
                );
            }}
        />
    );
}