import * as renderer from 'react-test-renderer';
import * as React from "react";
import { it, expect } from '@jest/globals';
import HelpDocument from '~Workflowish/Subcomponents/HelpDocument';

it('Renders an item', () => {
    const component = renderer.create(
        <HelpDocument helpDocLastOpen={0}></HelpDocument>
    )
    const item = component.toJSON();
    expect(item).toMatchSnapshot();
})