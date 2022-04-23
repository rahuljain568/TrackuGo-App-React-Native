/**
 * Component to handle sign in, signup related operations.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  ToastAndroid,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity, NativeModules
} from 'react-native';

import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import Geolocation from '@react-native-community/geolocation';
import moment from 'moment';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ButtonComponent from '../components/partials/Button.component';

import mainStyle from '../styles/main.style';
import authStyle from '../styles/auth.style';

import Loader from '../modules/loader.module';

import UriConfig from '../config/uri.config';

import ApiService from '../services/api.service';
import StorageService from '../services/storage.service';
import GeneralService from '../services/general.service';
import NavigationService from '../services/navigation.service';
import { Icon } from 'react-native-elements';
import { signUpValidation, signInValidation } from '../services/validation.service';
import LinearGradient from 'react-native-linear-gradient';
import Heartbeat from "../BackgroundService";

export default class AuthenticationComponent extends Component {

  constructor() {
    super();

    this.state = {
      errors: [],
      values: [],
      messages: [],
      loading: false
    }

  }

  componentDidMount() {
    this.fetchCurrentLocation();
  }

  //------current location start------//
  fetchCurrentLocation() {
    try {

      DeviceInfo.getPowerState().then((state) => {
        this.setState({
          values: { ...this.state.values, ["power"]: state.batteryLevel.toFixed(2) }
        });
      });
      DeviceInfo.getAvailableLocationProviders().then((providers) => {
        this.setState({
          values: { ...this.state.values, ["gps_status"]: providers.gps ? "ON" : "OFF" }
        });
        // if (providers.gps == true) {

        // }
        // else if (providers.gps == false)
        // {
        //   ToastAndroid.show("Please enable location11", ToastAndroid.LONG);
        // }
      });
      Geolocation.getCurrentPosition(
        (position) => {
          console.log('position', position);
          this.setState({
            values: { ...this.state.values, ["latitude"]: position.coords.latitude.toString() }
          });
          this.setState({
            values: { ...this.state.values, ["longitude"]: position.coords.longitude.toString() }
          });
        }, (error) => { console.log(error), alert("Please enable location") }, {
        enableHighAccuracy: false, timeout: 20000,
      }
      );
    } catch (error) {
      console.log('error1111', error);
    }
  }
  //------current location end------// 

  validateInput = (value, name) => {

    let { fieldValue, isValid, message } = GeneralService.isValid(name, value, signInValidation[name]);

    this.setState({
      values: { ...this.state.values, [name]: fieldValue },
      errors: { ...this.state.errors, [name]: !isValid },
      messages: { ...this.state.messages, [name]: message },
    });

    return isValid;
  }

  signin = () => {
    let values = this.state.values;

    for (let field in signInValidation) {
      if (!this.validateInput(values[field] || null, field)) {
        return false;
      }
    }
    messaging().getToken()
      .then(fcmToken => {
        if (fcmToken) {

          let params = {
            username: values.username,
            password: values.password,
            // username: '9312509399',
            // password: '9312509399',
            // username: 'demo',
            // password: 'demo',
            device: {
              id: DeviceInfo.getUniqueId(),
              notification_id: fcmToken,
              type: DeviceInfo.getDeviceType(),
              model: DeviceInfo.getDeviceName(),
              os: "ANDROID",
            }
          };
          this.setState({ loading: true });

          ApiService.call('post', UriConfig.uri.SIGNIN, params, async (content, status) => {
            this.setState({ loading: false });

            await StorageService.store('user', JSON.stringify(content.user));
            await StorageService.store('refresh_token', content.refresh_token);

            await StorageService.store('access_token', content.access_token);
            let circle_expiry_date = (content.user.circle_subscriptions.length > 0) ? content.user.circle_subscriptions[0].expiry_date : null;
            console.log(circle_expiry_date,'circle_expiry_date');
            await StorageService.store('circle_expiry_date', JSON.stringify(circle_expiry_date));
            await StorageService.store('device_info', JSON.stringify(params.device));
            

            NavigationService.navigate('auth', 'Splash');

            ToastAndroid.show(status.message, ToastAndroid.SHORT);
            Heartbeat.startService();
          }, (error, errors, content) => {

            this.setState({ loading: false });

            if (content && content.hasOwnProperty('is_verified') && !content.is_verified) {
              NavigationService.navigate('auth', 'VerifySignUp', { email: content.email, username: content.username });
            }

          });
        } else {
          return console.log("no token");
        }
      });
  }

  render() {

    let { errors, messages } = this.state;

    return (
      <View style={[mainStyle.body, authStyle.body]}>
        <Loader loading={this.state.loading} />
        <View style={{ height: '40%', alignItems: 'center', justifyContent: 'center' }}>
          <Image
            resizeMode="center"
            style={{
              width: 200,
              height: 150,
              // backgroundColor: 'red',
            }}
            source={require("../assets/images/logo1024-1024.png")}
          />
          {/* <Text style={{ fontSize: 17, color: 'gray', fontWeight: 'bold', textAlign: 'center' }}>
            TrackUGo
</Text> */}
          <Text style={{ fontSize: 15, color: 'gray', fontWeight: '500', textAlign: 'center', paddingHorizontal: 50 }}>
            SATrack
          </Text>
        </View>

        <View style={[authStyle.bodyPart]} />
        <View style={authStyle.loginBox}>
          <View style={mainStyle.formBody}>
            <Text style={{ fontSize: 22, color: 'black', fontFamily: 'TTNorms-Medium', textAlign: 'center', paddingBottom: 30 }}
            >LOGIN</Text>
            <View style={{ marginBottom: 15 }}>
              <View
                style={[
                  authStyle.formInput,
                  errors.username ? mainStyle.inputError : null,
                ]}
              >
                <View style={{ paddingVertical: 15, paddingHorizontal: 10 }}>
                  <Icon
                    name="user"
                    type="font-awesome"
                    size={20}
                    color="gray"
                  />
                </View>
                <TextInput
                  // autoCapitalize={false}
                  style={authStyle.formInputField}
                  onChangeText={(value) =>
                    this.validateInput(value, "username")
                  }
                  placeholder="Username"
                />
              </View>
              {errors.username && (
                <View style={{ paddingHorizontal: 30 }}>
                  <Text style={mainStyle.errorMessage}>
                    {messages.username}
                  </Text>
                </View>
              )}
            </View>

            <View style={{ marginBottom: 15 }}>
              <View
                style={[
                  authStyle.formInput,
                  errors.password ? mainStyle.inputError : null,
                ]}
              >
                <View style={{ paddingVertical: 15, paddingHorizontal: 10 }}>
                  <Icon
                    name="lock"
                    type="font-awesome"
                    size={20}
                    color="gray"
                  />
                </View>
                <TextInput
                  style={authStyle.formInputField}
                  onChangeText={(value) =>
                    this.validateInput(value, "password")
                  }
                  placeholder="Password"
                  secureTextEntry={true}
                />

              </View>
              {errors.password && (
                <View style={{ paddingHorizontal: 30 }}>
                  <Text style={mainStyle.errorMessage}>
                    {messages.password}
                  </Text>
                </View>
              )}
            </View>

            {/* <ButtonComponent
              text="Sign In"
              onClick={this.signin.bind(this)}
            /> */}
            <TouchableOpacity onPress={this.signin.bind(this)}>
              <LinearGradient
                colors={['#F39921', 'gray']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 1 }}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 30,
                  width: '100%',
                  flexDirection: 'row',
                  padding: 12,
                }}>
                <Text style={{ color: '#fff', fontSize: 20 }}>Sign In</Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={mainStyle.flexRow}>
              <Text
                onPress={() =>
                  NavigationService.navigate("auth", "ForgotPassword")
                }
                style={[
                  mainStyle.flexTwo,
                  mainStyle.textRight,
                  authStyle.bottomText,
                  mainStyle.fontmd,
                  mainStyle.textlg,
                ]}
              >
                Forgot Password?
              </Text>
            </View>
            <View style={mainStyle.flexRow, mainStyle.flexOne}>
              <Text
                onPress={() => NavigationService.navigate("auth", "SignUp")}
                style={[
                  mainStyle.textCenter,
                  authStyle.bottomText,
                  mainStyle.fontmd,
                  mainStyle.textxl,
                ]}
              >
                Don't have an account?
              </Text>
              <Text
                onPress={() => NavigationService.navigate("auth", "SignUp")}
                style={[
                  mainStyle.textCenter,
                  mainStyle.fontmd,
                  mainStyle.textxl,
                  mainStyle.yellowText
                ]}
              >
                Create Account
              </Text>
            </View>
            {/* <View style={mainStyle.flexRow}>
              <Text
                onPress={() => NavigationService.navigate("auth", "Login")}
                style={[
                  mainStyle.flexOne,
                  authStyle.bottomText,
                  mainStyle.fontmd,
                  mainStyle.textnm,
                ]}
              >
                Login New
              </Text>
              <Text
                onPress={() => NavigationService.navigate("auth", "NewSignUp")}
                style={[
                  mainStyle.flexTwo,
                  mainStyle.textRight,
                  authStyle.bottomText,
                  mainStyle.fontmd,
                  mainStyle.textnm,
                ]}
              >
                Signup New
              </Text>

            </View>
          */}
          </View>
        </View>
      </View>
    );
  };
}

