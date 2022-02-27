/**
 * Component to handle shared locations related operations.
 */

import React, { Component } from 'react';
import { Alert, FlatList, Image, Modal, Text, TextInput, ToastAndroid, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Icon } from 'react-native-elements';
import MapView, { Callout, Marker } from 'react-native-maps';
import ButtonComponent from '../components/partials/Button.component';
import AppConfig from '../config/app.config';
import UriConfig from '../config/uri.config';
import Colors from '../modules/colors.module';
import Icons from '../modules/icons.module';
import Loader from '../modules/loader.module';
import ApiService from '../services/api.service';
import GeneralService from '../services/general.service';
import NavigationService from '../services/navigation.service';
import { locationValidation } from '../services/validation.service';
import locationsStyle from '../styles/locations.style';
import mainStyle from '../styles/main.style';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';


export default class SharedLocationsComponent extends Component {

  constructor() {
    super();

    let { latitudeDelta, longitudeDelta } = GeneralService.locationDelta(0.001);

    this.state = {
      page: 1,
      nextPage: null,

      tabSelected: 'with-me',
      locations: [],
      isLocationModalVisible: false,

      location: {
        latitude: AppConfig.default_location.latitute,
        longitude: AppConfig.default_location.longitude,
        latitudeDelta: latitudeDelta,
        longitudeDelta: longitudeDelta
      },

      errors: [],
      values: [],
      messages: [],

      loading: false,
      refreshing: false,
      currentLocation: null,
    };
  }

  componentDidMount() {
    this.getSharedLocations();
  }

  getSharedLocations = (page) => {

    this.setState({ refreshing: true });

    ApiService.call('get', UriConfig.uri.SHARED_LOCATIONS + "/" + this.state.tabSelected + (page ? "?page=" + page : ""), {}, (content, status) => {

      let locations = content.locations;

      this.setState({
        refreshing: false,
        nextPage: locations.next_page,
        locations: page ? [...this.state.locations, ...locations.items] : locations.items
      });

    }, (error, errors, content) => {
      this.setState({ refreshing: false });
    });
  }

  nextPageSharedLocations = () => {
    let { page, nextPage } = this.state;

    if (nextPage && nextPage !== page) {
      this.setState({ page: nextPage }, () => {
        this.getSharedLocations(nextPage);
      });
    }
  }

  tabSelect = (tab) => {
    this.setState({
      page: 1,
      nextPage: null,
      tabSelected: tab
    }, () => {
      this.getSharedLocations();
    });
  }

  toggleLocationModal = async (bool) => {

    if (bool) {
      let position = await GeneralService.currentLocation();

      this.setState({
        currentLocation: {
          latitude: position.latitude,
          longitude: position.longitude,
        }
      });
    }

    this.setState({ isLocationModalVisible: bool });

    this.setState({
      values: [],
      errors: [],
      messages: [],
    });
  }

  validateInput = (value, name) => {

    let { fieldValue, isValid, message } = GeneralService.isValid(name, value, locationValidation[name]);

    this.setState({
      values: { ...this.state.values, [name]: fieldValue },
      errors: { ...this.state.errors, [name]: !isValid },
      messages: { ...this.state.messages, [name]: message },
    });

    return isValid;
  }

  shareLocation = () => {

    let { values, currentLocation } = this.state;

    for (let field in locationValidation) {
      if (!this.validateInput(values[field] || null, field)) {
        return false;
      }
    }

    if (!currentLocation) {
      return alert('Still getting current location of your device. Please wait...');
    }

    let params = {
      phone: values.phone,
      expire_after: values.expire_after,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      remarks: values.remarks
    };

    this.setState({ loading: true });

    ApiService.call('post', UriConfig.uri.SHARED_LOCATION_SAVE, params, (content, status) => {

      this.setState({
        loading: false,
        isLocationModalVisible: false
      });

      ToastAndroid.show(status.message, ToastAndroid.SHORT);

      this.getSharedLocations();

    }, (error, errors, content) => {

      this.setState({ loading: false });
      GeneralService.placeErrors(this, errors);
    });

  }

