'use client';

import './checkbox-multi.scss';

import Img from '../../image/image';
import Stock from '../../stocks/stock/stock';
import { useContext, useState } from 'react';
import IconText from '../../icon-text/icon-text';
import { State } from '../../container/container';
import { AutoCompleteOption } from '../autocomplete';
import { constants } from '@/shared/scripts/constants';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Cancel, People, Person } from '@mui/icons-material';
import { movies } from '@/shared/server/database/samples/movies/movies';
import { Autocomplete, Checkbox, IconButton, TextField } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CityStateCountry from '../../locations/city-state-country/city-state-country';

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
            renderInput={(params) => (
                <TextField 
                    {...params} 
                    label={placeholder} 
                    placeholder={loaded ? placeholder : ``} 
                    className={`checkboxMultiField ${selectedOptions?.length > 0 ? `input_hasValue` : `input_noValue`}`} 
                />
            )}
            renderTags={options[0]?.type == `Stock` ? (selected: AutoCompleteOption[], getTagProps) => (
                selected.map((option, index) => {
                    const { key, onDelete, ...tagProps } = getTagProps({ index });
                    return (
                        <div
                            key={option.id}
                            {...tagProps}
                            className={`${tagProps?.className} checkboxMultiTag`}
                            style={{ background: `var(--bg)`, padding: `3px 0 10px`, borderRadius: 15 }}
                        >
                            <Stock {...option} linkable={false} showCompanyName={width >= constants.breakpoints.mobile}>
                                <IconButton className={`checkboxMultiTagDeleteBtn`} onClick={onDelete} style={{ padding: 0, maxHeight: 30 }}>
                                    <Cancel />
                                </IconButton>
                            </Stock>
                        </div>
                    );
                })
            ) : undefined}
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
                                    {width >= constants.breakpoints.notebook ? `Low: ` : ``}<IconText dollarSign number={option?.low} className={`stockSeachResultPrice`} />
                                </span>
                                <span style={{ color: `var(--links)`, marginLeft: 8 }}> - </span>
                                <span className={`font`} style={{ color: `white`, fontWeight: `bolder`, marginLeft: 8 }}>
                                    {width >= constants.breakpoints.notebook ? `High: ` : ``}<IconText dollarSign number={option?.high} className={`stockSeachResultPrice`} />
                                </span>
                                {width >= constants.breakpoints.laptop && <>
                                    <span style={{ color: `var(--links)`, marginLeft: 8 }}> - </span>
                                    <span className={`font`} style={{ color: `white`, fontWeight: `bolder`, marginLeft: 8 }}>
                                        {width >= constants.breakpoints.laptop ? (
                                            <IconText 
                                                icon={<Person style={{ fontSize: 20, color: `var(--links)` }} />} 
                                                text={option?.ceo && option?.ceo != `` ? option?.ceo : `Unknown`} 
                                            />
                                        ) : ``}
                                    </span>
                                    <span style={{ color: `var(--links)`, marginLeft: 8 }}> - </span>
                                    <span className={`font`} style={{ color: `white`, fontWeight: `bolder`, marginLeft: 8 }}>
                                        {width >= constants.breakpoints.laptop ? (
                                            <IconText 
                                                decimalPlaces={0} 
                                                number={option?.employees} 
                                                icon={<People style={{ fontSize: 20, color: `var(--links)` }} />} 
                                            />
                                        ) : ``}
                                    </span>
                                    {width >= constants.breakpoints.computer && <>
                                        <span style={{ color: `var(--links)`, marginLeft: 8 }}> - </span>
                                        <span className={`font`} style={{ color: `white`, fontWeight: `bolder`, marginLeft: 8 }}>
                                            <CityStateCountry {...{ city: option?.city, state: option?.state, country: option?.country }} />
                                        </span>
                                    </>}
                                </>}
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