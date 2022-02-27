/**
 * Component to show group map of devices.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native';

import { Icon } from 'react-native-elements';
import CheckBox from '@react-native-community/checkbox';
import MapView, { Marker, Callout, Polyline } from 'react-native-maps';

import mainStyle from '../styles/main.style';
import groupMapStyle from '../styles/group-map.style';

import AppConfig from '../config/app.config';
import UriConfig from '../config/uri.config';

import Colors from '../modules/colors.module';
import Icons from '../modules/icons.module';

import ApiService from '../services/api.service';
import GeneralService from '../services/general.service';
import StorageService from '../services/storage.service';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

let timeout;

export default class GroupMapComponent extends Component {
  static navigationOptions = ({ navigation }) => { 
    let params = navigation.state.params || {},
    device = params.device || null;
    return {
      headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
      ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
    };
  };
  constructor() {
    super();

    let { latitudeDelta, longitudeDelta } = GeneralService.locationDelta(0.005);

    this.state = {
      mapRef: null,
      mapType: "standard",
      isTracking: false,
      isModalVisible: false,

      devices: [],
      region: {
        latitude: AppConfig.default_location.latitute,
        longitude: AppConfig.default_location.longitude,
        latitudeDelta: latitudeDelta,
        longitudeDelta: longitudeDelta
      },

      currentLocation: null,
      trackingDevices: [],
      routeColors: []
    }
  }

  async componentDidMount() {

    let baseUrl = await StorageService.fetch('assets_url'),
      folders = JSON.parse(await StorageService.fetch('folders'));

    this.setState({ iconBaseUrl: baseUrl + folders.vehicle_icons });

    this.groupMapData();
  }

  componentWillUnmount() {
    this.removeTimeout();
  }

  groupMapData = () => {

    let { devices, trackingDevices, isTracking } = this.state;

    ApiService.call('get', UriConfig.uri.DEVICES_ALL, {}, (content, status) => {

      let newDevices = content.devices;
      console.log('newDevices',newDevices);

      this.setState({ devices: newDevices }, () => {

        if (devices.length <= 0) {
          this.fitToMarkersToMap();
        }

        if (isTracking) {
          for (const device of newDevices) { 
            if (device.location && trackingDevices[device.license_plate]) { 
              trackingDevices[device.license_plate].push({
                latitude: device.location.coordinates[1],
                longitude: device.location.coordinates[0],
              });
            }
          }

          this.setState({ trackingDevices: trackingDevices });
        }

        this.removeTimeout();

        timeout = setTimeout(() => {
          this.groupMapData();
        }, 10000);

      });

    }, (error, errors, content) => {

    });
  }

  removeTimeout = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  }

  fitToMarkersToMap = () => {

    const { devices, mapRef, currentLocation } = this.state;

    let markers = devices.map(d => d._id);

    if (currentLocation) {
      markers.push("cl");
    }

    mapRef.fitToSuppliedMarkers(
      markers,
      {
        animated: true,
        edgePadding: {
          top: 10,
          left: 10,
          right: 10,
          bottom: 10,
        },
      }
    );
  }

  toggleMapType = () => {
    this.setState({ mapType: this.state.mapType === "satellite" ? "standard" : "satellite" });
  }

  toggleTrackModal = () => {

    let { isModalVisible, isTracking } = this.state;

    this.setState({ isModalVisible: !isModalVisible });

    if (!isTracking) {
      this.setState({
        routeColors: [],
        trackingDevices: []
      });
    }

  }

  track = async (track) => {

    if (track) {

      let position = await GeneralService.currentLocation();

      this.setState({
        isTracking: true,
        isModalVisible: false,
        currentLocation: {
          latitude: position.latitude,
          longitude: position.longitude,
        }
      }, () => {
        this.fitToMarkersToMap();
      });
    } else {

      this.setState({
        routeColors: [],
        isTracking: false,
        trackingDevices: [],
        isModalVisible: false,
        currentLocation: null
      }, () => {
        this.fitToMarkersToMap();
      });

    }
  }

  toggleCheckbox = (deviceNumber) => {

    let { trackingDevices, routeColors } = this.state;

    if (trackingDevices[deviceNumber]) {
      delete trackingDevices[deviceNumber];
      delete routeColors[deviceNumber];
    } else {
      trackingDevices[deviceNumber] = [];
      routeColors[deviceNumber] = GeneralService.randomColor();
    }

    this.setState({
      routeColors: routeColors,
      trackingDevices: trackingDevices
    });

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

  render() {

    let { region, mapType, currentLocation, isTracking, devices, iconBaseUrl, isModalVisible, trackingDevices, routeColors } = this.state,
      devicesWithLocations = devices.filter(d => !!d.location); 
    return (

      <View style={mainStyle.flexOne}>

        <MapView
          mapType={mapType}
          style={mainStyle.flexOne}
          initialRegion={region}
          zoomControlEnabled={true}
          ref={(ref) => { this.state.mapRef = ref }}
          onRegionChangeComplete={this.regionChange}
        >
          {

            devicesWithLocations.map(device => {

              let mapIconUrl = iconBaseUrl ? iconBaseUrl + GeneralService.deviceTopviewIcon(device) : null;

              return (
                <Marker.Animated
                  key={device._id}
                  identifier={device._id}
                  coordinate={{
                    latitude: device.location.coordinates[1],
                    longitude: device.location.coordinates[0],
                  }}
                  anchor={{ x: 0.5, y: 0.5 }}
                  style={{ transform: [{ rotate: (Math.abs((device.head + 270) % 360)) + "deg" }] }}
                >
                  <Image source={{ uri: mapIconUrl }} resizeMode="contain" style={mainStyle.mapIcon} />
                  <Callout>
                    <View style={groupMapStyle.callout}>
                      <Text style={[groupMapStyle.calloutHeader, mainStyle.fontbl]}>{device.license_plate}</Text>

                      {
                        device.current_state &&
                        <View style={groupMapStyle.calloutRow}>
                          <Icon name='shield' type='font-awesome' size={15} color={GeneralService.deviceStatusColor(device.current_state)} />
                          <Text style={[groupMapStyle.calloutRowText, mainStyle.fontmd]}>{GeneralService.camelcase(device.current_state)}</Text>
                        </View>
                      }

                      <View style={groupMapStyle.calloutRow}>
                        <Icon name='tachometer' type='font-awesome' size={15} color={Colors.gray} />
                        <Text style={[groupMapStyle.calloutRowText, mainStyle.fontmd]}>{device.current_speed || 0} km/hr</Text>
                      </View>

                      <View style={groupMapStyle.calloutRow}>
                        <Icon name='map-marker' type='font-awesome' size={20} color={Colors.gray} />
                        <Text style={[groupMapStyle.calloutRowText, mainStyle.fontmd]}>{device.address || "Not Available"}</Text>
                      </View>

                      <View style={groupMapStyle.calloutRow}>
                        <Icon name='calendar' type='font-awesome' size={15} color={Colors.gray} />
                        <Text style={[groupMapStyle.calloutRowText, mainStyle.fontmd]}>{GeneralService.dateFormat(device.updated_at)}</Text>
                      </View>

                    </View>
                  </Callout>
                </Marker.Animated>
              );
            })
          }

          {
            currentLocation &&
            <Marker
              key="cl"
              identifier="cl"
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              title="Your Location"
            >
              <Image source={Icons.idle} />
              <Callout>
                <View style={groupMapStyle.callout}>
                  <Text style={[groupMapStyle.calloutHeader, mainStyle.fontbl]}>Current Location</Text>
                </View>
              </Callout>
            </Marker>
          }

          {
            Object.keys(trackingDevices).map((deviceNumber) => {

              let routeCoordinates = Object.values(trackingDevices[deviceNumber]);

              return (
                <Polyline
                  key={"route" + deviceNumber}
                  strokeColor={routeColors[deviceNumber]} // fallback for when `strokeColors` is not supported by the map-provider
                  coordinates={routeCoordinates}
                  strokeColors={[
                    '#7F0000',
                    '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
                    '#B24112',
                    '#E5845C',
                    '#238C23',
                    '#7F0000'
                  ]}
                  strokeWidth={5}
                />
              )
            })
          }

        </MapView>

        <View style={groupMapStyle.options}>
          <TouchableOpacity style={groupMapStyle.option} onPress={() => this.toggleMapType()}>
            <Icon name='layers' type='font-awesome-5' color={Colors.white} size={30} />
          </TouchableOpacity>
          <TouchableOpacity style={groupMapStyle.option} onPress={() => this.toggleTrackModal()}>
            <Image source={Icons.route} />
          </TouchableOpacity>
          <TouchableOpacity style={groupMapStyle.option} onPress={() => this.fitToMarkersToMap()}>
            <Icon name='refresh' type='font-awesome' color={Colors.white} size={25} />
          </TouchableOpacity>
        </View>

        <TouchableWithoutFeedback onPress={() => { }}>
          <Modal
            transparent={true}
            animationType={'none'}
            onRequestClose={() => this.toggleTrackModal()}
            visible={isModalVisible}>
            <View style={mainStyle.modalBackground}>
              <View style={mainStyle.modalForm}>

                <View style={mainStyle.formBody}>

                  <Text style={[mainStyle.textxl, mainStyle.marginBottom10, mainStyle.fontmd, mainStyle.whiteText]}>Select to Track</Text>

                  {
                    devicesWithLocations.map((device) =>
                      (
                        <View key={device._id} style={[mainStyle.flexRow, mainStyle.itemsCenter]}>
                          <CheckBox
                            value={trackingDevices[device.license_plate] ? true : false}
                            onChange={() => this.toggleCheckbox(device.license_plate)} />
                          <Text style={[mainStyle.fontmd, mainStyle.textlg, mainStyle.whiteText]}>{device.license_plate}</Text>
                        </View>

                      )
                    )
                  }

                  <View style={{ flexDirection: "row-reverse" }}>

                    <TouchableOpacity onPress={() => this.toggleTrackModal()}>
                      <Text style={[mainStyle.fontrg, mainStyle.marginLeft10, mainStyle.lightText]}>Close</Text>
                    </TouchableOpacity>

                    {
                      isTracking &&
                      <TouchableOpacity onPress={() => this.track(false)}>
                        <Text style={[mainStyle.fontrg, mainStyle.marginLeft10, mainStyle.redText]}>Stop Tracking</Text>
                      </TouchableOpacity>
                    }

                    {
                      !isTracking &&
                      <TouchableOpacity onPress={() => this.track(true)}>
                        <Text style={[mainStyle.fontbl, mainStyle.yellowText]}>Track</Text>
                      </TouchableOpacity>
                    }

                  </View>

                </View>
              </View>
            </View>
          </Modal>
        </TouchableWithoutFeedback>

      </View>
    );
  };
}