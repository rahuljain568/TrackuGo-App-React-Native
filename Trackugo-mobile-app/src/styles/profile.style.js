import {
    StyleSheet
} from 'react-native';

import Colors from '../modules/colors.module';

const profile = StyleSheet.create({
    upperPart: {
        padding: 20,
        marginBottom: 10,
        alignItems: "center",
        backgroundColor: Colors.yellow
    },
    iconView: {
        width: 100,
        padding: 10,
        borderWidth: 1,
        borderRadius: 50,
        marginBottom: 10,
        borderColor: Colors.white
    },
    lowerPart: {
        padding: 20,
        borderWidth: 1,
        borderRadius: 10,
        marginHorizontal: 15,
        borderColor: Colors.theme.borderColor
    },
    section: {
        marginBottom: 10,
        flexDirection: "row",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.theme.borderColor,
    },
    sectionText: {
        marginLeft: 20,
    },
    sectionTextMain: {
        fontSize: 18
    },
    sectionTextSub: {
        fontSize: 12
    },
    editIcon: {
        top: 10,
        right: 20,
        zIndex: 1,
        position: 'absolute'
    },
    passwordText: {
        fontSize: 20,
        marginLeft: 20,
        color: Colors.yellow
    }
});

export default profile;
