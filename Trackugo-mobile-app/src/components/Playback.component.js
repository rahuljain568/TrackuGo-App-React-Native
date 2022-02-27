
/**
 * Component to handle playback related operations.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TextInput,
  TouchableOpacity
} from 'react-native';

import { Icon } from 'react-native-elements';
import MapView, { Marker, Polyline, Callout } from 'react-native-maps';
import DateTimePicker from "react-native-modal-datetime-picker";

import ButtonComponent from '../components/partials/Button.component';

import UriConfig from '../config/uri.config';

import mainStyle from '../styles/main.style';
import playbackStyle from '../styles/playback.style';

import ApiService from '../services/api.service';
import StorageService from '../services/storage.service';
import GeneralService from '../services/general.service';
import NavigationService from '../services/navigation.service';

import Loader from '../modules/loader.module';
import Colors from '../modules/colors.module';
import Icons from '../modules/icons.module';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class PlaybackComponent extends Component {

  static navigationOptions = ({ navigation }) => {
    let params = navigation.state.params || {},
      device = params.device || null;

    return {
      headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
      ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
      headerTitle: (
        <View>
          <Text style={mainStyle.titleTextMain}>Playback</Text>
          <Text style={mainStyle.titleTextSub}>{device ? device.license_plate : null}</Text>
        </View>
      ),
      headerRight: (
        <TouchableOpacity style={mainStyle.pad10} onPress={() => params ? params.requestModalOpen() : null}>
          <Icon name='calendar' type='font-awesome' size={30} color={Colors.gray} />
        </TouchableOpacity>
      )
    };
  };

  constructor() {
    super();

    let now = new Date();

    this.state = {
      device: null,
      playSpeed: 1,
      loading: false,
      playing: false,
      mapType: "standard",

      coordinate: null,
      coordinates: [],

      stats: null,
      stoppages: [],
      parkingLocations: [],

      from_date: GeneralService.dateFormat(null, 'd/m/Y') + " 00:00",
      to_date: GeneralService.dateFormat(now, 'd/m/Y H:i'),
      errors: {
        from_date: false,
        to_date: false
      },
      current_picker: null,
      isNavigationVisible: false,
      isDateTimePickerVisible: false,

      region: GeneralService.defaultLocation(0.5),
    }

    this.index = 0;
  }

  async componentDidMount() {

    let { navigation } = this.props,
      device = navigation.getParam('device', null),
      params = navigation.getParam('params', null);

    this.props.navigation.setParams({
      device: device,
      requestModalOpen: this.requestModalOpen,
    });

    let baseUrl = await StorageService.fetch('assets_url'),
      folders = JSON.parse(await StorageService.fetch('folders')),
      stateData = {
        device: device,
        iconBaseUrl: baseUrl + folders.vehicle_icons
      };

    if (params) {

      if (params.date) {
        stateData.from_date = GeneralService.dateFormat(params.date, 'd/m/Y') + " 00:00";
        stateData.to_date = GeneralService.dateFormat(params.date, 'd/m/Y') + " 23:59";
      } else {
        stateData.from_date = GeneralService.dateFormat(params.start_time, 'd/m/Y H:i');
        stateData.to_date = GeneralService.dateFormat(params.end_time, 'd/m/Y H:i');
      }

      stateData.isNavigationVisible = true;
    }

    this.setState(stateData, () => {
      if (stateData.isNavigationVisible) {
        this.getPlaybackRoute();
      }

      this.getParkingLocations();
    });

  }

  componentWillUnmount() {
    this.pause();
  }

  showDateTimePicker = (pickerElement) => {
    this.setState({
      current_picker: pickerElement,
      isDateTimePickerVisible: true
    });
  }

  hideDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: false });
  }

  handleDatePicked = (date) => {

    if (this.state.current_picker) {
      this.setState({
        [this.state.current_picker]: GeneralService.dateFormat(date, 'd/m/Y H:i'),
        errors: { ...this.state.errors, [this.state.current_picker]: false }
      });
    }
    this.hideDateTimePicker();
  }

  requestModalOpen = () => {
    this.setState({ isNavigationVisible: false });
  }

  requestModalClose = () => {
    this.hideDateTimePicker();
    NavigationService.back();
  }

  toogleMapType = () => {
    this.setState({ mapType: this.state.mapType === "satellite" ? "standard" : "satellite" });
  }

  getPlaybackRoute = () => {
    let { device, from_date, to_date, region } = this.state;

    if (!device) {
      return NavigationService.back();
    } else if (!from_date) {
      return this.setState({ errors: { ...this.state.errors, from_date: true } });
    } else if (!to_date) {
      return this.setState({ errors: { ...this.state.errors, to_date: true } });
    }

    let params = {
      from_date: GeneralService.dateFormat(GeneralService.correctDate(from_date + ":00"), 'Y-m-d H:i:s'),
      to_date: GeneralService.dateFormat(GeneralService.correctDate(to_date + ":00"), 'Y-m-d H:i:s'),
      offset: new Date().getTimezoneOffset()
    };

    this.setState({ loading: true });

    ApiService.call('post', UriConfig.uri.DEVICE_PLAYBACK + "/" + device._id, params, (content) => {

      let stats = null,
        coordinate = null,
        currentState = null,
        routeCoordinates = [],
        locations = content.locations,
        count = locations.length;

      if (count > 0) {
        stats = {
          total_time: content.total_time,
          total_distance: content.total_distance,
          start_time: locations[0].created_at,
          start_address: locations[0].address,
          end_time: locations[count - 1].created_at,
          end_address: locations[count - 1].address
        };

        currentState = locations[0];
        coordinate = new MapView.AnimatedRegion({
          ...region,
          latitude: currentState.location.coordinates[1],
          longitude: currentState.location.coordinates[0],
        });

        for (let location of locations) {
          routeCoordinates.push({
            latitude: location.location.coordinates[1],
            longitude: location.location.coordinates[0],
          });
        }
      }

      this.index = 0;
      this.total = count;
      this.locations = locations;

      this.setState({
        stats: stats,
        playSpeed: 1,
        loading: false,
        coordinate: coordinate,
        isNavigationVisible: true,
        currentState: currentState,
        stoppages: content.stoppages,
        coordinates: routeCoordinates
      }, () => {

        this.mapRef.fitToSuppliedMarkers(
          ['start', 'end'],
          {
            animated: true,
            edgePadding: {
              top: 10,
              left: 20,
              right: 20,
              bottom: 10,
            },
          }
        );

        this.play();

      });

    }, (error, errors, content) => {
      this.setState({ loading: false });
    });

  }

  getParkingLocations = () => {

    let { device } = this.state;

    ApiService.call('get', UriConfig.uri.PARKING_LOCATIONS + "/" + device._id, {}, (content, status) => {

      this.setState({ parkingLocations: content.parkingLocations.items });

    }, (error, errors, content) => {

    });
  }

  markerAnimation = () => {
    if (this.index >= this.total || !this.state.playing) {
      return this.pause();
    }

    let { region, playSpeed } = this.state,
      currentState = this.locations[this.index],
      coordinates = currentState.location.coordinates,
      markerCoordinates = {
        latitude: coordinates[1],
        longitude: coordinates[0]
      },
      timeInterval = 3000 / playSpeed;

    this.index = this.index + 1;

    if (this.mapRef) {
      this.mapRef.animateToRegion({
        ...markerCoordinates,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta
      }, timeInterval);
    }

    this.state.coordinate.timing(markerCoordinates, timeInterval).start();

    this.setState({ currentState: currentState });
  }

  play = () => {

    if (this.interval) {
      return false;
    }

    this.markerAnimation();
    this.setState({ playing: true });
    this.interval = setInterval(this.markerAnimation, 3000 / this.state.playSpeed);
  }

  pause = () => {
    if (this.interval) {
      this.interval = null;
      clearInterval(this.interval);
    }

    this.setState({ playing: false });
  }

  controlPlaySpeed = () => {

    this.pause();

    this.setState({ playSpeed: (this.state.playSpeed % 3) + 1 }, () => {
      this.play();
    });
  }

  coordinatesToAnimatedRegion = (location) => {
    return new MapView.AnimatedRegion({
      ...this.state.region,
      latitude: location.coordinates[1],
      longitude: location.coordinates[0],
    })
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

    let { loading, region, device, currentState, coordinates, iconBaseUrl, stoppages, parkingLocations, mapType, stats, playing, coordinate, playSpeed } = this.state;

    let mapIconUrl = device && iconBaseUrl ? iconBaseUrl + GeneralService.deviceTopviewIcon(device) : null,
      coordinatesCount = coordinates ? coordinates.length : 0,
      startCoordinate = coordinatesCount > 0 ? coordinates[0] : null,
      endCoordinate = coordinatesCount > 0 ? coordinates[coordinatesCount - 1] : null;

    return (
      <View style={mainStyle.flexOne}>
        <Loader loading={loading} />

        <Modal
          transparent={true}
          animationType={'none'}
          onRequestClose={() => { this.requestModalClose() }}
          visible={!this.state.isNavigationVisible}>
          <View style={mainStyle.modalBackground}>
            <View style={mainStyle.modalForm}>
              <View style={mainStyle.formBody}>

                <TouchableOpacity onPress={() => this.showDateTimePicker('from_date')}>
                  <TextInput
                    editable={false}
                    value={this.state.from_date}
                    style={[mainStyle.formInput, mainStyle.whiteText, this.state.errors.from_date ? mainStyle.inputError : null]} placeholder="From Date Time"
                    placeholderTextColor={this.state.errors.from_date ? "red" : null}
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => this.showDateTimePicker('to_date')}>
                  <TextInput
                    editable={false}
                    value={this.state.to_date}
                    style={[mainStyle.formInput, mainStyle.whiteText, this.state.errors.to_date ? mainStyle.inputError : null]} placeholder="To Date Time"
                    placeholderTextColor={this.state.errors.to_date ? "red" : null}
                  />
                </TouchableOpacity>

                <DateTimePicker
                  mode={'datetime'}
                  onConfirm={this.handleDatePicked}
                  onCancel={this.hideDateTimePicker}
                  maximumDate={new Date()}
                  isVisible={this.state.isDateTimePickerVisible}
                />

                <ButtonComponent text="Proceed" onClick={this.getPlaybackRoute.bind(this)} />

              </View>
            </View>
          </View>
        </Modal>

        <MapView
          mapType={mapType}
          style={mainStyle.flexOne}
          initialRegion={region}
          zoomControlEnabled={true}
          ref={(ref) => { this.mapRef = ref }}
          onRegionChangeComplete={this.regionChange}
        >

          {
            startCoordinate &&
            <Marker
              key={"start"}
              identifier={"start"}
              calloutVisible={true}
              title="Starting Point"
              coordinate={startCoordinate}
              anchor={{ x: 0.2, y: 1 }}
            >
              <Image source={Icons.flag} />
            </Marker>
          }

          {
            endCoordinate &&
            <Marker
              key={"end"}
              identifier={"end"}
              calloutVisible={true}
              title="Finishing Point"
              coordinate={endCoordinate}
              anchor={{ x: 0.2, y: 1 }}
            >
              <Image source={Icons.flag} />
            </Marker>
          }

          {
            device && coordinate && currentState &&
            <Marker.Animated
              key={"device"}
              coordinate={coordinate}
              anchor={{ x: 0.5, y: 0.5 }}
              ref={marker => (this.marker = marker)}
            >
              <Image
                style={{
                  width: 40,
                  height: 40,
                  resizeMode: 'contain',
                  transform: [
                    { rotate: `${device.vehicle_type == "PERSONAL_TRACKER" ? 0 : Math.abs(currentState.head + 270) % 360}deg` }
                  ],
                  zIndex: 3
                }}
                source={{ uri: mapIconUrl }}
              />
            </Marker.Animated>
          }

          {
            stoppages.map((stoppage) => {

              return (
                <Marker
                  key={"s" + stoppage.id}
                  coordinate={{
                    latitude: stoppage.location.coordinates[1],
                    longitude: stoppage.location.coordinates[0]
                  }}
                  calloutVisible={true}
                  anchor={{ x: 0.2, y: 1 }}
                >
                  <Image source={Icons.stoppage} />
                  <Callout>
                    <View style={playbackStyle.callout}>
                      <Text style={[playbackStyle.calloutHeader, mainStyle.fontbl]}>Stoppage</Text>

                      <View style={playbackStyle.calloutRow}>
                        <Icon name='map-marker' type='font-awesome' size={20} color={Colors.gray} />
                        <Text style={[playbackStyle.calloutRowText, mainStyle.fontmd]}>{stoppage.address}</Text>
                      </View>

                      <View style={playbackStyle.calloutRow}>
                        <Icon name='calendar' type='font-awesome' size={15} color={Colors.gray} />
                        <Text style={[playbackStyle.calloutRowText, mainStyle.fontmd]}>{GeneralService.dateFormat(stoppage.start_time, 'h:i A')} - {GeneralService.dateFormat(stoppage.end_time, 'h:i A')}</Text>
                      </View>

                      <View style={playbackStyle.calloutRow}>
                        <Icon name='clock-o' type='font-awesome' size={15} color={Colors.gray} />
                        <Text style={[playbackStyle.calloutRowText, mainStyle.fontmd]}>{stoppage.stoppage_time}</Text>
                      </View>

                    </View>
                  </Callout>
                </Marker>
              );

            })

          }

          {
            parkingLocations.map((parkingLocation) => {

              return (
                <Marker
                  key={parkingLocation._id}
                  coordinate={{
                    latitude: parkingLocation.location.coordinates[1],
                    longitude: parkingLocation.location.coordinates[0]
                  }}
                  calloutVisible={true}
                  anchor={{ x: 0.2, y: 1 }}
                >
                  <Image source={Icons.parkingGreen} />
                  <Callout>
                    <View style={playbackStyle.callout}>
                      <Text style={[playbackStyle.calloutHeader, mainStyle.fontbl]}>Parking</Text>

                      <View style={playbackStyle.calloutRow}>
                        <Icon name='map-marker' type='font-awesome' size={20} color={Colors.gray} />
                        <Text style={[playbackStyle.calloutRowText, mainStyle.fontmd]}>{parkingLocation.address}</Text>
                      </View>

                    </View>
                  </Callout>
                </Marker>
              );

            })

          }

          <Polyline
            coordinates={coordinates}
            strokeColor={Colors.yellow} // fallback for when `strokeColors` is not supported by the map-provider
            strokeColors={[
              '#7F0000',
              '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
              '#B24112',
              '#E5845C',
              '#238C23',
              '#7F0000'
            ]}
            strokeWidth={3}
          />
        </MapView>

        <View style={playbackStyle.options}>
          <TouchableOpacity style={playbackStyle.option} onPress={() => this.toogleMapType()}>
            <Icon name='layers' type='font-awesome-5' color={Colors.white} size={30} />
          </TouchableOpacity>
          <TouchableOpacity style={playbackStyle.option} onPress={() => playing ? this.pause() : this.play()}>
            <Icon name={playing ? 'pause' : 'play'} type='font-awesome' size={25} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={playbackStyle.option} onPress={() => this.controlPlaySpeed()}>
            <Text style={{ color: 'white', textAlign: 'center', fontSize: 20, fontWeight: 'bold' }}>{playSpeed}x</Text>
          </TouchableOpacity>
        </View>

        {
          device && currentState && stats &&

          <View style={playbackStyle.detailBox}>

            <Text style={[mainStyle.whiteText, mainStyle.fontmd, mainStyle.textlg, mainStyle.marginBottom10]}>Trip Details - {stats.total_distance} KM ({stats.total_time})</Text>

            <View style={mainStyle.flexRow}>
              <Icon name='map-marker' type='font-awesome' color={Colors.theme.lightText} size={15} style={mainStyle.flexOne} />
              <Text style={[mainStyle.lightText, mainStyle.textnm, mainStyle.fontrg, mainStyle.marginLeft10, mainStyle.flexThree]}>{stats.start_address}</Text>
              <Text style={[mainStyle.lightText, mainStyle.textnm, mainStyle.fontrg, mainStyle.marginLeft10, mainStyle.flexOne]}>{GeneralService.dateFormat(stats.start_time, 'h:i A')}</Text>
            </View>
            <View style={playbackStyle.addressDivider} />
            <View style={mainStyle.flexRow}>
              <Icon name='map-marker' type='font-awesome' color={Colors.theme.lightText} size={15} style={mainStyle.flexOne} />
              <Text style={[mainStyle.lightText, mainStyle.textnm, mainStyle.fontrg, mainStyle.marginLeft10, mainStyle.flexThree]}>{stats.end_address}</Text>
              <Text style={[mainStyle.lightText, mainStyle.textnm, mainStyle.fontrg, mainStyle.marginLeft10, mainStyle.flexOne]}>{GeneralService.dateFormat(stats.end_time, 'h:i A')}</Text>
            </View>

            {/* <View style={playbackStyle.buttonsBox}>
              <View style={playbackStyle.part}>
                <Icon name='fast-backward' type='font-awesome' size={30} color={Colors.yellow} onPress={() => this.fastBackward()} />
              </View>
              <View style={playbackStyle.part}>
                <Icon name={playing ? 'pause' : 'play'} type='font-awesome' size={30} color={Colors.yellow} onPress={() => playing ? this.pause() : this.play()} />
              </View>
              <View style={playbackStyle.part}>
                <Icon name='stop' type='font-awesome' size={30} color={Colors.yellow} onPress={() => this.stop()} />
              </View>
              <View style={playbackStyle.part}>
                <Icon name='fast-forward' type='font-awesome' size={30} color={Colors.yellow} onPress={() => this.fastForward()} />
              </View>
            </View> */}

            <View style={playbackStyle.bottomBar}>
              <Text style={[mainStyle.fontrg, mainStyle.textsm, mainStyle.lightText, mainStyle.flexOne]}>{currentState.speed} kmph</Text>
              {
                device.vehicle_type != "PERSONAL_TRACKER" &&
                <View style={[mainStyle.flexOne, mainStyle.flexRow, mainStyle.itemsFlexEnd]}>
                  <Text style={[mainStyle.fontrg, mainStyle.textsm, mainStyle.lightText]}>Ignition  </Text>
                  <Icon name='circle' type='font-awesome' color={currentState.ignition ? Colors.green : Colors.red} size={10} />
                </View>
              }
              <Text style={[mainStyle.fontrg, mainStyle.textsm, mainStyle.lightText, mainStyle.flexOne]}>{GeneralService.dateFormat(currentState.created_at, 'h:i A, d/m/y')}</Text>
            </View>
          </View>
        }

      </View>
    );
  };
}