import {
    StyleSheet
} from 'react-native';

import Colors from '../modules/colors.module';

const geofence = StyleSheet.create({
    options: {
        top: 10,
        right: 10,
        borderRadius: 5,
        position: "absolute",
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderColor: Colors.theme.borderColor,
    },
    option: {
        padding: 10
    },
    optionsh: {
        top: 10,
        left: 10,
        borderRadius: 5,
        position: "absolute",
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderColor: Colors.theme.borderColor,
    },
    radioView: {
        marginBottom: 15,
        flexDirection: 'row',
    },
    radioBox: {
        flex: 1,
        padding: 5,
        borderWidth: 1,
        textAlign: "center",
        color: Colors.white,
        borderColor: Colors.white,
    },
    radioBoxSelected: {
        color: Colors.yellow,
        backgroundColor: Colors.white
    },
    center: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        position: "absolute",
        justifyContent: "center",
    },
    circle: {
        width: 120,
        height: 120,
        opacity: 0.7,
        borderWidth: 2,
        borderRadius: 60,
        position: "absolute",
        borderColor: Colors.yellow,
        backgroundColor: Colors.blue,
    },
    centerIcon: {
        bottom: 15,
        position: "relative"
    }
});

export default geofence;
