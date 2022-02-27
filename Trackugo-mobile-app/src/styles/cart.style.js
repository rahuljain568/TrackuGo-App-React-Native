import {
    StyleSheet
} from 'react-native';

import Colors from '../modules/colors.module';

const cart = StyleSheet.create({
    cartItem: {
        // margin: 5,
        // padding: 10,
        // elevation: 2,
        // marginBottom: 15,
        // borderLeftWidth: 3,
        // borderLeftColor: Colors.yellow

        marginBottom: 10,
        borderRadius: 10,
        alignSelf: 'center',
        justifyContent: 'center',
        width: '99%',
        paddingVertical: 5,
        backgroundColor: Colors.white,
        elevation: 3,
        flexDirection: 'row',
        padding: 10
    },
    cartLeftPart: {
        marginRight: 5,
        borderRightWidth: 1,
        justifyContent: "center",
        borderColor: Colors.theme.borderColor,
    },
    productImage: {
        width: 100,
        height: 100,
    },
    deliveryRow: {
        paddingVertical: 3,
        flexDirection: 'row',
        alignItems: 'center',
        // paddingHorizontal: 10,
        justifyContent: 'space-between',
    },
    productButtonView: {
        borderWidth: 1,
        flexDirection: "row",
        borderRadius: 20,
        borderColor: Colors.yellow,
        justifyContent: 'center',
        alignItems: 'center'
    },
    productButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        justifyContent: "center",
        backgroundColor: Colors.yellow
    },
    productCount: {
        minWidth: 30,
        fontSize: 16,
        textAlign: "center",
        textAlignVertical: "center",
        color: Colors.yellow
    },
    checkoutButtonView: {
        left: 0,
        bottom: 0,
        width: "100%",
        position: "absolute",
        backgroundColor: Colors.yellow
    },

    DetailBottomCard: {
        marginTop: 10,
        borderRadius: 10,
        marginHorizontal: 5,
        paddingTop: 5,
        backgroundColor: Colors.white,
        elevation: 3,
        marginBottom: 25,
    },
    DetailBottomCardRow: {
        paddingVertical: 3,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        justifyContent: 'space-between',
    },
    DetailBottomCardLine: {
        marginTop: 5,
        height: 1,
        width: '100%',
        backgroundColor: Colors.gray
    },
    DetailPriceVw: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    DetailBottomCardRowTotal: {
        marginTop: 5,
        // backgroundColor: Colors.yellow,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10
    },
});

export default cart;