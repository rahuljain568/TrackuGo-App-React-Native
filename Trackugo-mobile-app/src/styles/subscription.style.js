import {
    StyleSheet
} from 'react-native';

import Colors from '../modules/colors.module';

const subscription = StyleSheet.create({
    packageItem: {
        margin: 5,
        padding: 10,
        elevation: 1,
        borderRadius: 5,
        borderLeftWidth: 3,
        borderLeftColor: Colors.yellow
    },
    packageLeftPart: {
        marginRight: 5,
        borderRightWidth: 1,
        justifyContent: "center",
        borderColor: Colors.theme.borderColor,
    },
    selectedPackage: {
        margin: 5,
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: Colors.theme.borderColor
    },
    itemView: {
        margin: 5,
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: Colors.theme.borderColor
    },
    itemHeaderText: {
        flex: 3,
        paddingHorizontal: 10
    },
    itemHeaderTextMain: {
        fontSize: 16,
        fontWeight: '600',
    },
    payButton: {
        padding: 5,
        fontSize: 16,
        elevation: 1,
        borderRadius: 2,
        color: Colors.white,
        alignSelf: "flex-end",
        backgroundColor: Colors.green
    },
    moreButton: {
        elevation: 1,
        borderRadius: 2,
        paddingVertical: 2,
        color: Colors.white,
        paddingHorizontal: 4,
    },
});

export default subscription;