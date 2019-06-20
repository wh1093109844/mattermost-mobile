// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {NativeModules} from 'react-native';
import {getGenericPassword, resetGenericPassword, setGenericPassword} from 'react-native-keychain';

import avoidNativeBridge from 'app/utils/avoid_native_bridge';

const {Initialization} = NativeModules;

export async function loadCredentials() {
    const credentials = await avoidNativeBridge(
        () => {
            return Initialization.credentialsExist;
        },
        () => {
            return Initialization.credentials;
        },
        () => {
            return getGenericPassword();
        }
    );

    if (!credentials) {
        return null;
    }

    // The username is made up of the device token and user ID separated by a comma
    const usernameParsed = credentials.username.split(',');

    // The password is made up of the session token and server URL separated by a comma
    const passwordParsed = credentials.password.split(',');

    if (usernameParsed.length !== 2 || passwordParsed.length !== 2) {
        // These credentials are invalid
        return null;
    }

    const [deviceToken, currentUserId] = usernameParsed;
    const [token, url] = passwordParsed;

    return {
        currentUserId,
        deviceToken,
        token,
        url,
    };
}

export async function storeCredentials(deviceToken, currentUserId, token, url) {
    // Only save to keychain if the url and token are set
    if (!url || !token) {
        return;
    }

    const username = `${deviceToken},${currentUserId}`;
    const password = `${token},${url}`;

    await setGenericPassword(username, password);
}

export async function clear() {
    await resetGenericPassword();
}
