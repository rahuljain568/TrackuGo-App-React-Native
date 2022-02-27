/**
 * Component to view devices list, save or update device etc.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity
} from 'react-native';

import { Icon } from 'react-native-elements';

import UriConfig from '../config/uri.config';

import mainStyle from '../styles/main.style';
import deviceStyle from '../styles/device.style';

import Colors from '../modules/colors.module';
import Icons from '../modules/icons.module';

import ApiService from '../services/api.service';
import GeneralService from '../services/general.service';
import StorageService from '../services/storage.service';
import NavigationService from '../services/navigation.service';
import moment from "moment";
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class DevicesComponent extends Component {
  static navigationOptions = ({ navigation }) => {
    let params = navigation.state.params || {}; 
    return {
      headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
      ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
    };
  };
  
  constructor() {
    super();

    this.state = {
      page: 1,
      nextPage: null,

      refreshing: false,
      devices: []
    };
  }

  async componentDidMount() {

    let user = JSON.parse(await StorageService.fetch('user')),
      baseUrl = await StorageService.fetch('assets_url'),
      folders = JSON.parse(await StorageService.fetch('folders'));

    this.setState({
      user: user,
      iconBaseUrl: baseUrl + folders.vehicle_icons
    });

    this.props.navigation.addListener('didFocus', (payload) => {
      this.getDevices();
    });

  }

  getDevices(page) {

    this.setState({ refreshing: true });

    if (!page) {
      this.setState({ devices: [] });
    }

    ApiService.call('get', UriConfig.uri.DEVICES + (page ? "?page=" + page : ""), {}, (content) => {

      let devices = content.devices;

      this.setState({
        refreshing: false,
        nextPage: devices.next_page,
        devices: page ? [...this.state.devices, ...devices.items] : devices.items
      });
      // if (devices.items.length == 0) {
      //   alert("Currently no data are available!..")
      //   return;
      // }
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

  render() {

    let { devices, refreshing, iconBaseUrl, user } = this.state;

    console.log("usre", user);


    return (
      <View style={mainStyle.body}>
        <View style={mainStyle.contentArea}>
          <FlatList
            data={devices}
            refreshing={refreshing}
            onRefresh={() => this.getDevices()}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => item._id}
            ListEmptyComponent={this.renderEmptyContainer()}
            onEndReached={() => this.nextPageDevices()}
            renderItem={({ item, index, separators }) => {

              let iconfile = iconBaseUrl ? iconBaseUrl + GeneralService.deviceSideviewIcon(item) : null,
                subscription = item.subscriptions && item.subscriptions.length > 0 ? item.subscriptions[0] : null,
                isOkay = subscription && item.status == "ACTIVE",
                batteryIcon = 'battery';

              if (Number.isInteger(item.battery)) {
                if (item.battery < 10) {
                  batteryIcon = "battery-0";
                } else if (item.battery < 40) {
                  batteryIcon = "battery-1";
                } else if (item.battery < 60) {
                  batteryIcon = "battery-2";
                } else if (item.battery < 80) {
                  batteryIcon = "battery-3";
                }
              }


              return (
                <View
                  style={[
                    deviceStyle.itemView,
                    isOkay ? null : mainStyle.inactive,
                  ]}
                >
                  <View style={deviceStyle.upperPart}>
                    <Image
                      source={{ uri: iconfile }}
                      style={mainStyle.vehicleIcon}
                    />

                    <View style={deviceStyle.itemHeaderText}>
                      <Text
                        style={[
                          deviceStyle.itemHeaderTextMain,
                          mainStyle.fontmd,
                        ]}
                      >
                        #{index + 1} - {item.license_plate}
                      </Text>
                      {item.current_state && (
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
                          {moment
                            .utc(item.current_state_since, "YYYY-MM-DD HH:mm:ss").local()
                            .fromNow().split("ago")[0]}
                        </Text>
                      )}

                      {subscription && (
                        <Text
                          style={[
                            mainStyle.textnm,
                            mainStyle.fontrg,
                            mainStyle.lightText,
                          ]}
                        >
                          Expires On:{" "}
                          {GeneralService.dateFormat(
                            subscription.expiry_date,
                            "d M Y"
                          )}
                        </Text>
                      )}
                    </View>
                    {this.detailButtonRender(item, devices)}
                  </View>

                  <View style={deviceStyle.lowerPart}>
                    {isOkay && (
                      <View style={deviceStyle.infoItemBorder}>
                        <View style={deviceStyle.infoItemInner}>
                          {item.ignition ||
                            item.vehicle_type ==
                            "PERSONAL_TRACKER" ? (
                            <Image
                              source={Icons.speedometer}
                              style={mainStyle.smallIcon}
                            />
                          ) : (
                            <Icon
                              name="tachometer"
                              type="font-awesome"
                              size={15}
                              color={Colors.red}
                            />
                          )}
                          <Text
                            style={[
                              mainStyle.fontmd,
                              mainStyle.marginLeft5,
                            ]}
                          >
                            {item.current_speed || 0} kmph
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
                    )}

                    {isOkay &&
                      item.vehicle_type != "PERSONAL_TRACKER" && (
                        <View style={deviceStyle.infoItemBorder}>
                          <View style={deviceStyle.infoItemInner}>
                            <Icon
                              name="road"
                              type="font-awesome"
                              size={15}
                            />
                            <Text
                              style={[
                                mainStyle.fontmd,
                                mainStyle.marginLeft5,
                              ]}
                            >
                              {item.today_distance || 0} kms
                            </Text>
                          </View>
                          <Text
                            style={[
                              mainStyle.fontrg,
                              mainStyle.textsm,
                              mainStyle.lightText,
                            ]}
                          >
                            Travelled Today
                          </Text>
                        </View>
                      )}

                    {isOkay &&
                      item.vehicle_type != "PERSONAL_TRACKER" && (
                        <View style={deviceStyle.infoItemBorder}>
                          <View style={deviceStyle.infoItemInner}>
                            <Icon
                              name="bolt"
                              type="font-awesome"
                              size={15}
                              color={
                                item.supply
                                  ? Colors.green
                                  : Colors.red
                              }
                            />
                            <Text
                              style={[
                                mainStyle.fontmd,
                                mainStyle.marginLeft5,
                              ]}
                            >
                              {item.supply ? "On" : "Off"}
                            </Text>
                          </View>
                          <Text
                            style={[
                              mainStyle.fontrg,
                              mainStyle.textsm,
                              mainStyle.lightText,
                            ]}
                          >
                            Supply
                          </Text>
                        </View>
                      )}

                    {isOkay &&
                      item.vehicle_type != "PERSONAL_TRACKER" && (
                        <View style={deviceStyle.infoItem}>
                          <View style={deviceStyle.infoItemInner}>
                            <Icon
                              name="fire"
                              type="font-awesome"
                              size={15}
                              color={
                                item.ignition
                                  ? Colors.green
                                  : Colors.red
                              }
                            />
                            <Text
                              style={[
                                mainStyle.fontmd,
                                mainStyle.marginLeft5,
                              ]}
                            >
                              {item.ignition ? "On" : "Off"}
                            </Text>
                          </View>
                          <Text
                            style={[
                              mainStyle.fontrg,
                              mainStyle.textsm,
                              mainStyle.lightText,
                            ]}
                          >
                            Ignition
                          </Text>
                        </View>
                      )}
                  </View>
                  <View style={mainStyle.dividerWithMargin} />
                  <View style={deviceStyle.lowerPart}>
                    {isOkay && (
                      <View style={deviceStyle.infoItemBorder}>
                        <View style={deviceStyle.infoItemInner}>
                          <Icon
                            name={batteryIcon}
                            type="font-awesome"
                            size={15}
                            color={
                              item.battery < 30
                                ? Colors.red
                                : Colors.green
                            }
                          />
                          <Text
                            style={[
                              mainStyle.fontmd,
                              mainStyle.marginLeft5,
                            ]}
                          >
                            {item.battery || 0}%
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
                    )}

                    {isOkay && (
                      <View style={deviceStyle.infoItem}>
                        <View style={deviceStyle.infoItemInner}>
                          <Icon
                            name="signal"
                            type="font-awesome"
                            size={15}
                            color={
                              item.signal < 30
                                ? Colors.red
                                : Colors.green
                            }
                          />
                          <Text
                            style={[
                              mainStyle.fontmd,
                              mainStyle.marginLeft5,
                            ]}
                          >
                            {item.signal || 0}%
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
                    )}
                  </View>

                  {isOkay && item.address && (
                    <View>
                      <View style={mainStyle.dividerWithMargin} />
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
                    </View>
                  )}
                </View>
              );
            }}
          />
        </View>

        {
          user && !user.parent &&
          <TouchableOpacity style={mainStyle.floatingButton} onPress={() => NavigationService.navigate('homeStack', 'Products')}>
            <Image source={Icons.plus} />
          </TouchableOpacity>
        }

      </View>
    );
  }
  renderEmptyContainer() {
    return (
      <View style={mainStyle.itemsCenter}>
        <Text style={mainStyle.fontrg}>{this.state.refreshing ? "Fetching devices..." : "No devices found."}</Text>
      </View>
    );
  }

  detailButtonRender = (item, devices) => {

    if (item.status != "ACTIVE") {
      return (
        <TouchableOpacity onPress={() => alert('Please ask adminstrator to change device status.')}>
          <View style={[deviceStyle.rightButton, { backgroundColor: Colors.gray }]}>
            <Text style={[mainStyle.whiteText, mainStyle.fontmd, mainStyle.textlg]}>{item.status}  </Text>
            <Icon name='angle-right' type='font-awesome' color={Colors.white} size={20} />
          </View>
        </TouchableOpacity>
      );
    } else if (!item.subscriptions || item.subscriptions.length <= 0) {
      return (
        <TouchableOpacity onPress={() => NavigationService.navigate('homeStack', 'Packages', { device: item })}>
          <View style={[deviceStyle.rightButton, { backgroundColor: Colors.yellow }]}>
            <Text style={[mainStyle.whiteText, mainStyle.fontmd, mainStyle.textlg]}>Renew  </Text>
            <Icon name='angle-right' type='font-awesome' color={Colors.white} size={20} />
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity onPress={() => item.vehicle_type == "PERSONAL_TRACKER" ? NavigationService.navigate('homeStack', 'Reports', { device: item, report_type: 'Detailed' }) : NavigationService.navigate('homeStack', 'ReportMenu', { device: item, devices: devices })}>
        <View style={[deviceStyle.rightButton, { backgroundColor: Colors.blue }]}>
          <Text style={[mainStyle.whiteText, mainStyle.fontmd, mainStyle.textlg]}>Reports  </Text>
          <Icon name='angle-right' type='font-awesome' color={Colors.white} size={20} />
        </View>
      </TouchableOpacity>
    );
  }
}