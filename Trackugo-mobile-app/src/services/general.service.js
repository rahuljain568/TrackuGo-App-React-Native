import {
    Linking,
    Dimensions,
    ToastAndroid,
    PermissionsAndroid, Alert
} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';
import ApiService from './api.service';

import AppConfig from '../config/app.config';
import UriConfig from '../config/uri.config';

import Colors from '../modules/colors.module';

function currentLocation() {
    return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(position => {
            resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
        }, () => {
            reject({
                latitude: 0,
                longitude: 0
            });
        });
    });
}

function locationDelta(latitudeDelta) {

    latitudeDelta = latitudeDelta || 0.0500;
    const { width, height } = Dimensions.get('window');
    return {
        latitudeDelta: latitudeDelta,
        longitudeDelta: latitudeDelta * (width / height),
    }
}

function defaultLocation(delta) {

    const { latitudeDelta, longitudeDelta } = locationDelta(delta);

    return {
        latitude: AppConfig.default_location.latitute,
        longitude: AppConfig.default_location.longitude,
        latitudeDelta: latitudeDelta,
        longitudeDelta: longitudeDelta
    };

}

function geocodingReverse(coordinates, callback, errorCallback) {
    let url = UriConfig.geocode + "?latlng=" + coordinates.latitude + "," + coordinates.longitude + "&key=" + AppConfig.google_api_key;

    ApiService.callExternal('get', url, {}, (response) => {

        if (!response) {
            return errorCallback("Invalid Response");
        } else if (response.status != "OK") {
            return errorCallback(response.error_message);
        }

        if (response.hasOwnProperty("results") && response.results) {
            let results = response.results;
            if (results.hasOwnProperty("formatted_address")) {
                return callback(results.formatted_address);
            }
        }

        return errorCallback("Invalid Response");
    });
}

function hasValue(data) {
	return (data !== undefined) && (data !== null) && (data !== "");
}
function correctDate(dateString) {
    return dateString.replace(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/, "$2/$1/$3 $4:$5:$6");
}

function dateFormat(date, format) {

    date = date ? new Date(date) : new Date();
    format = (format || 'd M Y h:i A').replace(/([a-z])/gi, "[$1]");

    if (isNaN(date.getTime())) {
        return "";
    }

    // var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var year = date.getFullYear(),
        month = date.getMonth(),
        day = date.getDate(),
        hour = date.getHours(),
        minutes = date.getMinutes(),
        seconds = date.getSeconds(),
        meridiem = hour < 12 ? 'am' : 'pm',
        hoursmall = hour > 12 ? hour % 12 : hour;

    return format.replace("[Y]", year)
        .replace("[y]", year.toString().substring(2, 4))
        .replace("[m]", ((month + 1) < 10 ? "0" : "") + (month + 1))
        .replace("[M]", months[month])
        .replace(/\[d\]/gi, (day < 10 ? "0" : "") + day)
        .replace("[h]", (hoursmall < 10 ? "0" : "") + hoursmall)
        .replace("[H]", (hour < 10 ? "0" : "") + hour)
        .replace(/\[i\]/gi, (minutes < 10 ? "0" : "") + minutes)
        .replace("[s]", (seconds < 10 ? "0" : "") + seconds)
        .replace("[a]", meridiem)
        .replace("[A]", meridiem.toUpperCase());
}

function dateInterval(date) {
    date = date ? new Date(date) : new Date();

    var now = new Date(),
        dayDifference = Math.round((now - date) / (1000 * 60 * 60 * 24));

    if (dayDifference == 1) {
        return "Yesterday";
    } else if (dayDifference > 1) {
        return dayDifference + " Days";
    }

    var nowHours = now.getHours(),
        dateHours = date.getHours(),
        hoursDifference = nowHours - dateHours;

    if (hoursDifference > 0) {
        return hoursDifference + " hr";
    }

    var nowMinutes = now.getMinutes(),
        dateMinutes = date.getMinutes(),
        minutesDifference = nowMinutes - dateMinutes;

    if (minutesDifference > 0) {
        return minutesDifference + " min";
    }

    var nowSeconds = now.getSeconds(),
        dateSeconds = date.getSeconds(),
        secondsDifference = nowSeconds - dateSeconds;

    if (secondsDifference > 0) {
        return secondsDifference + " sec";
    }

    return "Just Now";
}

