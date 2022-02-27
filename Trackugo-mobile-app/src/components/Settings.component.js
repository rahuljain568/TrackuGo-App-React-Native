/**
 * Component to handle reports related operations.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native';

import mainStyle from '../styles/main.style';
import settingsStyle from '../styles/settings.style';

import NavigationService from '../services/navigation.service';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class SettingsComponent extends Component {
  static navigationOptions = ({ navigation }) => {
    let params = navigation.state.params || {};

    return {
      headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
      ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
    };
  };

  render() {

    return (
      <View style={[mainStyle.body, mainStyle.contentArea]}>

        {/* <TouchableOpacity style={settingsStyle.settingItem} onPress={() => NavigationService.navigate('homeStack', 'Subscriptions')}>
          <Text style={[mainStyle.fontmd, mainStyle.textxl, mainStyle.marginBottom5]}>Manage Devices</Text>
          <Text style={[mainStyle.fontrg, mainStyle.textnm, mainStyle.lightText]}>Purchase/View subscription of your devices</Text>
        </TouchableOpacity> */}
        {/* <TouchableOpacity style={settingsStyle.settingItem} onPress={() => NavigationService.navigate('homeStack', 'Payments')}>
          <Text style={[mainStyle.fontmd, mainStyle.textxl, mainStyle.marginBottom5]}>Payments</Text>
          <Text style={[mainStyle.fontrg, mainStyle.textnm, mainStyle.lightText]}>View history of payments processed</Text>
        </TouchableOpacity> */}
        <TouchableOpacity style={settingsStyle.settingItem} onPress={() => NavigationService.navigate('homeStack', 'Alert')}>
          <Text style={[mainStyle.fontmd, mainStyle.textxl, mainStyle.marginBottom5]}>Alert Setting</Text>
          <Text style={[mainStyle.fontrg, mainStyle.textnm, mainStyle.lightText]}>Get updates about devices setting up alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={settingsStyle.settingItem} onPress={() => NavigationService.navigate('homeStack', 'Notifications')}>
          <Text style={[mainStyle.fontmd, mainStyle.textxl, mainStyle.marginBottom5]}>Notifications</Text>
          <Text style={[mainStyle.fontrg, mainStyle.textnm, mainStyle.lightText]}>All alerts received related to devices</Text>
        </TouchableOpacity>
        <TouchableOpacity style={settingsStyle.settingItem} onPress={() => NavigationService.navigate('homeStack', 'Immobilizer')}>
          <Text style={[mainStyle.fontmd, mainStyle.textxl, mainStyle.marginBottom5]}>Immobilizer</Text>
          <Text style={[mainStyle.fontrg, mainStyle.textnm, mainStyle.lightText]}>Immobilizer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={settingsStyle.settingItem} onPress={() => NavigationService.navigate('homeStack', 'Profile')}>
          <Text style={[mainStyle.fontmd, mainStyle.textxl, mainStyle.marginBottom5]}>Profile</Text>
          <Text style={[mainStyle.fontrg, mainStyle.textnm, mainStyle.lightText]}>Manage your profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={settingsStyle.settingItem} onPress={() => NavigationService.navigate('homeStack', 'ChangePassword')}>
          <Text style={[mainStyle.fontmd, mainStyle.textxl, mainStyle.marginBottom5]}>Change Password</Text>
          <Text style={[mainStyle.fontrg, mainStyle.textnm, mainStyle.lightText]}>Change account password</Text>
        </TouchableOpacity>

      </View>
    );
  };
}