/**
 * Component to handle subscriptions related operations.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  FlatList,
  TouchableOpacity,
  ToastAndroid
} from 'react-native';

import ButtonComponent from '../components/partials/Button.component';

import AppConfig from '../config/app.config';
import UriConfig from '../config/uri.config';

import mainStyle from '../styles/main.style';
import subscriptionStyle from '../styles/subscription.style';

import Colors from '../modules/colors.module';
import Loader from '../modules/loader.module';

import ApiService from '../services/api.service';
import GeneralService from '../services/general.service';
import StorageService from '../services/storage.service';
import NavigationService from '../services/navigation.service';
import RazorpayCheckout from 'react-native-razorpay';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class SubscriptionsComponent extends Component {
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
      refreshing: false,
      devices: []
    };
  }

  async componentDidMount() {

    let baseUrl = await StorageService.fetch('assets_url'),
      folders = JSON.parse(await StorageService.fetch('folders'));

    this.setState({ iconBaseUrl: baseUrl + folders.vehicle_icons });

    this.props.navigation.addListener('didFocus', (payload) => {
      this.getDevices();
    });
  }

  getDevices = () => {

    this.setState({ refreshing: true });

    ApiService.call('get', UriConfig.uri.DEVICES, {}, (content) => {

      this.setState({
        refreshing: false,
        devices: content.devices.items
      });

    }, (error, errors, content) => {
      this.setState({ refreshing: false });
    });
  }

  render() {

    let { iconBaseUrl, devices, refreshing } = this.state;

    return (
      <View style={mainStyle.body}>
        <View style={mainStyle.contentArea}>
          <FlatList
            data={devices}
            refreshing={refreshing}
            onRefresh={() => this.getDevices()}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => item._id}
            renderItem={({ item, index, separators }) => {

              let iconfile = iconBaseUrl ? iconBaseUrl + GeneralService.deviceSideviewIcon(item) : null,
                subscription = item.subscriptions && item.subscriptions.length > 0 ? item.subscriptions[0] : null,
                isOkay = subscription && item.status == "ACTIVE";

              return (

                <View style={[subscriptionStyle.itemView, isOkay ? null : mainStyle.inactive]}>
                  <View style={mainStyle.flexRow}>
                    {
                      item.status == "ACTIVE" &&
                      <Image source={{ uri: iconfile }} style={mainStyle.vehicleIcon} />
                    }
                    <View style={subscriptionStyle.itemHeaderText}>
                      <Text style={[subscriptionStyle.itemHeaderTextMain, mainStyle.fontmd]}>{item.license_plate}</Text>
                      {
                        subscription &&
                        <Text style={[mainStyle.textsm, mainStyle.lightText, mainStyle.fontrg]}>Expires On: {GeneralService.dateFormat(subscription.expiry_date, 'd/m/Y')}</Text>
                      }
                    </View>
                    {this.detailButtonRender(item)}
                  </View>

                </View>
              )
            }}
          />
        </View>
      </View>
    );
  }

  detailButtonRender = (item) => {

    if (item.status != "ACTIVE") {
      return (
        <TouchableOpacity onPress={() => alert('Please ask adminstrator to change device status.')}>
          <Text style={[subscriptionStyle.moreButton, mainStyle.fontmd, { backgroundColor: Colors.gray }]}>{GeneralService.camelcase(item.status)}</Text>
        </TouchableOpacity>
      );
    } else if (!item.subscriptions || item.subscriptions.length <= 0) {
      return (
        <TouchableOpacity onPress={() => NavigationService.navigate('homeStack', 'Packages', { device: item })}>
          <Text style={[subscriptionStyle.moreButton, mainStyle.fontmd, { backgroundColor: Colors.blue }]}>Renew</Text>
        </TouchableOpacity>
      );
    }
  }

}

export class SubscriptionComponent extends Component {

  static navigationOptions = ({ navigation }) => {
    let params = navigation.state.params || {};
    let device = params.device || null;

    return {
      headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
      ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
      headerTitle: (
        <View>
          <Text style={mainStyle.titleTextMain}>Subscription</Text>
          <Text style={mainStyle.titleTextSub}>{device ? device.license_plate : null}</Text>
        </View>
      )
    };
  };

  constructor() {
    super();

    this.state = {
      refreshing: false,
      subscriptions: []
    };
  }

  componentDidMount() {
    let { navigation } = this.props,
      device = navigation.getParam('device', null);

    this.props.navigation.setParams({ device: device });

    this.props.navigation.addListener('didFocus', async (payload) => {
      this.setState({
        device: device,
        user: JSON.parse(await StorageService.fetch('user')),
      }, () => {
        this.getSubscriptions();
      });
    });

  }

  getSubscriptions = () => {

    let { device } = this.state;

    this.setState({ refreshing: true });

    ApiService.call('get', UriConfig.uri.SUBSCRIPTIONS + "/" + device._id, {}, (content) => {

      this.setState({
        refreshing: false,
        subscriptions: content.subscriptions
      });

    }, (error, errors, content) => {
      this.setState({ refreshing: false });
    });
  }

  render() {

    let { refreshing, subscriptions } = this.state;

    return (
      <View style={mainStyle.body}>
        <View style={mainStyle.contentArea}>

          <FlatList
            data={subscriptions}
            refreshing={refreshing}
            onRefresh={() => this.getSubscriptions()}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => item._id}
            ListEmptyComponent={this.renderEmptyContainer()}
            renderItem={({ item, index, separators }) => {

              let now = GeneralService.dateFormat(null, 'Y-m-d H:i:s'),
                isCurrent = GeneralService.dateFormat(item.start_date, 'Y-m-d') < now && GeneralService.dateFormat(item.expiry_date, 'Y-m-d') > now;

              return (
                <View style={subscriptionStyle.selectedPackage}>
                  <Text style={[mainStyle.textxl, mainStyle.marginBottom5, mainStyle.fontmd]}>{item.package.package_name}</Text>
                  <Text style={[mainStyle.textnm, mainStyle.marginBottom5, mainStyle.fontrg]}>
                    Validity Period:
                    <Text style={mainStyle.fontmd}>{GeneralService.dateFormat(item.start_date, 'd/m/Y')} - {GeneralService.dateFormat(item.expiry_date, 'd/m/Y')}</Text>
                  </Text>

                  <Text style={[mainStyle.textRight, mainStyle.greenText, mainStyle.textlg, mainStyle.fontbl]}>{GeneralService.amountString(item.paid_amount)}</Text>
                </View>
              )
            }}
          />
          {this.packageButtonRender()}

        </View>
      </View>
    );
  }

  renderEmptyContainer() {
    return (
      <View style={mainStyle.itemsCenter}>
        <Text style={mainStyle.fontrg}>{this.state.refreshing ? "Fetching subscriptions..." : "No subscription availed for device."}</Text>
      </View>
    );
  }

  packageButtonRender = () => {
    let { device, user } = this.state;

    if (!device || !user) {
      return null;
    }

    if (user.parent) {
      return (
        <View style={mainStyle.itemsCenter}>
          <Text style={mainStyle.fontrg}>Please ask your adminstrator to extend subscription.</Text>
        </View>
      );
    }

    return (
      <ButtonComponent text="See Packages" onClick={this.navigateToPackages.bind(this)} color={Colors.darkGray} />
    );
  }

  navigateToPackages = () => {
    return NavigationService.navigate('homeStack', 'Packages', { device: this.state.device });
  }

}

export class PackagesComponent extends Component {

  static navigationOptions = ({ navigation }) => {
    let params = navigation.state.params || {};
    let device = params.device || null;

    return {
      headerTitle: (
        <View>
          <Text style={mainStyle.titleTextMain}>Packages</Text>
          <Text style={mainStyle.titleTextSub}>{device ? device.license_plate : null}</Text>
        </View>
      )
    };
  };

  constructor() {
    super();

    this.state = {
      loading: false,
      refreshing: false,
      packages: []
    };
  }

  componentDidMount() {
    let { navigation } = this.props,
      device = navigation.getParam('device', null);

    this.props.navigation.setParams({ device: device });

    this.setState({ device: device }, () => {
      this.getPackages();
    });


    this.props.navigation.addListener('didFocus', (payload) => {

      let { subscription } = this.state;
      if (subscription) {
        NavigationService.reset([{
          routeName: 'Payments'
        },
        {
          routeName: 'PaymentDetail',
          data: { id: subscription.payment }
        }]);
      }
    });

  }

  getPackages = () => {

    this.setState({ refreshing: true });

    ApiService.call('get', UriConfig.uri.PACKAGES + "?package_type=GPS", {}, (content) => {

      this.setState({
        refreshing: false,
        packages: content.packages
      });
      console.log('content111111', content);
    }, (error, errors, content) => {
      this.setState({ refreshing: false });
    });
  }

  selectPackage = (item) => {
    let { device } = this.state, packageId = item._id;

    this.setState({
      loading: true,
      selectedPackage: null
    });

    ApiService.call('post', UriConfig.uri.PACKAGE_VALIDATE, { package: packageId, device: device._id }, (content) => {
      console.log(content, 'content');
      this.setState({
        loading: false,
        selectedPackage: content.package
      });
    }, (error, errors, content) => {
      this.setState({ loading: false });

      if (error) {
        Alert.alert('Error', error);
      }

    });
  }

  purchasePackage = () => {
    let { device, selectedPackage } = this.state;

    this.setState({ loading: true });

    ApiService.call('post', UriConfig.uri.PACKAGE_PURCHASE, { package: selectedPackage._id, device: device._id }, (content) => {

      this.setState({
        loading: false,
        subscription: content.subscription
      });
      this.payment(content);
      // NavigationService.navigate('homeStack', 'Webview', { content: content });

    }, (error, errors, content) => {
      this.setState({ loading: false });

    });
  }

  async payment(content) {
    try {
      // let amount = content.razorpay_order.amount;
      let amount = content.subscription.paid_amount;
      let user = JSON.parse(await StorageService.fetch('user'));
      console.log(user, 'user');
      var options = {
        description: '',
        // image: 'https://i.imgur.com/3g7nmJC.png',
        currency: 'INR',
        key: AppConfig.razorpay_key,
        amount: amount * 100,
        name: 'TrackUGo',
        order_id: content.razorpay_order.id,
        prefill: {
          email: user.email,
          contact: user.phone,
          name: user.username,
        },
        theme: { color: Colors.theme.mainColor }
      }
      RazorpayCheckout.open(options).then((data) => {
        console.log(data, 'RazorpayCheckout');
        this.verifyPayment(content, data);
      }).catch((error) => {
        console.log(error, 'RazorpayCheckout error');
        ToastAndroid.show('Payment failed', ToastAndroid.LONG);
      });
    } catch (error) {
      console.log(error);
    }
  }

  async verifyPayment(content, razorpay) {
    try {
      let uri = UriConfig.uri.PACKAGE_PAYMENT_RESPONSE,
        params = {
          "amount": content.subscription.paid_amount,
          "razorpay_payment_id": razorpay.razorpay_payment_id,
          // "razorpay_order_id": razorpay.razorpay_order_id,
          "razorpay_order_id": content.subscription._id,
          "razorpay_signature": razorpay.razorpay_signature,
          "message": "message"
        };
      ApiService.call('post', uri + '/' + content.subscription._id, params, (content) => {
        console.log('PACKAGE_PAYMENT_RESPONSE', content);
        this.setState({ isLoading: false });
        ToastAndroid.show('Payment success', ToastAndroid.LONG);
        NavigationService.navigate('homeStack', 'Home')
      }, (error, errors, content) => {
        ToastAndroid.show('Payment failed', ToastAndroid.LONG);
        this.setState({ circle: [], isLoading: false, });
      });
    } catch (error) {
      console.log(error);
    }
  }

  render() {

    let { refreshing, packages, selectedPackage } = this.state;

    return (
      <View style={mainStyle.contentArea}>
        <Loader loading={this.state.loading} />

        {
          selectedPackage &&
          <View style={subscriptionStyle.selectedPackage}>

            <Text style={[mainStyle.textlg, mainStyle.marginBottom5, mainStyle.fontbl]}>{selectedPackage.package_name}</Text>
            <Text style={[mainStyle.textnm, mainStyle.marginBottom5, mainStyle.fontrg]}>
              Validity Period: <Text style={mainStyle.fontmd}>{GeneralService.dateFormat(selectedPackage.start_date, 'd/m/Y')} - {GeneralService.dateFormat(selectedPackage.expiry_date, 'd/m/Y')}</Text>
            </Text>

            <TouchableOpacity onPress={() => this.purchasePackage()}>
              <Text style={[subscriptionStyle.payButton, mainStyle.fontmd]}>Pay {GeneralService.amountString(selectedPackage.price)}</Text>
            </TouchableOpacity>
          </View>
        }

        {
          selectedPackage &&
          <View style={[mainStyle.dividerWithMargin, { marginHorizontal: 10 }]} />
        }

        <FlatList
          data={packages}
          refreshing={refreshing}
          onRefresh={() => this.getPackages()}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => item._id}
          ListEmptyComponent={this.renderEmptyContainer()}
          renderItem={({ item, index, separators }) => {

            return (

              <View style={[subscriptionStyle.packageItem, mainStyle.flexRow]}>

                <View style={[subscriptionStyle.packageLeftPart, mainStyle.flexOne]}>
                  <Text style={[mainStyle.textlg, mainStyle.textCenter, mainStyle.fontbl]}>{GeneralService.amountString(item.price)}</Text>
                  <Text style={[mainStyle.textsm, mainStyle.textCenter, mainStyle.lightText, mainStyle.fontrg]}>{item.period} Days</Text>
                </View>
                <View style={mainStyle.flexThree}>
                  <Text style={[mainStyle.textnm, mainStyle.fontmd]}>{item.package_name}</Text>
                  <Text style={[mainStyle.textsm, mainStyle.lightText, mainStyle.fontrg]}>{item.package_description}</Text>
                </View>
                <View style={mainStyle.justifyCenter}>
                  <Text style={[mainStyle.blueText, mainStyle.fontmd]} onPress={() => this.selectPackage(item)}>Apply</Text>
                </View>

              </View>
            )
          }}
        />

      </View>
    );
  }

  renderEmptyContainer() {
    return (
      <View style={mainStyle.itemsCenter}>
        <Text style={mainStyle.fontrg}>{this.state.refreshing ? "Fetching packages..." : "No package available."}</Text>
      </View>
    );
  }

}