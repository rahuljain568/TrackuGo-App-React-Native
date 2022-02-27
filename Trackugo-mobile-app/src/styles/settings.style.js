import {
    StyleSheet
} from 'react-native';

import Colors from '../modules/colors.module';

const settings = StyleSheet.create({
    settingItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        paddingHorizontal: 5,
        borderBottomColor: Colors.theme.borderColor
    }
});

export default settings;