export class SignUpComponent extends Component {
  constructor() {
    super();
    this.state = {
      errors: [],
      values: [],
      messages: [],
      loading: false,
      isDateTimePickerVisibleFrom1: false,
      dob: "", gender: "",
    }

  }

  validateInput = (value, name) => {
    try {
      let { fieldValue, isValid, message } = GeneralService.isValid(name, value, signUpValidation[name]);
      console.log(fieldValue, 'fieldValue');
      if (name == 'dob') {
        this.setState({
          values: { ...this.state.values, [name]: fieldValue },
          errors: {},
          messages: {},
        });
        return;
      } else if (name == "gender") {
        this.setState({
          values: { ...this.state.values, [name]: fieldValue },
          errors: {},
          messages: {},
        });
        return;
      }
      else {
        this.setState({
          values: { ...this.state.values, [name]: fieldValue },
          errors: { ...this.state.errors, [name]: !isValid },
          messages: { ...this.state.messages, [name]: message },
        });
      }

      return isValid;
    } catch (error) {
      console.log(error);
    }
  }

  componentDidMount() {
    this.fetchCurrentLocation();
  }

  //------current location start------//
  fetchCurrentLocation() {
    try {
      DeviceInfo.getPowerState().then((state) => {
        this.setState({
          values: { ...this.state.values, ["power"]: state.batteryLevel.toFixed(2) }
        });
      });
      DeviceInfo.getAvailableLocationProviders().then((providers) => {
        this.setState({
          values: { ...this.state.values, ["gps_status"]: providers.gps ? "ON" : "OFF" }
        });
      });
      Geolocation.getCurrentPosition(
        (position) => {
          console.log('position', position);
          this.setState({
            values: { ...this.state.values, ["latitude"]: position.coords.latitude.toString() }
          });
          this.setState({
            values: { ...this.state.values, ["longitude"]: position.coords.longitude.toString() }
          });
        }, (error) => { console.log(error), alert("Please enable location") }, {
        enableHighAccuracy: false, timeout: 20000,
      }
      );
    } catch (error) {
      console.log('error1111', error);
    }
  }
  //------current location end------// 

