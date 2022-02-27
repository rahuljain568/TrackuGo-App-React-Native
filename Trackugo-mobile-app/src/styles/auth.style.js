import {
  StyleSheet
} from 'react-native';

import Colors from '../modules/colors.module';

const auth = StyleSheet.create({
  body: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyColor: {
    backgroundColor: Colors.theme.lightBackgroundColor
  },
  bodyPart: {
    flex: 1,
    alignSelf: 'stretch',
  },
  bgImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loginBox: {
    top: '45%',
    elevation: 3,
    minWidth: '90%',
    minHeight: '50%',
    borderRadius: 20,
    position: 'absolute',
    paddingHorizontal: 20,
    // borderColor: Colors.theme.borderColor,
    backgroundColor: Colors.theme.backgroundColor
  },
  signupBox: {
    // top: '20%',
    elevation: 3,
    width: '90%',
    alignSelf:'center',
    // minHeight: '50%',
    borderRadius: 20,
    // position: 'absolute',
    paddingHorizontal: 20,
    // borderColor: Colors.theme.borderColor, 
    backgroundColor: Colors.theme.backgroundColor,
    marginBottom:40
  },
  tab: {
    padding: 20,
    borderColor: Colors.theme.borderColor,
    flexDirection: 'row',
    borderBottomWidth: 1
  },
  tabText: {
    flex: 1,
    fontSize: 20,
    color: Colors.theme.lightText,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  bottomText: {
    fontSize: 16,
    marginTop: 20,
    color: Colors.theme.lightText,
  },
  formInput: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 30,
    // marginBottom: 15,
    // padding: 5,
    borderColor: Colors.theme.borderColor,
  },
  formInputField: {
    width: '80%',
    fontSize: 14,
    fontFamily: 'TTNorms-Medium',
    paddingLeft: 10
  },
  errorMessage: {
    fontSize: 10,
    color: Colors.red,
  },
  vwError: {
    paddingHorizontal: 20,
    width:'85%'
  },
  txtInputLabel: {
      color: '#e7e7e7', 
      fontSize: 16,
  },
  vwGender: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 5
  },
  txtGender: {
      marginLeft: 5,
      fontSize: 14,
      color:  '#000',
      marginHorizontal: 10
  },
  btnGender: {
      alignItems: 'center',
      borderRadius: 5,
      justifyContent: 'center',
      flexDirection: 'row',
      backgroundColor: '#fff',
      height: 40,
      // width: 103,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.6,
      shadowRadius: 3,
      elevation: 3,
  },
});

export default auth;