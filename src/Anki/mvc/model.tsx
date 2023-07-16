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
    lastModifiedUnixMillis: number
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
                lastModifiedUnixMillis: item.lastModifiedUnixMillis
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
                    lastModifiedUnixMillis: Date.now()
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

const getOrMakeInitialQuestionData = (data: string, oldData: QuestionData | undefined): QuestionData => {
    const desiredFamiliarity: QuestionData = {};
    const matches = [...data.matchAll(/\{\{(.+?)\}\}/g)];
    matches.forEach(match => {
        desiredFamiliarity[match[1]] = {
            familiarity: INITIAL_TEST_TIME,
            lastTested: Date.now() - INITIAL_TEST_TIME
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