  doSignup = () => {
    try {
      this.fetchCurrentLocation();
      let values = this.state.values;
      if (values.gps_status == "OFF") {
        alert("Please enable location");
        return;
      }
      for (let field in signUpValidation) {
        if (!this.validateInput(values[field] || null, field)) {
          return false;
        }
      }
      Heartbeat.startService();
      this.setState({ loading: true });

      ApiService.call('post', UriConfig.uri.SIGNUP, this.state.values, (content, status) => {

        this.setState({ loading: false });

        NavigationService.navigate('auth', 'VerifySignUp', { email: content.email, username: content.username });

        ToastAndroid.show(status.message, ToastAndroid.SHORT);

      }, (error, errors, content) => {

        this.setState({ loading: false });

        GeneralService.placeErrors(this, errors);

      });
    } catch (error) {

    }
  }

  isUsernameAvailable = () => {
    try {
      let username = this.state.values.username;
      if (!this.validateInput(username, 'username')) {
        return false;
      }

      ApiService.call('get', UriConfig.uri.USERNAME_AVAILABLE + '/' + username, {}, (content) => {
        if (!content.username_available) {
          this.setState({
            errors: { ...this.state.errors, username: true },
            messages: { ...this.state.messages, username: 'Username already taken. Try another.' },
          });
        }

      }, (error, errors, content) => {

      });
    } catch (error) {

    }
  }
  showDateTimePickerFrom1 = () => {
    this.setState({ isDateTimePickerVisibleFrom1: true });
  };
  hideDateTimePickerFrom1 = () => {
    this.setState({ isDateTimePickerVisibleFrom1: false });
  };
  handleDatePickedFrom1 = date => {
    console.log("A date has been picked: ", date);
    this.setState({
      dob: moment(date).format('DD-MM-YYYY'),
    });
    this.validateInput(moment(date).format("YYYY-MM-DD 00:00:00"), 'dob')
    this.hideDateTimePickerFrom1();
  };
  onPressGender(flag) {
    try {
      if (flag == 1) {
        this.setState({ gender: 'Male' })
        this.validateInput('Male', 'gender')
      } else if (flag == 2) {
        this.setState({ gender: 'Female' })
        this.validateInput('Female', 'gender')
      } else if (flag == 3) {
        this.setState({ gender: 'Other' })
        this.validateInput('Other', 'gender')
      }
    } catch (error) {

    }
  }
  render() {
    let { errors, messages, gender } = this.state;
    return (
      <View style={{
        backgroundColor: '#fff',
        height: '100%',
        width: '100%',
      }}>
        <ScrollView keyboardShouldPersistTaps='always'>
          <View style={{ height: '20%', alignItems: 'center', justifyContent: 'center' }}>
            <Image
              resizeMode="center"
              style={{
                width: 150,
                height: 100,
              }}
              source={require("../assets/images/logo1024-1024.png")}
            />
            <Text style={{ fontSize: 17, color: 'gray', fontWeight: 'bold', textAlign: 'center' }}>
              SATrack</Text>
            <Text style={{ fontSize: 15, color: 'gray', fontWeight: '500', textAlign: 'center', paddingHorizontal: 50 }}>
              Tracking</Text>
          </View>

          <View style={[authStyle.signupBox, { paddingBottom: 35, padding: 20, marginTop: 20 }]}>

            <View style={{ paddingBottom: 15, alignItems: 'center' }}>
              <Text style={mainStyle.headerText}>Create Account</Text>
            </View>
            <View style={{ marginBottom: 15 }}>
              <View style={[authStyle.formInput, errors.profile_name ? mainStyle.inputError : null]} >
                <TextInput
                  style={authStyle.formInputField}
                  onChangeText={(value) => this.validateInput(value, 'profile_name')} SignUpComponent
                  placeholder="Profile Name"
                />

              </View>
              {
                errors.profile_name &&
                <View style={authStyle.vwError}>
                  <Text style={authStyle.errorMessage}>{messages.profile_name}</Text>
                </View>
              }
            </View>
            <View style={{ marginBottom: 15 }}>
              <View style={[authStyle.formInput, errors.username ? mainStyle.inputError : null]} >
                <TextInput
                  style={authStyle.formInputField}
                  onChangeText={(value) => this.validateInput(value, 'username')}
                  onEndEditing={(value) => this.isUsernameAvailable()}
                  placeholder="Username"
                />

              </View>
              {
                errors.username &&
                <View style={authStyle.vwError}>
                  <Text style={mainStyle.errorMessage}>{messages.username}</Text>
                </View>
              }
            </View>
            <View style={{ marginBottom: 15 }}>
              <View style={[authStyle.formInput, errors.password ? mainStyle.inputError : null]} >
                <TextInput
                  style={authStyle.formInputField}
                  onChangeText={(value) => this.validateInput(value, 'password')}
                  placeholder="Password"
                  secureTextEntry={true}
                />

              </View>
              {
                errors.password &&
                <View style={authStyle.vwError}>
                  <Text style={mainStyle.errorMessage}>{messages.password}</Text>
                </View>
              }
            </View>
            <View style={{ marginBottom: 15 }}>
              <View style={[authStyle.formInput, errors.email ? mainStyle.inputError : null]} >
                <TextInput
                  style={authStyle.formInputField}
                  onChangeText={(value) => this.validateInput(value, 'email')}
                  placeholder="Email"
                />

              </View>
              {
                errors.email &&
                <View style={authStyle.vwError}>
                  <Text style={mainStyle.errorMessage}>{messages.email}</Text>
                </View>
              }
            </View>
            <View style={{ marginBottom: 15 }}>
              <View style={[authStyle.formInput, errors.phone ? mainStyle.inputError : null]} >
                <TextInput
                  style={authStyle.formInputField}
                  onChangeText={(value) => this.validateInput(value, 'phone')}
                  placeholder="Mobile"
                  keyboardType="numeric"
                  maxLength={10}
                />

              </View>
              {
                errors.phone &&
                <View style={authStyle.vwError}>
                  <Text style={mainStyle.errorMessage}>{messages.phone}</Text>
                </View>
              }
            </View>
              {/*<TouchableOpacity style={{ marginBottom: 15 }} activeOpacity={1} onPress={this.showDateTimePickerFrom1}>
              <View style={[authStyle.formInput, errors.address ? mainStyle.inputError : null]} >
                <TextInput
                  style={[authStyle.formInputField, { color: '#333' }]}
                  value={this.state.dob}
                  placeholder="Date Of Birth"
                  editable={false}
                />
                <DateTimePickerModal
                  isVisible={this.state.isDateTimePickerVisibleFrom1}
                  onConfirm={this.handleDatePickedFrom1}
                  onCancel={this.hideDateTimePickerFrom1}
                  mode="date"
                  maximumDate={new Date()}
                />
              </View>
            </TouchableOpacity>
             <View style={{ marginBottom: 15 }}>
              <Text style={[authStyle.txtInputLabel, { marginTop: -7 }]}>Gender</Text>
              <View style={authStyle.vwGender}>
                <TouchableOpacity onPress={() => this.onPressGender(1)}
                  style={[authStyle.btnGender, { width: '30%' }, gender == 'Male' ? { backgroundColor: "#f39820" } : { backgroundColor: "#ffffff" }]}>
                  <MaterialIcons name={'gender-male'} size={22} color={gender == 'Male' ? "#ffffff" : "#333333"} />
                  <Text style={[authStyle.txtGender, gender == 'Male' ? { color: "#ffffff" } : { color: "#333333" }]}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.onPressGender(2)}
                  style={[authStyle.btnGender, { width: '30%' }, gender == 'Female' ? { backgroundColor: "#f39820" } : { backgroundColor: "#ffffff" }]}>
                  <MaterialIcons name={'gender-female'} size={22} color={gender == 'Female' ? "#ffffff" : "#333333"} />
                  <Text style={[authStyle.txtGender, gender == 'Female' ? { color: "#ffffff" } : { color: "#333333" }]}>Female</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.onPressGender(3)}
                  style={[authStyle.btnGender, { width: '30%' }, gender == 'Other' ? { backgroundColor: "#f39820" } : { backgroundColor: "#ffffff" }]}>
                  <MaterialIcons name={'gender-male-female-variant'} size={22} color={gender == 'Other' ? "#ffffff" : "#333333"} />
                  <Text style={[authStyle.txtGender, gender == 'Other' ? { color: "#ffffff" } : { color: "#333333" }]}>Other</Text>
                </TouchableOpacity>
              </View>
            </View> */}
            <View style={{ marginBottom: 15 }}>
              <View style={[authStyle.formInput, errors.address ? mainStyle.inputError : null]} >
                <TextInput
                  style={authStyle.formInputField}
                  onChangeText={(value) => this.validateInput(value, 'address')}
                  placeholder="Address (Optional)"
                />

              </View>
              {
                errors.address &&
                <View style={authStyle.vwError}>
                  <Text style={mainStyle.errorMessage}>{messages.address}</Text>
                </View>
              }
            </View>
            <TouchableOpacity onPress={this.doSignup.bind(this)} >
              <LinearGradient
                colors={['#F39921', 'gray']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 1 }}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 30,
                  width: '100%',
                  flexDirection: 'row',
                  padding: 12,
                }}>
                <Text style={{ color: '#fff', fontSize: 20 }}>Sign Up</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <Loader loading={this.state.loading} />
        </ScrollView>
      </View>
    );
  };
}

