import {
    StyleSheet
} from 'react-native';

import Colors from '../modules/colors.module';

const notification = StyleSheet.create({
    notificationItem: {
        margin: 5,
        padding: 10,
        elevation: 1,
        borderLeftWidth: 3,
    },
    notificationLeftPart: {
        marginRight: 10,
        paddingRight: 10,
        borderRightWidth: 1,
        justifyContent: "center",
        borderColor: Colors.theme.borderColor,
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
    vwHeader: {
        top: 10,
        right: 10,
        left: 10,
        position: "absolute",
        flexDirection: 'row',
        alignItems: 'center'
    },
    vwHeaderChild: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
    },
    vwHeaderRight: {
        flex: 8,
        justifyContent: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center'
    },
    vwHeaderLeft: {
        // flex: 8,
        justifyContent: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center'
    },
    btnHeader: {
        marginLeft: 15,
        height: 46,
        width: 46,
        borderRadius: 23,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.white,
        elevation: 4
    },
    options: {
        top: 70,
        right: 10,
        borderRadius: 5,
        position: "absolute",
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderColor: Colors.theme.borderColor,
    },
    option: {
        padding: 10
    },
    vwBottom: {
        bottom: 0,
        right: 0,
        left: 0,
        position: "absolute",
        flexDirection: 'row',
        alignItems: 'center'
    },
    vwBottomChild:{
        backgroundColor: Colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 3
    },
    txtBottomLabel: {
        color: Colors.black,
        fontSize: 16,
        fontWeight: 'bold',
    },
    txtBottom: {
        color: Colors.black,
        fontSize: 14,
    },
    vwList: {
        marginTop: 10,
        borderRadius: 7,
        marginHorizontal: 8,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        alignItems: 'center',
        backgroundColor: Colors.white,
        elevation: 3
    },
    txtListLabel: {
        color: Colors.black,
        fontSize: 16,
        fontWeight: 'bold',
    },
    txtList: {
        color: Colors.black,
        fontSize: 14,
    },
    vwModel: {
        marginTop: 20,
        flex: 1,
        backgroundColor: Colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 3
    },
    vwModelButton: {
        flex: 1.5,
        backgroundColor: Colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    btnModel: {
        marginBottom: 10,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        height: 42,
        width: '80%',
        borderRadius: 10,
        backgroundColor: Colors.black,
        marginTop: 20
    },
    txtModelButton: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold'
    },
    vwSettingRowCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 15,
        backgroundColor: Colors.white,
        elevation: 3
    },
});

export default notification;