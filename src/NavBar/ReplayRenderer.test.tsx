import * as renderer from 'react-test-renderer';
import * as React from "react";
import { it, expect } from '@jest/globals';
import { ReplayRendererNavbarAndDialog } from './ReplayRenderer';
import { BaseDeltaType } from '~CoreDataLake';

it("Doesn't render replay buffer if not shown", () => {
    const hugeReplayBuffer: BaseDeltaType[] = Array(100).fill({
        key: "dummy"
    });
    const component = renderer.create(
        <ReplayRendererNavbarAndDialog replayBuffer={hugeReplayBuffer}></ReplayRendererNavbarAndDialog>
    )
    const item = component.toJSON();
    expect(item).toMatchSnapshot();
})