// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Text} from 'react-native';
import {Navigation} from 'react-native-navigation';

import CustomPropTypes from 'app/constants/custom_prop_types';

export default class Hashtag extends React.PureComponent {
    static propTypes = {
        componentId: PropTypes.string.isRequired,
        hashtag: PropTypes.string.isRequired,
        linkStyle: CustomPropTypes.Style.isRequired,
        onHashtagPress: PropTypes.func,
        actions: PropTypes.shape({
            showSearchModal: PropTypes.func.isRequired,
        }).isRequired,
    };

    handlePress = () => {
        if (this.props.onHashtagPress) {
            this.props.onHashtagPress(this.props.hashtag);

            return;
        }

        // Close thread view, permalink view, etc
        Navigation.dismissAllModals();
        Navigation.popToRoot();

        this.props.actions.showSearchModal(this.props.componentId, '#' + this.props.hashtag);
    };

    render() {
        return (
            <Text
                style={this.props.linkStyle}
                onPress={this.handlePress}
            >
                {`#${this.props.hashtag}`}
            </Text>
        );
    }
}
