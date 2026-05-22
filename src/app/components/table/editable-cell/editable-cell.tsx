import { useEffect, useRef, useState } from 'react';
import Icon_Button from '../../buttons/icon-button/icon-button';
import { Add, DoDisturb, Remove, Save } from '@mui/icons-material';

const shieldTableKeys = (event: any) => {
    event.stopPropagation();
    event.defaultMuiPrevented = true;
    event?.nativeEvent?.stopImmediatePropagation?.();
};

const markTableKeysHandled = (event: any) => {
    event.defaultMuiPrevented = true;
};

const blockENotation = (event: any) => {
    if ([`e`, `E`, `+`, `-`].includes(event?.key)) event.preventDefault();
};

export const forceFieldBlurOnPressEnter = (event: any) => {
    if (event?.key == `Enter`) {
        event.preventDefault();
        event?.target?.blur?.();
    }
};

const cleanNumberDraft = (input: any) => {
    const raw = String(input ?? ``).replace(/[^\d.]/g, ``);
    const [whole = ``, ...decimalParts] = raw.split(`.`);
    const decimals = decimalParts.join(``).slice(0, 2);
    return decimalParts?.length > 0 ? `${whole}.${decimals}` : whole;
};

export default function EditableCell({
    min = 0,
    step = 1,
    value = ``,
    mode = `text`,
    canEdit = true,
    valueFirst = true,
    onSave = () => {},
    showActions = true,
    showStepper = false,
    saveOnEnter = false,
    onCancel = () => {},
    cancelOnBlur = false,
    onIncrease = () => {},
    onDecrease = () => {},
    renderValue = undefined,
    pendingValue = undefined,
    hasRenderedValue = false,
}: any) {
    const blurIntentRef = useRef<`save` | `cancel` | null>(null);
    const focusedRef = useRef(false);
    const numericMode = mode == `number`;
    const originalValue = numericMode ? Number(value || 0) : String(value || ``);
    const externalValue = pendingValue == undefined ? originalValue : (numericMode ? Number(pendingValue || 0) : String(pendingValue || ``));
    const [draftValue, setDraftValue] = useState<any>(externalValue);
    const currentValue = numericMode ? cleanNumberDraft(draftValue) : String(draftValue ?? ``);
    const currentSaveValue = numericMode ? Number(currentValue || 0) : currentValue;
    const isDirty = `${currentSaveValue}` != `${originalValue}`;
    const minReached = numericMode ? Number(currentValue || 0) <= Number(min || 0) : false;
    const zeroNumber = numericMode && String(currentValue ?? ``).trim() != `` && Number(currentSaveValue || 0) === 0;
    const saveCurrent = () => onSave?.(currentSaveValue, originalValue);
    const cancelCurrent = () => {
        setDraftValue(originalValue);
        onCancel?.();
    };
    useEffect(() => {
        if (!focusedRef.current) setDraftValue(externalValue);
    }, [externalValue]);
    const handleInputKeyDown = (event: any) => {
        shieldTableKeys(event);
        if (numericMode) blockENotation(event);
        if (event?.key == `Tab`) event.preventDefault();
        if (event?.key == `Escape`) {
            blurIntentRef.current = `cancel`;
            event.preventDefault();
            event?.target?.blur?.();
            return;
        }
        if ((saveOnEnter || numericMode) && event?.key == `Enter`) {
            blurIntentRef.current = `save`;
            forceFieldBlurOnPressEnter(event);
            return;
        }
    };
    const handleInputChange = (event: any) => {
        const nextValue = numericMode ? cleanNumberDraft(event?.target?.value) : event?.target?.value;
        setDraftValue(nextValue);
    };
    const valueNode = renderValue ? renderValue(currentValue) : (
        <input
            min={numericMode ? min : undefined}
            step={numericMode ? step : undefined}
            type={numericMode ? `number` : `text`}
            inputMode={numericMode ? `decimal` : `text`}
            value={currentValue}
            onKeyDown={handleInputKeyDown}
            onKeyUp={(event) => shieldTableKeys(event)}
            onKeyDownCapture={(event) => markTableKeysHandled(event)}
            className={`editableCellInput stockText`}
            onClick={(event) => shieldTableKeys(event)}
            onChange={handleInputChange}
            onMouseDown={(event) => shieldTableKeys(event)}
            onFocus={(event) => {
                focusedRef.current = true;
                shieldTableKeys(event);
            }}
            onBlur={() => {
                focusedRef.current = false;
                if (blurIntentRef.current == `save`) {
                    blurIntentRef.current = null;
                    return saveCurrent();
                }
                if (blurIntentRef.current == `cancel`) {
                    blurIntentRef.current = null;
                    return cancelCurrent();
                }
                if (cancelOnBlur && isDirty) cancelCurrent();
            }}
            style={{ border: `none`, width: `100%`, color: zeroNumber ? `var(--error)` : `inherit`, background: `transparent` }}
        />
    );
    if (!canEdit) return <>{renderValue ? renderValue(currentValue) : currentValue}</>;
    return (
        <div className={`editableCellWrap flexContainer`} style={{ width: `100%`, justifyContent: `flex-end`, gridGap: 15 }}>
            {valueFirst ? valueNode : null}
            <div className={`flexContainer`} style={{ flexDirection: showStepper ? `column` : `row`, gap: 3 }}>
                {showStepper ? (
                    <div className={`flexContainer`} style={{ gap: 3, flexDirection: valueFirst ? `row-reverse` : `row` }}>
                        <Icon_Button size={14} title={``} rounded={false} className={`qtyBtn actionIconButton grayAction ${(hasRenderedValue && !isDirty) ? `qtySuccess` : `qtyBlue`}`} onClick={(event: any) => {
                            event.stopPropagation();
                            onIncrease?.(currentSaveValue);
                        }}>
                            <Add style={{ fontSize: 18 }} fontSize={`small`} />
                        </Icon_Button>
                        {showActions && isDirty ? (
                            <Icon_Button size={14} title={``} rounded={false} className={`qtyBtn actionIconButton grayAction qtySuccess`} onClick={(event: any) => {
                                event.stopPropagation();
                                saveCurrent();
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
                            onDecrease?.(currentSaveValue);
                        }}>
                            <Remove style={{ fontSize: 18 }} fontSize={`small`} />
                        </Icon_Button>
                    ) : null}
                    {showActions && isDirty ? (
                        <>
                            {!showStepper ? (
                                <Icon_Button size={14} title={``} rounded={false} className={`qtyBtn actionIconButton grayAction qtySuccess`} onClick={(event: any) => {
                                    event.stopPropagation();
                                    saveCurrent();
                                }}>
                                    <Save style={{ fontSize: 14 }} fontSize={`small`} />
                                </Icon_Button>
                            ) : null}
                            <Icon_Button size={14} title={``} rounded={false} className={`qtyBtn actionIconButton grayAction qtyRed`} onClick={(event: any) => {
                                event.stopPropagation();
                                cancelCurrent();
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
