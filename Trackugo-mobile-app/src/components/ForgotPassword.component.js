/**
 * Component to handle forgot password related operations.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  Alert,
  TextInput,
  TouchableOpacity
} from 'react-native';

import ButtonComponent from '../components/partials/Button.component';

import mainStyle from '../styles/main.style';

import UriConfig from '../config/uri.config';

import ApiService from '../services/api.service';
import GeneralService from '../services/general.service';
import NavigationService from '../services/navigation.service';
import { forgotPasswordValidation, passwordValidation } from '../services/validation.service';

export default class ForgotPasswordComponent extends Component {

  constructor() {
    super();

    this.state = {
      errors: [],
      values: [],
      messages: [],
      loading: false
    }

  }

  validateInput = (value, name) => {

    let { fieldValue, isValid, message } = GeneralService.isValid(name, value, forgotPasswordValidation[name]);

    this.setState({
      values: { ...this.state.values, [name]: fieldValue },
      errors: { ...this.state.errors, [name]: !isValid },
      messages: { ...this.state.messages, [name]: message },
    });

    return isValid;
  }

  otpRequest = () => {

    let values = this.state.values;

    for (let field in forgotPasswordValidation) {
      if (!this.validateInput(values[field] || null, field)) {
        return false;
      }
    }

    this.setState({ loading: true });

    ApiService.call('post', UriConfig.uri.FORGOT_PASSWORD, values, async (content) => {
      this.setState({ loading: false });

      NavigationService.navigate('auth', 'ResetPassword', values);
    }, (error, errors, content) => {
      this.setState({ loading: false });
    });
  }

  render() {

    let { errors, messages } = this.state;
    return (
      <View style={mainStyle.body}>
        <View style={mainStyle.headerView}>
          <Text style={mainStyle.headerText}>Forgot Password</Text>
          <Text style={mainStyle.headerSubText}>Enter email to send otp</Text>
        </View>
        <View style={[mainStyle.formBody, mainStyle.itemsCenter]}>
          <View style={mainStyle.formBodyInner}>

            <View style={[mainStyle.formInput, errors.email ? mainStyle.inputError : null]} >
              <TextInput
                style={mainStyle.formInputField}
                onChangeText={(value) => this.validateInput(value, 'email')}
                placeholder="Email"
              />
              {
                errors.email &&
                <Text style={mainStyle.errorMessage}>{messages.email}</Text>
              }
            </View>

            <ButtonComponent text="Send OTP" onClick={this.otpRequest.bind(this)} />

          </View>
        </View>
      </View>
    );
  };
}

export class ResetPasswordComponent extends Component {

  constructor() {
    super();

    this.inputs = [];

    this.state = {
      otp: [],
      email: null,
      errors: [],
      values: [],
      messages: [],
      loading: false
    }

  }

  componentDidMount() {
    const { navigation } = this.props;
    this.setState({ email: navigation.getParam('email', null) });
  }

  onInput = (index, value) => {
    let otp = this.state.otp;
    otp[index] = value;

    let focusOn = value ? index + 1 : index - 1;
    if (this.inputs[focusOn]) {
      this.inputs[focusOn].focus();
    }
  }

  validateInput = (value, name) => {

    let { fieldValue, isValid, message } = GeneralService.isValid(name, value, passwordValidation[name], this.state.values);

    this.setState({
      values: { ...this.state.values, [name]: fieldValue },
      errors: { ...this.state.errors, [name]: !isValid },
      messages: { ...this.state.messages, [name]: message },
    });

    return isValid;
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

  resetPasswordRequest = () => {

    let { email, otp, values } = this.state;

    for (let field in passwordValidation) {
      if (!this.validateInput(values[field] || null, field)) {
        return false;
      }
    }

    let otpText = otp.join("");

    if (otpText.length !== 4) {
      return false;
    }

    let params = {
      email: email,
      otp: otpText,
      password: values.new_password
    };

    this.setState({ loading: true });

    ApiService.call('put', UriConfig.uri.RESET_PASSWORD, params, (content, status) => {
      this.setState({ loading: false });

      Alert.alert(status.title, status.message, [{ text: 'OK' }]);

      NavigationService.navigate('auth', 'Auth');

    }, (error, errors, content) => {
      this.setState({ loading: false });
    });
  }

  render() {

    let { errors, messages, email } = this.state;

    return (
      <View style={mainStyle.body}>
        <View style={mainStyle.headerView}>
          <Text style={mainStyle.headerText}>Reset Password</Text>
          <Text style={mainStyle.headerSubText}>We have sent you an OTP on {email} to reset password</Text>
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

            <View style={[mainStyle.formInput, errors.new_password ? mainStyle.inputError : null]} >
              <TextInput
                style={mainStyle.formInputField}
                onChangeText={(value) => this.validateInput(value, 'new_password')}
                placeholder="New Password"
                secureTextEntry={true}
              />
              {
                errors.new_password &&
                <Text style={mainStyle.errorMessage}>{messages.new_password}</Text>
              }
            </View>

            <View style={[mainStyle.formInput, errors.confirm_password ? mainStyle.inputError : null]} >
              <TextInput
                style={mainStyle.formInputField}
                onChangeText={(value) => this.validateInput(value, 'confirm_password')}
                placeholder="Confirm Password"
                secureTextEntry={true}
              />
              {
                errors.confirm_password &&
                <Text style={mainStyle.errorMessage}>{messages.confirm_password}</Text>
              }
            </View>

            <ButtonComponent text="Reset Password" onClick={this.resetPasswordRequest.bind(this)} />
          </View>

          <View style={mainStyle.textCenter, mainStyle.pad10, { marginTop: 30 }}>
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