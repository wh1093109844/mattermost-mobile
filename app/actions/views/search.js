// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Navigation} from 'react-native-navigation';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {ViewTypes} from 'app/constants';

export function handleSearchDraftChanged(text) {
    return async (dispatch, getState) => {
        dispatch({
            type: ViewTypes.SEARCH_DRAFT_CHANGED,
            text,
        }, getState);
    };
}

export function showSearchModal(componentId, initialValue = '') {
    return (dispatch, getState) => {
        const theme = getTheme(getState());

        Navigation.showModal({ // TODO animated: true? // TODO overrideBackPress: true?
            stack: {
                children: [{
                    component: {
                        name: 'Search',
                        passProps: {
                            initialValue,
                        },
                        options: {
                            backButton: {
                                text: '',
                            },
                            background: {
                                color: theme.centerChannelBg,
                            },
                            topBar: {
                                visible: false,
                            },
                        },
                    },
                }],
            },
        });
    };
}
