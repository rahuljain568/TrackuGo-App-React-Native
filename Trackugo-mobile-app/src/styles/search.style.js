import {
    StyleSheet
} from 'react-native';

import Colors from '../modules/colors.module';

const search = StyleSheet.create({
    searchView: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    searchInput: {
        width: '100%',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        borderColor: Colors.theme.borderColor,
    }
});

export default search;