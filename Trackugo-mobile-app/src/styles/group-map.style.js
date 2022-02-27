import {
    StyleSheet
} from 'react-native';

import Colors from '../modules/colors.module';

const group = StyleSheet.create({
    callout: {
        width: 200,
        padding: 10,
        elevation: 5,
        backgroundColor:Colors.white,
        borderRadius:20,
    },
    calloutHeader: {
        fontSize: 16,
        fontWeight:'700',
        marginBottom: 10,
        fontFamily: 'TTNorms-Bold'
    },
    calloutRow: {
        // marginBottom: 5,
        flexDirection: "row",
    },
    calloutRowText: {
        fontSize: 14,
        marginLeft: 5,
        color: Colors.theme.lightText
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
        padding: 10
    },
});

export default group;
