// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {PropTypes} from 'prop-types';
import React from 'react';
import {intlShape} from 'react-intl';
import {Text} from 'react-native';
import {Navigation} from 'react-native-navigation';

import CustomPropTypes from 'app/constants/custom_prop_types';
import {preventDoubleTap} from 'app/utils/tap';

export default class MarkdownTableImage extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node.isRequired,
        componentId: PropTypes.string.isRequired,
        source: PropTypes.string.isRequired,
        textStyle: CustomPropTypes.Style.isRequired,
        serverURL: PropTypes.string.isRequired,
        theme: PropTypes.object.isRequired,
    };

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    handlePress = preventDoubleTap(() => {
        const {componentId, theme} = this.props;

        Navigation.push(componentId, {
            component: {
                name: 'TableImage',
                passProps: {
                    imageSource: this.getImageSource(),
                },
                options: {
                    background: {
                        color: theme.centerChannelBg,
                    },
                    topBar: {
                        backButton: {
                            color: theme.sidebarHeaderTextColor,
                            text: '',
                        },
                        background: {
                            color: theme.sidebarHeaderBg,
                        },
                        title: {
                            color: theme.sidebarHeaderTextColor,
                            text: this.context.intl.formatMessage({
                                id: 'mobile.routes.tableImage',
                                defaultMessage: 'Image',
                            }),
                        },
                    },
                },
            },
        });
    });

    getImageSource = () => {
        let source = this.props.source;

        if (source.startsWith('/')) {
            source = `${this.props.serverURL}/${source}`;
        }

        return source;
    };

    render() {
        return (
            <Text
                onPress={this.handlePress}
                style={this.props.textStyle}
            >
                {this.props.children}
            </Text>
        );
    }
}
