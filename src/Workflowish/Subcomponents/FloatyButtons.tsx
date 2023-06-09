import * as React from 'react';
import "./FloatyButtons.css"
import { FocusedActionReceiver } from '../mvc/focusedActionReceiver';
import { OmniBarHandlerAndState } from './OmnibarWrapper';

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
    const [transformString, setTransformString] = React.useState<string>("");
    const [tristates, setTristates] = React.useState<FloatyButtonTristates>({
        shiftKey: "OFF",
        altKey: "OFF",
        ctrlKey: "OFF",
    })
    React.useEffect(() => {
        const viewport = window.visualViewport;
        if (viewport) {
            const layoutSpannerDiv = document.createElement("div");
            document.body.appendChild(layoutSpannerDiv);
            layoutSpannerDiv.style.position = "fixed";
            layoutSpannerDiv.style.width = "100%";
            layoutSpannerDiv.style.height = "100%";
            layoutSpannerDiv.style.visibility = "hidden";
            const viewportHandler = () => {
                if (viewport) {
                    const offsetX = viewport.offsetLeft;
                    const offsetY = viewport.height
                        - layoutSpannerDiv.getBoundingClientRect().height
                        + viewport.offsetTop;
                    setTransformString(`translate(${offsetX}px, ${offsetY}px) scale(${1 / viewport.scale})`)
                }
            }
            viewport.addEventListener("scroll", viewportHandler);
            viewport.addEventListener('resize', viewportHandler);

            return () => {
                viewport.removeEventListener("scroll", viewportHandler);
                viewport.removeEventListener('resize', viewportHandler);

                layoutSpannerDiv.remove();
            }
        }
    }, [setTransformString])
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
    return <>
        <span className="floatyButtons" style={{ transform: transformString }}>
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
    </>
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