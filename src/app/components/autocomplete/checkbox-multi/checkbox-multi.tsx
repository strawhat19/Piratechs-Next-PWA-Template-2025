import './checkbox-multi.scss';

// import Img from '../../image/image';
import { AutoCompleteOption } from '../autocomplete';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Autocomplete, Checkbox, TextField } from '@mui/material';
import { movies } from '@/shared/server/database/samples/movies/movies';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

const checkedIcon = <CheckBoxIcon fontSize={`small`} />;
const icon = <CheckBoxOutlineBlankIcon fontSize={`small`} />;

export default function CheckboxMulti() {
    return (
        <Autocomplete
            multiple
            options={movies}
            className={`w100`}
            disableCloseOnSelect
            id={`checkbox-multi`}
            getOptionLabel={(option: AutoCompleteOption) => option.label}
            renderInput={(params) => (
                <TextField {...params} label={`Checkboxes`} placeholder={`Favorites`} />
            )}
            renderOption={(props, option: AutoCompleteOption, { selected }) => {
                const { key, ...optionProps } = props;
                return (
                    <li key={option?.id} {...optionProps}>
                        <Checkbox
                            icon={icon}
                            checked={selected}
                            checkedIcon={checkedIcon}
                            style={{ marginRight: 5 }}
                        />
                        {option.emojis[0]}
                        {/* <Img src={option.image} alt={option.label} className={`autocomplete-poster`} width={100} height={150} /> */}
                        <span style={{ color: `black`, marginLeft: 8}}>
                            {option.label}
                        </span>
                    </li>
                );
            }}
        />
    );
}