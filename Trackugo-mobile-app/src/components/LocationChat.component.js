import React from "react";
import MapView, { Marker, Polyline, AnimatedRegion } from "react-native-maps";
import { View, Text, TouchableOpacity, Linking, Platform,StyleSheet,Image } from "react-native";
import mainStyle from "../styles/main.style";
import homeStyle from "../styles/home.style";
import { Icon } from "react-native-elements";

import Icons from "../modules/icons.module";
import Colors from "../modules/colors.module";
import Loader from "../modules/loader.module";

import AppConfig from "../config/app.config";
import UriConfig from "../config/uri.config";

import ApiService from "../services/api.service";
import StorageService from "../services/storage.service";
import GeneralService from "../services/general.service";
import NavigationService from "../services/navigation.service";
import dayjs from "dayjs";

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
const LocationChat = ({ location, current_address, orientation,time }) => {
  console.log("Location Chat", location, current_address);
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
      <TouchableOpacity onPress={openMaps} style={{ padding: 5 }}>
        <MapView
          style={{ height: 120, width: 190 }}
          initialRegion={{
            latitude: location.coordinates[1],
            longitude: location.coordinates[0],
            latitudeDelta: 0.0034,
            longitudeDelta: 0.0042,
          }}
          pitchEnabled={false}
          rotateEnabled={false}
          zoomEnabled={false}
          scrollEnabled={false}
          minZoomLevel={5}
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
        <View
          style={[
            mainStyle.flexRow,
            mainStyle.marginLeft5,
            { flexDirection: "column" },
          ]}
        >
          <View style={mainStyle.flexThree}>
            {location && (
              <View style={mainStyle.flexRow}>
                <Text style={[mainStyle.textlg, mainStyle.fontrg]}>
                  {current_address}
                </Text>
              </View>
            )}
          </View>
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
              style={[mainStyle.textxs, mainStyle.fontrg, { color: "#999" }]}
            >
              {dayjs(time).format("LT")}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default LocationChat;