import React from "react";
import { Card, QuestionData, TransformedDataAndSetter, getTimeUntilNextTest } from "./mvc/model";
import { Button } from '@mui/material';

const RETEST_IMMINENTLY_TIME = 60 * 60 * 1000;

export const TestModePanel = (props: {
    transformedDataAndSetter: TransformedDataAndSetter
}) => {
    const items = props.transformedDataAndSetter.transformedData;
    const testableItems = Object.entries(items);
    const [reveal, setReveal] = React.useState(false);
    if (testableItems.length) {
        const itemToTestNow: [string, Card] = testableItems.reduce((prev, item) => {
            const getItemTestability = (questionData: QuestionData): number => {
                return -Math.min(...Object.values(questionData).map((data) => getTimeUntilNextTest(data)));
            }
            return getItemTestability(prev[1].questionData) > getItemTestability(item[1].questionData) ? prev : item
        }, testableItems[0]);
        const testCandidates = Object.entries(itemToTestNow[1].questionData);
        const mostTestable = testCandidates.reduce((prev, next) => getTimeUntilNextTest(prev[1]) < getTimeUntilNextTest(next[1]) ? prev : next, testCandidates[0]);
        let testText = itemToTestNow[1].data;

        const updateCurrentCard = (goodOrBad: "good" | "bad") => {
            props.transformedDataAndSetter.setItemsByKey((transformedData) => {
                const itemToUpdate = transformedData[itemToTestNow[0]];
                const newQuestionData = { ...itemToUpdate.questionData };
                if (goodOrBad == "good") {
                    newQuestionData[mostTestable[0]].familiarity *= 1.1;
                    newQuestionData[mostTestable[0]].lastTested = Date.now();
                } else {
                    newQuestionData[mostTestable[0]].familiarity *= 0.9;
                    newQuestionData[mostTestable[0]].lastTested = Date.now() - RETEST_IMMINENTLY_TIME;
                }
                return { [itemToTestNow[0]]: { ...itemToUpdate, questionData: newQuestionData } };
            })
        }

        if (!reveal) testText = testText.replace(mostTestable[0], "???");
        testText = testText.replace(/\{\{|\}\}/g, "")
        return <>
            <h2>{testText}</h2>
            <h3>This card repeats every: {toDurationString(mostTestable[1].familiarity)}</h3>
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
    if (builder.length > 0){
        return builder.join(", ");
    }else{
        return "Less than a minute";
    }
}