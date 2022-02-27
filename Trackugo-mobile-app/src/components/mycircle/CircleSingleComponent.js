import React, { Component } from 'react';
import {
  Text, View, StyleSheet, Share, TouchableOpacity, Platform, ImageBackground, Image,
  Linking, Dimensions, Modal, TextInput, ToastAndroid, Alert
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../modules/colors.module';
import mainStyle from '../../styles/main.style';
import moment from 'moment';
import StorageService from '../../services/storage.service';
import UriConfig from "../../config/uri.config";
import ApiService from "../../services/api.service";
import GeneralService from "../../services/general.service";
import NavigationService from "../../services/navigation.service";
import Loader from "../../modules/loader.module";
import MapView, { Marker, Callout, Polygon } from "react-native-maps";

import geofenceStyle from "../../styles/geofence.style";
import groupMapStyle from "../../styles/group-map.style";
import circleDetailsStyle from "../../styles/circleDetails.style";
import ButtonComponent from "../partials/Button.component";
import Icons from '../../modules/icons.module';
import { h } from '../../styles/dimension';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class CircleSingle extends Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
console.log(params,'params')
    return {
      headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
            ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
      headerTitle: (
        <Text style={mainStyle.mainTitle}>
          {params.itemData ? params.circleName : "Geofence"}
        </Text>
      ),
      // headerRight: (
      //   <TouchableOpacity
      //     style={mainStyle.pad10}
      //     onPress={() => (params ? params.modalState(true) : null)}
      //   >
      //     <Icon
      //       name="check"
      //       type="font-awesome"
      //       size={30}
      //       color={Colors.gray}
      //     />
      //   </TouchableOpacity>
      // ),
    };
  };

  constructor() {
    super();

    let { latitudeDelta, longitudeDelta } = GeneralService.locationDelta(0.005);

    this.state = {
      id: null,
      device: null,
      itemData: null,
      loading: true,
      isGeofenceVisible: false,
      isModalVisible: false,
      type: "circle",
      geoFence: null,
      location: null,
      coordinates: [],
      region: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: latitudeDelta,
        longitudeDelta: longitudeDelta,
      },
      currentLocation: null,
      mapType: "standard",
      values: [],
      editing: false,
      user: null, isAssignShowShow: false,circleName:''
    };
  }

  async componentDidMount() {
    try {
      let { navigation } = this.props,
        id = navigation.getParam("id", null),
        device = navigation.getParam("device", null),
        itemData = navigation.getParam("itemData", null);
        circleName = navigation.getParam("circleName", null);

      // itemData=itemData.location.coordinates[1]=!null?itemData:null;
      console.log('itemData', itemData);
      this.props.navigation.setParams({
        device: device,
        modalState: this.modalState,
        itemData: itemData
      });
      let user = JSON.parse(await StorageService.fetch('user'));

      // this.setState(
      //   {
      //     user: user,
      //     id: id,
      //     device: device,
      //   },
      //   () => {
      //     this.getGeofence(itemData);
      //   }
      // );
      this.getGeofence(itemData);
    } catch (error) {
      console.log(error, 'errorerror');
    }


  }

  getGeofence = (itemData) => {
    // let itemData = this.props.navigation.getParam("itemData", null);
    if (itemData != null) {
      console.log('itemData22', itemData);
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
        region: {
          ...this.state.region,
          latitude: itemData.location.coordinates[1],
          longitude: itemData.location.coordinates[0],
          // latitudeDelta: latitudeDelta,
          // longitudeDelta: longitudeDelta,
        },
        location: {
          latitude: itemData.location.coordinates[1],
          longitude: itemData.location.coordinates[0],
        },
      });
      if (coordinate) {
        this.centerMap(
          coordinate.latitude,
          coordinate.longitude,
          // itemData.latitude_delta,
          // itemData.longitude_delta,
        );
      }

    }
    this.setState({ loading: false });
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
  circleState = (bool) => {
    this.setState({ isAssignShow: true, isGeofenceVisible: bool });
  };
  changeInput = (value, name) => {
    this.setState({ values: { ...this.state.values, [name]: value } });
  };

  saveGeofence = () => {
    try {
      let {
        geoFence,
        values,
        device,
        coordinates,
        type,
        location,
        id,
        region,
        user
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
      let itemData = this.props.navigation.getParam("itemData", null);

      params.user_id = itemData._id;
      params.latitude_delta = region.latitudeDelta;
      params.longitude_delta = region.longitudeDelta;
      params.latitude = location.latitude;
      params.longitude = location.longitude;
      params.type = "Group";

      console.log("Geofencing Params", params)
      this.setState({ loading: true });
      console.log('params1111111', params);
      console.log('geoFence110', geoFence);
      console.log('id110', id);
      ApiService.call(
        geoFence ? "put" : "post",
        UriConfig.uri.GEO_FENCE_SAVE + "/" + (geoFence ? id : ''),
        // "post",
        // UriConfig.uri.geo_fence_save_group,
        params,
        (content, status) => {
          this.setState({
            loading: false,
            editing: false,
            isModalVisible: false,
            isGeofenceVisible: false,
            isAssignShow: false
          });
          console.log(content);
          ToastAndroid.show(status.message, ToastAndroid.SHORT);

          // NavigationService.navigate("homeStack", "GeoFencing", {
          //     device: device,
          // });
        },
        (error, errors, content) => {
          this.setState({ loading: false });
          GeneralService.placeErrors(this, errors);
        }
      );
    } catch (error) {
      console.log(error);
      this.setState({ loading: false });
    }
  };

  regionChange = (region) => {
    console.log('region', region);
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
    if (geoFence.coordinates == null) {
      return;
    }
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

                NavigationService.navigate("homeStack", "CircleList", {
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
  async shareLocation(itemData) {
    try {
      let lat = itemData.location.coordinates[0];
      let lon = itemData.location.coordinates[1];
      const result = await Share.share({
        // title: 'Hey buddy install this',  

        message: itemData.profile_name + " has just shared his location with you.\nAddress: " + itemData.address + "\nClick on below link to view on map."
          + "\nhttps://www.google.co.in/maps/place/" + lon + "," + lat + "\nEnjoy our services. \nWe are India’s biggest GPS security company. Visit - trackugo.in"

        // message: itemData.address,
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
  async openDirection(itemData) {
    try {
      let user = JSON.parse(await StorageService.fetch('user'));
      let lon = itemData.location.coordinates[0];
      let lat = itemData.location.coordinates[1];
      if (this.state.platform === "android" || "web") {
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&origin=` +
          user.location.coordinates[0] +
          `,` +
          user.location.coordinates[1] +
          `&destination=` +
          lat +
          `,` +
          lon +
          `&travelmode=driving`
        );
      } else {
        console.log("Something Went Wrong?")
      }
    } catch (error) {
      console.log(error);
    }
  }

  regionChange1 = (region) => {
    this.setState({
      region: {
        ...this.state.region,
        longitudeDelta: region.longitudeDelta,
        latitudeDelta: region.latitudeDelta,
      }
    });
  }
  fitToMarkersToMap = () => {
    const { devices, itemData, mapRef, currentLocation } = this.state;

    // let markers = itemData.map(d => d._id);

    // if (currentLocation) {
    //   markers.push("cl");
    // }

    // mapRef.fitToSuppliedMarkers(
    //   markers,
    //   {
    //     animated: true,
    //     edgePadding: {
    //       top: 10,
    //       left: 10,
    //       right: 10,
    //       bottom: 10,
    //     },
    //   }
    // );
  }
  render() {
    const {
      geoFence,
      region,
      loading,
      isGeofenceVisible,
      isModalVisible,
      values,
      type,
      location,
      coordinates,
      mapType,
      editing, currentLocation, isAssignShow
    } = this.state;
    let notifyWhen = values.notify_when || "ARRIVAL";
    console.log('geoFence', geoFence);
    let itemData = this.props.navigation.getParam("itemData", null);
    let device = this.props.navigation.getParam("itemData", null);
    console.log('itemData123', device);
    // device = device.filter(d => !!d.location);
    console.log(location, 'location');
    return (

      <View style={mainStyle.map}>
        <Loader loading={false} />
        {
          !isGeofenceVisible &&
          <MapView
            mapType={mapType}
            style={mainStyle.map}
            ref={(ref) => (this._map = ref)}
            initialRegion={region}
            zoomControlEnabled
            onPress={(e) => this.onPress(e)}
            onRegionChangeComplete={this.regionChange1}
          >
            <Marker.Animated
              coordinate={{
                latitude: region.latitude,
                longitude: region.longitude
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              {/* <Image source={Icons.idle} resizeMode="contain" style={mainStyle.mapIcon} /> */}
              <ImageBackground style={{
                justifyContent: 'center', alignItems: 'center',
                height: 70, width: 50,
              }} resizeMode="contain" source={Icons.marker}>
                <Text style={[circleDetailsStyle.txtListLabel, { color: "black", fontSize: 20, marginBottom: 13 }]}>{device.profile_name.slice(0, 1)}</Text>

              </ImageBackground>
              {/* <Callout>
                <View style={groupMapStyle.callout}>
                  <Text style={[groupMapStyle.calloutHeader, mainStyle.fontbl]}>{device.profile_name}</Text>
                  <View style={groupMapStyle.calloutRow}>
                    <Icon name='map-marker' type='font-awesome' size={20} color={Colors.gray} />
                    <Text style={[groupMapStyle.calloutRowText, mainStyle.fontmd]}>{device.address || "Not Available"}</Text>
                  </View>
                </View>
              </Callout> */}
              <Callout tooltip={true}>
                <View style={groupMapStyle.callout}>
                  <View style={[groupMapStyle.calloutRow, { justifyContent: 'space-between' }]}>
                    <Text style={groupMapStyle.calloutHeader}>{device.profile_name}</Text>
                    <View style={groupMapStyle.calloutRow}>
                      <Icon name='battery-high' color={Colors.gray} size={20} />
                      <Text style={[groupMapStyle.calloutRowText, mainStyle.fontmd]}>{(device.battery * 100).toFixed(0)}%</Text>
                    </View>
                  </View>

                  <View style={groupMapStyle.calloutRow}>
                    <Icon name='clock' type='font-awesome' size={20} color={Colors.gray} />
                    <Text style={[groupMapStyle.calloutRowText, mainStyle.fontmd]}>{moment(device.event_timestamp).format('DD MMM YYYY, h:mm A')}</Text>
                  </View>
                  <View style={groupMapStyle.calloutRow}>
                    <Icon name='map-marker' type='font-awesome' size={20} color={Colors.gray} />
                    <Text style={[groupMapStyle.calloutRowText, mainStyle.fontmd]}>{device.current_address || "Not Available"}</Text>
                  </View>
                </View>
              </Callout>
            </Marker.Animated>
            {/* {coordinates.length > 0 && (
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
          )} */}
          </MapView>
        }
        {
          isGeofenceVisible &&
          <MapView
            mapType={mapType}
            style={mainStyle.map}
            ref={(ref) => (this._map = ref)}
            initialRegion={region}
            onPress={(e) => this.onPress(e)}
            onRegionChangeComplete={this.regionChange}
          >
            {/* <Marker.Animated
              coordinate={{
                latitude: region.latitude,
                longitude: region.longitude
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <ImageBackground style={{
                justifyContent: 'center', alignItems: 'center',
                height: 70, width: 50,
              }} resizeMode="contain" source={Icons.marker}>
                <Text style={[circleDetailsStyle.txtListLabel, { color: "black", fontSize: 20, marginBottom: 13 }]}>{device.profile_name.slice(0, 1)}</Text>

              </ImageBackground>
              <Callout>
                <View style={groupMapStyle.callout}>
                  <Text style={[groupMapStyle.calloutHeader, mainStyle.fontbl]}>{device.profile_name}</Text>
                  <View style={groupMapStyle.calloutRow}>
                    <Icon name='map-marker' type='font-awesome' size={20} color={Colors.gray} />
                    <Text style={[groupMapStyle.calloutRowText, mainStyle.fontmd]}>{device.address || "Not Available"}</Text>
                  </View>
                </View>
              </Callout>
            </Marker.Animated> */}
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
        }
        <View style={styles.vwBottom}>
          <Text style={[styles.txtBottomLabel, { marginTop: 0 }]}>{itemData.profile_name}</Text>
          <Text style={styles.txtBottomAddress}>{itemData.address}</Text>
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            width: '50%',
            height: h(4),
            borderRadius: 20,
            paddingVertical: 7,
            paddingHorizontal: 10,
            backgroundColor: Colors.red, marginBottom: 10
          }}>
            <Text style={styles.txtBottomAddress, { color: Colors.white }}>{moment(itemData.event_timestamp).format('DD MMM YYYY, h:mm A')}</Text>
          </View>
          <View style={styles.vwBottomChild}>
            <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
              onPress={() => this.openDirection(itemData)}>
              <Icon name={'map-marker-path'} size={25} color={Colors.white} />
              <Text style={styles.txtBottomLabel}>Get Direction</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
              onPress={() => this.circleState(true)}>
              <Icon name={'map-marker-radius'} size={25} color={Colors.white} />
              <Text style={styles.txtBottomLabel}>Assign Zone</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
              onPress={() => this.shareLocation(itemData)}>
              <Icon name={'share-variant'} size={25} color={Colors.white} />
              <Text style={styles.txtBottomLabel}>Share Location</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* <View style={geofenceStyle.center}>
            <View style={geofenceStyle.circle} />
            <Image style={geofenceStyle.centerIcon} source={Icons.idle} />
          </View> */}

        {/* {editing && type && (
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
        )} */}

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
          <TouchableOpacity style={groupMapStyle.option} onPress={() => this.fitToMarkersToMap()}>
            <Icon name='refresh' type='font-awesome' color={Colors.white} size={25} />
          </TouchableOpacity>
          {isAssignShow &&
            <TouchableOpacity style={groupMapStyle.option} onPress={() => this.modalState(true)}>
              <Icon name='check' type='font-awesome' color={Colors.white} size={25} />
            </TouchableOpacity>
          }
          {/* {itemData && (
            <TouchableOpacity
              style={geofenceStyle.option}
              onPress={() => this.deleteGeoFence(itemData._id)}
            >
              <Icon
                name="trash"
                type="font-awesome"
                color={Colors.white}
                size={30}
              />
            </TouchableOpacity>
          )} */}

          {/* {!editing && (
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
          )} */}

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


const styles = StyleSheet.create({
  vwBottom: {
    bottom: 0,
    right: 0,
    left: 0,
    position: "absolute",
    backgroundColor: Colors.theme.backgroundModal,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 3
  },
  vwBottomChild: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 3,
    backgroundColor: Colors.darkGray,
    borderRadius: 15,
    paddingHorizontal: 5,

  },
  txtBottomLabel: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5
  },
  txtBottomAddress: {
    color: Colors.white,
    fontSize: 14,
    marginBottom: 10
  },
})