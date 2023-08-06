import * as React from 'react';
import "./FloatyButtons.css"
import { FocusedActionReceiver } from '../mvc/focusedActionReceiver';
import { OmniBarHandlerAndState } from './OmnibarWrapper';
import { FloatyRegion } from '~util/FloatyRegion';

const tristateSwitches = ["shiftKey", "altKey", "ctrlKey"] as const;
const tristates = ["ON", "HELD", "OFF"] as const;
export const MOBILE_ACTION_1 = "MOBILE_ACTION_1";
type FloatyButtonTristates = {
    [key in typeof tristateSwitches[number]]: typeof tristates[number]
}


export const FloatyButtons = (props: {
    focusedActionReceiver: FocusedActionReceiver,
    omniBarHandlerRef: React.MutableRefObject<OmniBarHandlerAndState>
}) => {
    // code derived from https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport
    const [tristates, setTristates] = React.useState<FloatyButtonTristates>({
        shiftKey: "OFF",
        altKey: "OFF",
        ctrlKey: "OFF",
    })
    const stateToColor = (state: string) => {
        const stateBackgroundColorMapping: Record<string, string> = { "ON": "lightblue", "HELD": "blue", "OFF": "" };
        const stateColorMapping: Record<string, string> = { "ON": "black", "HELD": "white", "OFF": "black" };
        return {
            background: stateBackgroundColorMapping[state],
            color: stateColorMapping[state]
        };
    }
    const restoreFocus = () => {
        props.focusedActionReceiver.focusThis();
    }
    return <FloatyRegion style={{ bottom: "0px" }} stickyHeightPct={100}>
        <span className="floatyButtons">
            <StateToggleKey _key="Shift" sx={stateToColor(tristates["shiftKey"])} restoreFocus={restoreFocus} setTristates={setTristates} />
            <StateToggleKey _key="Ctrl" sx={stateToColor(tristates["ctrlKey"])} restoreFocus={restoreFocus} setTristates={setTristates} />
            <StateToggleKey _key="Alt" sx={stateToColor(tristates["altKey"])} restoreFocus={restoreFocus} setTristates={setTristates} />
            <KeyButton
                _key={"ArrowUp"}
                text={"Up"}
                setTristates={setTristates}
                focusedActionReceiver={props.focusedActionReceiver}
                omniBarHandlerRef={props.omniBarHandlerRef}
            />
            <KeyButton
                _key={"ArrowDown"}
                text={"Down"}
                setTristates={setTristates}
                focusedActionReceiver={props.focusedActionReceiver}
                omniBarHandlerRef={props.omniBarHandlerRef}
            />
            <KeyButton
                _key={"Enter"}
                text={"Enter"}
                setTristates={setTristates}
                focusedActionReceiver={props.focusedActionReceiver}
                omniBarHandlerRef={props.omniBarHandlerRef}
            />
            <KeyButton
                _key={"Tab"}
                text={"Tab"}
                setTristates={setTristates}
                focusedActionReceiver={props.focusedActionReceiver}
                omniBarHandlerRef={props.omniBarHandlerRef}
            />
            <KeyButton
                _key={MOBILE_ACTION_1}
                text={"Act"}
                setTristates={setTristates}
                focusedActionReceiver={props.focusedActionReceiver}
                omniBarHandlerRef={props.omniBarHandlerRef}
            />
        </span>
    </FloatyRegion>
}

const StateToggleKey = (props: {
    _key: string,
    sx: Record<string, string>
    setTristates: React.Dispatch<React.SetStateAction<FloatyButtonTristates>>
    restoreFocus: () => void
}) => {
    const tristateKey = props._key.toLowerCase() + "Key" as typeof tristateSwitches[number];
    const subsequentState = (currentState: typeof tristates[number]) => {
        let currentIdx = tristates.indexOf(currentState);
        if (currentIdx == tristates.length - 1) currentIdx = -1;
        return tristates[currentIdx + 1];
    }
    return <button style={props.sx} onClick={(evt) => {
        props.setTristates((tristates) => {
            return {
                ...tristates,
                [tristateKey]: subsequentState(tristates[tristateKey])
            }
        })
        props.restoreFocus();
        evt.preventDefault();
        return false;
    }}>
        {props._key}
    </button>
}


const KeyButton = (props: {
    _key: string,
    text: string,
    setTristates: React.Dispatch<React.SetStateAction<FloatyButtonTristates>>,
    omniBarHandlerRef: React.MutableRefObject<OmniBarHandlerAndState>,
    focusedActionReceiver: FocusedActionReceiver
}) => (
    <button onClick={(rawEvent) => {
        props.setTristates(tristates => {
            const { event, resetTristates } = composeEvent(tristates, props._key);
            if (props._key == MOBILE_ACTION_1 && tristates.altKey == "OFF" && tristates.ctrlKey == "OFF" && tristates.shiftKey == "OFF") {
                props.omniBarHandlerRef.current.setOmniBarState(state => ({ ...state, barContents: ">" }));
            }
            if (props.omniBarHandlerRef.current.state.barContents.length == 0) {
                props.focusedActionReceiver.keyCommand(event, rawEvent);
            }
            setTimeout(() => props.omniBarHandlerRef.current.handler(event), 1);
            return resetTristates;
        })
    }}> {props.text} </button>
)

const composeEvent = (tristates: FloatyButtonTristates, key: string): {
    resetTristates: FloatyButtonTristates,
    event: Parameters<FocusedActionReceiver["keyCommand"]>[0]
} => {
    const tristatesAsBoolean: {
        [key in typeof tristateSwitches[number]]?: boolean
    } = {};
    const resetTristates = { ...tristates };
    for (const key in resetTristates) {
        const _key = key as typeof tristateSwitches[number];
        tristatesAsBoolean[_key] = (tristates[_key] != "OFF");
        if (resetTristates[_key] == "ON") {
            resetTristates[_key] = "OFF";
        }
    }
    const event: Parameters<FocusedActionReceiver["keyCommand"]>[0] = {
        key,
        ...tristatesAsBoolean as {
            [key in typeof tristateSwitches[number]]: boolean
        },
        metaKey: false,
        preventDefault: () => {
            // No need to prevent default
        }
    }
    return {
        resetTristates,
        event
    }
}