export class VerifySignUpComponent extends Component {

  constructor() {
    super();

    this.inputs = [];

    this.state = {
      otp: [],
      email: null,
      username: null,
      loading: false
    }
  }

  componentDidMount() {
    const { navigation } = this.props;
    this.setState({
      email: navigation.getParam('email', null),
      username: navigation.getParam('username', null)
    });
  }

  onInput = (index, value) => {
    let otp = this.state.otp;
    otp[index] = value;

    let focusOn = value ? index + 1 : index - 1;
    if (this.inputs[focusOn]) {
      this.inputs[focusOn].focus();
    }
  }

  resendOtp = () => {

    let email = this.state.email;
    if (!email) {
      return false;
    }

    this.setState({ loading: true });

    ApiService.call('post', UriConfig.uri.RESEND_OTP, { email: email }, (content) => {
      this.setState({ loading: false });
    }, (error, errors, content) => {
      this.setState({ loading: false });
    });

  }

  verifyAccount = () => {

    let { otp, email, username } = this.state;
    let otpText = otp.join("");

    if (otpText.length !== 4) {
      return false;
    }

    messaging().getToken()
      .then(fcmToken => {
        if (fcmToken) {

          let params = {
            email: email,
            username: username,
            otp: otpText,
            device: {
              id: DeviceInfo.getUniqueId(),
              notification_id: fcmToken,
              type: DeviceInfo.getDeviceType(),
              model: DeviceInfo.getDeviceName(),
              os: "ANDROID",
            }
          };

          console.log('device1111', params);

          this.setState({ loading: true });

          ApiService.call('post', UriConfig.uri.SIGNUP_VERIFY, params, async (content, status) => {
            this.setState({ loading: false });

            ToastAndroid.show(status.message, ToastAndroid.LONG);

            await StorageService.store('user', JSON.stringify(content.user));
            await StorageService.store('refresh_token', content.refresh_token);

            await StorageService.store('access_token', content.access_token);

            NavigationService.navigate('auth', 'Splash');

          }, (error, errors, content) => {
            this.setState({ loading: false });
          });

        } else {
          return console.log("no token");
        }
      });
  }

