import { AppRegistry, ToastAndroid } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import DeviceInfo from 'react-native-device-info';
import Geolocation from '@react-native-community/geolocation';
import UriConfig from './src/config/uri.config';
import Geocoder from 'react-native-geocoding';
import StorageService from './src/services/storage.service';
import ApiService from './src/services/api.service';
import AppConfig from './src/config/app.config';
import GeneralService from "./src/services/general.service";
import moment from "moment";

AppRegistry.registerHeadlessTask('Heartbeat', () => updateLocation);
AppRegistry.registerComponent(appName, () => App);

console.disableYellowBox = true;

//update location
const updateLocation = async () => {
    try {
        let power = "", gps_status = "OFF", latitude = "0", longitude = "0";
        let user = JSON.parse(await StorageService.fetch('user'));
        if (user) {
            DeviceInfo.getAvailableLocationProviders().then((providers) => {
                gps_status = providers.gps ? "ON" : "OFF"
                DeviceInfo.getPowerState().then((state) => {
                    power = state.batteryLevel.toFixed(2)
                    if (gps_status == "ON") {
                        Geolocation.getCurrentPosition(
                            (position) => {
                                latitude = position.coords.latitude
                                longitude = position.coords.longitude
                                let uri = UriConfig.uri.USER_EVENT,
                                    params = {
                                        "user_id": user._id,
                                        "latitude": latitude,
                                        "longitude": longitude,
                                        "current_address": '' ,
                                        "power": power,
                                        "gps_status": gps_status
                                    };
                              //  console.log("'post', uri, params", params, uri);
                                ApiService.call('post', uri, params, async (content, status) => {
                                    // ToastAndroid.show('My location ' + latitude + ', ' + longitude + ' at ' + moment().format('LTS'), ToastAndroid.LONG);
                                    // ToastAndroid.show('My location ' + params.current_address + ' at ' + moment().format('LTS'), ToastAndroid.LONG);
                                }, (error, errors, content) => { console.log(error); });

                                // Geocoder.init(AppConfig.google_api_key, { language: "en" });
                                // console.log(latitude, longitude, 'latitude, longitude');
                                // Geocoder.from(latitude, longitude)
                                //     .then(json => {
                                //         console.log('json', json);
                                //         let uri = UriConfig.uri.USER_EVENT,
                                //             params = {
                                //                 "user_id": user._id,
                                //                 "latitude": latitude,
                                //                 "longitude": longitude,
                                //                 "current_address": json.results[0].address_components[0].long_name,
                                //                 "power": power,
                                //                 "gps_status": gps_status
                                //             };
                                //         console.log("'post', uri, params", params, uri);
                                //         ApiService.call('post', uri, params, async (content, status) => {
                                //             // ToastAndroid.show('My location ' + latitude + ', ' + longitude, ToastAndroid.LONG);
                                //         }, (error, errors, content) => { console.log(error); });
                                //     }).catch(error => console.log(error, 'Geocoder'));

                            }, (error) => { console.log(error.message); }, {
                            enableHighAccuracy: false, timeout: 20000,
                        });
                    } else if (gps_status == "OFF") {
                        let uri = UriConfig.uri.USER_EVENT,
                            params = {
                                "user_id": user._id,
                                "latitude": '0',
                                "longitude": '0',
                                "current_address": "",
                                "power": power,
                                "gps_status": gps_status
                            };
                     //   console.log("'post', uri, params", params, uri);
                        ApiService.call('post', uri, params, async (content, status) => {
                            // ToastAndroid.show('GPS OFF Updated', ToastAndroid.LONG);
                        }, (error, errors, content) => { console.log(error); });
                        // ToastAndroid.show('Enable Location', ToastAndroid.LONG);
                    }
                });
            });
        }
    } catch (error) {
        console.log('error', error);
    }
}
//update location