import {
    StyleSheet
} from 'react-native';

import Colors from '../modules/colors.module';

const main = StyleSheet.create({
    modalBackground: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-around',
        backgroundColor: '#00000040'
    },
    activityIndicatorWrapper: {
        width: 100,
        height: 100,
        display: 'flex',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: Colors.theme.backgroundColor,
    },
    body: {
        flex: 1,
        backgroundColor: Colors.theme.backgroundColor
    },
    contentArea: {
        minHeight: "100%",
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: Colors.theme.lightBackgroundColor
    },
    formBody: {
        paddingVertical: 20,
    },
    modalForm: {
        opacity: 8,
        bottom: -10,
        elevation: 2,
        width: '90%',
        borderRadius: 5,
        position: 'absolute',
        paddingHorizontal: 20,
        backgroundColor: Colors.theme.backgroundModal
    },
    formInput: {
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 15,
        borderColor: Colors.theme.borderColor,
    },
    formInputField: {
        fontSize: 16,
        fontFamily: 'TTNorms-Medium'
    },
    inputError: {
        borderColor: Colors.red,
    },
    errorMessage: {
        fontSize: 10,
        color: Colors.red,
    },
    formButton: {
        elevation: 0
    },
    headerView: {
        padding: 20
    },
    mainTitle: {
        fontSize: 24,
        marginTop: 4,
        color: Colors.white,
        fontFamily: 'TTNorms-Medium'
    },
    headerText: {
        fontSize: 28,
        fontFamily: 'TTNorms-Medium'
    },
    headerSubText: {
        fontSize: 18,
        marginTop: 10,
        fontFamily: 'TTNorms-Regular',
        color: Colors.theme.lightText
    },
    formBodyInner: {
        width: '80%'
    },
    otpView: {
        marginBottom: 15,
        flexDirection: 'row',
        paddingHorizontal: 10,
        justifyContent: 'space-between'
    },
    otpInput: {
        flex: 1,
        maxWidth: 50,
        fontSize: 30,
        textAlign: "center",
        borderBottomWidth: 5,
        paddingHorizontal: 15,
        fontFamily: "TTNorms-Medium",
        borderColor: Colors.theme.borderColor,
    },
    whiteText: {
        color: Colors.white
    },
    blueText: {
        color: Colors.blue
    },
    greenText: {
        color: Colors.green
    },
    yellowText: {
        color: Colors.yellow
    },
    redText: {
        color: Colors.red
    },
    yellowBg: {
        backgroundColor: Colors.yellow
    },
    list: {
        margin: 5,
        borderWidth: 1,
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderRadius: 10,
        borderColor: Colors.theme.borderColor
    },
    listLeft: {
        flex: 3
    },
    listRight: {
        flex: 1,
        alignItems: 'flex-end'
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    listDescription: {
        fontSize: 12,
        fontWeight: '200',
        color: Colors.theme.lightText,
    },
    listSmallText: {
        fontSize: 11,
        color: Colors.theme.lightText,
    },
    listRightButton: {
        flex: 1,
        alignItems: 'flex-end'
    },
    map: {
        flex: 1
    },
    flexRow: {
        flexDirection: 'row',
    },
    flexOne: {
        flex: 1
    },
    flexTwo: {
        flex: 2
    },
    flexThree: {
        flex: 3
    },
    flexFour: {
        flex: 3
    },
    marginLeft5: {
        marginLeft: 5
    },
    marginLeft10: {
        marginLeft: 10
    },
    marginBottom5: {
        marginBottom: 5
    },
    marginBottom10: {
        marginBottom: 10
    },
    pad10: {
        padding: 10
    },
    textLeft: {
        textAlign: 'left'
    },
    textRight: {
        textAlign: 'right'
    },
    textCenter: {
        textAlign: 'center'
    },
    itemsCenter: {
        alignItems: 'center', 
    },
    verticalCenter: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    xsIcon: {
        width: 12,
        height: 12,
    },
    smallIcon: {
        width: 15,
        height: 15,
    },
    vehicleIcon: {
        width: 40,
        height: 40,
    },
    largeIcon: {
        width: 50,
        height: 50,
    },
    mapIcon: {
        width: 35,
        height: 35
    },
    userIcon: {
        width: "100%",
        height: 100
    },
    fontbl: {
        fontFamily: 'TTNorms-Bold'
    },
    fontlt: {
        fontFamily: 'TTNorms-Light'
    },
    fontmd: {
        fontFamily: 'TTNorms-Medium'
    },
    fontrg: {
        fontFamily: 'TTNorms-Regular'
    },
    fonttn: {
        fontFamily: 'TTNorms-Thin'
    },
    textxs: {
        fontSize: 10
    },
    textsm: {
        fontSize: 12
    },
    textnm: {
        fontSize: 14
    },
    textlg: {
        fontSize: 16
    },
    textxl: {
        fontSize: 20
    },
    lightText: {
        color: Colors.theme.lightText
    },
    border: {
        borderWidth: 1,
        borderColor: Colors.theme.borderColor
    },
    borderRight: {
        borderRightWidth: 1,
        borderColor: Colors.theme.borderColor
    },
    flexWrap: {
        flexWrap: 'wrap'
    },
    justifyCenter: {
        justifyContent: 'center'
    },
    divider: {
        borderBottomWidth: 1,
        borderColor: Colors.theme.borderColor
    },
    dividerVertical: {
        flex: 1,
        height: "100%",
        paddingVertical: 5
    },
    dividerVerticalInner: {
        flex: 1,
        width: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: Colors.blue,
    },
    dividerWithMargin: {
        marginVertical: 10,
        borderBottomWidth: 1,
        borderColor: Colors.theme.borderColor
    },
    menuOptionMain: {
        padding: 5
    },
    menuOption: {
        paddingVertical: 2,
        paddingHorizontal: 10,
    },
    titleTextMain: {
        fontSize: 24,
        // marginTop: 10,
        fontWeight: '600',
        color: Colors.white,
        fontFamily: 'TTNorms-Medium'
    },
    titleTextSub: {
        fontSize: 16,
        fontWeight: '200',
        color: Colors.theme.lightText,
        fontFamily: 'TTNorms-Medium'
    },
    table: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    tr: {
        flex: 1,
        alignSelf: 'stretch',
        flexDirection: 'row',
        marginVertical: 10
    },
    td: {
        flex: 1,
        alignSelf: 'stretch',
    },
    inactive: {
        borderWidth: 2,
        borderColor: Colors.yellow
    },
    borderThick: {
        borderWidth: 3
    },
    borderGreen: {
        borderColor: Colors.green
    },
    floatingButton: {
        right: 10,
        width: 52,
        height: 52,
        bottom: 10,
        elevation: 3,
        borderWidth: 1,
        borderRadius: 30,
        position: 'absolute',
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.yellow,
        borderColor: Colors.theme.borderColor,
    },
    flexEnd: {
        alignSelf: "flex-end"
    },
    itemsFlexEnd: {
        alignItems: "flex-end"
    }
});

export default main;


//red #CB1111
//yellow #F2BC08
//green #157105