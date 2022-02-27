
/**
 * Component to handle profile related operations.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  ToastAndroid,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';

import { Icon } from 'react-native-elements';

import ButtonComponent from '../components/partials/Button.component';

import UriConfig from '../config/uri.config';

import mainStyle from '../styles/main.style';
import profileStyle from '../styles/profile.style';

import ApiService from '../services/api.service';
import StorageService from '../services/storage.service';
import GeneralService from '../services/general.service';
import NavigationService from '../services/navigation.service';

import Loader from '../modules/loader.module';
import Colors from '../modules/colors.module';

import { profileValidation, passwordValidation } from '../services/validation.service';
import { ScrollView } from 'react-native-gesture-handler';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class ProfileComponent extends Component {

  static navigationOptions = ({ navigation }) => {

    return {
      headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
      ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
      headerBackImage: (
        <View style={{ padding: 10 }}>
          <Icon name='angle-left' type='font-awesome' color={Colors.white} size={38} />
        </View>
      ),
      headerStyle: {
        elevation: 0,
        backgroundColor: Colors.yellow
      }
    };
  };

  constructor() {
    super();

    this.state = {
      user: null,
      loading: false,
      editing: false,

      errors: [],
      values: [],
      messages: []
    }

  }

  async componentDidMount() {

    let user = JSON.parse(await StorageService.fetch('user'));

    this.setState({
      user: user,
      values: {
        profile_name: user.profile_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      }
    });
  }

  toggleProfileForm = () => {

    let { editing } = this.state;

    this.setState({
      editing: !editing,
      errors: []
    });
  }

  validateInput = (value, name) => {

    let { fieldValue, isValid, message } = GeneralService.isValid(name, value, profileValidation[name]);

    this.setState({
      values: { ...this.state.values, [name]: fieldValue },
      errors: { ...this.state.errors, [name]: !isValid },
      messages: { ...this.state.messages, [name]: message },
    });

    return isValid;
  }

  profileSave = () => {

    let { values } = this.state;

    for (let field in profileValidation) {
      if (!this.validateInput(values[field] || null, field)) {
        return false;
      }
    }

    this.setState({ loading: true });

    ApiService.call('put', UriConfig.uri.USER_PROFILE, this.state.values, (content) => {

      this.setState({
        loading: false,
        editing: false,
        user: content.user
      });

      StorageService.store('user', JSON.stringify(content.user));
    }, (error, errors, content) => {

      this.setState({ loading: false });

      GeneralService.placeErrors(this, errors);
    });
  }

  render() {

    let { loading, user, editing, errors, messages, values } = this.state;

    return (
      <SafeAreaView>
        <ScrollView>
          <Loader loading={loading} />

          {
            !editing &&
            (
              <View>

                <TouchableOpacity style={profileStyle.editIcon} onPress={() => this.toggleProfileForm()}>
                  <Icon name='pencil' type='font-awesome' size={30} color={Colors.white} />
                </TouchableOpacity>

                <View style={profileStyle.upperPart}>
                  <View style={profileStyle.iconView}>
                    <Icon name='user' type='font-awesome' size={75} color={Colors.white} />
                  </View>
                  <Text style={[mainStyle.whiteText, mainStyle.textxl, mainStyle.fontbl]}>{user ? user.profile_name : null}</Text>
                </View>

                <View style={profileStyle.lowerPart}>
                  <View style={profileStyle.section}>
                    <View style={profileStyle.sectionText}>
                      <Text style={[profileStyle.sectionTextSub, mainStyle.fontrg]}>Phone</Text>
                      <Text style={[profileStyle.sectionTextMain, mainStyle.fontmd]}>{user ? user.phone : null}</Text>
                    </View>
                  </View>
                  <View style={profileStyle.section}>
                    <View style={profileStyle.sectionText}>
                      <Text style={[profileStyle.sectionTextSub, mainStyle.fontrg]}>Email</Text>
                      <Text style={[profileStyle.sectionTextMain, mainStyle.fontmd]}>{user ? user.email : null}</Text>
                    </View>
                  </View>
                  <View style={profileStyle.section}>
                    <View style={profileStyle.sectionText}>
                      <Text style={[profileStyle.sectionTextSub, mainStyle.fontrg]}>Address</Text>
                      <Text style={[profileStyle.sectionTextMain, mainStyle.fontmd]}>{user ? user.address : null}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )
          }

          {
            editing && user &&
            (
              <View style={[mainStyle.formBody, mainStyle.itemsCenter]}>
                <View style={mainStyle.formBodyInner}>

                  <View style={[mainStyle.formInput, errors.profile_name ? mainStyle.inputError : null]} >
                    <TextInput
                      onChangeText={(value) => this.validateInput(value, 'profile_name')}
                      placeholder="Profile Name"
                      value={values.profile_name || user.profile_name}
                    />
                    {
                      errors.profile_name &&
                      <Text style={mainStyle.errorMessage}>{messages.profile_name}</Text>
                    }
                  </View>

                  <View style={[mainStyle.formInput, errors.phone ? mainStyle.inputError : null]} >
                    <TextInput
                      onChangeText={(value) => this.validateInput(value, 'phone')}
                      placeholder="Phone"
                      keyboardType="numeric"
                      maxLength={10}
                      value={values.phone || user.phone}
                    />
                    {
                      errors.phone &&
                      <Text style={mainStyle.errorMessage}>{messages.phone}</Text>
                    }
                  </View>

                  <View style={[mainStyle.formInput, errors.email ? mainStyle.inputError : null]} >
                    <TextInput
                      onChangeText={(value) => this.validateInput(value, 'email')}
                      placeholder="Email"
                      value={values.email || user.email}
                    />
                    {
                      errors.email &&
                      <Text style={mainStyle.errorMessage}>{messages.email}</Text>
                    }
                  </View>

                  <View style={[mainStyle.formInput, errors.address ? mainStyle.inputError : null]} >
                    <TextInput
                      onChangeText={(value) => this.validateInput(value, 'address')}
                      placeholder="Address (Optional)"
                      value={values.address || user.address}
                    />
                    {
                      errors.address &&
                      <Text style={mainStyle.errorMessage}>{messages.address}</Text>
                    }
                  </View>

                  <View style={mainStyle.flexRow}>
                    <View style={[mainStyle.flexTwo, mainStyle.pad10]}>
                      <ButtonComponent text="Save" onClick={this.profileSave.bind(this)} />
                    </View>
                    <View style={[mainStyle.flexOne, mainStyle.pad10]}>
                      <ButtonComponent text="Cancel" onClick={this.toggleProfileForm.bind(this)} color={Colors.gray} />
                    </View>
                  </View>
                </View>
              </View>
            )
          }

        </ScrollView>
      </SafeAreaView>
    );
  };
}

export class ChangePasswordComponent extends Component {
  static navigationOptions = ({ navigation }) => {
    let params = navigation.state.params || {};

    return {
      headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
      ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
    };
  };
  constructor() {
    super();

    this.state = {
      loading: false,

      errors: [],
      values: [],
      messages: []
    }

  }

  validateInput = (value, name) => {

    let { fieldValue, isValid, message } = GeneralService.isValid(name, value, passwordValidation[name]);

    this.setState({
      values: { ...this.state.values, [name]: fieldValue },
      errors: { ...this.state.errors, [name]: !isValid },
      messages: { ...this.state.messages, [name]: message },
    });

    return isValid;
  }

  changePassword = () => {

    let { values } = this.state;

    for (let field in passwordValidation) {
      if (!this.validateInput(values[field] || null, field)) {
        return false;
      }
    }

    this.setState({ loading: true });

    ApiService.call('put', UriConfig.uri.CHANGE_PASSWORD, {
      password: this.state.values.new_password,
      confirm_password: this.state.values.confirm_password
    }, (content, status) => {

      this.setState({ loading: false });

      ToastAndroid.show(status.message, ToastAndroid.SHORT);

      NavigationService.navigate('homeStack', 'Settings');

    }, (error, errors, content) => {

      this.setState({ loading: false });

      GeneralService.placeErrors(this, errors);
    });
  }

  render() {

    let { loading, errors, messages } = this.state;

    return (
      <View style={[mainStyle.body, mainStyle.contentArea]}>
        <Loader loading={loading} />
        <View style={[mainStyle.formInput, errors.new_password ? mainStyle.inputError : null]} >
          <TextInput
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
            onChangeText={(value) => this.validateInput(value, 'confirm_password')}
            placeholder="Confirm Password"
            secureTextEntry={true}
          />
          {
            errors.confirm_password &&
            <Text style={mainStyle.errorMessage}>{messages.confirm_password}</Text>
          }
        </View>

        <ButtonComponent text="Change Password" onClick={this.changePassword.bind(this)} />
      </View>
    );
  };
}