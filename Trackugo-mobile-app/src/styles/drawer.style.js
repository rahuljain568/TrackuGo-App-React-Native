import {
    StyleSheet
} from 'react-native';

import Colors from '../modules/colors.module';

const drawer = StyleSheet.create({
    drawerHeader: {
        padding: 10,
        borderBottomWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.theme.backgroundModal,
        borderBottomColor: Colors.theme.backgroundModal
    },
    drawerLogoText: {
        fontSize: 24,
        fontWeight: 'bold'
    },
    drawerItem: {
        paddingVertical: 15,
        flexDirection: 'row',
        paddingHorizontal: 20,
    },
    drawerItemActive: {
        backgroundColor: Colors.theme.lightBackgroundColor
    },
    drawerItemLeft: {
        flex: 1
    },
    drawerItemRight: {
        flex: 3
    },
    drawerItemText: {
        fontSize: 20
    },
});

export default drawer;