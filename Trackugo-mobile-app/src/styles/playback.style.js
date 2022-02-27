import {
    StyleSheet
} from 'react-native';

import Colors from '../modules/colors.module';

const playback = StyleSheet.create({
    detailBox: {
        padding: 10,
        elevation: 1,
        borderRadius: 10,
        marginBottom: -10,
        backgroundColor: Colors.theme.backgroundModal
    },
    buttonsBox: {
        marginVertical: 10,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    options: {
        top: 10,
        right: 10,
        borderRadius: 5,
        position: "absolute",
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderColor: Colors.theme.borderColor,
    },
    option: {
        padding: 7
    },
    bottomBar: {
        padding: 10,
        marginTop: 10,
        flexDirection: "row",
        marginHorizontal: -10,
        backgroundColor: "#111"
    },
    addressDivider: {
        height: 15,
        marginLeft: 3,
        marginVertical: 2,
        borderLeftWidth: 2,
        borderLeftColor: Colors.theme.lightText
    },
    callout: {
        width: 250,
        padding: 10,
        elevation: 2
    },
    calloutHeader: {
        fontSize: 16,
        marginBottom: 10
    },
    calloutRow: {
        marginBottom: 5,
        flexDirection: "row",
    },
    calloutRowText: {
        fontSize: 14,
        marginLeft: 5,
        color: Colors.theme.lightText
    },
});

export default playback;