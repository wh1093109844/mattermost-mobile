// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';
import {Navigation} from 'react-native-navigation';

import PostList from './post_list';
import Preferences from 'mattermost-redux/constants/preferences';

jest.useFakeTimers();

describe('PostList', () => {
    const serverURL = 'https://server-url.fake';
    const baseProps = {
        actions: {
            handleSelectChannelByName: jest.fn(),
            loadChannelsByTeamName: jest.fn(),
            refreshChannelWithRetry: jest.fn(),
            selectFocusedPostId: jest.fn(),
            setDeepLinkURL: jest.fn(),
        },
        componentId: 'componentId',
        deepLinkURL: '',
        lastPostIndex: -1,
        postIds: ['post-id-1', 'post-id-2'],
        serverURL,
        siteURL: 'https://site-url.fake',
        theme: Preferences.THEMES.default,
    };

    const deepLinks = {
        permalink: serverURL + '/team-name/pl/pl-id',
        channel: serverURL + '/team-name/channels/channel-name',
    };

    const wrapper = shallow(
        <PostList {...baseProps}/>
    );

    test('should match snapshot', () => {
        expect(wrapper.getElement()).toMatchSnapshot();
    });

    test('setting permalink deep link', () => {
        wrapper.setProps({deepLinkURL: deepLinks.permalink});
        expect(baseProps.actions.setDeepLinkURL).toHaveBeenCalled();
        expect(baseProps.actions.selectFocusedPostId).toHaveBeenCalled();
        expect(Navigation.showModal).toHaveBeenCalled();
        expect(wrapper.getElement()).toMatchSnapshot();
    });

    test('setting channel deep link', () => {
        wrapper.setProps({deepLinkURL: deepLinks.channel});
        expect(baseProps.actions.setDeepLinkURL).toHaveBeenCalled();
        expect(baseProps.actions.handleSelectChannelByName).toHaveBeenCalled();
        expect(wrapper.getElement()).toMatchSnapshot();
    });
});
