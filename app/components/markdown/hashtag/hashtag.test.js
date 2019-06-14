// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';
import {Text} from 'react-native';
import {Navigation} from 'react-native-navigation';

import Hashtag from './hashtag';

jest.mock('react-native-navigation', () => ({
    dismissAllModals: jest.fn(),
    popToRoot: jest.fn(),
}));

describe('Hashtag', () => {
    const baseProps = {
        hashtag: 'test',
        linkStyle: {color: 'red'},
        componentId: 'componentId',
        actions: {
            showSearchModal: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<Hashtag {...baseProps}/>);

        expect(wrapper.getElement()).toMatchSnapshot();
    });

    test('should open hashtag search on click', () => {
        const props = {
            ...baseProps,
        };

        const wrapper = shallow(<Hashtag {...props}/>);

        wrapper.find(Text).simulate('press');

        expect(Navigation.dismissAllModals).toHaveBeenCalled();
        expect(Navigation.popToRoot).toHaveBeenCalled();
        expect(props.actions.showSearchModal).toHaveBeenCalledWith(props.componentId, '#test');
    });

    test('should call onHashtagPress if provided', () => {
        const props = {
            ...baseProps,
            onHashtagPress: jest.fn(),
        };

        const wrapper = shallow(<Hashtag {...props}/>);

        wrapper.find(Text).simulate('press');

        expect(Navigation.dismissAllModals).not.toBeCalled();
        expect(Navigation.popToRoot).not.toBeCalled();
        expect(props.actions.showSearchModal).not.toBeCalled();

        expect(props.onHashtagPress).toBeCalled();
    });
});
