
/**
 * Component to handle device map, parking location page.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  Platform,
  TextInput,
  ScrollView,
  ToastAndroid,
  TouchableOpacity,
} from 'react-native';

import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

import { Icon } from 'react-native-elements';
import MapView, { Marker, Polyline, AnimatedRegion } from 'react-native-maps';

import mainStyle from '../styles/main.style';
import liveTrackStyle from '../styles/live-track.style';

import Loader from '../modules/loader.module';
import Colors from '../modules/colors.module';
import Icons from '../modules/icons.module';

import AppConfig from '../config/app.config';
import UriConfig from '../config/uri.config';

import ApiService from '../services/api.service';
import StorageService from '../services/storage.service';
import GeneralService from '../services/general.service';
import NavigationService from '../services/navigation.service';
import moment from "moment";
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

let timeout;

export default class LiveTrackPersonalComponent extends Component {

  static navigationOptions = ({ navigation }) => {
    let params = navigation.state.params || {},
      device = params.device || null;

    return {
      headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
      ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
      headerTitle: (
        <View>
          <Text style={mainStyle.titleTextMain}>Live Track</Text>
          <Text style={mainStyle.titleTextSub}>{device ? device.license_plate : null}</Text>
        </View>
      ),
      headerRight: (
        <View style={mainStyle.flexRow}>
          <Menu>
            <MenuTrigger style={mainStyle.pad10}>
              <Icon name='ellipsis-v' type='font-awesome' size={35} color={Colors.gray} />
            </MenuTrigger>
            <MenuOptions optionsContainerStyle={{ marginTop: 50 }}>
              <MenuOption onSelect={() => device ? NavigationService.navigate('homeStack', 'Subscription', { device: device }) : null}>
                <Text style={[mainStyle.menuOptionMain, mainStyle.textlg, mainStyle.fontmd]}>Subscription</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>
      )
    };
  };

  constructor() {
    super();

    let { latitudeDelta, longitudeDelta } = GeneralService.locationDelta(0.01);

    this.state = {
      track: true,
      loading: false,
      options: false,

      errors: [],
      values: [],
      messages: [],

      mapType: "standard",
      mapRef: null,
      markerRef: null,
      currentCoordinate: new AnimatedRegion({
        latitude: 0,
        longitude: 0, 
        latitudeDelta: latitudeDelta,
        longitudeDelta: longitudeDelta
      }),
      region: {
        latitude: AppConfig.default_location.latitute,
        longitude: AppConfig.default_location.longitude,
        latitudeDelta: latitudeDelta,
        longitudeDelta: longitudeDelta
      },

      routeCoordinates: [],
    }
  }

  async componentDidMount() {

    let baseUrl = await StorageService.fetch('assets_url'),
      folders = JSON.parse(await StorageService.fetch('folders'));

    this.setState({ iconBaseUrl: baseUrl + folders.vehicle_icons });

    this.props.navigation.addListener('didBlur', (payload) => {
      this.removeTimeout();
    });

    this.props.navigation.addListener('didFocus', (payload) => {
      this.getDeviceInfo();
    });

    this.getDeviceInfo(true);
  }

  componentWillUnmount() {
    this.removeTimeout();
  }

  getDeviceInfo = (loader) => { 

    let { navigation } = this.props;
    let id = navigation.getParam('id', null);

    if (loader) {
      this.setState({ loading: true });
    }

    ApiService.call('get', UriConfig.uri.DEVICE_DETAILS + "/" + id, {}, (content) => {

      let device = content.device;
      let { region, routeCoordinates, mapRef, markerRef, currentCoordinate, track } = this.state;

      if (device.location) {

        let deviceLocation = device.location.coordinates,
          newCoordinate = {
            latitude: deviceLocation[1],
            longitude: deviceLocation[0]
          };

        if (loader) {
          region.latitude = deviceLocation[1];
          region.longitude = deviceLocation[0];
        } else if (mapRef) {

          if (Platform.OS === "android") {
            if (markerRef && track) {
              // markerRef._component.animateMarkerToCoordinate(
                markerRef.animateMarkerToCoordinate(
                newCoordinate,
                10000
              );
            }
          } else {
            currentCoordinate.timing(newCoordinate).start();
          }

          if (["ON_TRIP", "IDLE"].indexOf(device.current_state) >= 0) {
            if (track) {
              mapRef.animateToRegion({
                latitude: deviceLocation[1],
                longitude: deviceLocation[0],
                latitudeDelta: region.latitudeDelta,
                longitudeDelta: region.longitudeDelta,
              }, 10000);
            }

            this.setState({ routeCoordinates: routeCoordinates.concat([newCoordinate]) });
          }

        }

        this.setState({ currentCoordinate: newCoordinate });

      }

      this.setState({
        loading: false,
        device: device,
        region: region
      }, () => {

        this.removeTimeout();

        timeout = setTimeout(() => {
          this.getDeviceInfo();
        }, 10000);

        if (loader) {
          this.latestTrip();
        }

      });

      this.props.navigation.setParams({ device: device });
    }, (error, errors, content) => {
      this.setState({ loading: false });
    });
  }

  removeTimeout = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  }

  toggleMapType = () => {
    this.setState({ mapType: this.state.mapType === "satellite" ? "standard" : "satellite" });
  }

  toggleOptions = () => {
    this.setState({ options: !this.state.options });
  }

  enableTracking = () => {

    this.setState({ track: true });

    let { mapRef, region, currentCoordinate } = this.state;

    if (mapRef) {
      mapRef.animateToRegion({
        latitude: currentCoordinate.latitude,
        longitude: currentCoordinate.longitude,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      }, 1000);
    }

  }

  regionChange = (region) => {
    this.setState({
      region: {
        ...this.state.region,
        longitudeDelta: region.longitudeDelta,
        latitudeDelta: region.latitudeDelta,
      }
    });
  }

  onRegionChange = (region) => {
    this.setState({ track: false });
  }

  latestTrip = () => {
    let { device } = this.state;

    ApiService.call('get', UriConfig.uri.DEVICE_LATEST_TRIP + "/" + device._id, {}, (content) => {

      let routeCoordinates = [];
      for (let tripLocation of content.tripLocations) {
        if (tripLocation.hasOwnProperty("location") && tripLocation.location.hasOwnProperty("coordinates")) {
          routeCoordinates.push({
            latitude: tripLocation.location.coordinates[1],
            longitude: tripLocation.location.coordinates[0],
          });
        }
      }

      this.setState({ routeCoordinates: routeCoordinates });

    }, (error, errors, content) => {
      this.setState({ loading: false });
    });

  }

  render() {

    let { device, iconBaseUrl, region, loading, routeCoordinates, currentCoordinate, options, mapType, errors, messages } = this.state;

    let iconfile = device && iconBaseUrl ? iconBaseUrl + GeneralService.deviceSideviewIcon(device) : null,
      mapIconUrl = device && iconBaseUrl ? iconBaseUrl + GeneralService.deviceTopviewIcon(device) : null;

    if (device) {

      let batteryIcon = 'battery';

      if (device.battery < 10) {
        batteryIcon = 'battery-0';
      } else if (device.battery < 40) {
        batteryIcon = 'battery-1';
      } else if (device.battery < 60) {
        batteryIcon = 'battery-2';
      } else if (device.battery < 80) {
        batteryIcon = 'battery-3';
      }

      return (
        <View style={mainStyle.flexOne}>
          <Loader loading={loading} />
          <MapView
            mapType={mapType}
            style={mainStyle.flexOne}
            initialRegion={region}
            ref={(ref) => {
              this.state.mapRef = ref;
            }}
            onPress={() => {
              this.setState({ track: false });
            }}
            pitchEnabled={true}
            rotateEnabled={true}
            zoomEnabled={true}
            scrollEnabled={true}
            zoomControlEnabled={true}
            onRegionChangeComplete={this.regionChange}
          >
            {device.hasOwnProperty("location") && device.location ? (
              <Marker.Animated
                ref={(marker) => {
                  this.state.markerRef = marker;
                }}
                coordinate={currentCoordinate}
                anchor={{ x: 0.5, y: 0.5 }}
                style={{
                  transform: [
                    {
                      rotate: Math.abs((device.head + 270) % 360) + "deg",
                    },
                  ],
                }}
              >
                <Image
                  source={{ uri: mapIconUrl }}
                  resizeMode="contain"
                  style={mainStyle.mapIcon}
                />
              </Marker.Animated>
            ) : null}

            <Polyline
              coordinates={routeCoordinates}
              strokeColor={Colors.green} // fallback for when `strokeColors` is not supported by the map-provider
              strokeColors={[
                "#7F0000",
                "#00000000", // no color, creates a "long" gradient between the previous and next coordinate
                "#B24112",
                "#E5845C",
                "#238C23",
                "#7F0000",
              ]}
              strokeWidth={10}
            />
          </MapView>

          {device.location && (
            <ScrollView horizontal={true} style={liveTrackStyle.options}>
              {options && (
                <View style={mainStyle.flexRow}>
                  <TouchableOpacity
                    style={liveTrackStyle.option}
                    onPress={() => this.toggleMapType()}
                  >
                    <Icon
                      name="layers"
                      type="font-awesome-5"
                      color={Colors.white}
                      size={30}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={liveTrackStyle.option}
                    onPress={() => this.enableTracking()}
                  >
                    <Icon
                      name="refresh"
                      type="font-awesome"
                      color={Colors.white}
                      size={25}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={liveTrackStyle.option}
                    onPress={() =>
                      NavigationService.navigate(
                        "homeStack",
                        "Playback",
                        { device: device }
                      )
                    }
                  >
                    <Image source={Icons.routeTrack} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={liveTrackStyle.option}
                    onPress={() =>
                      NavigationService.navigate(
                        "homeStack",
                        "GeoFencing",
                        { device: device }
                      )
                    }
                  >
                    <Image source={Icons.fence} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={liveTrackStyle.option}
                    onPress={() =>
                      GeneralService.openMapApp(
                        device.location.coordinates[1],
                        device.location.coordinates[0]
                      )
                    }
                  >
                    <Icon
                      name="directions"
                      type="font-awesome-5"
                      color={Colors.white}
                      size={30}
                    />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={liveTrackStyle.option}
                onPress={() => this.toggleOptions()}
              >
                <Icon
                  name={options ? "chevron-left" : "chevron-right"}
                  type="font-awesome"
                  color={Colors.white}
                  size={25}
                />
              </TouchableOpacity>
            </ScrollView>
          )}

          <View style={liveTrackStyle.detailBox}>
            <View style={[mainStyle.flexRow, mainStyle.itemsCenter]}>
              <Image
                source={{ uri: iconfile }}
                style={[mainStyle.vehicleIcon]}
              />
              <Text
                style={[
                  mainStyle.textlg,
                  mainStyle.fontmd,
                  mainStyle.marginLeft10,
                ]}
              >
                {GeneralService.uppercase(device.license_plate)}
              </Text>
            </View>
            <View
              style={[
                mainStyle.flexRow,
                mainStyle.marginBottom5,
                mainStyle.itemsCenter,
              ]}
            >
              {device.current_state == "ON_TRIP" && (
                <Image
                  source={Icons.moving}
                  style={mainStyle.smallIcon}
                />
              )}
              {device.current_state != "ON_TRIP" && (
                <Icon
                  name="shield"
                  type="font-awesome"
                  size={15}
                  color={GeneralService.deviceStatusColor(
                    device.current_state
                  )}
                />
              )}
              <Text
                style={[
                  mainStyle.textnm,
                  mainStyle.fontrg,
                  mainStyle.lightText,
                  mainStyle.marginLeft10,
                ]}
              >
                {GeneralService.camelcase(device.current_state)} - Since{" "}
                {
                  moment
                    .utc(
                      device.current_state_since,
                      "YYYY-MM-DD HH:mm:ss"
                    )
                    .local()
                    .fromNow()
                    .split("ago")[0]
                }
              </Text>
            </View>

            <View style={mainStyle.flexRow}>
              <Icon
                name="map-marker"
                type="font-awesome"
                color={Colors.blue}
                size={30}
              />
              <View style={mainStyle.marginLeft5}>
                <Text style={[mainStyle.textsm, mainStyle.fontrg]}>
                  {device.address || "Not Available"}
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
                    device.updated_at,
                    "h:i A, d M"
                  )}
                </Text>
              </View>
            </View>

            <View style={mainStyle.dividerWithMargin} />

            <View style={mainStyle.flexRow}>
              <View style={liveTrackStyle.infoItemBorder}>
                <View style={liveTrackStyle.infoItemInner}>
                  <Image source={Icons.speedometer} />
                  <Text style={[mainStyle.fontmd, mainStyle.marginLeft5]}>
                    {device.current_speed || 0} km/hr
                  </Text>
                </View>
                <Text
                  style={[
                    mainStyle.fontrg,
                    mainStyle.textsm,
                    mainStyle.lightText,
                  ]}
                >
                  Current Speed
                </Text>
              </View>

              <View style={liveTrackStyle.infoItemBorder}>
                <View style={liveTrackStyle.infoItemInner}>
                  <Icon
                    name={batteryIcon}
                    type="font-awesome"
                    size={15}
                    color={
                      device.battery < 40 ? Colors.red : Colors.green
                    }
                  />
                  <Text style={[mainStyle.fontmd, mainStyle.marginLeft5]}>
                    {device.battery || 0}%
                  </Text>
                </View>
                <Text
                  style={[
                    mainStyle.fontrg,
                    mainStyle.textsm,
                    mainStyle.lightText,
                  ]}
                >
                  Battery
                </Text>
              </View>
              <View style={liveTrackStyle.infoItem}>
                <View style={liveTrackStyle.infoItemInner}>
                  <Icon
                    name="signal"
                    type="font-awesome"
                    size={15}
                    color={
                      device.signal < 30 ? Colors.yellow : Colors.green
                    }
                  />
                  <Text style={[mainStyle.fontmd, mainStyle.marginLeft5]}>
                    {device.signal || 0}%
                  </Text>
                </View>
                <Text
                  style={[
                    mainStyle.fontrg,
                    mainStyle.textsm,
                    mainStyle.lightText,
                  ]}
                >
                  Signal
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    } else {
      return (
        <View style={mainStyle.flexOne}>
          <Loader loading={this.state.loading} />
        </View>
      );
    }


  };
}