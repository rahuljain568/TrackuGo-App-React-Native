import {
    StyleSheet
} from 'react-native';

import Colors from '../modules/colors.module';

const device = StyleSheet.create({
    itemView: {
        margin: 5,
        padding: 10,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: Colors.theme.borderColor
    },
    upperPart: {
        marginBottom: 5,
        marginBottom: 10,
        paddingBottom: 5,
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
    lowerPart: {
        flexDirection: 'row',
        justifyContent: 'space-between'
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
    icon: {
        padding: 5,
        marginVertical: 5
    },
    selected: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: Colors.green
    },
    rightButton: {
        elevation: 1,
        borderRadius: 2,
        paddingVertical: 2,
        paddingHorizontal: 4,
        flexDirection: "row",
    },
});

export default device;