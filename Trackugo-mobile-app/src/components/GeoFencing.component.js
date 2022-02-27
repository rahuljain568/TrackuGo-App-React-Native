/**
 * Component to handle geo fencing related operations.
 */

import React, { Component } from "react";
import {
  View,
  Text,
  Alert,
  Image,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";

import MapView, { Marker, Polygon } from "react-native-maps";

import ButtonComponent from "./partials/Button.component";

import mainStyle from "../styles/main.style";
import geofenceStyle from "../styles/geofence.style";

import UriConfig from "../config/uri.config";

import ApiService from "../services/api.service";
import GeneralService from "../services/general.service";
import NavigationService from "../services/navigation.service";

import Icons from "../modules/icons.module";
import Colors from "../modules/colors.module";
import Loader from "../modules/loader.module";

import { Icon } from "react-native-elements";
import StorageService from '../services/storage.service';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

let id = 0;

export default class GeoFencingComponent extends Component {
  static navigationOptions = ({ navigation }) => {
    let params = navigation.state.params || {},
      device = params.device || null;

    return {
      headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
      ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
      headerTitle: (
        <View>
          <Text style={mainStyle.titleTextMain}>GeoFence</Text>
          <Text style={mainStyle.titleTextSub}>
            {/* {device ? device.license_plate : null} */}
          </Text>
        </View>
      ),
    };
  };

  constructor() {
    super();

    this.state = {
      page: 1,
      nextPage: null,

      device: null,
      loading: false,
      refreshing: true,
      geoFencing: [],
    };
  }

  async componentDidMount() {
    let { navigation } = this.props, device = navigation.getParam("device", null);
    this.props.navigation.setParams({ device: device });
    let tmpDevice = {
      device: {
        license_plate: device.license_plate,
        _id: device._id
      },
      location: device.location
    }
    this.props.navigation.addListener("didFocus", (payload) => {
      this.setState(
        {
          device: tmpDevice
        },
        () => {
          this.getGeoFencing(1);
        }
      );
    });
  }

  getGeoFencing = async (page) => {
    this.setState({ isLoading: true, modelCreateCircle: false, });
    let uri = UriConfig.uri.GEO_FENCING
      , params = {};

    this.setState({ refreshing: true });

    if (!page) {
      this.setState({ geoFencing: [] });
    }
    console.log('api call GEO_FENCING', uri + '?type=Single Device&page=' + page, params)
    ApiService.call('get', uri + '?type=Single Device&page=' + page, params, (content) => {
      console.log('content GEO_FENCING', content.geoFencing)
      let geoFencing = content.geoFencing;

      this.setState({
        refreshing: false,
        nextPage: geoFencing.nextPage,
        geoFencing: geoFencing
        // geoFencing: [...this.state.geoFencing, ...geoFencing.items],
      });
    },
      (error, errors, content) => {
        this.setState({ refreshing: false });
        console.log(error, 'error');
      }
    );
  };

  nextPageGeoFencing = () => {
    let { page, nextPage } = this.state;
    console.log(nextPage, 'nextPage')
    if (nextPage && nextPage !== page) {
      this.setState({ page: nextPage }, () => {
        this.getGeoFencing(nextPage);
      });
    }
  };

  render() {
    let { device } = this.state;
    console.log(this.state.geoFencing, 'gf');
    return (
      <View style={mainStyle.flexOne}>
        <View style={mainStyle.contentArea}>
          <Loader loading={this.state.loading} />

          <FlatList
            data={this.state.geoFencing}
            refreshing={this.state.refreshing}
            showsVerticalScrollIndicator={false}
            onRefresh={() => this.getGeoFencing()}
            keyExtractor={(item, index) => item._id}
            onEndReached={() => this.nextPageGeoFencing()}
            ListEmptyComponent={this.renderEmptyContainer()}
            renderItem={({ item, index, separators }) => (
              <View style={[mainStyle.list, mainStyle.flexRow]}>
                <View style={mainStyle.flexFour}>
                  {item.device &&
                    <Text
                      style={[
                        mainStyle.listTitle,
                        mainStyle.fontmd,
                        mainStyle.marginBottom5,
                      ]}
                    >
                      {item.device[0].license_plate}
                    </Text>
                  }
                  <Text
                    style={[
                      mainStyle.fontrg,
                      mainStyle.lightText,
                      mainStyle.textsm,
                    ]}
                  >
                    {GeneralService.dateInterval(item.created_at)} ago
                  </Text>
                </View>
                <TouchableOpacity
                  style={mainStyle.justifyCenter}
                  onPress={() =>
                    NavigationService.navigate("homeStack", "GeoFence", {
                      device: item,
                      id: item._id,
                    })
                  }
                >
                  <Icon
                    name="angle-right"
                    type="font-awesome"
                    color={Colors.darkGray}
                    size={40}
                  />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>

        {device && (
          <TouchableOpacity
            style={mainStyle.floatingButton}
            onPress={() =>
              NavigationService.navigate("homeStack", "GeoFence", {
                device: device,
                id: ""
              })
            }
          >
            <Image source={Icons.plus} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  renderEmptyContainer() {
    return (
      <View style={mainStyle.itemsCenter}>
        <Text style={mainStyle.fontrg}>
          {this.state.refreshing
            ? "Fetching geo fences..."
            : "No geo fence saved."}
        </Text>
      </View>
    );
  }
}

export class GeoFenceComponent extends Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Text style={mainStyle.mainTitle}>
          {params.device.device ? params.device.device.license_plate : "Geofence"}
          {"Geofence"}
        </Text>
      ),
      headerRight: (
        <TouchableOpacity
          style={mainStyle.pad10}
          onPress={() => (params ? params.modalState(true) : null)}
        >
          <Icon
            name="check"
            type="font-awesome"
            size={30}
            color={Colors.gray}
          />
        </TouchableOpacity>
      ),
    };
  };

  constructor() {
    super();

    let { latitudeDelta, longitudeDelta } = GeneralService.locationDelta(0.005);
    let { latitude, longitude } = GeneralService.defaultLocation(0.005);

    this.state = {
      id: "",
      device: null,
      loading: true,
      isModalVisible: false,
      type: "circle",
      geoFence: null,
      location: null,
      coordinates: [],
      region: {
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: latitudeDelta,
        longitudeDelta: longitudeDelta,
      },
      mapType: "standard",

      values: [],

      editing: false,
    };
  }

  componentDidMount() {
    let { navigation } = this.props,
      id = navigation.getParam("id", null),
      device = navigation.getParam("device", null);
    this.props.navigation.setParams({
      device: device,
      modalState: this.modalState,
    });
    console.log('id:', id, 'device', device._id)
    this.setState(
      {
        id: id,
        device: device,
      },
      () => {
        this.getGeofence(device);
      }
    );
  }

  getGeofence = (device) => {
    let itemData = this.props.navigation.getParam("device", null);
    console.log('itemData22', itemData);
    if (itemData != null) {
      if (itemData.location) {
        let tmpLet = itemData.location.coordinates[1], tmpLong = itemData.location.coordinates[0];

        coordinate = {
          latitude: tmpLet, longitude: tmpLong,
        };
        this.setState({
          type: "circle", location: coordinate,
          values: {
            remarks: itemData.remarks, notify_when: itemData.notify_when,
            geoFence: itemData,
          },
        });
        // if (coordinate) {
        this.centerMap(
          tmpLet,
          tmpLong,
          itemData.latitude_delta,
          itemData.longitude_delta,
        );
        // }
      } else {
        ToastAndroid.show("Location not available", ToastAndroid.LONG);
      }
    }
    this.setState({ loading: false });
    return;


    let { id } = this.state;
    if (!id) {
      if (device.location) {
        this.centerMap(
          device.location.coordinates[1],
          device.location.coordinates[0]
        );
      }

      return this.setState({ loading: false });
    }
    ApiService.call(
      "get",
      UriConfig.uri.GEO_FENCE_DETAILS +
      "/" + id,
      {},
      (content) => {
        let geoFence = content.geoFence,
          coordinate = null;
        console.log(geoFence, 'geoFence00');
        if (geoFence) {
          if (geoFence.coordinates) {
            let coordinates = this.parseCoordinates(geoFence);

            this.setState({
              type: "polygon",
              coordinates: coordinates,
            });

            coordinate = {
              latitude: coordinates[0].latitude,
              longitude: coordinates[0].longitude,
            };
          } else {
            let coordinates = geoFence.location.coordinates;

            coordinate = {
              latitude: coordinates[1],
              longitude: coordinates[0],
            };

            this.setState({
              type: "circle",
              location: coordinate,
            });
          }

          this.setState({
            values: {
              remarks: geoFence.remarks,
              notify_when: geoFence.notify_when,
            },
          });

          if (coordinate) {
            this.centerMap(
              coordinate.latitude,
              coordinate.longitude,
              geoFence.latitude_delta,
              geoFence.longitude_delta
            );
          }
        }

        this.setState({
          loading: false,
          geoFence: geoFence,
        });
      },
      (error, errors, content) => {
        this.setState({ loading: false });
      }
    );
  };

  centerMap = (latitude, longitude, latitudeDelta, longitudeDelta) => {
    let { region } = this.state;
    setTimeout(() => {
      this._map.animateToRegion({
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: latitudeDelta || region.latitudeDelta,
        longitudeDelta: longitudeDelta || region.longitudeDelta,
      });
    }, 2000);
  };

  parseCoordinates = (geoFence) => {
    let coordinates = [];
    for (let coordinate of geoFence.coordinates.coordinates[0]) {
      coordinates.push({ latitude: coordinate[1], longitude: coordinate[0] });
    }

    return coordinates;
  };

  modalState = (bool) => {
    this.setState({ isModalVisible: bool });
  };

  changeInput = (value, name) => {
    this.setState({ values: { ...this.state.values, [name]: value } });
  };

  saveGeofence = () => {
    let {
      geoFence,
      values,
      device,
      coordinates,
      type,
      location,
      id,
      region,
    } = this.state;

    let params = {
      remarks: values.remarks,
      notify_when: values.notify_when || "ARRIVAL",
    };

    if (type == "circle") {
      if (!location) {
        return alert("Please draw fencing properly.");
      }

      // params.location = location;
    } else if (type == "polygon") {
      if (coordinates.length < 3) {
        return alert("Please draw fencing properly.");
      }

      // params.coordinates = coordinates;
    } else {
      return alert("Data not valid.");
    }

    params.latitude_delta = region.latitudeDelta;
    params.longitude_delta = region.longitudeDelta;
    params.location = {
      latitude: region.latitude,
      longitude: region.longitude
    };
    params.user_id = id;
    params.device = device.device._id;
    // params.device = device._id;
    params.type = "Single Device"
    console.log("Geofencing Params", params)
    this.setState({ loading: true });

    ApiService.call(id ? "put" : "post", UriConfig.uri.GEO_FENCE_SAVE + "/" + id, params,
      (content, status) => {
        this.setState({
          loading: false,
          editing: false,
          isModalVisible: false,
        });

        ToastAndroid.show(status.message, ToastAndroid.SHORT);

        NavigationService.navigate("homeStack", "GeoFencing", {
          device: device,
        });
      },
      (error, errors, content) => {
        this.setState({ loading: false });

        GeneralService.placeErrors(this, errors);
      }
    );
  };

  regionChange = (region) => {
    console.log('regionChange region', region);
    this.setState({
      region: {
        // ...this.state.region,
        latitude: region.latitude,
        longitude: region.longitude,
        longitudeDelta: region.longitudeDelta,
        latitudeDelta: region.latitudeDelta,
      },
      location: region,
    });
  };

  onPress(e) {
    if (this.state.editing) {
      if (this.state.type == "circle") {
        this.setState({ location: e.nativeEvent.coordinate });
      } else {
        this.setState({
          coordinates: [...this.state.coordinates, e.nativeEvent.coordinate],
        });
      }
    }
  }

  toggleMapType = () => {
    this.setState({
      mapType: this.state.mapType === "satellite" ? "standard" : "satellite",
    });
  };

  drawCoordinates = () => {
    this.setState({
      editing: true,
      location: null,
      coordinates: [],
    });
  };

  resetCoordinates = () => {
    let { geoFence } = this.state;

    this.setState({ editing: false });

    if (!geoFence) {
      return this.setState({
        type: "circle",
        location: null,
        coordinates: [],
      });
    }

    if (geoFence.coordinates) {
      this.setState({
        type: "polygon",
        coordinates: this.parseCoordinates(geoFence),
      });
    } else {
      let coordinates = geoFence.location.coordinates;

      this.setState({
        type: "circle",
        location: {
          latitude: coordinates[1],
          longitude: coordinates[0],
        },
      });
    }
  };

  drawPatternChange = () => {
    this.setState({ type: this.state.type == "circle" ? "polygon" : "circle" });
  };

  deleteGeoFence(id) {
    Alert.alert(
      "Confirmation",
      "Are you sure to delete geo fence?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            this.setState({ loading: true });

            ApiService.call(
              "delete",
              UriConfig.uri.GEO_FENCE_DELETE + "/" + id,
              {},
              async (content, status) => {
                this.setState({ loading: false });

                ToastAndroid.show(status.message, ToastAndroid.SHORT);

                NavigationService.navigate("homeStack", "GeoFencing", {
                  device: this.state.device,
                });
              },
              (error, errors, content) => {
                this.setState({ loading: false });
              }
            );
          },
        },
      ],
      { cancelable: true }
    );
  }

  render() {
    const {
      geoFence,
      region,
      loading,
      isModalVisible,
      values,
      type,
      location,
      coordinates,
      mapType,
      editing,
    } = this.state;

    let notifyWhen = values.notify_when || "ARRIVAL";
    return (
      <View style={mainStyle.map}>
        <Loader loading={loading} />
        <MapView
          mapType={mapType}
          style={mainStyle.map}
          ref={(ref) => (this._map = ref)}
          initialRegion={region}
          zoomControlEnabled
          onPress={(e) => this.onPress(e)}
          onRegionChangeComplete={this.regionChange}
        >
          {coordinates.length > 0 && (
            <Polygon
              key="polygon"
              strokeWidth={1}
              strokeColor="#F00"
              coordinates={coordinates}
              fillColor="rgba(255,0,0,0.5)"
            />
          )}
          {location && (
            <MapView.Circle
              center={location}
              radius={200}
              strokeWidth={1}
              strokeColor={"#1a66ff"}
              fillColor={"rgba(230,238,255,0.5)"}
            />
          )}
        </MapView>

        {/* <View style={geofenceStyle.center}>
          <View style={geofenceStyle.circle} />
          <Image style={geofenceStyle.centerIcon} source={Icons.idle} />
        </View> */}

        {editing && type && (
          <View style={geofenceStyle.optionsh}>
            <TouchableOpacity
              style={geofenceStyle.option}
              onPress={() => this.drawPatternChange()}
            >
              {type == "circle" && (
                <Icon
                  name="circle-o"
                  type="font-awesome"
                  color={Colors.white}
                  size={30}
                />
              )}

              {type == "polygon" && (
                <Icon
                  name="square-o"
                  type="font-awesome"
                  color={Colors.white}
                  size={30}
                />
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={geofenceStyle.options}>
          <TouchableOpacity
            style={geofenceStyle.option}
            onPress={() => this.toggleMapType()}
          >
            <Icon
              name="layers"
              type="font-awesome-5"
              color={Colors.white}
              size={30}
            />
          </TouchableOpacity>

          {geoFence && (
            <TouchableOpacity
              style={geofenceStyle.option}
              onPress={() => this.deleteGeoFence(geoFence._id)}
            >
              <Icon
                name="trash"
                type="font-awesome"
                color={Colors.white}
                size={30}
              />
            </TouchableOpacity>
          )}

          {!editing && (
            <TouchableOpacity
              style={geofenceStyle.option}
              onPress={() => this.drawCoordinates()}
            >
              <Icon
                name="pencil"
                type="font-awesome"
                color={Colors.white}
                size={30}
              />
            </TouchableOpacity>
          )}

          {editing && (
            <TouchableOpacity
              style={geofenceStyle.option}
              onPress={() => this.resetCoordinates()}
            >
              <Icon
                name="times"
                type="font-awesome"
                color={Colors.white}
                size={30}
              />
            </TouchableOpacity>
          )}
        </View>

        <Modal
          transparent={true}
          animationType={"none"}
          onRequestClose={() => this.modalState(false)}
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
                  Geo Fence
                </Text>

                <View style={geofenceStyle.radioView}>
                  <Text
                    style={[
                      geofenceStyle.radioBox,
                      mainStyle.fontmd,
                      mainStyle.textnm,
                      notifyWhen == "ARRIVAL"
                        ? geofenceStyle.radioBoxSelected
                        : null,
                    ]}
                    onPress={() => this.changeInput("ARRIVAL", "notify_when")}
                  >
                    ARRIVAL
                  </Text>
                  <Text
                    style={[
                      geofenceStyle.radioBox,
                      mainStyle.fontmd,
                      mainStyle.textnm,
                      notifyWhen == "LEFT"
                        ? geofenceStyle.radioBoxSelected
                        : null,
                    ]}
                    onPress={() => this.changeInput("LEFT", "notify_when")}
                  >
                    LEFT
                  </Text>
                  <Text
                    style={[
                      geofenceStyle.radioBox,
                      mainStyle.fontmd,
                      mainStyle.textnm,
                      notifyWhen == "BOTH"
                        ? geofenceStyle.radioBoxSelected
                        : null,
                    ]}
                    onPress={() => this.changeInput("BOTH", "notify_when")}
                  >
                    BOTH
                  </Text>
                </View>

                <View style={mainStyle.formInput}>
                  <TextInput
                    style={[mainStyle.formInputField, mainStyle.whiteText]}
                    value={values.remarks || ""}
                    onChangeText={(value) => this.changeInput(value, "remarks")}
                    placeholder="Remarks (Optional)"
                    placeholderTextColor={Colors.theme.lightText}
                  />
                </View>

                <ButtonComponent
                  text="Save"
                  onClick={this.saveGeofence.bind(this)}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

export class GeoFenceDetailComponent extends Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerTitle: (
        <Text style={mainStyle.mainTitle}>
          {params.geoFence ? params.geoFence.title : "Geofence Detail"}
        </Text>
      ),
    };
  };

  constructor() {
    super();

    let { latitudeDelta, longitudeDelta } = GeneralService.locationDelta(0.02);

    this.state = {
      loading: true,

      geoFence: null,
      location: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: latitudeDelta,
        longitudeDelta: longitudeDelta,
      },
    };
  }

  async componentDidMount() {
    let { navigation } = this.props,
      id = navigation.getParam("id", null);

    ApiService.call(
      "get",
      UriConfig.uri.GEO_FENCE_DETAILS + "/" + id,
      {},
      (content) => {
        let geoFence = content.geoFence,
          coordinates = geoFence.location
            ? geoFence.location.coordinates
            : null;

        this.stateLocation({
          latitude: coordinates ? coordinates[1] : 0,
          longitude: coordinates ? coordinates[0] : 0,
        });

        this.props.navigation.setParams({ geoFence: geoFence });

        this.setState({
          loading: false,
          geoFence: content.geoFence,
        });
      },
      (error, errors, content) => {
        this.setState({ loading: false });
      }
    );
  }

  stateLocation(coordinates) {
    var location = { ...this.state.location };
    location.latitude = coordinates.latitude;
    location.longitude = coordinates.longitude;

    this._map.animateToRegion(location, 1000);

    this.setState({ location });
  }

  render() {
    const { geoFence, location } = this.state;

    return (
      <View style={mainStyle.map}>
        <Loader loading={this.state.loading} />
        <MapView
          style={mainStyle.map}
          ref={(ref) => (this._map = ref)}
          initialRegion={location}
          region={location}
        >
          <Marker
            coordinate={location}
            title={geoFence ? geoFence.address : "Not Available"}
          />

          {geoFence && (
            <MapView.Circle
              center={location}
              radius={500}
              strokeWidth={1}
              strokeColor={"#1a66ff"}
              fillColor={"rgba(230,238,255,0.5)"}
            />
          )}
        </MapView>
        <View style={mainStyle.pad10}>
          <Text style={[mainStyle.textxl, mainStyle.fontbl]}>
            {/* {geoFence ? geoFence.device.license_plate : null} */}
          </Text>
          <Text style={[mainStyle.textlg, mainStyle.fontmd]}>
            {geoFence ? geoFence.title : null}
          </Text>

          <View style={mainStyle.flexRow}>
            <Icon name="map-marker" type="font-awesome" size={20} />
            <Text
              style={[
                mainStyle.textnm,
                mainStyle.marginLeft5,
                mainStyle.flexWrap,
                mainStyle.fontrg,
              ]}
            >
              {geoFence ? geoFence.address : null}
            </Text>
          </View>
          <View style={mainStyle.flexRow}>
            <Icon name="circle" type="font-awesome" size={20} />
            <Text
              style={[
                mainStyle.textnm,
                mainStyle.marginLeft5,
                mainStyle.flexWrap,
                mainStyle.fontrg,
              ]}
            >
              {geoFence ? geoFence.range + " meters" : null}
            </Text>
          </View>
          <View style={mainStyle.flexRow}>
            <Icon name="comment" type="font-awesome" size={20} />
            <Text
              style={[
                mainStyle.textnm,
                mainStyle.marginLeft5,
                mainStyle.flexWrap,
                mainStyle.fontrg,
              ]}
            >
              {geoFence ? geoFence.remarks : null}
            </Text>
          </View>
        </View>
      </View>
    );
  }
}
