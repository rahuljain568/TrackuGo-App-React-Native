import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  Share,
  ToastAndroid,
  TouchableOpacity,
  Alert,
  StyleSheet,AppState
} from 'react-native';
// import BackgroundGeolocation from "@mauron85/react-native-background-geolocation";
import dynamicLinks from '@react-native-firebase/dynamic-links';

import mainStyle from '../styles/main.style';
import homeStyle from '../styles/home.style';

import Icons from '../modules/icons.module';
import Colors from '../modules/colors.module';

import AppConfig from '../config/app.config';
import UriConfig from '../config/uri.config';

import ApiService from '../services/api.service';
import StorageService from '../services/storage.service';
import GeneralService from '../services/general.service';
import NavigationService from '../services/navigation.service';

import { deviceValidation } from '../services/validation.service';
import axios from "axios";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ActiveTab from "./hometabs/ActiveTab";
import GPSTab from "./hometabs/GPSTab";

let timeout;

export default class HomepageComponent extends Component {
  static navigationOptions = ({ navigation }) => {
    let params = navigation.state.params || {},
      stats = params ? params.stats : null;

    return {
      headerTitle: (
        <View style={homeStyle.statsView}>
          <TouchableOpacity
            onPress={() => (params ? params.tabSelect(null) : null)}
          >
            <View
              style={[
                homeStyle.stat,
                params.selected == null
                  ? { borderBottomColor: Colors.blue, borderBottomWidth: 2 }
                  : null,
              ]}
            >
              <Text style={[homeStyle.statTextMain, mainStyle.blueText]}>
                {stats && stats.TOTAL ? stats.TOTAL : 0}
              </Text>
              <Text
                style={[
                  homeStyle.statTextSub,
                  mainStyle.blueText,
                  mainStyle.fontmd,
                ]}
              >
                All
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => (params ? params.tabSelect(null) : null)}
          >
            <View
              style={[
                homeStyle.stat,
                params.selected == null
                  ? { borderBottomColor: Colors.blue, borderBottomWidth: 2 }
                  : null,
              ]}
            >
              <Text style={[homeStyle.statTextMain, mainStyle.blueText]}>
                {stats && stats.TOTAL ? stats.TOTAL : 0}
              </Text>
              <Text
                style={[
                  homeStyle.statTextSub,
                  mainStyle.blueText,
                  mainStyle.fontmd,
                ]}
              >
                Personal
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => (params ? params.tabSelect("on_trip") : null)}
          >
            <View
              style={[
                homeStyle.stat,
                params.selected == "on_trip"
                  ? {
                    borderBottomColor: Colors.green,
                    borderBottomWidth: 2,
                  }
                  : null,
              ]}
            >
              <Text style={[homeStyle.statTextMain, mainStyle.greenText]}>
                {stats && stats.ON_TRIP ? stats.ON_TRIP : 0}
              </Text>
              <Text
                style={[
                  homeStyle.statTextSub,
                  mainStyle.greenText,
                  mainStyle.fontmd,
                ]}
              >
                Moving
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => (params ? params.tabSelect("stopped") : null)}
          >
            <View
              style={[
                homeStyle.stat,
                params.selected == "stopped"
                  ? { borderBottomColor: Colors.red, borderBottomWidth: 2 }
                  : null,
              ]}
            >
              <Text style={[homeStyle.statTextMain, mainStyle.redText]}>
                {stats && stats.STOPPED ? stats.STOPPED : 0}
              </Text>
              <Text
                style={[
                  homeStyle.statTextSub,
                  mainStyle.redText,
                  mainStyle.fontmd,
                ]}
              >
                Stop
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => (params ? params.tabSelect("idle") : null)}
          >
            <View
              style={[
                homeStyle.stat,
                params.selected == "idle"
                  ? {
                    borderBottomColor: Colors.yellow,
                    borderBottomWidth: 2,
                  }
                  : null,
              ]}
            >
              <Text style={[homeStyle.statTextMain, mainStyle.yellowText]}>
                {stats && stats.IDLE ? stats.IDLE : 0}
              </Text>
              <Text
                style={[
                  homeStyle.statTextSub,
                  mainStyle.yellowText,
                  mainStyle.fontmd,
                ]}
              >
                Idle
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => (params ? params.tabSelect("idle") : null)}
          >
            <View
              style={[
                homeStyle.stat,
                params.selected == "idle"
                  ? {
                    borderBottomColor: Colors.yellow,
                    borderBottomWidth: 2,
                  }
                  : null,
              ]}
            >
              <Text style={[homeStyle.statTextMain, mainStyle.yellowText]}>
                {stats && stats.IDLE ? stats.IDLE : 0}
              </Text>
              <Text
                style={[
                  homeStyle.statTextSub,
                  mainStyle.yellowText,
                  mainStyle.fontmd,
                ]}
              >
                No Data
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => (params ? params.tabSelect("idle") : null)}
          >
            <View
              style={[
                homeStyle.stat,
                params.selected == "idle"
                  ? {
                    borderBottomColor: Colors.yellow,
                    borderBottomWidth: 2,
                  }
                  : null,
              ]}
            >
              <Text style={[homeStyle.statTextMain, mainStyle.yellowText]}>
                {stats && stats.IDLE ? stats.IDLE : 0}
              </Text>
              <Text
                style={[
                  homeStyle.statTextSub,
                  mainStyle.yellowText,
                  mainStyle.fontmd,
                ]}
              >
                Expired
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      ),
      headerLeft: (
        <TouchableOpacity onPress={() => NavigationService.drawerOpen()}>
          <View>
            <View style={homeStyle.menuIcon}>
              <Image source={Icons.sideMenu} />
            </View>
          </View>
        </TouchableOpacity>
      ),
      headerRight: (
        <TouchableOpacity
          style={mainStyle.pad10}
          onPress={() => NavigationService.navigate("homeStack", "Search")}
        >
          {/* <Image source={Icons.search}></Image> */}
        </TouchableOpacity>
      ),
      headerStyle: {
        elevation: 0,
      },
    };
  };

  constructor() {
    super();

    let { latitudeDelta, longitudeDelta } = GeneralService.locationDelta(0.001);

    this.state = {
      page: 1,
      nextPage: null,

      user: null,
      devices: [],
      status: null,
      location: {
        latitude: AppConfig.default_location.latitute,
        longitude: AppConfig.default_location.longitude,
        latitudeDelta: latitudeDelta,
        longitudeDelta: longitudeDelta,
      },
      current_address: 'Not Available',
      refreshing: false,
      region: null,
      locations: [],
      stationaries: [],
      isRunning: false,
      errors: [],
      values: [],
      messages: [],

      loading: false,
      isModalVisible: false,

      tabStatus: 1,
      appState: AppState.currentState,
    };
  }

  async componentDidMount() {
    try {
      this.openDeepLinkingURL(); 
    } catch (error) {
      console.log(error);
    }
  }

  tabSelect = (tab) => {
    this.props.navigation.setParams({ selected: tab });

    this.setState({
      page: 1,
      nextPage: null,
      status: tab,
    }, () => {
      this.getDevices();
    });
  }

  getDevices = (page) => {

    this.setState({ refreshing: true });

    if (!page) {
      this.setState({ devices: [] });
    }

    ApiService.call('get', UriConfig.uri.DEVICES + "?status=" + (this.state.status || "") + (page ? "&page=" + page : ""), {}, async (content, status) => {

      let devices = content.devices;

      this.setState({
        refreshing: false,
        nextPage: devices.next_page,
        devices: [...this.state.devices, ...devices.items]
      });

      let stats = {},
        total = 0;

      if (content.counts) {
        let counts = content.counts;

        for (let record of counts) {
          if (record._id) {
            stats[record._id] = record.count;
          }

          total += record.count;
        }

        stats.TOTAL = total;
      }

      this.props.navigation.setParams({ stats: stats });

    }, (error, errors, content) => {
      this.setState({ refreshing: false });
    });
  }

  nextPageDevices = () => {
    let { page, nextPage } = this.state;

    if (nextPage && nextPage !== page) {
      this.setState({ page: nextPage }, () => {
        this.getDevices(nextPage);
      });
    }
  }

  toggleModal = (bool) => {
    this.setState({ isModalVisible: bool });

    this.setState({
      values: [],
      errors: [],
      messages: [],
    });
  }

  validateInput = (value, name) => {

    let { fieldValue, isValid, message } = GeneralService.isValid(name, value, deviceValidation[name]);

    this.setState({
      values: { ...this.state.values, [name]: fieldValue },
      errors: { ...this.state.errors, [name]: !isValid },
      messages: { ...this.state.messages, [name]: message },
    });

    return isValid;
  }

  deviceActivate = () => {

    let { values } = this.state;

    for (let field in deviceValidation) {
      if (!this.validateInput(values[field] || null, field)) {
        return false;
      }
    }

    this.setState({ loading: true });

    ApiService.call('post', UriConfig.uri.DEVICE_ACTIVATE, this.state.values, (content, status) => {

      this.setState({ loading: false });

      NavigationService.navigate('homeStack', 'Devices');

      ToastAndroid.show(status.message, ToastAndroid.LONG);

    }, (error, errors, content) => {

      this.setState({ loading: false });

      GeneralService.placeErrors(this, errors);
    });
  }

  shareLocation = async (device) => {
    try {

      let { user } = this.state;

      await Share.share({
        subject: device.license_plate + ' Device Location',
        message: user.profile_name + ' has just shared location with you of device ' + device.license_plate + '.\nAddress: ' + device.address + '.\nClick on below link to view on map.\nhttps://www.google.co.in/maps/place/' + device.location.coordinates[1] + ',' + device.location.coordinates[0] + '\nEnjoy our services. We are India’s biggest GPS security company. Visit - trackugo.in'
      });
    } catch (error) {
      alert(error.message);
    }
  }
  componentWillUnmount() {
    console.log("Component unmount")
    // BackgroundGeolocation.events.forEach(event =>
    //   BackgroundGeolocation.removeAllListeners(event)
    // );
    this.removeTimeout();
    this.componentWillUnmount_get();
  }

  getUserLocation = async () => {
    try {
      const accessToken = await StorageService.fetch("access_token");
      BackgroundGeolocation.getCurrentLocation(
        async (lastLocation) => {
          let region = this.state.region;
          const latitudeDelta = 0.01;
          const longitudeDelta = 0.01;
          region = Object.assign({}, lastLocation, {
            latitudeDelta,
            longitudeDelta,
          });
          let my_location = Object.assign(
            {},
            {
              latitude: lastLocation.latitude,
              longitude: lastLocation.longitude,
              latitudeDelta: latitudeDelta,
              longitudeDelta: longitudeDelta,
            }
          );
          let address = await GeneralService.geocodingReverse(
            {
              latitude: lastLocation.latitude,
              longitude: lastLocation.longitude,
            },
            (address) => {
              return address;
            },
            (error) => {
              return error;
            }
          );
          address = address ? address : 'Not Available';
          console.log("Current Address", address);
          this.setState({
            locations: [lastLocation],
            region,
            location: my_location,
            current_address: address,
          });
          axios({
            method: 'post',
            url: `http://api-staging.trackugo.in/user/location`,
            headers: {
              "Content-Type": "application/json",
              Authorization: accessToken ? "Bearer " + accessToken : null,
            },
            data: [{
              lat: lastLocation.latitude,
              lon: lastLocation.longitude,
              current_address: address
            }]
          }).then(() => {

          })
        },
        (error) => {
          setTimeout(() => {
            Alert.alert(
              "Error obtaining current location",
              JSON.stringify(error)
            );
          }, 100);
        }
      );
      this.removeTimeout();

      timeout = setTimeout(() => {
        // this.getUserLocation();
      }, 60000);
    } catch (error) {
      console.log(error);
    }
  }

  removeTimeout = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  // deep linking
  openDeepLinkingURL() {
    AppState.addEventListener('change', this._handleAppStateChange);
    dynamicLinks()
      .getInitialLink()
      .then(link => {
        if (link) {
          var url = link.url;
          var code = url.slice(-7);
          NavigationService.navigate("homeStack", "CircleList", { circleCode: code })
        }
      });
  }
  componentWillUnmount_get() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }
  _handleAppStateChange = async (nextAppState) => {
    try {
      this.setState({ appState: nextAppState });

      if (nextAppState === 'background') {
        console.log("App is in Background Mode.") 
      }

      if (nextAppState === 'active') {
        console.log("App is in Active Foreground Mode.")
        const handleDynamicLink = link => {
          console.log(link, 'Background link');
          if (link) {
            var url = link.url;
            var code = url.slice(-7);
            NavigationService.navigate("homeStack", "CircleList", { circleCode: code })
          }
        };
        dynamicLinks().onLink(handleDynamicLink)
      }

      if (nextAppState === 'inactive') {
        console.log("App is in inactive Mode.")
      }
    } catch (error) {
      console.log(error);
    }
  };
  // deep linking 

  render() {
    let { location, iconBaseUrl, isModalVisible, user, errors, messages, current_address, devices, tabStatus } = this.state;
    console.log("User Object", user);
    return (
      <View style={{ flex: 1, backgroundColor: Colors.white }}>
        <View style={{
          flexDirection: 'row',
          backgroundColor: '#595959',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 55
        }}>
          {/* <View style={styles.header}> */}
          <View style={{ flex: 1, }}>
            <TouchableOpacity activeOpacity={0.70} style={{ marginLeft: 10 }}
              onPress={() => { NavigationService.drawerOpen() }}>
              <Icon name="menu" size={35} color='#f2f2f2' />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 9, flexDirection: 'row', height: 55, justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity activeOpacity={1} style={styles.headerTextBox}
              onPress={() => { this.setState({ tabStatus: 1 }) }}>
              <Text style={{ fontSize: 20, color: '#f2f2f2', fontWeight: 'bold', textAlign: 'center' }}>ACTIVE</Text>
              <View style={[styles.vwTabLine, { backgroundColor: tabStatus == 1 ? Colors.yellow : '#595959', }]} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={1} style={styles.headerTextBox}
              onPress={() => { this.setState({ tabStatus: 2 }) }}>
              <Text style={{ fontSize: 20, color: '#f2f2f2', fontWeight: 'bold' }}>BUY GPS</Text>
              <View style={[styles.vwTabLine, { backgroundColor: tabStatus == 2 ? Colors.yellow : '#595959', }]} />
            </TouchableOpacity>
          </View>
          {/* </View> */}
        </View>
        {tabStatus == 1 ?
          (
            <ActiveTab navigation={this.props.navigation} user={user} />
          ) : (
            <GPSTab navigation={this.props.navigation} user={user} />
          )
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    height: 70,
    // flexDirection: 'row',
    // alignItems: 'center'
  },
  headerTextBox: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    height: 55,
  },
  eachBox: {
    width: '44%',
    borderWidth: 1,
    marginHorizontal: '3%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 5,
    marginBottom: 15,
    borderColor: '#e6e6e6',
    backgroundColor: '#cccccc',
    borderRadius: 5
  },
  yellowBox: {
    backgroundColor: '#ff8c1a',
    paddingHorizontal: 12,
    paddingVertical: 1,
    borderRadius: 5
  },
  vwRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  vwTabLine: { height: 4, width: '75%', position: 'absolute', bottom: 0, alignSelf: 'center', borderRadius: 30 }
})