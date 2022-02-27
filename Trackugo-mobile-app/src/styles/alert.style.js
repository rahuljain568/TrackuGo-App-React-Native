import {
    StyleSheet
} from 'react-native';

import Colors from '../modules/colors.module';

const alert = StyleSheet.create({
    alertItem: {
        flexDirection: "row",
        padding: 20,
        borderBottomWidth: 1,
        borderColor: Colors.theme.borderColor,
        backgroundColor: Colors.theme.lightBackgroundColor
    },
    alertItemText: {
        flex: 1,
        fontSize: 18
    }
});

export default alert;
