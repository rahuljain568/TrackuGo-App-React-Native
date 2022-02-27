import {
    StyleSheet
} from 'react-native';

import Colors from '../modules/colors.module';

const locations = StyleSheet.create({
    itemView: {
        margin: 5,
        padding: 10,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: Colors.theme.borderColor
    },
    itemHeaderText: {
        flex: 4,
        paddingHorizontal: 10
    },
    itemHeaderTextMain: {
        fontSize: 16,
        fontWeight: '600',
    },
    itemHeaderTextSub: {
        fontSize: 14,
        fontWeight: '200',
        color: Colors.theme.lightText,
    },
    map: {
        height: 100,
        width: '100%',
        marginTop: 10,
        marginBottom: 5
    },
    tabs: {
        flexDirection: 'row',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.theme.borderColor
    },
    tab: {
        flex: 1,
        textAlign: 'center',
        paddingVertical: 10
    },
    tabActive: {
        color: Colors.yellow,
        borderBottomWidth: 3,
        borderBottomColor: Colors.yellow
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

export default locations;