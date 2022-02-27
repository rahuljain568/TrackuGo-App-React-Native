import {
    StyleSheet
} from 'react-native';

import Colors from '../modules/colors.module';

const product = StyleSheet.create({
    productItem: {
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
    productImage: { 
        width: 160,
        height: 170,
    },
    productImageSmall: {
        width: 75,
        height: 120,
    },
    productDetailImage: {
        width: 150,
        height: 250,
    },
    productDetailCheckbox: {
        width: 25,
        height: 25,
        tintColor: Colors.theme.backgroundModal
    },
    productTitle: {
        fontSize: 24,
        color: Colors.theme.backgroundModal
    },
    productDetail: {
        fontSize: 14,
        color: Colors.darkGray
    },
    productAmount: {
        fontSize: 18,
        marginBottom: 10,
        color: Colors.yellow,
        marginTop: 2
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
    cartButtonView: {
        left: 0,
        right:0,
        bottom: 0,
        position: "absolute",
        width: "100%",
        backgroundColor: Colors.yellow
    },
    tabs: {
        flexDirection: 'row',
        marginBottom: 10,
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
    packageListVw: {
        flexDirection: 'row', alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray,
        paddingVertical: 10,
    },
    packageListCol1Vw: {
        flex: 3
    },
    packageListCol2Vw: {
        flex: 2.5,
        marginLeft: 5
    },
    packageListCol3Vw: {
        flex: 2,
        marginLeft: 5,
    },
    DetailTopCard: {
        marginTop: 10,
        marginHorizontal: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 10,
        backgroundColor: Colors.white,
        elevation: 3,
    },
    DetailCenterCard: {
        marginTop: 10,
        borderRadius: 10,
        marginHorizontal: 5, 
        paddingHorizontal: 10,
        paddingVertical:5,
        backgroundColor: Colors.white,
        elevation: 3,
    },
    DetailBottomCard: {
        marginTop: 10,
        borderRadius: 10,
        marginHorizontal: 5,
        paddingVertical:5,
        paddingTop:5,
        backgroundColor: Colors.white,
        elevation: 3,
        marginBottom: 55,
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
        marginTop:5,
        // backgroundColor: Colors.yellow,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10
    },
});

export default product;