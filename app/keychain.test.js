// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {NativeModules, Platform} from 'react-native';
import {getGenericPassword, setGenericPassword} from 'react-native-keychain';

import * as Keychain from './keychain';

jest.mock('react-native-keychain', () => ({
    getGenericPassword: jest.fn(),
    resetGenericPassword: jest.fn(),
    setGenericPassword: jest.fn(),
}));
jest.mock('react-native', () => ({
    NativeModules: {
        Initialization: {
            credentials: null,
            credentialsExist: false,
        },
    },
    Platform: {
        OS: '',
    },
}));

beforeEach(() => {
    jest.resetModules();
});

describe('Keychain', () => {
    describe('loadCredentials', () => {
        test('should return credentials from generic password', async () => {
            getGenericPassword.mockReturnValue({
                username: 'abc,def',
                password: '123,456',
            });

            const credentials = await Keychain.loadCredentials();

            expect(credentials).toEqual({
                currentUserId: 'def',
                deviceToken: 'abc',
                token: '123',
                url: '456',
            });
            expect(getGenericPassword).toHaveBeenCalled();
        });

        test('should return null when unable to get generic password', async () => {
            getGenericPassword.mockReturnValue(null);

            const credentials = await Keychain.loadCredentials();

            expect(credentials).toEqual(null);
            expect(getGenericPassword).toHaveBeenCalled();
        });

        test('should return null when generic password is invalid', async () => {
            getGenericPassword.mockReturnValue({
                username: 'username',
                password: 'password',
            });

            const credentials = await Keychain.loadCredentials();

            expect(credentials).toEqual(null);
            expect(getGenericPassword).toHaveBeenCalled();
        });

        test('should load from Initialization on Android when possible', async () => {
            NativeModules.Initialization.credentialsExist = true;
            NativeModules.Initialization.credentials = {
                username: 'aaa,bbb',
                password: 'ccc,ddd',
            };
            Platform.OS = 'android';

            const credentials = await Keychain.loadCredentials();

            expect(credentials).toEqual({
                currentUserId: 'bbb',
                deviceToken: 'aaa',
                token: 'ccc',
                url: 'ddd',
            });
            expect(getGenericPassword).not.toHaveBeenCalled();
        });
    });

    describe('storeCredentials', () => {
        test('should store credentials as generic password', async () => {
            await Keychain.storeCredentials('deviceToken', 'currentUserId', 'token', 'url');

            expect(setGenericPassword).toHaveBeenCalledWith('deviceToken,currentUserId', 'token,url');
        });

        test('should do nothing if url is not set', async () => {
            await Keychain.storeCredentials('deviceToken', 'currentUserId', 'token', '');

            expect(setGenericPassword).not.toHaveBeenCalled();
        });

        test('should do nothing if token is not set', async () => {
            await Keychain.storeCredentials('deviceToken', 'currentUserId', '', 'url');

            expect(setGenericPassword).not.toHaveBeenCalled();
        });
    });
});
