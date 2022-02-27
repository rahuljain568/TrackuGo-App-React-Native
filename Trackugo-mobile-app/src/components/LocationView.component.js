/**
 * Component to show group map of devices.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity
} from 'react-native';

import { Icon } from 'react-native-elements';
import MapView, { Marker, Callout } from 'react-native-maps';

import mainStyle from '../styles/main.style';
import groupMapStyle from '../styles/group-map.style';

import AppConfig from '../config/app.config';

import Icons from '../modules/icons.module';
import Colors from '../modules/colors.module';

import GeneralService from '../services/general.service';

export default class LocationViewComponent extends Component {

  constructor() {
    super();

    let { latitudeDelta, longitudeDelta } = GeneralService.locationDelta(0.005);

    this.state = {
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
      type = navigation.getParam('type', null),
      record = navigation.getParam('record', null);

    if (record && record.location) {

      this.setState({
        location: {
          ...this.state.location,
          latitude: record.location.coordinates[1],
          longitude: record.location.coordinates[0],
        },
        type: type,
        record: record
      });
    }

  }

  toogleMapType = () => {
    this.setState({ mapType: this.state.mapType === "satellite" ? "standard" : "satellite" });
  }

  render() {

    let { type, record, location, mapType } = this.state;

    return (

      <View style={mainStyle.flexOne}>

        <MapView
          style={mainStyle.flexOne}
          initialRegion={location}
          mapType={mapType}
          zoomControlEnabled={true}
        >
          {
            record && record.location ? (
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude
                }}
                calloutVisible={true}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <Image source={type == "stoppage" ? Icons.stoppage : Icons.idle} />
                <Callout>
                  <View style={groupMapStyle.callout}>
                    <Text style={[groupMapStyle.calloutHeader, mainStyle.fontbl]}>{GeneralService.camelcase(type)}</Text>

                    <View style={groupMapStyle.calloutRow}>
                      <Icon name='map-marker' type='font-awesome' size={20} color={Colors.gray} />
                      <Text style={[groupMapStyle.calloutRowText, mainStyle.fontmd]}>{record.address}</Text>
                    </View>

                    <View style={groupMapStyle.calloutRow}>
                      <Icon name='calendar' type='font-awesome' size={15} color={Colors.gray} />
                      <Text style={[groupMapStyle.calloutRowText, mainStyle.fontmd]}>{GeneralService.dateFormat(record.start_time, 'h:i A')} - {GeneralService.dateFormat(record.end_time, 'h:i A')}</Text>
                    </View>

                    <View style={groupMapStyle.calloutRow}>
                      <Icon name='clock-o' type='font-awesome' size={15} color={Colors.gray} />
                      <Text style={[groupMapStyle.calloutRowText, mainStyle.fontmd]}>{type == "stoppage" ? record.stoppage_time : record.idle_time}</Text>
                    </View>

                  </View>
                </Callout>
              </Marker>
            ) : null
          }

        </MapView>

        <View style={groupMapStyle.options}>
          <TouchableOpacity style={groupMapStyle.option} onPress={() => this.toogleMapType()}>
            <Icon name='layers' type='font-awesome-5' color={Colors.white} size={30} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
}