  expireLocation = (id) => {

    Alert.alert(
      'Confirmation',
      'Are you sure to expire location?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK', onPress: () => {

            this.setState({ loading: true });

            ApiService.call('put', UriConfig.uri.SHARED_LOCATION_EXPIRE + "/" + id, {}, (content, status) => {

              this.setState({ loading: false });

              ToastAndroid.show(status.message, ToastAndroid.SHORT);

              this.getSharedLocations();

            }, (error, errors, content) => {
              this.setState({ loading: false });
            });
          }
        },
      ],
      { cancelable: true }
    );

  }

  render() {

    let { location, locations, tabSelected, refreshing, loading, isLocationModalVisible, errors, messages } = this.state;

    return (
      <View style={mainStyle.flexOne}>
        <View style={mainStyle.contentArea}>

          <Loader loading={loading} />

          <View style={locationsStyle.tabs}>
            <Text style={[locationsStyle.tab, mainStyle.fontmd, tabSelected == "with-me" ? locationsStyle.tabActive : null]} onPress={() => this.tabSelect('with-me')}>With Me</Text>
            <Text style={[locationsStyle.tab, mainStyle.fontmd, tabSelected == "by-me" ? locationsStyle.tabActive : null]} onPress={() => this.tabSelect('by-me')}>By Me</Text>
          </View>

          <FlatList
            data={locations}
            refreshing={refreshing}
            onRefresh={() => this.getSharedLocations()}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => item._id}
            onEndReached={() => this.nextPageSharedLocations()}
            ListEmptyComponent={this.renderEmptyContainer()}
            renderItem={({ item }) => {

              return (

                <View style={locationsStyle.itemView}>
                  <View style={mainStyle.flexRow}>

                    <View style={locationsStyle.itemHeaderText}>
                      <Text style={[locationsStyle.itemHeaderTextMain, mainStyle.fontmd]}>{tabSelected == "with-me" ? item.shared_by.profile_name : item.shared_with.profile_name}</Text>

                      <Text style={[locationsStyle.itemHeaderTextSub, mainStyle.fontmd]}>{tabSelected == "with-me" ? item.shared_by.phone : item.shared_with.phone}</Text>

                      {
                        item.status == "ACTIVE" &&
                        <Text style={[mainStyle.textsm, mainStyle.lightText, mainStyle.fontrg]}>Expires At: {item.expire_at ? GeneralService.dateFormat(item.expire_at, 'h:i A, d M y') : 'Does Not Expire'}</Text>
                      }

                      {
                        item.status != "ACTIVE" &&
                        <Text style={[mainStyle.redText, mainStyle.fontbl]}>Expired</Text>
                      }

                    </View>

                    {
                      tabSelected == "with-me" &&
                      <TouchableOpacity onPress={() => NavigationService.navigate('homeStack', 'UserLiveTrack', { user: tabSelected == "with-me" ? item.shared_by : item.shared_with })}>
                        <View style={[mainStyle.flexOne, mainStyle.flexRow]}>
                          <Text style={[mainStyle.blueText, mainStyle.fontrg]}>Details  </Text>
                          <Icon name='angle-right' type='font-awesome' color={Colors.blue} size={18} />
                        </View>
                      </TouchableOpacity>
                    }

                    {
                      tabSelected == "by-me" && item.status == "ACTIVE" &&
                      <TouchableOpacity onPress={() => this.expireLocation(item._id)}>
                        <View style={[mainStyle.flexOne, mainStyle.flexRow]}>
                          <Text style={[mainStyle.redText, mainStyle.fontrg]}>Expire</Text>
                        </View>
                      </TouchableOpacity>
                    }
                  </View>

                  <View>
                    <MapView
                      style={locationsStyle.map}
                      pitchEnabled={false}
                      rotateEnabled={false}
                      zoomEnabled={false}
                      scrollEnabled={false}
                      initialRegion={tabSelected == "with-me" ? {
                        latitude: item.shared_by.location.coordinates[1],
                        longitude: item.shared_by.location.coordinates[0],
                        latitudeDelta: location.latitudeDelta,
                        longitudeDelta: location.longitudeDelta,
                      } : {
                        latitude: item.shared_with.location.coordinates[1],
                        longitude: item.shared_with.location.coordinates[0],
                        latitudeDelta: location.latitudeDelta,
                        longitudeDelta: location.longitudeDelta,
                      }}
                    >
                      {
                        (item.hasOwnProperty('shared_by') || item.hasOwnProperty('shared_with')) && item ? (
                          <Marker
                            coordinate={{
                              latitude: tabSelected == "with-me" ? item.shared_by.location.coordinates[1] : item.shared_withlocation.coordinates[1],
                              longitude: tabSelected == "with-me" ? item.shared_by.location.coordinates[0] : item.shared_withlocation.coordinates[0],
                            }}
                          >
                            <Image source={Icons.idle} />
                          </Marker>
                        )
                          : null
                      }

                    </MapView>

                    {
                      item &&
                      <View style={mainStyle.flexRow}>
                        <Image source={Icons.trackerBlack} style={mainStyle.xsIcon} />
                        <Text style={[mainStyle.textxs, mainStyle.fontrg, mainStyle.marginLeft5]}>{tabSelected == "with-me" ? item.shared_by.address : item.shared_with.address}</Text>
                      </View>
                    }

                  </View>
                </View>
              )
            }}
          />

          <TouchableWithoutFeedback onPress={() => { }}>
            <Modal
              transparent={true}
              animationType={'none'}
              onRequestClose={() => this.toggleLocationModal(false)}
              visible={isLocationModalVisible}>
              <View style={mainStyle.modalBackground}>
                <View style={mainStyle.modalForm}>

                  <View style={mainStyle.formBody}>

                    <Text style={[mainStyle.textxl, mainStyle.marginBottom10, mainStyle.fontmd, mainStyle.whiteText]}>Share Your Location</Text>

                    <View style={[mainStyle.formInput, errors.phone ? mainStyle.inputError : null]} >
                      <TextInput
                        style={[mainStyle.formInputField, mainStyle.whiteText]}
                        onChangeText={(value) => this.validateInput(value, 'phone')}
                        placeholder="Phone"
                        keyboardType="numeric"
                        placeholderTextColor={Colors.theme.lightText}
                      />
                      {
                        errors.phone &&
                        <Text style={mainStyle.errorMessage}>{messages.phone}</Text>
                      }
                    </View>

                    <View style={[mainStyle.formInput, errors.expire_after ? mainStyle.inputError : null]} >
                      <TextInput
                        style={[mainStyle.formInputField, mainStyle.whiteText]}
                        onChangeText={(value) => this.validateInput(value, 'expire_after')}
                        placeholder="Expire After (in hours)"
                        keyboardType="numeric"
                        placeholderTextColor={Colors.theme.lightText}
                      />
                      {
                        errors.expire_after &&
                        <Text style={mainStyle.errorMessage}>{messages.expire_after}</Text>
                      }
                    </View>

                    <View style={[mainStyle.formInput, errors.remarks ? mainStyle.inputError : null]} >
                      <TextInput
                        style={[mainStyle.formInputField, mainStyle.whiteText]}
                        onChangeText={(value) => this.validateInput(value, 'remarks')}
                        placeholder="Remarks (Optional)"
                        placeholderTextColor={Colors.theme.lightText}
                      />
                      {
                        errors.remarks &&
                        <Text style={mainStyle.errorMessage}>{messages.remarks}</Text>
                      }
                    </View>

                    <ButtonComponent text="Share" onClick={this.shareLocation.bind(this)} />

                  </View>
                </View>
              </View>
            </Modal>
          </TouchableWithoutFeedback>

        </View>

        {/* <TouchableOpacity style={mainStyle.floatingButton} onPress={() => this.toggleLocationModal(true)}>
          <Image source={Icons.shareLocation} />
        </TouchableOpacity> */}

      </View>
    );
  }

  renderEmptyContainer() {
    return (
      <View style={mainStyle.itemsCenter}>
        <Text style={mainStyle.fontrg}>{this.state.refreshing ? "Fetching locations..." : "You have no shared locations."}</Text>
      </View>
    );
  }

}

