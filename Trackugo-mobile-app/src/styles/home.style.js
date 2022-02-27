import {
    StyleSheet
} from 'react-native';

import Colors from '../modules/colors.module';

const home = StyleSheet.create({
    menuIcon: {
        padding: 5,
        alignSelf: 'baseline',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        backgroundColor: Colors.lightGray,
    },
    statsView: {
        flex: 4,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    stat: {
        padding: 2,
        marginLeft: 10,
    },
    statTextMain: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statTextSub: {
        fontSize: 10
    },
    itemView: {
        margin: 5,
        padding: 10,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: Colors.theme.borderColor
    },
    itemHeaderUpper: {
        marginBottom: 10,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: Colors.theme.borderColor
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
    itemHeaderLower: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    map: {
        height: 100,
        width: '100%',
        marginTop: 10,
        marginBottom: 5
    },
    moreButton: {
        elevation: 1,
        borderRadius: 2,
        paddingVertical: 2,
        paddingHorizontal: 4,
        flexDirection: "row",
        backgroundColor: Colors.yellow
    },
    rightIcons: {
        flexDirection: "row",
        alignItems: "flex-end"
    },
    filterView: {
        width: 100,
        height: 40,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.gray,
        // borderBottomColor: Colors.yellow,
        // borderBottomWidth: 3
    },
    filterViewActive: {
        width: 100,
        height: 40,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.gray,
        borderBottomColor: Colors.yellow,
        borderBottomWidth: 3
    }
});

export default home;