import Icon_Button from '../../buttons/icon-button/icon-button';
import { Add, DoDisturb, Remove, Save } from '@mui/icons-material';

const blockENotation = (event: any) => {
    if ([`e`, `E`, `+`, `-`].includes(event?.key)) event.preventDefault();
};

export default function EditableCell({
    value = ``,
    canEdit = true,
    valueFirst = true,
    pendingValue = undefined,
    mode = `text`,
    step = 1,
    min = 0,
    showStepper = false,
    onSave = () => {},
    onCancel = () => {},
    onIncrease = () => {},
    onDecrease = () => {},
    onChangeValue = () => {},
    renderValue = undefined,
}: any) {
    const numericMode = mode == `number`;
    const originalValue = numericMode ? Number(value || 0) : String(value || ``);
    const currentValue = pendingValue == undefined ? originalValue : (numericMode ? Number(pendingValue || 0) : String(pendingValue || ``));
    const isDirty = `${currentValue}` != `${originalValue}`;
    const minReached = numericMode ? Number(currentValue || 0) <= Number(min || 0) : false;
    const valueNode = renderValue ? renderValue(currentValue) : (
        <input
            min={numericMode ? min : undefined}
            step={numericMode ? step : undefined}
            type={numericMode ? `number` : `text`}
            value={currentValue}
            onKeyDown={numericMode ? blockENotation : undefined}
            className={`editableCellInput stockText`}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => onChangeValue(numericMode ? toTwoDecimals(event?.target?.value) : event?.target?.value)}
            style={{ border: `none`, width: `100%`, color: `inherit`, background: `transparent` }}
        />
    );
    if (!canEdit) return <>{renderValue ? renderValue(currentValue) : currentValue}</>;
    return (
        <div className={`editableCellWrap flexContainer`} style={{ width: `100%`, justifyContent: `space-between` }}>
            {valueFirst ? valueNode : null}
            <div className={`flexContainer`} style={{ flexDirection: showStepper ? `column` : `row`, gap: 3 }}>
                {showStepper ? (
                    <div className={`flexContainer`} style={{ gap: 3, flexDirection: valueFirst ? `row-reverse` : `row` }}>
                        <Icon_Button size={14} title={``} rounded={false} className={`qtyBtn actionIconButton grayAction qtyBlue`} onClick={(event: any) => {
                            event.stopPropagation();
                            onIncrease?.(currentValue);
                        }}>
                            <Add style={{ fontSize: 18 }} fontSize={`small`} />
                        </Icon_Button>
                        {isDirty ? (
                            <Icon_Button size={14} title={``} rounded={false} className={`qtyBtn actionIconButton grayAction qtySuccess`} onClick={(event: any) => {
                                event.stopPropagation();
                                onSave?.(currentValue, originalValue);
                            }}>
                                <Save style={{ fontSize: 14 }} fontSize={`small`} />
                            </Icon_Button>
                        ) : null}
                    </div>
                ) : null}
                <div className={`flexContainer`} style={{ gap: 3, flexDirection: valueFirst ? `row-reverse` : `row` }}>
                    {showStepper ? (
                        <Icon_Button size={14} title={``} rounded={false} disabled={minReached} className={`qtyBtn actionIconButton grayAction ${isDirty ? `` : `qtyRed`}`} onClick={(event: any) => {
                            event.stopPropagation();
                            onDecrease?.(currentValue);
                        }}>
                            <Remove style={{ fontSize: 18 }} fontSize={`small`} />
                        </Icon_Button>
                    ) : null}
                    {isDirty ? (
                        <>
                            {!showStepper ? (
                                <Icon_Button size={14} title={``} rounded={false} className={`qtyBtn actionIconButton grayAction qtySuccess`} onClick={(event: any) => {
                                    event.stopPropagation();
                                    onSave?.(currentValue, originalValue);
                                }}>
                                    <Save style={{ fontSize: 14 }} fontSize={`small`} />
                                </Icon_Button>
                            ) : null}
                            <Icon_Button size={14} title={``} rounded={false} className={`qtyBtn actionIconButton grayAction qtyRed`} onClick={(event: any) => {
                                event.stopPropagation();
                                onCancel?.();
                            }}>
                                <DoDisturb style={{ fontSize: 15 }} fontSize={`small`} />
                            </Icon_Button>
                        </>
                    ) : null}
                </div>
            </div>
            {!valueFirst ? valueNode : null}
        </div>
    );
}
    const toTwoDecimals = (input: any) => {
        const raw = String(input ?? ``).trim();
        if (raw == ``) return ``;
        const parsed = Number(raw);
        if (!Number.isFinite(parsed)) return ``;
        return Math.round(parsed * 100) / 100;
    };
