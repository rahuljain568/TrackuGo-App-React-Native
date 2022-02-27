/**
 * Component to render splash screen.
 */

import React, { Component } from 'react';
import {
  View,
  Image,
  Alert,
  ImageBackground, Text
} from 'react-native';

import messaging from '@react-native-firebase/messaging';

import { Images } from '../../modules/icons.module';

import mainStyle from "../../styles/main.style";
import authStyle from "../../styles/auth.style";

import UriConfig from '../../config/uri.config';

import ApiService from '../../services/api.service';
import StorageService from '../../services/storage.service';
import NavigationService from '../../services/navigation.service';

export default class SplashComponent extends Component {

  componentDidMount() {
    ApiService.call('get', UriConfig.uri.CONFIGURATIONS, {}, async (content) => {


      await StorageService.store('assets_url', content.configurations.assets_url);
      await StorageService.store('folders', JSON.stringify(content.configurations.folders));

      //Compare current application version with version in response.

      var accessToken = await StorageService.fetch('access_token');
      if (accessToken) {
        NavigationService.navigate('auth', 'Home');

        messaging().hasPermission()
          .then(enabled => {
            if (!enabled) {
              messaging().requestPermission()
                .then(() => {
                  // User has authorised  
                })
                .catch(error => {
                  // User has rejected permissions  
                });
            }
          });


      } else {
        NavigationService.navigate('auth', 'Auth');
      }

    }, (error, errors, content) => {
      Alert.alert(error);
    });

  }

  render() {
    return (
      <View
        style={{ backgroundColor: "white", flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        {/* <ImageBackground source={Images.bgImage} style={{
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center'
        }}> */}

        <Image resizeMode='cover'
          source={Images.mainLoginLogo}
          style={{
            width: 200,
            height: 200,
            borderRadius: 10,
            paddingHorizontal: 20,
          }}
        />
        <Text style={{
          fontSize: 15, color: 'gray', fontWeight: '500',
          textAlign: 'center', paddingHorizontal: 50,
        }}
        >Complete Family and Vehicle Tracking with Dating Solutions</Text>
        {/* </ImageBackground> */}
      </View>
    );
  };
}