export class SharedLocationComponent extends Component {

  static navigationOptions = ({ navigation }) => {
    let params = navigation.state.params || {},
      location = params.location || null;

    return {
      headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
      ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
      headerTitle: (
        <View>
          <Text style={mainStyle.titleTextMain}>Shared Location</Text>
          <Text style={mainStyle.titleTextSub}>{location ? location.shared_by.profile_name : null}</Text>
        </View>
      )
    };
  };

  constructor() {
    super();

    let { latitudeDelta, longitudeDelta } = GeneralService.locationDelta(0.01);

    this.state = {
      loading: false,

      mapType: "standard",
      mapRef: null,
      markerRef: null,
      currentCoordinate: null,
      region: {
        latitude: AppConfig.default_location.latitute,
        longitude: AppConfig.default_location.longitude,
        latitudeDelta: latitudeDelta,
        longitudeDelta: longitudeDelta
      },

      sharedLocation: null
    }
  }

  async componentDidMount() {
    this.getLocationInfo();

    let position = await GeneralService.currentLocation();

    this.setState({ currentCoordinate: position });
  }

  getLocationInfo = () => {

    let { navigation } = this.props,
      id = navigation.getParam('id', null);

    this.setState({ loading: true });

    ApiService.call('get', UriConfig.uri.SHARED_LOCATION + "/" + id, {}, (content) => {

      let location = content.location;
      this.setState({
        loading: false,
        sharedLocation: location
      }, () => {

        let { mapRef } = this.state;

        mapRef.fitToSuppliedMarkers(
          ["my", "shared"],
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

      });

      this.props.navigation.setParams({ location: location });
    }, (error, errors, content) => {
      this.setState({ loading: false });
    });
  }

  toggleMapType = () => {
    this.setState({ mapType: this.state.mapType === "satellite" ? "standard" : "satellite" });
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

    let { sharedLocation, region, loading, currentCoordinate, mapType } = this.state;

    return (
      <View style={mainStyle.flexOne}>
        <Loader loading={loading} />
        <MapView
          mapType={mapType}
          style={mainStyle.flexOne}
          initialRegion={region}
          ref={(ref) => { this.state.mapRef = ref }}
          zoomControlEnabled={true}
          onRegionChangeComplete={this.regionChange}
        >
          {
            sharedLocation &&
            <Marker
              key="shared"
              identifier="shared"
              coordinate={{
                latitude: sharedLocation.location.coordinates[1],
                longitude: sharedLocation.location.coordinates[0]
              }}
            >
              <Image source={Icons.idle} />
              <Callout>
                <View style={locationsStyle.callout}>
                  <Text style={[locationsStyle.calloutHeader, mainStyle.fontbl]}>{sharedLocation.shared_with.profile_name}</Text>

                  <View style={locationsStyle.calloutRow}>
                    <Icon name='phone' type='font-awesome' size={15} color={Colors.gray} />
                    <Text style={[locationsStyle.calloutRowText, mainStyle.fontmd]}>{sharedLocation.shared_with.phone}</Text>
                  </View>

                  <View style={locationsStyle.calloutRow}>
                    <Icon name='map-marker' type='font-awesome' size={20} color={Colors.gray} />
                    <Text style={[locationsStyle.calloutRowText, mainStyle.fontmd]}>{sharedLocation.address}</Text>
                  </View>

                  <View style={locationsStyle.calloutRow}>
                    <Icon name='calendar' type='font-awesome' size={15} color={Colors.gray} />
                    <Text style={[locationsStyle.calloutRowText, mainStyle.fontmd]}>{GeneralService.dateFormat(sharedLocation.expire_at)}</Text>
                  </View>

                </View>
              </Callout>
            </Marker>
          }

          {
            currentCoordinate && sharedLocation &&
            <Marker
              key="me"
              identifier="me"
              coordinate={currentCoordinate}
            >
              <Image source={Icons.stoppage} />
              <Callout>
                <View style={locationsStyle.callout}>
                  <Text style={[locationsStyle.calloutHeader, mainStyle.fontbl]}>Your Location</Text>
                  <View style={locationsStyle.calloutRow}>
                    <Text style={[locationsStyle.calloutRowText, mainStyle.fontmd]}>{sharedLocation.shared_by.profile_name}</Text>
                  </View>
                </View>
              </Callout>
            </Marker>
          }
        </MapView>

        <View style={locationsStyle.options}>
          <TouchableOpacity style={locationsStyle.option} onPress={() => this.toggleMapType()}>
            <Icon name='layers' type='font-awesome-5' color={Colors.white} size={30} />
          </TouchableOpacity>
        </View>

      </View>
    );
  };
}