function dateModify(dateString, interval, format) {
    var parts = interval.split(" "),
        period = parseInt(parts[0]),
        type = parts[1];

    date = dateString ? new Date(dateString) : new Date();

    format = format || 'd/m/Y H:i';

    if (isNaN(date.getTime())) {
        return "";
    }

    switch (type.toUpperCase()) {
        case "D":
        case "DAY":
            date.setDate(date.getDate() + period);
            break;

        case "M":
        case "MON":
        case "MONTH":
            date.setMonth(date.getMonth() + period);
            break;

        case "Y":
        case "YEAR":
            date.setYear(date.getFullYear() + period);
            break;

        case "H":
        case "HOUR":
            date.setHours(date.getHours() + period);
            break;

        case "MIN":
        case "MINUTE":
            date.setMinutes(date.getMinutes() + period);
            break;

        case "S":
        case "SECOND":
            date.setSeconds(date.getSeconds() + period);
            break;

        default:

            break;
    }

    return dateFormat(date, format);
}


/**
 * Convert string to upper case and replace underscore(_) with space( ).
 * @param {String} string String to be altered..
 * @return {String} Upper case string.
 */
uppercase = (string) => {
    return (string || "").replace("_", " ").toUpperCase();
}

/**
 * Convert string to lower case and replace underscore(_) with space( ).
 * @param {String} string String to be altered..
 * @return {String} Lower case string.
 */
lowercase = (string) => {
    return (string || "").replace("_", " ").toLowerCase();
}

/**
 * Convert string to camel case and replace underscore(_) with space( ).
 * @param {String} string String to be altered..
 * @return {String} Camel case string.
 */
