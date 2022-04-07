/**
 * Component to show homepage.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  Share,
  FlatList,
  TextInput,
  ScrollView,
  SafeAreaView,
  ToastAndroid,
  TouchableOpacity,
  Alert, RefreshControl
} from 'react-native';

import { colors, Icon } from 'react-native-elements';
import MapView, { Marker } from 'react-native-maps';
// import BackgroundGeolocation from "@mauron85/react-native-background-geolocation";


import ButtonComponent from '../../components/partials/Button.component';

import mainStyle from '../../styles/main.style';
import homeStyle from '../../styles/home.style';

import Icons from '../../modules/icons.module';
import Colors from '../../modules/colors.module';
import Loader from '../../modules/loader.module';

import AppConfig from '../../config/app.config';
import UriConfig from '../../config/uri.config';

import ApiService from '../../services/api.service';
import StorageService from '../../services/storage.service';
import GeneralService from '../../services/general.service';
import NavigationService from '../../services/navigation.service';

import { deviceValidation } from '../../services/validation.service';
import moment from "moment";
import axios from "axios";

import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

let timeout;

export default class ActiveTab extends Component {

  static navigationOptions = ({ navigation }) => {
    let params = navigation.state.params || {},
      stats = params ? params.stats : null;

    return {
      headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
      ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
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
      filtered_devices: [],
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
    };
  }

  async componentDidMount() {
    try {
      let { latitudeDelta, longitudeDelta } = GeneralService.locationDelta(0.001);
      let loggedUser = JSON.parse(await StorageService.fetch('user')),
        baseUrl = await StorageService.fetch('assets_url'),
        folders = JSON.parse(await StorageService.fetch('folders'));
      let lng = loggedUser.location.coordinates[0];
      let lat = loggedUser.location.coordinates[1];
      let location = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: latitudeDelta,
        longitudeDelta: longitudeDelta,
      },
        region = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: latitudeDelta,
          longitudeDelta: longitudeDelta,
        };
      this.setState({
        region, location: location, current_address: loggedUser.address,
        user: loggedUser, iconBaseUrl: baseUrl + folders.vehicle_icons
      });
      this.props.navigation.setParams({ selected: null, tabSelect: this.tabSelect });
      this.props.navigation.addListener('didFocus', (payload) => { this.getDevices(); });
      this.getDevices();
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


  onTabSelect(tab) {
    this.props.navigation.setParams({ selected: tab });

    // local filter
    let { devices } = this.state, tmpArray = [];
    let tmpFilter = ""
    if (tab) {
      tmpFilter = tab.toUpperCase()
      devices.forEach(element => {
        if (element.current_state == tmpFilter) {
          tmpArray.push(element)
        }
      });
    } else {
      tmpArray = devices
    }
    this.setState({
      filtered_devices: tmpArray,
      page: 1,
      nextPage: null,
      status: tab,
    })

    //// server side filter
    // this.setState({
    //   page: 1,
    //   nextPage: null,
    //   status: tab,
    // }, () => {
    //   this.getDevices();
    // });
  }

  getDevices = (page) => {
    this.setState({ refreshing: true });

    if (!page) {
      this.props.navigation.setParams({ selected: null });
      this.setState({ devices: [], filtered_devices: [] });
    }

    ApiService.call('get', UriConfig.uri.DEVICES + "?status=" + (this.state.status || "") + (page ? "&page=" + page : ""), {}, async (content, status) => {

      let devices = content.devices;

      this.setState({
        refreshing: false,
        nextPage: devices.next_page,
        devices: [...this.state.devices, ...devices.items],
        filtered_devices: [...this.state.devices, ...devices.items]
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
  }

  removeTimeout = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  async shareMyLocation(user) {
    try {
      let lon = user.location.coordinates[0];
      let lat = user.location.coordinates[1];
      const result = await Share.share({
        // title: 'Hey buddy install this',  

        message: user.profile_name + " has just shared his location with you.\nAddress: " + user.address + "\nClick on below link to view on map."
          + "\nhttps://www.google.co.in/maps/place/" + lat + "," + lon + "\nEnjoy our services. \nWe are India’s biggest GPS security company. Visit - trackugo.in"

        // url: url
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      console.log(error);
    }
  };
  render() {
    let { location, iconBaseUrl, isModalVisible, user, errors, messages, current_address, devices } = this.state;
  console.log(this.state.filtered_devices,'this.state.filtered_devices');
    return (
      <View style={mainStyle.flexOne}>
        {this.tabs1()}
        {/* {this.tabs()} */}
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => this.getDevices()}
            />
          }
        >
          <View style={mainStyle.contentArea}>
            <Loader loading={this.state.loading} />
            {user && (
              <View style={homeStyle.itemView}>
                <View style={mainStyle.flexRow}>
                  <View style={{ flex: 4, }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                      <Image source={Icons.avatar} style={{ width: 26, height: 26, borderRadius: 13, marginRight: 5 }} />
                      <Text style={[homeStyle.itemHeaderTextMain, mainStyle.fontmd]}>{user.profile_name}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => NavigationService.navigate("homeStack", "UserLiveTrack", { user: user })}>
                    <View style={homeStyle.moreButton}>
                      <Text
                        style={[mainStyle.whiteText, mainStyle.fontmd, mainStyle.textlg]}>Map View{" "}</Text>
                      <Icon name="angle-right" type="font-awesome" color={Colors.white} size={20} />
                    </View>
                  </TouchableOpacity>
                </View>

                <View>
                  <MapView
                    style={homeStyle.map}
                    pitchEnabled={false}
                    rotateEnabled={false}
                    minZoomLevel={5}
                    scrollEnabled={false}
                    initialRegion={
                      user.location
                        ? {
                          latitude: location.latitude,
                          longitude: location.longitude,
                          latitudeDelta: location.latitudeDelta,
                          longitudeDelta: location.longitudeDelta,
                        } : location
                    }
                  >
                    {user.hasOwnProperty("location") && user.location && (
                      <Marker
                        coordinate={{
                          latitude: location.latitude,
                          longitude: location.longitude,
                        }}
                      >
                        <Image
                          source={require("../../assets/icons/Icons/user_placeholder.png")}
                          style={{ width: 40, height: 40 }}
                        />
                      </Marker>
                    )}
                  </MapView>

                  <View style={mainStyle.flexRow}>
                    <View style={mainStyle.flexThree}>
                      {user.location && (
                        <View style={mainStyle.flexRow}>
                          <Icon
                            name="map-marker"
                            type="font-awesome"
                            color={Colors.blue}
                            size={25}
                          />
                          <View style={mainStyle.marginLeft5}>
                            <Text
                              style={[mainStyle.textsm, mainStyle.fontrg]}
                            >
                              {current_address}
                            </Text>
                            <Text
                              style={[
                                mainStyle.textsm,
                                mainStyle.fontrg,
                                mainStyle.lightText,
                              ]}
                            >
                              Last Updated:{" "}
                              {GeneralService.dateFormat(
                                user.updated_at,
                                "h:i A, d M"
                              )}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                    <View style={homeStyle.rightIcons}>
                      <TouchableOpacity
                        onPress={() =>
                          NavigationService.navigate(
                            "homeStack",
                            "Notifications"
                          )
                        }
                      >
                        <Icon
                          name="bell"
                          type="font-awesome"
                          color={Colors.gray}
                          size={20}
                        />
                      </TouchableOpacity>
                      <Text> </Text>
                      {user.location && (
                        <TouchableOpacity
                          onPress={() => this.shareMyLocation(user)}
                        >
                          <Icon
                            name="share-square"
                            type="font-awesome"
                            color={Colors.gray}
                            size={22}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            )}

            <FlatList
              data={this.state.filtered_devices}
              // refreshing={this.state.refreshing}
              // onRefresh={() => this.getDevices()}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item, index) => item._id}
              onEndReached={() => this.nextPageDevices()}
              ListEmptyComponent={this.renderEmptyContainer()}
              contentContainerStyle={{ paddingBottom: 50 }}
              renderItem={({ item }) => {
                let iconfile = iconBaseUrl ? iconBaseUrl + GeneralService.deviceSideviewIcon(item) : null,
                  mapIconUrl = iconBaseUrl ? iconBaseUrl + GeneralService.deviceTopviewIcon(item) : null,
                  isOkay =
                    item.subscriptions &&
                    item.subscriptions.length > 0 &&
                    item.status == "ACTIVE";

                if (!isOkay) {
                  return null;
                }

                return (
                  <View style={homeStyle.itemView}>
                    <View style={mainStyle.flexRow}>
                      <Image
                        source={{ uri: iconfile }}
                        style={mainStyle.vehicleIcon}
                      />
                      <View style={homeStyle.itemHeaderText}>
                        <Text
                          style={[
                            homeStyle.itemHeaderTextMain,
                            mainStyle.fontmd,
                          ]}
                        >
                          {item.license_plate}
                        </Text>
                        <Text
                          style={[
                            mainStyle.textnm,
                            mainStyle.fontrg,
                            {
                              color: GeneralService.deviceStatusColor(
                                item.current_state
                              ),
                            },
                          ]}
                        >
                          {GeneralService.camelcase(
                            item.current_state
                          )}{" "}
                          - Since{" "}
                          {
                            moment
                              .utc(
                                item.current_state_since,
                                "YYYY-MM-DD HH:mm:ss"
                              )
                              .local()
                              .fromNow()
                              .split("ago")[0]
                          }
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() =>
                          NavigationService.navigate(
                            "homeStack",
                            item.vehicle_type == "PERSONAL_TRACKER"
                              ? "LiveTrackPersonal"
                              : "LiveTrack",
                            { id: item._id, devices: devices }
                          )
                        }
                      >
                        <View style={homeStyle.moreButton}>
                          <Text
                            style={[
                              mainStyle.whiteText,
                              mainStyle.fontmd,
                              mainStyle.textlg,
                            ]}
                          >
                            Map View{" "}
                          </Text>
                          <Icon
                            name="angle-right"
                            type="font-awesome"
                            color={Colors.white}
                            size={20}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>

                    <View>
                      <MapView
                        style={homeStyle.map}
                        pitchEnabled={false}
                        rotateEnabled={false}
                        zoomEnabled={false}
                        scrollEnabled={false}
                        initialRegion={
                          item.location
                            ? {
                              latitude:
                                item.location.coordinates[1],
                              longitude:
                                item.location.coordinates[0],
                              latitudeDelta:
                                location.latitudeDelta,
                              longitudeDelta:
                                location.longitudeDelta,
                            }
                            : location
                        }
                      >
                        {item.hasOwnProperty("location") &&
                          item.location &&
                          ["ON_TRIP", "IDLE", "STOPPED"].indexOf(
                            item.current_state
                          ) > -1 ? (
                          <Marker
                            coordinate={{
                              latitude:
                                item.location.coordinates[1],
                              longitude:
                                item.location.coordinates[0],
                            }}
                            style={
                              item.vehicle_type ==
                                "PERSONAL_TRACKER"
                                ? {}
                                : {
                                  transform: [
                                    {
                                      rotate:
                                        (Math.abs(
                                          item.head + 270
                                        ) %
                                          360) +
                                        "deg",
                                    },
                                  ],
                                }
                            }
                          >
                            <Image
                              source={{ uri: mapIconUrl }}
                              resizeMode="contain"
                              style={mainStyle.mapIcon}
                            />
                          </Marker>
                        ) : null}
                      </MapView>

                      <View style={mainStyle.flexRow}>
                        <View style={mainStyle.flexThree}>
                          {item.address && (
                            <View style={mainStyle.flexRow}>
                              <Icon
                                name="map-marker"
                                type="font-awesome"
                                color={Colors.blue}
                                size={25}
                              />
                              <View style={mainStyle.marginLeft5}>
                                <Text
                                  style={[
                                    mainStyle.textsm,
                                    mainStyle.fontrg,
                                  ]}
                                >
                                  {item.address}
                                </Text>
                                <Text
                                  style={[
                                    mainStyle.textsm,
                                    mainStyle.fontrg,
                                    mainStyle.lightText,
                                  ]}
                                >
                                  Last Updated:{" "}
                                  {GeneralService.dateFormat(
                                    item.updated_at,
                                    "h:i A, d M"
                                  )}
                                </Text>
                              </View>
                            </View>
                          )}
                        </View>
                        <View style={homeStyle.rightIcons}>
                          <TouchableOpacity
                            onPress={() =>
                              NavigationService.navigate(
                                "homeStack",
                                "Notifications", {
                                itemData: item
                              }
                              )
                            }
                          >
                            <Icon
                              name="bell"
                              type="font-awesome"
                              color={Colors.gray}
                              size={20}
                            />
                          </TouchableOpacity>
                          <Text> </Text>

                          {item.location && (
                            <TouchableOpacity
                              onPress={() =>
                                this.shareLocation(item)
                              }
                            >
                              <Icon
                                name="share-square"
                                type="font-awesome"
                                color={Colors.gray}
                                size={22}
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          </View>

          {
            user && !user.parent && (
              <TouchableOpacity
                style={mainStyle.floatingButton}
                onPress={() => this.toggleModal()}
              >
                <Image source={Icons.plus} />
              </TouchableOpacity>
            )
          }
        </ScrollView>
        <Modal
          transparent={true}
          animationType={"none"}
          onRequestClose={() => this.toggleModal(false)}
          visible={isModalVisible}
        >
          <View style={mainStyle.modalBackground}>
            <View style={mainStyle.modalForm}>
              <View style={mainStyle.formBody}>
                <Text
                  style={[
                    mainStyle.textxl,
                    mainStyle.marginBottom10,
                    mainStyle.fontmd,
                    mainStyle.whiteText,
                  ]}
                >
                  Add Device
                </Text>

                <View
                  style={[
                    mainStyle.formInput,
                    errors.device_name ? mainStyle.inputError : null,
                  ]}
                >
                  <TextInput
                    style={[mainStyle.formInputField, mainStyle.whiteText]}
                    onChangeText={(value) =>
                      this.validateInput(value, "device_name")
                    }
                    placeholder="Device Name"
                    placeholderTextColor={Colors.theme.lightText}
                  />
                  {errors.device_name && (
                    <Text style={mainStyle.errorMessage}>
                      {messages.device_name}
                    </Text>
                  )}
                </View>

                <View
                  style={[
                    mainStyle.formInput,
                    errors.device_code ? mainStyle.inputError : null,
                  ]}
                >
                  <TextInput
                    style={[mainStyle.formInputField, mainStyle.whiteText]}
                    onChangeText={(value) =>
                      this.validateInput(value, "device_code")
                    }
                    placeholder="Device Code"
                    placeholderTextColor={Colors.theme.lightText}
                  />
                  {errors.device_code && (
                    <Text style={mainStyle.errorMessage}>
                      {messages.device_code}
                    </Text>
                  )}
                </View>

                <ButtonComponent
                  text="Submit"
                  onClick={this.deviceActivate.bind(this)}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View >
    );
  }

  renderEmptyContainer() {
    return (
      <View style={mainStyle.itemsCenter}>
        <Text style={mainStyle.fontrg}>{this.state.refreshing ? "Fetching devices..." : "You have not purchased any device. Please press add button to purchase."}</Text>
      </View>
    );
  }

  tabs() {
    let { navigation } = this.props;
    // let devices = navigation.getParam("devices", []);
    let params = navigation.state.params || {},
      stats = params ? params.stats : null;
    return (
      <View style={{ marginTop: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
        {/* <View style={[homeStyle.statsView,{marginTop:60}]}> */}
        <TouchableOpacity
          onPress={() => { (params ? params.tabSelect(null) : null), this.onTabSelect(null) }}
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
          onPress={() => { (params ? params.tabSelect(null) : null), this.onTabSelect(null) }}
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
          onPress={() => { (params ? params.tabSelect("on_trip") : null), this.onTabSelect("on_trip") }}
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
          onPress={() => { (params ? params.tabSelect("stopped") : null), this.onTabSelect("stopped") }}
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
          onPress={() => { (params ? params.tabSelect("idle") : null), this.onTabSelect("idle") }}
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
          onPress={() => { (params ? params.tabSelect("idle") : null), this.onTabSelect("idle") }}
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
          onPress={() => { (params ? params.tabSelect("idle") : null), this.onTabSelect("idle") }}
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

    )
  }
  tabs1() {
    let { navigation } = this.props;
    // let devices = navigation.getParam("devices", []);
    let params = navigation.state.params || {},
      stats = params ? params.stats : null;
    return (
      <View
        style={{
          backgroundColor: Colors.theme.lightBackgroundColor,
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingTop: 10
        }}>
        <ScrollView horizontal={true}>
          <TouchableOpacity
            onPress={() => { this.onTabSelect(null) }}
            // onPress={() => { (params ? params.tabSelect(null) : null), this.onTabSelect(null) }}
            style={params.selected == null ? homeStyle.filterViewActive : homeStyle.filterView}>
            <Text
              style={{
                fontSize: 14,
                color: 'black',
                textAlign: 'center',
              }}>
              All({stats && stats.TOTAL ? stats.TOTAL : 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { this.onTabSelect(null) }}
            // onPress={() => { (params ? params.tabSelect(null) : null), this.onTabSelect(null) }}
            style={params.selected == null ? homeStyle.filterViewActive : homeStyle.filterView}>
            <Text
              style={{
                fontSize: 14,
                color: 'black',
                textAlign: 'center',
              }}>
              Person({stats && stats.TOTAL ? stats.TOTAL : 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { this.onTabSelect("on_trip") }}
            // onPress={() => { (params ? params.tabSelect("on_trip") : null), this.onTabSelect("on_trip") }}
            style={params.selected == "on_trip" ? homeStyle.filterViewActive : homeStyle.filterView}>
            <Text
              style={{
                fontSize: 14,
                color: 'black',
                textAlign: 'center',
              }}>
              Moving({stats && stats.ON_TRIP ? stats.ON_TRIP : 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { this.onTabSelect("stopped") }}
            // onPress={() => { (params ? params.tabSelect("stopped") : null), this.onTabSelect("stopped") }}
            style={params.selected == "stopped" ? homeStyle.filterViewActive : homeStyle.filterView}>
            <Text
              style={{
                fontSize: 14,
                color: 'black',
                textAlign: 'center',
              }}>
              Stop({stats && stats.STOPPED ? stats.STOPPED : 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { this.onTabSelect("idle") }}
            // onPress={() => { (params ? params.tabSelect("idle") : null), this.onTabSelect("idle") }}
            style={params.selected == "idle" ? homeStyle.filterViewActive : homeStyle.filterView}>
            <Text
              style={{
                fontSize: 14,
                color: 'black',
                textAlign: 'center',
              }}>
              Idle({stats && stats.IDLE ? stats.IDLE : 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { this.onTabSelect("disconnected") }}
            // onPress={() => { (params ? params.tabSelect("idle") : null), this.onTabSelect("idle") }}
            style={params.selected == "disconnected" ? homeStyle.filterViewActive : homeStyle.filterView}>
            <Text
              style={{
                fontSize: 12,
                color: 'black',
                textAlign: 'center',
              }}>
              Disconnected({stats && stats.DISCONNECTED ? stats.DISCONNECTED : 0})
            </Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            onPress={() => { this.onTabSelect("idle") }}
            // onPress={() => { (params ? params.tabSelect("idle") : null), this.onTabSelect("idle") }}
            style={params.selected == "idle" ? homeStyle.filterViewActive : homeStyle.filterView}>
            <Text
              style={{
                fontSize: 14,
                color: 'black',
                textAlign: 'center',
              }}>
              Expired({stats && stats.IDLE ? stats.IDLE : 0})
            </Text>
          </TouchableOpacity> */}
        </ScrollView>
        {/* <TouchableOpacity
           onPress={() => {
               this.setRange('Yesterday');
           }}
           style={{
               width: 80,
               height: 30,
               borderRadius: 15,
               justifyContent: 'center',
           }}>
           <Text
               style={{
                   fontSize: 14,
                   color: 'white',
                   textAlign: 'center',
               }}>
               Yesterday
 </Text>
       </TouchableOpacity>
       <TouchableOpacity
           onPress={() => {
               this.setRange('Week');
           }}
           style={{
               width: 80,
               height: 30,
               borderRadius: 15,
               justifyContent: 'center',
           }}>
           <Text
               style={{
                   fontSize: 14,
                   color: 'white',
                   textAlign: 'center',
               }}>
               Week
 </Text>
       </TouchableOpacity>
       <TouchableOpacity
           onPress={() => {
               this.setRange('Month');
           }}
           style={{
               width: 80,
               height: 30,
               borderRadius: 15,
               justifyContent: 'center',
           }}>
           <Text
               style={{
                   fontSize: 14,
                   color: 'white',
                   textAlign: 'center',
               }}>
               Month
 </Text>
       </TouchableOpacity>
    */}
      </View>

    )
  }
  tabs2() {
    let { navigation } = this.props;
    // let devices = navigation.getParam("devices", []);
    let params = navigation.state.params || {},
      stats = params ? params.stats : null;
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: Colors.theme.lightBackgroundColor, }}>
        {/* <View style={[homeStyle.statsView,{marginTop:60}]}> */}
        <TouchableOpacity
          onPress={() => { (params ? params.tabSelect(null) : null), this.onTabSelect(null) }}
        >
          <View
            style={{ width: 100, height: 40, justifyContent: 'center' }}
          >
            <Text style={[homeStyle.statTextMain]}>
              {stats && stats.TOTAL ? stats.TOTAL : 0}
            </Text>
            <Text
              style={[
                homeStyle.statTextSub,
                mainStyle.fontmd,
              ]}
            >
              All
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { (params ? params.tabSelect(null) : null), this.onTabSelect(null) }}
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
          onPress={() => { (params ? params.tabSelect("on_trip") : null), this.onTabSelect("on_trip") }}
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
          onPress={() => { (params ? params.tabSelect("stopped") : null), this.onTabSelect("stopped") }}
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
          onPress={() => { (params ? params.tabSelect("idle") : null), this.onTabSelect("idle") }}
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
          onPress={() => { (params ? params.tabSelect("idle") : null), this.onTabSelect("idle") }}
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
          onPress={() => { (params ? params.tabSelect("idle") : null), this.onTabSelect("idle") }}
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

    )
  }
}