  render() {
    return (
      <View style={mainStyle.body}>
        <Loader loading={this.state.loading} />
        <View style={mainStyle.headerView}>
          <Text style={mainStyle.headerText}>Verify OTP</Text>
          <Text style={mainStyle.headerSubText}>We have sent you an OTP on {this.state.email} to complete signup</Text>
        </View>
        <View style={[mainStyle.formBody, mainStyle.itemsCenter]}>
          <View style={mainStyle.formBodyInner}>
            <View style={mainStyle.otpView}>

              <TextInput
                ref={(input) => { this.inputs[0] = input }}
                style={mainStyle.otpInput}
                keyboardType="numeric"
                onChangeText={(value) => this.onInput(0, value)}
                maxLength={1} />

              <TextInput
                ref={(input) => { this.inputs[1] = input }}
                style={mainStyle.otpInput}
                keyboardType="numeric"
                onChangeText={(value) => this.onInput(1, value)}
                maxLength={1} />

              <TextInput
                ref={(input) => { this.inputs[2] = input }}
                style={mainStyle.otpInput}
                keyboardType="numeric"
                onChangeText={(value) => this.onInput(2, value)}
                maxLength={1} />

              <TextInput
                ref={(input) => { this.inputs[3] = input }}
                style={mainStyle.otpInput}
                keyboardType="numeric"
                onChangeText={(value) => this.onInput(3, value)}
                maxLength={1} />

            </View>

            <ButtonComponent text="Verify" onClick={this.verifyAccount.bind(this)} />

          </View>

          <View style={[mainStyle.textCenter, mainStyle.pad10, { marginTop: 30 ]}>
            <TouchableOpacity onPress={() => this.resendOtp()}>
              <Text style={[mainStyle.lightText, mainStyle.fontmd, mainStyle.textnm]}>
                Click here to <Text style={[mainStyle.lightText, mainStyle.fontmd, mainStyle.textnm, mainStyle.blueText]}>resend</Text> otp
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    );
  };
}