camelcase = (string) => {
    string = (string || "").replace('_', ' ');
    return string.split(' ').map(function (word, index) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
}

isValid = (name, value, validationRules, values) => {

    value = typeof value === 'string' ? value : '';

    let message = '',
        isValid = true;

    if (value) {
        if (validationRules) {

            if (validationRules.hasOwnProperty('regex') && !validationRules.regex.test(value)) {
                isValid = false;
                message = validationRules.message || camelcase(name) + ' is not valid.';
            }

            if (values && validationRules.hasOwnProperty('equals') && value != values[validationRules.equals]) {
                isValid = false;
                message = validationRules.message || (camelcase(name) + ' should be same as ' + camelcase(validationRules.equals) + '.');
            }

            if (validationRules.hasOwnProperty('in') && validationRules.in.indexOf(value) < 0) {
                isValid = false;
                message = validationRules.message || (camelcase(name) + ' should be one of ' + validationRules.in.join(', ') + '.');
            }

        }

    } else if (validationRules.required) {
        isValid = false;
        message = camelcase(name) + ' is required.';
    }

    return {
        fieldValue: value,
        isValid: isValid,
        message: message
    }
}

deviceSideviewIcon = (device) => {

    if (!device.icon) {
        return null;
    }

    let color = 'black';
    let currentState = typeof device.current_state === 'string' ? device.current_state.toUpperCase() : '';

    switch (currentState) {
        case "ON_TRIP":
            color = "green";
            break;

        case "STOPPED":
            color = "red";
            break;

        case "IMMOBILIZE":
            color = "red";
            break;

        case "IDLE":
            color = "yellow";
            break;

        default:
            color = "black";
    }

    let iconFilename = null;
    for (let iconFile of device.icon.icon_files) {
        if (iconFile.icon_type == 'sideview' && iconFile.icon_color == color) {
            iconFilename = iconFile.file_name;
        }
    }

    return iconFilename;
}

deviceTopviewIcon = (device) => {

    if (!device.icon) {
        return null;
    }

    let color = 'black';
    let currentState = typeof device.current_state === 'string' ? device.current_state.toUpperCase() : '';

    switch (currentState) {
        case "ON_TRIP":
            color = "green";
            break;

        case "STOPPED":
            color = "red";
            break;

        case "IMMOBILIZE":
            color = "red";
            break;

        case "IDLE":
            color = "yellow";
            break;

        case "DISCONNECTED":
            color = "black";
            break;

        default:
            color = "black";
    }

    let iconFilename = null;
    for (let iconFile of device.icon.icon_files) {
        if (iconFile.icon_type == 'topview' && iconFile.icon_color == color) {
            iconFilename = iconFile.file_name;
        }
    }

    return iconFilename;


    /* let icon = {
         path: null,
         // size: new google.maps.Size(30, 30),
         // origin: new google.maps.Point(0, 0),
         // anchor: new google.maps.Point(25, 25),
         // scaledSize: new google.maps.Size(30, 30),
         fillColor: Colors.black,
         fillOpacity: .8,
         rotation: parseInt(device.head)
     },
         vehicleType = device.vehicle_type.toUpperCase(),
         currentState = typeof device.current_state === 'string' ? device.current_state.toUpperCase() : '';
 
     switch (currentState) {
         case "ON_TRIP":
             icon.fillColor = Colors.green;
             break;
 
         case "STOPPED":
             icon.fillColor = Colors.red;
             break;
 
         case "IDLE":
             icon.fillColor = Colors.black;
             break;
 
     }
 
     if (vehicleType == "CAR") {
         icon.path = "M29.395,0H17.636c-3.117,0-5.643,3.467-5.643,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759c3.116,0,5.644-2.527,5.644-5.644V6.584C35.037,3.467,32.511,0,29.395,0z M34.05,14.188v11.665l-2.729,0.351v-4.806L34.05,14.188zM32.618,10.773c-1.016,3.9-2.219,8.51-2.219,8.51H16.631l-2.222-8.51C14.41,10.773,23.293,7.755,32.618,10.773z M15.741,21.713v4.492l-2.73-0.349V14.502L15.741,21.713z M13.011,37.938V27.579l2.73,0.343v8.196L13.011,37.938z M14.568,40.882l2.218-3.336h13.771l2.219,3.336H14.568z M31.321,35.805v-7.872l2.729-0.355v10.048L31.321,35.805z";
     } else if (vehicleType == "BUS" || vehicleType == "VAN" || vehicleType == "TRUCK") {
         icon.path = "M402.4,106.006h-60h-26.8h-74.8H182h-58.8H64.8H23.2c-12.8,0-23.2,10.4-23.2,23.2v133.2c0,12.8,10.4,23.2,23.2,23.2h51.6c2.8,19.2,19.2,34,39.2,34s36.4-14.8,38.8-34H316h4.8c4,17.6,19.6,30.8,38.4,30.8s34.4-13.2,38.4-30.8h4.8c12.8,0,23.2-10.4,23.2-23.2v-133.2C426,116.406,415.6,106.006,402.4,106.006z M188,118.006h46.8v72H188V118.006z M129.2,118.006H176v72h-46.8V118.006z M70.4,118.006h46.8v72H70.4V118.006z M11.6,129.206c0-6,5.2-11.2,11.6-11.2h35.6v72H11.6V129.206zM113.6,307.606c-15.2,0-27.6-12.4-27.6-27.6s12.4-27.6,27.6-27.6s27.6,12.4,27.6,27.6S128.8,307.606,113.6,307.606zM152.4,273.206c-3.2-18.8-19.2-32.8-38.8-32.8c-19.6,0.4-35.6,14.8-38.8,33.2h-52c-6.4,0-11.2-5.2-11.2-11.2v-60.8h280.8v60.4c0,4,1.2,8,3.2,11.2H152.4z M292.4,129.206v60.4h-45.6v-71.6h48.8C293.6,121.206,292.4,125.206,292.4,129.206zM304.4,129.206c0-6.4,5.2-11.2,11.2-11.2h27.2h10.4v72h-48.8V129.206z M359.2,304.806c-15.2,0-27.6-12.4-27.6-27.6s12.4-27.6,27.6-27.6s27.6,12.4,27.6,27.6S374.4,304.806,359.2,304.806z M402.8,273.606h-4.4c-1.6-20-18.8-36-39.2-36s-37.6,16-39.2,36h-4c-6.4,0-11.2-5.2-11.2-11.2v-60.8h54.8c0,0,14-0.4,26.4,12c12.4,12.4,19.2,32.4,19.6,59.6C404.8,273.606,404,273.606,402.8,273.606z M414,243.606c-3.6-16.4-10.4-29.2-20-38.4c-10.4-10.4-22-13.6-28.8-14.8v-72.4h37.2c6.4,0,11.6,5.2,11.6,11.2V243.606z";
     } else if (vehicleType == "BIKE") {
         icon.path = "M422,256c-12.318,0-25.604,3.001-36.872,8.101l-13.685-20.407C390.901,232.431,413.343,226,437,226c8.291,0,15-6.709,15-15v-30c0-57.891-47.109-105-105-105h-30c-8.291,0-15,6.709-15,15s6.709,15,15,15h15v30h-45c-5.01,0-9.697,2.505-12.48,6.68L258.972,166h-125.95l-7.529-11.294C117.686,142.987,104.619,136,90.557,136H15c-8.291,0-15,6.709-15,15c0,38.54,29.224,70.386,66.665,74.546l20.499,30.742C38.875,257.827,0,297.343,0,346c0,49.629,40.371,90,90,90c38.383,0,72.081-24.646,84.635-60h90.231c19.951,0,37.28-14.209,41.177-33.765l2.124-10.62c5.524-27.609,19.885-51.478,39.382-69.717l12.708,18.95C342.058,298.1,332,321.951,332,346c0,48.426,40.715,90,90,90c49.629,0,90-40.371,90-90C512,296.371,471.629,256,422,256z M90,375.9h51.855C131.336,393.973,111.793,406,90,406c-33.091,0-60-26.909-60-60s26.909-60,60-60c6.667,0,13.081,1.32,19.265,3.431l5.242,7.863C122.314,309.013,135.381,316,149.443,316H90c-16.569,0-30,13.431-30,30C60,362.569,73.431,375.9,90,375.9z M422,406c-32.501,0-60-27.297-60-60c0-13.865,4.856-27.697,15.397-39.593l32.151,47.943c4.563,6.833,13.904,8.752,20.801,4.102c6.885-4.614,8.716-13.931,4.102-20.801l-32.161-47.955C409.529,287.163,414.363,286,422,286c33.091,0,60,26.909,60,60S455.091,406,422,406z";
     }
 
 
     return icon;*/
}

deviceStatusColor = (currentState) => {

    currentState = typeof currentState === 'string' ? currentState.toUpperCase() : '';

    switch (currentState) {
        case "ON_TRIP":
            return Colors.green;

        case "STOPPED":
            return Colors.red;

        case "IMMOBILIZE":
            return Colors.red;

        case "IDLE":
            return Colors.yellow;

        default:
            return Colors.theme.lightText;
    }
}

openExternalApplication = (url) => {
    Linking.canOpenURL(url).then(supported => {
        if (supported) {
            Linking.openURL(url);
        } else {
            Alert.alert(
                'ERROR',
                'Unable to open: ' + url,
                [
                    { text: 'OK' },
                ]
            );
        }
    });
}

openMapApp = (latitude, longitude) => {

    let location = latitude + "," + longitude;
    openExternalApplication("geo:" + location + "?center=" + location + "&q=" + location + "&z=16");
}

/**
 * Return amount with Rupee symbol.
 * @param {Number} amount Amount.
 * @return {String} Amount String.
 */
amountString = (amount) => {
    return (amount < 0 ? "-" : "") + "₹" + Math.abs(amount);
}

placeErrors = (ref, errors) => {

    if (errors && errors instanceof Array) {
        for (let error of errors) {

            let { messages } = ref.state;
            for (let field in error) {
                if (!messages[field]) {
                    ref.setState({
                        errors: { ...ref.state.errors, [field]: true },
                        messages: { ...ref.state.messages, [field]: error[field] },
                    });
                }
            }
        }
    }
}

randomColor = () => {
    let letters = "0123456789ABCDEF",
        color = "#";

    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
}

download = async (url, callback) => {

    let urlParts = url.split("/");

    try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            RNFetchBlob
                .config({
                    fileCache: true,
                    addAndroidDownloads: {
                        notification: true,
                        useDownloadManager: true,
                        path: RNFetchBlob.fs.dirs.DownloadDir + '/' + urlParts[urlParts.length - 1],
                        description: 'Downloading file...'
                    }
                })
                .fetch('GET', url, {
                    //some headers ..
                })
                .then((res) => {
                    ToastAndroid.show("File saved to " + res.path(), ToastAndroid.LONG);

                    if (callback && typeof callback === 'function') {
                        callback();
                    }
                });
        }
    } catch (err) { }

}


export default {
    currentLocation,
    locationDelta,
    defaultLocation,
    geocodingReverse,
    hasValue,
    correctDate,
    dateFormat,
    dateInterval,
    dateModify,
    uppercase,
    lowercase,
    camelcase,
    isValid,
    deviceSideviewIcon,
    deviceTopviewIcon,
    deviceStatusColor,
    openExternalApplication,
    openMapApp,
    amountString,
    placeErrors,
    randomColor,
    download
};
