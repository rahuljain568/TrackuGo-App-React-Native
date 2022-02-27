import {
    StyleSheet
} from 'react-native';

import Colors from '../modules/colors.module';

const liveTrack = StyleSheet.create({
    detailBox: {
        elevation: 1,
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: Colors.theme.lightBackgroundColor,
    },
    detailBoxUpper: {
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderColor: Colors.theme.borderColor,
    },
    options: {
        top: 10,
        left: 10,
        borderRadius: 5,
        flexDirection: "row",
        position: "absolute",
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderColor: Colors.theme.borderColor,
    },
    option: {
        padding: 7,
        justifyContent: "center"
    },
    infoItem: {
        flex: 1,
        alignItems: "center",
    },
    infoItemBorder: {
        flex: 1,
        borderRightWidth: 1,
        alignItems: "center",
        borderColor: Colors.theme.borderColor
    },
    infoItemInner: {
        flexDirection: "row",
        alignItems: "center",
    },
    driverIcon: {
        marginTop: 10,
        alignSelf: "flex-end",
    },
    driverBox: {
        padding: 10,
        elevation: 1,
        borderRadius: 10,
        marginBottom: 10,
        borderColor: Colors.theme.borderColor,
        backgroundColor: Colors.theme.backgroundModal
    },
    driverPhoto: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginBottom: 10
    },
    driverInfoBox: {
        paddingVertical: 5,
        paddingHorizontal: 10
    },
    driverTextView: {
        paddingVertical: 5,
        paddingHorizontal: 10
    },
    documentItem: {
        marginBottom: 5,
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        flexDirection: "row",
        borderBottomColor: Colors.theme.borderColor,
    },
    documentsBox: {
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: Colors.theme.borderColor,
        backgroundColor: Colors.theme.lightBackgroundColor,
    }
});

export default liveTrack;