import React from "react";
import MapView, { Marker, Polyline, AnimatedRegion } from "react-native-maps";
import {
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
  ToastAndroid,
  View,
  Text,
  StyleSheet,
  Image
} from "react-native";
import { Icon } from "react-native-elements";

import mainStyle from "../styles/main.style";
import homeStyle from "../styles/home.style";

import Icons from "../modules/icons.module";
import Colors from "../modules/colors.module";
import Loader from "../modules/loader.module";

import AppConfig from "../config/app.config";
import UriConfig from "../config/uri.config";

import ApiService from "../services/api.service";
import StorageService from "../services/storage.service";
import GeneralService from "../services/general.service";
import NavigationService from "../services/navigation.service";
import dayjs from 'dayjs';

const styles = {
  left: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      display: "flex",
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: "#ccc",
      minHeight: 135,
      maxWidth: 200,
      alignItems: "center",
      justifyContent: "center",
      display: "flex",
    },
    containerToNext: {
      borderBottomLeftRadius: 3,
    },
    containerToPrevious: {
      borderTopLeftRadius: 3,
    },
    bottom: {
      flexDirection: "row",
      justifyContent: "flex-start",
    },
  }),
  right: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "flex-start",
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: "#ccc",
      minHeight: 135,
      marginLeft: 120,
      justifyContent: "flex-end",
    },
    containerToNext: {
      borderBottomLeftRadius: 3,
    },
    containerToPrevious: {
      borderTopLeftRadius: 3,
    },
    bottom: {
      flexDirection: "row",
      justifyContent: "flex-start",
    },
  }),
};
const LiveLocationChat = ({ location, expiry_time, location_id,orientation,time }) => {
  const openMaps = () => {
    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${location.coordinates[1]},${
        location.coordinates[0]
      }`,
      android: `http://maps.google.com/?q=${location.coordinates[1]},${
        location.coordinates[0]
      }`,
    });
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        }
      })
      .catch((err) => {
        console.error("An error occurred", err);
      });
  };
  const expireLocation = (id) => {
    Alert.alert(
      "Confirmation",
      "Are you sure to expire location?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            ApiService.call(
              "put",
              UriConfig.uri.SHARED_LOCATION_EXPIRE + "/" + id,
              {},
              (content, status) => {
                ToastAndroid.show(status.message, ToastAndroid.SHORT);
              },
              (error, errors, content) => {
              }
            );
          },
        },
      ],
      { cancelable: true }
    );
  };
  return (
    <View
      style={[
        styles[orientation].container,
        styles[orientation].wrapper,
        styles[orientation].containerToNext,
        styles[orientation].containerToPrevious,
        styles[orientation].bottom,
      ]}
    >
      <TouchableOpacity
        onPress={openMaps}
        style={{
          padding: 5,
        }}
      >
        <MapView
          style={{ height: 120, width: 190 }}
          initialRegion={{
            latitude: location.coordinates[1],
            longitude: location.coordinates[0],
            latitudeDelta: 0.0034,
            longitudeDelta: 0.0042,
          }}
          // scrollEnabled={false}
          minZoomLevel={5}
          zoomEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: location.coordinates[1],
              longitude: location.coordinates[0],
            }}
          >
            <Image
              source ={require("../assets/icons/Icons/user_placeholder.png")}
              style={{width:40,height:40}}
            />
          </Marker>
        </MapView>
        <View style={{ flexDirection: "column" }}>
          <TouchableOpacity
            onPress={() => expireLocation(location_id)}
            style={{
              backgroundColor: "white",
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
            }}
          >
            <View style={[mainStyle.flexOne, mainStyle.flexRow]}>
              <Text
                style={[
                  mainStyle.redText,
                  mainStyle.fontrg,
                  mainStyle.textlg,
                ]}
              >
                Expire Now
              </Text>
            </View>
          </TouchableOpacity>
          <View
            style={[
              mainStyle.flexThree,
              {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 5,
              },
            ]}
          >
            {location && (
              <View style={mainStyle.flexRow}>
                <Icon
                  name="map-marker"
                  type="font-awesome"
                  color={Colors.blue}
                  size={25}
                />
                <View style={[mainStyle.marginLeft5, { marginTop: 5 }]}>
                  <Text style={[mainStyle.textsm, mainStyle.fontrg]}>
                    Live location will end at {expiry_time}
                  </Text>
                </View>
              </View>
            )}
          </View>
          <View
            style={[
              mainStyle.flexRow,
              mainStyle.marginLeft5,
              { flexDirection: "column" },
            ]}
          >
            {location && (
              <Text
                style={[
                  mainStyle.textxs,
                  mainStyle.fontrg,
                  { color: "#999" },
                ]}
              >
                {dayjs(time).format("LT")}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default LiveLocationChat;