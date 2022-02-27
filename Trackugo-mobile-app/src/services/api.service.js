import { Alert, ToastAndroid } from 'react-native';

import DeviceInfo from 'react-native-device-info';

import UriConfig from '../config/uri.config';

import StorageService from '../services/storage.service';
import NavigationService from '../services/navigation.service';

import Heartbeat from "../BackgroundService";

async function call(method, uri, params, callback, errorCallback) {

    method = method.toUpperCase();
    const accessToken = await StorageService.fetch('access_token');
    const configuration = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': accessToken ? 'Bearer ' + accessToken : null
        }
    };

    if (method == "POST" || method == "PUT") {
        configuration.body = JSON.stringify(params);
    }

    // console.log("uri", UriConfig.apiUrl + uri);
    // console.log("api configuration", configuration);

    fetch(UriConfig.apiUrl + uri, configuration)
        .then(response => processResponse(response))
        .then((response) => {

            const { statusCode, data } = response;

            try {
                handleErrors(statusCode, data, { method: method, uri: uri, params: params, callback: callback, errorCallback: errorCallback });
            } catch (error) {
                return console.log("error", error.message);
            }

            if (data) {
                let status = data.status;
                if (status.code !== "success") {

                    if (typeof errorCallback === 'function') {
                        errorCallback(status.message);
                    }

                    return Alert.alert(status.title, status.message, [{ text: 'OK' }]);
                }

                if (callback && typeof callback === 'function') {
                    callback(data.content, status);
                }
            }
        })
        .catch((error) => {
            console.log("error", error);
            // return Alert.alert('Warning', error.message, [{ text: 'OK' }]);
            return ToastAndroid.showWithGravityAndOffset(
                // content.status.message,
                error.message,
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM,
                25,
                50
            );
        });
}

async function reviveToken(apiCall) {
    console.log("reviveToken");
    const refreshToken = await StorageService.fetch('refresh_token');

    fetch(UriConfig.apiUrl + UriConfig.uri.TOKEN_REVIVE, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + refreshToken
        }
    })
        .then(response => processResponse(response))
        .then(async (response) => {

            const { statusCode, data } = response;

            console.log("Revive Response");

            try {
                handleErrors(statusCode, data);
            } catch (error) {
                return console.log("error", error.message);
            }

            let status = data.status;
            if (status.code !== "success") {

                if (typeof apiCall.errorCallback === 'function') {
                    apiCall.errorCallback(status.message);
                }

                return Alert.alert(status.title, status.message, [{ text: 'OK' }]);
            }

            await StorageService.store('access_token', data.content.token);

            return call(apiCall.method, apiCall.uri, apiCall.params, apiCall.callback, apiCall.errorCallback);
        })
        .catch((error) => {
            console.log("error revoke", error);
            return Alert.alert('Warning', error.message, [{ text: 'OK' }]);
        });
}

function processResponse(response) {
    const statusCode = response.status;
    const data = response.json();

    return Promise.all([statusCode, data]).then(res => ({
        statusCode: res[0],
        data: res[1]
    }));
}

function handleErrors(statusCode, data, apiCall) {

    console.log("statusCode", statusCode);
    console.log("data", data);

    let message;
    let status = data.hasOwnProperty('status') ? data.status : null;

    try {
        switch (statusCode) {
            case 0:

                message = 'Not connected to internet. Please verify network and try again.';
                Alert.alert('Warning', message, [{ text: 'OK' }]);

                throw Error(message);

            case 403:
            case 409:

                message = status.message || 'There is some problem in processing request. Please try again after some time.';

                if (typeof apiCall.errorCallback === 'function') {
                    apiCall.errorCallback(message, null, data.content);
                }

                console.log("message", message);


                Alert.alert('Warning', message, [{ text: 'OK' }]);

                throw Error(message);

            case 404:

                message = status.message || 'Requested resource not found.';
                if (typeof apiCall.errorCallback === 'function') {
                    apiCall.errorCallback(message);
                }

                Alert.alert('Not Found', message, [{ text: 'OK' }]);

                throw Error(message);

            case 419:

                if (typeof apiCall.errorCallback === 'function' && data.hasOwnProperty('errors')) {
                    apiCall.errorCallback(null, data.errors);
                }

                throw Error('Validation Error.');

            case 401:
                if (apiCall) {
                    reviveToken(apiCall);
                    throw Error(status.message);
                }

                signout(true);

                message = 'Session timed out. Please signin again to continue.';
                Alert.alert('Warning', message, [{ text: 'OK' }]);

                throw Error(message);

            default:
                break;
        }
    } catch (error) {
        throw Error(error.message);
    }

    return data;
}

function signout(flag) {

    if (!flag) {
        call("POST", UriConfig.uri.SIGNOUT, { device: DeviceInfo.getUniqueId() });
    }

    Heartbeat.stopService();
    StorageService.clear();
    NavigationService.navigate('auth', 'Auth');
}

function callExternal(method, url, params, callback, errorCallback) {

    method = method.toUpperCase();

    const configuration = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (method == "POST" || method == "PUT") {
        configuration.body = JSON.stringify(params);
    }

    // console.log("url", url);
    // console.log("api configuration", configuration);

    fetch(url)
        .then(response => response.json())
        .then((responseJson) => {
            console.log("responseJson", responseJson);

            if (callback && typeof callback === 'function') {
                callback(responseJson);
            }
        })
        .catch((error) => {

            if (typeof errorCallback === 'function') {
                errorCallback(error);
            } else {
                console.log("error", error);
                return Alert.alert('Warning', error.message, [{ text: 'OK' }]);
            }
        });
}

export default {
    call,
    signout,
    callExternal
};