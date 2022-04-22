/**
 * Component to show notifications.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  FlatList,
  TouchableOpacity
} from 'react-native';

import { Icon } from 'react-native-elements';
import CheckBox from '@react-native-community/checkbox';
import MapView, { Marker, Callout } from 'react-native-maps';

import ButtonComponent from '../components/partials/Button.component';

import mainStyle from '../styles/main.style';
import notificationStyle from '../styles/notification.style';

import AppConfig from '../config/app.config';
import UriConfig from '../config/uri.config';

import ApiService from '../services/api.service';
import GeneralService from '../services/general.service';
import NavigationService from '../services/navigation.service';

import Colors from '../modules/colors.module';
import Icons from '../modules/icons.module';

import { createIconSetFromFontello } from "react-native-vector-icons";
import fontelloConfig from "../config.json";
const CustomIcon = createIconSetFromFontello(fontelloConfig);
import moment from "moment";
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';


export default class NotificationsComponent extends Component {


  static navigationOptions = ({ navigation }) => {
    let params = navigation.state.params || {};

    return {
      headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
      ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
      headerRight: (
        <TouchableOpacity style={mainStyle.pad10} onPress={() => params ? params.toggleModal(true) : null}>
          <Icon name='filter' type='font-awesome' size={30} color={Colors.gray} />
        </TouchableOpacity>
      )
    };
  };

  constructor() {
    super();

    this.state = {
      page: 1,
      nextPage: null,

      filters: [],
      refreshing: false,
      notifications: [],
      isModalVisible: false
    };
  }

  componentDidMount() {
    this.getNotifications();

    this.props.navigation.setParams({ toggleModal: this.toggleModal });
  }

  toggleModal = (bool) => {
    this.setState({ isModalVisible: bool });
  }

  getNotifications = (page) => {
    this.setState({ refreshing: true });

    if (!page) {
      this.setState({ notifications: [] });
    }

    let { filters } = this.state;
    console.log(filters, 'filters');
    ApiService.call('get', UriConfig.uri.NOTIFICATIONS + "?types=" + filters.join(",") + (page ? "&page=" + page : ""), {}, (content) => {

      let notifications = content.notifications;
      this.setState({
        refreshing: false,
        nextPage: notifications.next_page,
        notifications: [...this.state.notifications, ...notifications.items]
      });

    }, (error, errors, content) => {
      this.setState({ refreshing: false });
    });
  }

  nextPageNotifications = () => {
    let { page, nextPage } = this.state;

    if (nextPage && nextPage !== page) {
      this.setState({ page: nextPage }, () => {
        this.getNotifications(nextPage);
      });
    }
  }

  applyFilter = () => {
    this.setState({
      page: 1,
      nextPage: null,
      isModalVisible: false
    }, () => {
      this.getNotifications();
    });
  }

  toggleCheckbox = (notificationType) => {
    if (notificationType == 'RESET') {
      this.setState({ filters: [] });
    } else {
      let { filters } = this.state,
        index = filters.indexOf(notificationType);
      if (index < 0) {
        filters = [...filters, notificationType];
      } else {
        delete filters[index];
      }
      this.setState({ filters: filters });
    }
  }

  render() {

    let { filters, notifications, isModalVisible } = this.state, notificationsFiltered = [];

    let { navigation } = this.props;
    let itemData = navigation.getParam("itemData", null);
    if (notifications.length > 0) {
      if (itemData) {
        notificationsFiltered = notifications.filter(f => f.target_id === itemData._id)
      } else {
        notificationsFiltered = notifications
      }
    }
    return (
      <View style={[mainStyle.contentArea, mainStyle.flexOne]}>
        <FlatList
          data={notificationsFiltered}
          refreshing={this.state.refreshing}
          onRefresh={() => this.getNotifications()}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => item._id}
          onEndReached={() => this.nextPageNotifications()}
          ListEmptyComponent={this.renderEmptyContainer()}
          contentContainerStyle={{ paddingBottom: 70 }}
          renderItem={({ item, index, separators }) => {
            let iconName = "bell",
              iconColor = Colors.black;
            switch (item.notification_type) {
              case "OVERSPEED":
                iconName = Icons.overspeed;
                iconColor = Colors.red;
                break;
              case "IGNITION":
                iconName = Icons.ignition;
                iconColor = Colors.green;
                break;
              case "IGNITIONOFF":
                iconName = Icons.ignition_off;
                iconColor = Colors.red;
                break;
              case "IMMOBILIZE":
                iconName = Icons.immobilizer_cut;
                iconColor = Colors.red;
                break;
              case "UNPLUGGED":
                iconName = Icons.unplugged;
                iconColor = Colors.red;
                break;
              case "BATTERY":
                iconName = Icons.battery_green;
                iconColor = Colors.yellow;
                break;
              case "GEOFENCE":
                iconName = Icons.geofence_arrived_in;
                iconColor = Colors.green;
                break;
              case "ORDER":
                iconName = Icons.order_placed;
                iconColor = Colors.green;
                break;
              case "NOGPSSIGNAL":
                iconName = Icons.no_gps;
                iconColor = Colors.green;
                break;
              case "PARKINGMODE":
                iconName = Icons.parking_mode;
                iconColor = Colors.green;
                break;
              case "MAINTENANCE":
                iconName = Icons.maintenance;
                iconColor = Colors.green;
                break;
            }
            return (
              <TouchableOpacity
                onPress={() => this.navigateNotification(item)}
              >
                <View
                  style={[
                    notificationStyle.notificationItem,
                    mainStyle.flexRow,
                    { borderLeftColor: iconColor, backgroundColor: '#FFFFFF' },
                  ]}
                >
                  <View
                    style={[notificationStyle.notificationLeftPart]}
                  >
                    {[
                      "IGNITION",
                      "IGNITIONOFF",
                      "IMMOBILIZE",
                      "UNPLUGGED",
                      "GEOFENCE",
                      "PARKINGMODE",
                      "NOGPSSIGNAL",
                      "MAINTENANCE",
                      "ORDER",
                      "OVERSPEED",
                      "BATTERY",
                      // "TEMPERING",
                    ].includes(item.notification_type) ? (
                      // <CustomIcon  name={iconName}  color={iconColor}  size={25} />
                      <Image source={iconName} style={{ height: 25, width: 25 }} />
                    ) : (
                      <Icon name={iconName} type="font-awesome" color={iconColor} size={25} />
                    )}
                  </View>
                  <View style={mainStyle.flexOne}>
                    <Text style={[mainStyle.textnm, mainStyle.fontbl]}>{item.notification_type}</Text>
                    <Text style={[mainStyle.textnm, mainStyle.fontbl]}>{item.notification_title}</Text>
                    <Text
                      style={[
                        mainStyle.textsm,
                        mainStyle.lightText,
                        mainStyle.fontmd,
                      ]}
                    >
                      {item.notification_content}
                    </Text>
                    <Text
                      style={[
                        mainStyle.textxs,
                        mainStyle.textRight,
                        mainStyle.fontlt,
                      ]}
                    >
                      {moment
                        .utc(item.created_at, "YYYY-MM-DD HH:mm:ss")
                        .local()
                        .fromNow()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />

        <Modal
          transparent={true}
          animationType={"none"}
          onRequestClose={() => {
            this.toggleModal(false);
          }}
          visible={isModalVisible}
        >
          <View style={mainStyle.modalBackground}>
            <View style={mainStyle.modalForm}>
              <View style={mainStyle.formBody}>
                {[
                  "IGNITION",
                  "IGNITIONOFF",
                  "IMMOBILIZE",
                  "UNPLUGGED",
                  "GEOFENCE",
                  "PARKINGMODE",
                  "NOGPSSIGNAL",
                  "MAINTENANCE",
                  "ORDER",
                  "OVERSPEED",
                  "BATTERY",
                  "RESET",
                  // "TEMPERING",
                ].map((notificationType) => (
                  <View
                    key={notificationType}
                    style={[mainStyle.flexRow, mainStyle.itemsCenter]}
                  >
                    <CheckBox
                      value={filters.indexOf(notificationType) > -1}
                      onChange={() => this.toggleCheckbox(notificationType)}
                    />
                    <Text
                      style={[
                        mainStyle.fontmd,
                        mainStyle.textlg,
                        mainStyle.whiteText,
                      ]}
                    >
                      {GeneralService.camelcase(notificationType)}
                    </Text>
                  </View>
                ))}

                <ButtonComponent
                  text="Filter"
                  onClick={this.applyFilter.bind(this)}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  renderEmptyContainer() {
    return (
      <View style={mainStyle.itemsCenter}>
        <Text style={mainStyle.fontrg}>{this.state.refreshing ? "Fetching notifications..." : "No notifications found."}</Text>
      </View>
    );
  }

  navigateNotification = (notification) => {
    if (notification.location) {
      return NavigationService.navigate('homeStack', 'NotificationView', { notification: notification });
    } else if (notification.target_id) {
      return NavigationService.navigate('homeStack', 'LiveTrack', { id: notification.target_id });
    }

    return null;
  }

}

export class NotificationViewComponent extends Component {
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
      notification: null,
      mapType: "standard",
      location: {
        latitude: AppConfig.default_location.latitute,
        longitude: AppConfig.default_location.longitude,
        latitudeDelta: latitudeDelta,
        longitudeDelta: longitudeDelta
      }
    }
  }

  componentDidMount() {

    let { navigation } = this.props,
      notification = navigation.getParam('notification', null);

    if (notification && notification.location) {
      this.setState({
        location: {
          ...this.state.location,
          latitude: notification.location.coordinates[1],
          longitude: notification.location.coordinates[0],
        },
        notification: notification
      });
    }

  }

  toogleMapType = () => {
    this.setState({ mapType: this.state.mapType === "satellite" ? "standard" : "satellite" });
  }

  render() {

    let { notification, location, mapType } = this.state;

    return (
      <View style={mainStyle.flexOne}>
        <MapView
          style={mainStyle.flexOne}
          initialRegion={location}
          mapType={mapType}
          zoomControlEnabled={true}
        >
          {notification && notification.location && (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              calloutVisible={true}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <Image source={Icons.idle} />
              <Callout>
                <View style={notificationStyle.callout}>
                  <Text
                    style={[
                      notificationStyle.calloutHeader,
                      mainStyle.fontbl,
                    ]}
                  >
                    {GeneralService.camelcase(
                      notification.notification_title
                    )}
                  </Text>

                  <View style={notificationStyle.calloutRow}>
                    <Icon
                      name="map-marker"
                      type="font-awesome"
                      size={20}
                      color={Colors.gray}
                    />
                    <Text
                      style={[
                        notificationStyle.calloutRowText,
                        mainStyle.fontmd,
                      ]}
                    >
                      {notification.address || "Not Available"}
                    </Text>
                  </View>

                  <View style={notificationStyle.calloutRow}>
                    <Icon
                      name="calendar"
                      type="font-awesome"
                      size={15}
                      color={Colors.gray}
                    />
                    <Text
                      style={[
                        notificationStyle.calloutRowText,
                        mainStyle.fontmd,
                      ]}
                    >
                      {moment
                        .utc(notification.updated_at, "YYYY-MM-DD HH:mm:ss")
                        .local()
                        .fromNow()}
                    </Text>
                  </View>

                  <View style={notificationStyle.calloutRow}>
                    <Text
                      style={[
                        notificationStyle.calloutRowText,
                        mainStyle.fontmd,
                      ]}
                    >
                      {notification.notification_content}
                    </Text>
                  </View>
                </View>
              </Callout>
            </Marker>
          )}
        </MapView>

        <View style={notificationStyle.options}>
          <TouchableOpacity
            style={notificationStyle.option}
            onPress={() => this.toogleMapType()}
          >
            <Icon
              name="layers"
              type="font-awesome-5"
              color={Colors.white}
              size={30}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
}