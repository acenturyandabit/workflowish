import { BaseItemType, BaseStoreDataType } from "~CoreDataLake";
import { getStateToSet } from "~util/getStateToSet";
import * as React from 'react';

export type QuestionDataEntry = {
    familiarity: number,
    lastTested: number
};

export const getTimeUntilNextTest = (entry: QuestionDataEntry) => entry.lastTested + entry.familiarity - Date.now();

export type QuestionData = Record<string, QuestionDataEntry>;

export type Card = {
    _lm: number
    data: string,
    questionData: QuestionData,
}

export type TransformedData = Record<string, Card>;

export type ItemSetterByKey = React.Dispatch<React.SetStateAction<TransformedData>>

export type TransformedDataAndSetter = {
    transformedData: TransformedData,
    setItemsByKey: ItemSetterByKey
}

export const getTransformedDataAndSetter = (props: {
    data: BaseStoreDataType,
    updateData: React.Dispatch<React.SetStateAction<BaseStoreDataType>>,
}): TransformedDataAndSetter => {
    const transformedData: TransformedData = {};
    for (const key in props.data) {
        const item = props.data[key];
        if (isTestable(item)) {
            const data = item.data as string;
            transformedData[key] = {
                data,
                questionData: getOrMakeInitialQuestionData(data, item.questionData as QuestionData | undefined), // default
                _lm: item._lm
            }
        }
    }
    const setItemsByKey = (_itemsToSet: React.SetStateAction<TransformedData>) => {
        props.updateData((data) => {
            const itemsToSet = getStateToSet(_itemsToSet, transformedData);
            const dataToUpdate: BaseStoreDataType = {};
            for (const key in itemsToSet) {
                dataToUpdate[key] = {
                    ...data[key],
                    ...itemsToSet[key],
                    _lm: Date.now()
                }
            }
            return dataToUpdate;
        })
    }
    return {
        transformedData,
        setItemsByKey,
    };
}

const isTestable = (item: BaseItemType) => {
    if ('data' in item && typeof item.data == 'string') {
        return /{{.+}}/.exec(item.data) != null;
    }
}
const INITIAL_TEST_TIME = 24 * 60 * 60 * 1000;
const SAME_ROOT_SPLIT_TIME = 60 * 60 * 1000;

const getOrMakeInitialQuestionData = (data: string, oldData: QuestionData | undefined): QuestionData => {
    const desiredFamiliarity: QuestionData = {};
    const matches = [...data.matchAll(/\{\{(.+?)\}\}/g)];
    matches.forEach((match, idx) => {
        const thisInitialTime = INITIAL_TEST_TIME + idx * SAME_ROOT_SPLIT_TIME;
        desiredFamiliarity[match[1]] = {
            familiarity: thisInitialTime,
            lastTested: Date.now() - thisInitialTime
        };
    })
    if (oldData) {
        for (const matchText in desiredFamiliarity) {
            if (oldData[matchText]) {
                desiredFamiliarity[matchText] = oldData[matchText];
            }
        }
    }
    return desiredFamiliarity;
}

export const flattenItems = (transformedData: TransformedData) => {
    const testableItems = Object.entries(transformedData);
    return testableItems.flatMap(([id, card]) => {
        return Object.entries(card.questionData).map(([questionId, questionData]) => {
            let testText = card.data.replace(questionId, "???");
            testText = testText.replace(/\{\{|\}\}/g, "")
            const revealText = card.data.replace(/\{\{|\}\}/g, "")
            return {
                id,
                data: card.data,
                testText,
                revealText,
                questionId,
                testability: getTimeUntilNextTest(questionData)
            };
        })
    });
}