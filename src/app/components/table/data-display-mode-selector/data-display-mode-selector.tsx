'use client';

import Selector from '../../selector/selector';
import { GridView, TableRows } from '@mui/icons-material';
import { DataDisplayModes } from '@/shared/types/types';

type DataDisplayModeSelectorProps = {
    className?: string;
    value?: DataDisplayModes;
    onChange?: (mode: DataDisplayModes) => void;
};

const dataDisplayModeOptions = [
    {
        label: DataDisplayModes.Table,
        value: DataDisplayModes.Table,
        icon: <TableRows style={{ fontSize: 16 }} />,
    },
    {
        label: DataDisplayModes.Grid,
        value: DataDisplayModes.Grid,
        icon: <GridView style={{ fontSize: 16 }} />,
    },
];

export default function DataDisplayModeSelector({
    value = DataDisplayModes.Table,
    className = ``,
    onChange = () => {},
}: DataDisplayModeSelectorProps) {
    return (
        <Selector
            value={value}
            customColors={false}
            options={dataDisplayModeOptions}
            className={`dataDisplayModeSelector ${className}`.trim()}
            ariaLabel={`Data Display Mode`}
            onChange={(nextMode) => onChange(nextMode as DataDisplayModes)}
        />
    );
}
