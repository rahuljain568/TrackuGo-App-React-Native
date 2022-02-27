/**
 * Component to handle webview related operations.
 */

import React, { Component } from 'react';
import { View } from 'react-native';

import { WebView } from 'react-native-webview';

import Loader from '../modules/loader.module';

import NavigationService from '../services/navigation.service';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class WebviewComponent extends Component {

  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
      ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
      headerTitle: null,
      headerBackImage: null
    };
  };

  constructor() {
    super();

    this.state = {
      loading: true,
      content: null,
    };

  }

  componentDidMount() {

    let { navigation } = this.props,
      content = navigation.getParam('content', null);

    this.setState({
      loading: false,
      content: content,
    });

  }

  callbackTrack = (data) => {

    let { content } = this.state;

    if (data.url == content.pg_data.CALLBACK_URL) {
      NavigationService.back();
    }

  }

  render() {

    let { content } = this.state;

    if (content) {

      let data = content.pg_data,
        url = content.url;

      console.log("data", data);
      console.log("CHECKSUMHASH", data.CHECKSUMHASH);

      let bodyArray = [];
      for (let key in data) {
        bodyArray.push(key + "=" + data[key]);
      }

      console.log("bodyArray", bodyArray);

      let body = bodyArray.join("&");

      console.log("body", body);

      return (
        <WebView
          source={{
            uri: url,
            body: body,
            method: 'POST',
          }}
          onLoadStart={(a) => { console.log('onLoadStart', a) }}
          onLoadEnd={(a) => { console.log('onLoadEnd', a) }}
          onMessage={(a) => { console.log('onMessage', a) }}
          onNavigationStateChange={(data) => this.callbackTrack(data)}
          style={{ marginTop: 20 }}
        />
      );
    }
    return (
      <View style={{ flex: 1 }}>
        <Loader loading={this.state.loading} />
      </View>
    );

  }

}


/*
CALLBACK_URL: "https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID=TYP-000019"
CHANNEL_ID: "WAP"
CHECKSUMHASH: "AQbANWpmTlemDs8P9yDvz2QkyzUDHZubzdAl8BxOCFX7WtAUOeokLCO/oEpw1JYVA+W67aDh+RA+/RSKRxe5f8GNHEzxQqXwmiofHm+Kd0c="
CUST_ID: "5d7226fec44589652e4c59a2"
EMAIL: "lovepreet.yss@gmail.com"
INDUSTRY_TYPE_ID: "Retail"
MID: "wtekne01756378012824"
MOBILE_NO: "7011729920"
ORDER_ID: "TYP-000019"
TXN_AMOUNT: "500"
WEBSITE: "WEBSTAGING"
*/
