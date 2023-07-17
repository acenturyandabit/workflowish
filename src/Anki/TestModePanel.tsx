import React from "react";
import { TransformedDataAndSetter, flattenItems } from "./mvc/model";
import { Button } from '@mui/material';

const RETEST_IMMINENTLY_TIME = 60 * 60 * 1000;

export const TestModePanel = (props: {
    transformedDataAndSetter: TransformedDataAndSetter
}) => {
    const items = props.transformedDataAndSetter.transformedData;
    const testableItems = Object.entries(items);
    const [reveal, setReveal] = React.useState(false);
    if (testableItems.length) {
        const allItemsByTestability = flattenItems(items);
        allItemsByTestability.sort((a, b) => a.testability - b.testability);
        const mostTestable = allItemsByTestability[0];
        const updateCurrentCard = (goodOrBad: "good" | "bad") => {
            props.transformedDataAndSetter.setItemsByKey((transformedData) => {
                const itemToUpdate = transformedData[mostTestable.id];
                const newQuestionData = { ...itemToUpdate.questionData };
                if (goodOrBad == "good") {
                    newQuestionData[mostTestable.questionId].familiarity *= 1.1;
                    newQuestionData[mostTestable.questionId].lastTested = Date.now();
                } else {
                    newQuestionData[mostTestable.questionId].familiarity *= 0.9;
                    newQuestionData[mostTestable.questionId].lastTested = Date.now() - RETEST_IMMINENTLY_TIME;
                }
                return { [mostTestable.id]: { ...itemToUpdate, questionData: newQuestionData } };
            })
        }

        return <>
            <h2>{reveal ? mostTestable.revealText : mostTestable.testText}</h2>
            <h3>This card repeats every: {toDurationString(mostTestable.testability)}</h3>
            <div className="anki-buttons">
                <Button fullWidth variant="contained" onClick={() => setReveal(true)}>Reveal</Button>
                <Button fullWidth variant="contained" onClick={() => { updateCurrentCard("good"); setReveal(false) }}>Good</Button>
                <Button fullWidth variant="contained" onClick={() => { updateCurrentCard("bad"); setReveal(false) }}>Bad</Button>
            </div>
        </>
    } else {
        return <>
            <h2>No cards available</h2>
        </>
    }
}

export const toDurationString = (millis: number): string => {
    const builder: string[] = [];
    const durationLadder = {
        "year": 365 * 24 * 60 * 60 * 1000,
        "month": 30 * 24 * 60 * 60 * 1000,
        "week": 7 * 24 * 60 * 60 * 1000,
        "day": 24 * 60 * 60 * 1000,
        "hour": 60 * 60 * 1000,
        "minute": 60 * 1000,
    };
    for (const duration in durationLadder) {
        const durationMillis = durationLadder[duration as keyof typeof durationLadder];
        const wholePortions = Math.floor(millis / durationMillis);
        if (wholePortions > 0) {
            builder.push(`${wholePortions} ${duration}${wholePortions > 1 ? "s" : ""}`);
            millis -= wholePortions * durationMillis;
        }
    }
    if (builder.length > 0) {
        return builder.join(", ");
    } else {
        return "Less than a minute";
    }
}