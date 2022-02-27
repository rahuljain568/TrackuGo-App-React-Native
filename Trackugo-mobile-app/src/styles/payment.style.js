import {
    StyleSheet
} from 'react-native';
import Colors from '../modules/colors.module';

const payment = StyleSheet.create({
    itemView: {
        // margin: 5,
        // padding: 10,
        // elevation: 1,
        // borderLeftWidth: 3,
        // flexDirection: "row"
        marginBottom: 10,
        borderRadius: 10,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginHorizontal: 5, 
        backgroundColor: Colors.white,
        elevation: 3,
    },
    itemTextMain: {
        flex: 1,
        fontSize: 18
    },
    paymentBlock: { 
        marginBottom: 10,
        borderRadius: 10,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginHorizontal: 5,   
        backgroundColor: Colors.white,
        elevation: 3,
    },
    detailBox: { 
        marginTop:10,
        marginBottom: 10,
        borderRadius: 10,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginHorizontal: 5, 
        backgroundColor: Colors.white,
        elevation: 3,
    },
    textLeft: {
        flex: 1,
        fontSize: 14
    },
    textRight: {
        flex: 2,
        fontSize: 14,
        textAlign: "right"
    },
    deviceItem: {
        marginBottom: 15
    },
    marginVertical5: {
        marginVertical: 5
    }, 
    paymentListRow: {
        marginTop:3,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    labelColor:{
        color:Colors.yellow
    },
    totalColor:{
        color:Colors.black
    }, 
});

export default payment;
