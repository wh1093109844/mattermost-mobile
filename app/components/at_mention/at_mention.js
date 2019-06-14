// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {intlShape} from 'react-intl';
import {Clipboard, Platform, Text} from 'react-native';
import {Navigation} from 'react-native-navigation';

import {displayUsername} from 'mattermost-redux/utils/user_utils';

import CustomPropTypes from 'app/constants/custom_prop_types';
import mattermostManaged from 'app/mattermost_managed';
import BottomSheet from 'app/utils/bottom_sheet';

export default class AtMention extends React.PureComponent {
    static propTypes = {
        componentId: PropTypes.string.isRequired,
        isSearchResult: PropTypes.bool,
        mentionName: PropTypes.string.isRequired,
        mentionStyle: CustomPropTypes.Style,
        onPostPress: PropTypes.func,
        textStyle: CustomPropTypes.Style,
        teammateNameDisplay: PropTypes.string,
        theme: PropTypes.object.isRequired,
        usersByUsername: PropTypes.object.isRequired,
    };

    static contextTypes = {
        intl: intlShape,
    };

    constructor(props) {
        super(props);

        const user = this.getUserDetailsFromMentionName(props);
        this.state = {
            user,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.mentionName !== this.props.mentionName || nextProps.usersByUsername !== this.props.usersByUsername) {
            const user = this.getUserDetailsFromMentionName(nextProps);
            this.setState({
                user,
            });
        }
    }

    goToUserProfile = () => {
        const {componentId, theme} = this.props;
        const {intl} = this.context;
        const options = {
            component: {
                name: 'UserProfile',
                passProps: {
                    userId: this.state.user.id,
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
                            text: intl.formatMessage({id: 'mobile.routes.user_profile', defaultMessage: 'Profile'}),
                        },
                    },
                },
            },
        };

        if (Platform.OS === 'ios') {
            Navigation.push(componentId, options);
        } else {
            Navigation.showModal(options);
        }
    };

    getUserDetailsFromMentionName(props) {
        let mentionName = props.mentionName.toLowerCase();

        while (mentionName.length > 0) {
            if (props.usersByUsername.hasOwnProperty(mentionName)) {
                return props.usersByUsername[mentionName];
            }

            // Repeatedly trim off trailing punctuation in case this is at the end of a sentence
            if ((/[._-]$/).test(mentionName)) {
                mentionName = mentionName.substring(0, mentionName.length - 1);
            } else {
                break;
            }
        }

        return {
            username: '',
        };
    }

    handleLongPress = async () => {
        const {formatMessage} = this.context.intl;

        const config = mattermostManaged.getCachedConfig();

        if (config?.copyAndPasteProtection !== 'true') {
            const cancelText = formatMessage({id: 'mobile.post.cancel', defaultMessage: 'Cancel'});
            const actionText = formatMessage({id: 'mobile.mention.copy_mention', defaultMessage: 'Copy Mention'});

            BottomSheet.showBottomSheetWithOptions({
                options: [actionText, cancelText],
                cancelButtonIndex: 1,
            }, (value) => {
                if (value !== 1) {
                    this.handleCopyMention();
                }
            });
        }
    };

    handleCopyMention = () => {
        const {user} = this.state;
        const {mentionName} = this.props;
        let username = mentionName;
        if (user.username) {
            username = user.username;
        }

        Clipboard.setString(`@${username}`);
    };

    render() {
        const {isSearchResult, mentionName, mentionStyle, onPostPress, teammateNameDisplay, textStyle} = this.props;
        const {user} = this.state;

        if (!user.username) {
            return <Text style={textStyle}>{'@' + mentionName}</Text>;
        }

        const suffix = this.props.mentionName.substring(user.username.length);

        return (
            <Text
                style={textStyle}
                onPress={isSearchResult ? onPostPress : this.goToUserProfile}
                onLongPress={this.handleLongPress}
            >
                <Text style={mentionStyle}>
                    {'@' + displayUsername(user, teammateNameDisplay)}
                </Text>
                {suffix}
            </Text>
        );
    }
}
