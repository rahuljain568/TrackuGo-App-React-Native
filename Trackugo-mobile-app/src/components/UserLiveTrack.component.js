/**
 * Component to handle device map, parking location page.
 */

import React, { Component } from "react";
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
} from "react-native";

import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";

import { Icon } from "react-native-elements";
import MapView, { Marker, Polyline, AnimatedRegion } from "react-native-maps";

import mainStyle from "../styles/main.style";
import liveTrackStyle from "../styles/live-track.style";

import Loader from "../modules/loader.module";
import Colors from "../modules/colors.module";
import Icons from "../modules/icons.module";

import AppConfig from "../config/app.config";
import UriConfig from "../config/uri.config";

import ApiService from "../services/api.service";
import StorageService from "../services/storage.service";
import GeneralService from "../services/general.service";
import NavigationService from "../services/navigation.service";
import moment from "moment";
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

let timeout;

export default class UserLiveTrackComponent extends Component {
  static navigationOptions = ({ navigation }) => {
    let params = navigation.state.params || {},
      user = params.user || null;

    return {
      headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
      ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
      headerTitle: (
        <View>
          <Text style={mainStyle.titleTextMain}>User Live Track</Text>
          <Text style={mainStyle.titleTextSub}>
            {user ? user.profile_name : null}
          </Text>
        </View>
      ),
    };
  };
  // static navigationOptions = ({ navigation }) => ({ headerLeft: <Icon name={'back'} size={30} color='#ffffff' style={{paddingLeft: 20}} onPress={ () => { navigation.goBack() }} />, title: 'My Title', });

  constructor() {
    super();

    let { latitudeDelta, longitudeDelta } = GeneralService.locationDelta(0.01);

    this.state = {
      track: true,
      loading: false,
      options: false,
      user:null,
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
        longitudeDelta: longitudeDelta,
      }),
      region: {
        latitude: AppConfig.default_location.latitute,
        longitude: AppConfig.default_location.longitude,
        latitudeDelta: latitudeDelta,
        longitudeDelta: longitudeDelta,
      },

      routeCoordinates: [],
    };
  }

  async componentDidMount() {
    let baseUrl = await StorageService.fetch("assets_url"),
      folders = JSON.parse(await StorageService.fetch("folders"));

    this.setState({ iconBaseUrl: baseUrl + folders.vehicle_icons });

    this.props.navigation.addListener("didBlur", (payload) => {
      this.removeTimeout();
    });

    this.props.navigation.addListener("didFocus", (payload) => {
      this.getUserInfo();
    });

    this.getUserInfo(true);
  }

  componentWillUnmount() {
    this.removeTimeout();
  }

  getUserInfo = (loader) => {
    let { navigation } = this.props;
    let user = navigation.getParam("user", null);

    if (loader) {
      this.setState({ loading: true });
    }

    ApiService.call(
      "get",
      UriConfig.uri.USER_LOCATION + "/" + user._id,
      {},
      (content) => {
        console.log(content,'content');
        let user = content.user;
        let {
          region,
          routeCoordinates,
          mapRef,
          markerRef,
          currentCoordinate,
          track,
        } = this.state;

        if (user.location) {
          let userLocation = user.location.coordinates,
            newCoordinate = {
              latitude: userLocation[1],
              longitude: userLocation[0],
            };

          if (loader) {
            region.latitude = userLocation[1];
            region.longitude = userLocation[0];
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
          }

          this.setState({ currentCoordinate: newCoordinate });
        }

        this.setState(
          {
            loading: false,
            user: user,
            region: region,
          },
          () => {
            this.removeTimeout();

            timeout = setTimeout(() => {
              this.getUserInfo();
            }, 10000);

            // if (loader) {
            //   this.latestTrip();
            // }
          }
        );

        this.props.navigation.setParams({ user: user });
      },
      (error, errors, content) => {
        this.setState({ loading: false });
      }
    );
  };

  removeTimeout = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  toggleMapType = () => {
    this.setState({
      mapType: this.state.mapType === "satellite" ? "standard" : "satellite",
    });
  };

  toggleOptions = () => {
    this.setState({ options: !this.state.options });
  };

  enableTracking = () => {
    this.setState({ track: true });

    let { mapRef, region, currentCoordinate } = this.state;

    if (mapRef) {
      mapRef.animateToRegion(
        {
          latitude: currentCoordinate.latitude,
          longitude: currentCoordinate.longitude,
          latitudeDelta: region.latitudeDelta,
          longitudeDelta: region.longitudeDelta,
        },
        1000
      );
    }
  };

  regionChange = (region) => {
    this.setState({
      region: {
        ...this.state.region,
        longitudeDelta: region.longitudeDelta,
        latitudeDelta: region.latitudeDelta,
      },
    });
  };

  onRegionChange = (region) => {
    this.setState({ track: false });
  };

  latestTrip = () => {
    let { device } = this.state;

    ApiService.call(
      "get",
      UriConfig.uri.DEVICE_LATEST_TRIP + "/" + device._id,
      {},
      (content) => {
        let routeCoordinates = [];
        for (let tripLocation of content.tripLocations) {
          if (
            tripLocation.hasOwnProperty("location") &&
            tripLocation.location.hasOwnProperty("coordinates")
          ) {
            routeCoordinates.push({
              latitude: tripLocation.location.coordinates[1],
              longitude: tripLocation.location.coordinates[0],
            });
          }
        }

        this.setState({ routeCoordinates: routeCoordinates });
      },
      (error, errors, content) => {
        this.setState({ loading: false });
      }
    );
  };

  render() {
    let {
      user,
      iconBaseUrl,
      region,
      loading,
      routeCoordinates,
      currentCoordinate,
      options,
      mapType,
      errors,
      messages,
    } = this.state;

    if (user) {

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
            {user.hasOwnProperty("location") && user.location ? (
              <Marker.Animated
                ref={(marker) => {
                  this.state.markerRef = marker;
                }}
                coordinate={currentCoordinate}
                anchor={{ x: 0.5, y: 0.5 }}
                style={{
                  transform: [
                    {
                      rotate: Math.abs((0 + 270) % 360) + "deg",
                    },
                  ],
                }}
              >
                <Icon
                  name="user-circle"
                  type="font-awesome"
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

          {user.location && (
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
                    onPress={() =>
                      GeneralService.openMapApp(
                        user.location.coordinates[1],
                        user.location.coordinates[0]
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
              {/* <Image
                source={{ uri: iconfile }}
                style={[mainStyle.vehicleIcon]}
              /> */}
              <Text
                style={[
                  mainStyle.textlg,
                  mainStyle.fontmd,
                  mainStyle.marginLeft10,
                ]}
              >
                {GeneralService.uppercase(user.profile_name)}
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
                  {user.current_address || "Not Available"}
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
  }
}
