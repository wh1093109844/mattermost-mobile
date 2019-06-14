// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {intlShape} from 'react-intl';
import {
    Keyboard,
    FlatList,
    SafeAreaView,
    StyleSheet,
    View,
} from 'react-native';
import {Navigation} from 'react-native-navigation';

import {isDateLine, getDateForDateLine} from 'mattermost-redux/utils/post_list';

import ChannelLoader from 'app/components/channel_loader';
import DateHeader from 'app/components/post_list/date_header';
import FailedNetworkAction from 'app/components/failed_network_action';
import NoResults from 'app/components/no_results';
import PostSeparator from 'app/components/post_separator';
import StatusBar from 'app/components/status_bar';
import mattermostManaged from 'app/mattermost_managed';
import SearchResultPost from 'app/screens/search/search_result_post';
import ChannelDisplayName from 'app/screens/search/channel_display_name';
import {changeOpacity} from 'app/utils/theme';

export default class RecentMentions extends PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            clearSearch: PropTypes.func.isRequired,
            loadChannelsByTeamName: PropTypes.func.isRequired,
            loadThreadIfNecessary: PropTypes.func.isRequired,
            getRecentMentions: PropTypes.func.isRequired,
            selectFocusedPostId: PropTypes.func.isRequired,
            selectPost: PropTypes.func.isRequired,
            showSearchModal: PropTypes.func.isRequired,
        }).isRequired,
        componentId: PropTypes.string.isRequired,
        didFail: PropTypes.bool,
        isLoading: PropTypes.bool,
        postIds: PropTypes.array,
        theme: PropTypes.object.isRequired,
    };

    static defaultProps = {
        postIds: [],
    };

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    constructor(props) {
        super(props);

        props.actions.clearSearch();
        props.actions.getRecentMentions();
    }

    componentDidMount() {
        this.navigationEventListener = Navigation.events().bindComponent(this);
    }

    goToThread = (post) => {
        const {actions, componentId, theme} = this.props;
        const channelId = post.channel_id;
        const rootId = (post.root_id || post.id);

        Keyboard.dismiss();
        actions.loadThreadIfNecessary(rootId);
        actions.selectPost(rootId);

        Navigation.push(componentId, {
            component: {
                name: 'Thread',
                passProps: {
                    channelId,
                    rootId,
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
                        },
                    },
                },
            },
        });
    };

    handleClosePermalink = () => {
        const {actions} = this.props;
        actions.selectFocusedPostId('');
        this.showingPermalink = false;
    };

    handlePermalinkPress = (postId, teamName) => {
        this.props.actions.loadChannelsByTeamName(teamName);
        this.showPermalinkView(postId, true);
    };

    handleHashtagPress = async (hashtag) => {
        const {actions, componentId} = this.props;

        await Navigation.dismissModal(componentId);

        actions.showSearchModal(componentId, '#' + hashtag);
    };

    keyExtractor = (item) => item;

    navigationButtonPressed({buttonId}) {
        if (buttonId === 'close-settings') {
            Navigation.dismissModal(this.props.componentId, {
                animationType: 'slide-down',
            });
        }
    }

    previewPost = (post) => {
        Keyboard.dismiss();

        this.showPermalinkView(post.id, false);
    };

    renderEmpty = () => {
        const {formatMessage} = this.context.intl;
        const {theme} = this.props;

        return (
            <NoResults
                description={formatMessage({
                    id: 'mobile.recent_mentions.empty_description',
                    defaultMessage: 'Messages containing your username and other words that trigger mentions will appear here.',
                })}
                iconName='ios-at'
                title={formatMessage({id: 'mobile.recent_mentions.empty_title', defaultMessage: 'No Recent Mentions'})}
                theme={theme}
            />
        );
    };

    renderPost = ({item, index}) => {
        const {postIds, theme} = this.props;

        if (isDateLine(item)) {
            return (
                <DateHeader
                    date={getDateForDateLine(item)}
                    index={index}
                />
            );
        }

        let separator;
        const nextPost = postIds[index + 1];
        if (nextPost && !isDateLine(nextPost)) {
            separator = <PostSeparator theme={theme}/>;
        }

        return (
            <View>
                <ChannelDisplayName postId={item}/>
                <SearchResultPost
                    postId={item}
                    previewPost={this.previewPost}
                    goToThread={this.goToThread}
                    componentId={this.props.componentId}
                    onHashtagPress={this.handleHashtagPress}
                    onPermalinkPress={this.handlePermalinkPress}
                    managedConfig={mattermostManaged.getCachedConfig()}
                    showFullDate={false}
                    skipPinnedHeader={true}
                />
                {separator}
            </View>
        );
    };

    showPermalinkView = (postId, isPermalink) => {
        const {actions} = this.props;

        actions.selectFocusedPostId(postId);

        if (!this.showingPermalink) {
            this.showingPermalink = true;

            Navigation.showModal({ // TODO animationType?
                component: {
                    name: 'Permalink',
                    passProps: {
                        isPermalink,
                        onClose: this.handleClosePermalink,
                    },
                    options: {
                        background: changeOpacity('#000', 0.2),
                        modalPresentationStyle: 'overCurrentContext',
                        topBar: {
                            visible: false,
                        },
                    },
                },
            });
        }
    };

    retry = () => {
        this.props.actions.getRecentMentions();
    };

    render() {
        const {didFail, isLoading, postIds, theme} = this.props;

        let component;
        if (didFail) {
            component = (
                <FailedNetworkAction
                    onRetry={this.retry}
                    theme={theme}
                />
            );
        } else if (isLoading) {
            component = (
                <ChannelLoader channelIsLoading={true}/>
            );
        } else if (postIds.length) {
            component = (
                <FlatList
                    ref='list'
                    contentContainerStyle={style.sectionList}
                    data={postIds}
                    keyExtractor={this.keyExtractor}
                    keyboardShouldPersistTaps='always'
                    keyboardDismissMode='interactive'
                    renderItem={this.renderPost}
                />
            );
        } else {
            component = this.renderEmpty();
        }

        return (
            <SafeAreaView style={style.container}>
                <View style={style.container}>
                    <StatusBar/>
                    {component}
                </View>
            </SafeAreaView>
        );
    }
}

const style = StyleSheet.create({
    container: {
        flex: 1,
    },
});
