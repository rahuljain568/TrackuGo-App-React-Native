import {
    StyleSheet
} from 'react-native';

import Colors from '../modules/colors.module';

const report = StyleSheet.create({
    reportsRow: {
        flexDirection: "row",
        marginBottom: 10,
    },
    reportsRowItem: {
        flex: 1,
        padding: 20,
        borderWidth: 1,
        borderRadius: 4,
        marginHorizontal: 2,
        alignItems: "center",
        borderColor: Colors.theme.borderColor,
    },
    reportsRowItem2: {
        flex: 1,
        padding: 10,
        borderRadius: 5
    },
    leftItem: {
        marginRight: 10
    },
    reportItemText: {
        fontSize: 16,
        marginTop: 10,
        textAlign: "center"
    },
    reportItemIcon: {
        width: 35,
        height: 35,
        alignSelf: "flex-end"
    },
    tabs: {
        marginBottom: 10,
        flexDirection: "row",
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
    infoRow: {
        flexDirection: "row"
    },
    infoBlock: {
        marginLeft: 10,
        paddingBottom: 20
    },
    iconsSection: {
        marginVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    imageIcon: {
        width: 50,
        height: 50
    },
    imageIconSm: {
        width: 25,
        height: 25
    }
});

export default report;
