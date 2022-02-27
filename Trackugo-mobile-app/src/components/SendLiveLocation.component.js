import React, { useEffect, useRef, useState } from "react";
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
import { Icon, Button } from 'react-native-elements';
import mainStyle from "../styles/main.style";
import homeStyle from "../styles/home.style";
import liveTrackStyle from "../styles/live-track.style";

import Icons from "../modules/icons.module";
import Colors from "../modules/colors.module";
import Loader from "../modules/loader.module";

import AppConfig from "../config/app.config";
import UriConfig from "../config/uri.config";

import ApiService from "../services/api.service";
import StorageService from "../services/storage.service";
import GeneralService from "../services/general.service";
import NavigationService from "../services/navigation.service";
// import BackgroundGeolocation from "@mauron85/react-native-background-geolocation";


const SendLiveLocation = (props) => {
  let { latitudeDelta, longitudeDelta } = GeneralService.locationDelta(0.01);
  const mapRef = useRef();
  const markerRef = useRef();
  const [button1type, setButton1Type] = useState("outline");
  const [button2type, setButton2Type] = useState("outline");
  const [button3type, setButton3Type] = useState("outline");
  const [expiry_time, setExpiryTime] = useState(0);
  const [share_location_id, setLocationId] = useState(null);
  const [region, setRegion] = useState({
    latitude: AppConfig.default_location.latitute,
    longitude: AppConfig.default_location.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [location, setLocation] = useState({
    type: "Point",
    coordinates: [
      AppConfig.default_location.longitude,
      AppConfig.default_location.latitute,
    ],
  });
  const [currentCoordinate, setCoordinate] = useState(
    new AnimatedRegion({
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
  );
  const [address, setAddress] = useState("Not Available")
  useEffect(() => {
    let locationCoordinate = {};
    let new_region = {};
    let new_coordinate = {};
    BackgroundGeolocation.getCurrentLocation(lastLocation => {
      locationCoordinate = {
        type: "Point",
        coordinates: [
          lastLocation.longitude,
          lastLocation.latitude,
        ],
      };
      new_region = {
        latitude: lastLocation.latitude,
        longitude: lastLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      new_coordinate = new AnimatedRegion({
        latitude: lastLocation.latitude,
        longitude: lastLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      let new_address = GeneralService.geocodingReverse(
        {
          latitude: lastLocation.latitude,
          longitude: lastLocation.longitude,
        },
        (address) => {
          return address;
        },
        (error) => {
          return error;
        }
      );
      setAddress(new_address);
      setLocation(locationCoordinate);
      setRegion(new_region);
      setCoordinate(new_coordinate);
      console.log("Current Address", address, lastLocation)
    }, (error) => {
      setTimeout(() => {
        Alert.alert('Error obtaining current location', JSON.stringify(error));
      }, 100);
    });
  }, [])

  shareLocation = () => {
    let params = {
      expire_after: expiry_time,
      is_Tracking_request: false,
      user_id: props.navigation.state.params.sendTo._id,
    };

    ApiService.call(
      "post",
      UriConfig.uri.SHARED_LOCATION_SAVE,
      params,
      (content, status) => {
        console.log("Live Location", content);
        setLocationId(content.sharedLocation._id);
        ToastAndroid.show(status.message, ToastAndroid.SHORT);
        props.navigation.goBack();
        props.navigation.state.params.sendLiveLocation(
          expiry_time,
          content.sharedLocation._id,
          address,
          location
        );
      },
      (error, errors, content) => {
        GeneralService.placeErrors(this, errors);
      }
    );
  };
  return (
    <View style={mainStyle.flexOne}>
      <MapView
        mapType={"standard"}
        style={mainStyle.flexOne}
        initialRegion={region}
        ref={(ref) => {
          mapRef.current = ref;
        }}
        onPress={() => { }}
        pitchEnabled={true}
        rotateEnabled={true}
        zoomEnabled={true}
        scrollEnabled={true}
        zoomControlEnabled={true}
      >
        {location ? (
          <Marker.Animated
            ref={(marker) => {
              markerRef.current = marker;
            }}
            coordinate={currentCoordinate}
            anchor={{ x: 0.5, y: 0.5 }}
            style={{
              transform: [
                {
                  rotate: Math.abs((0 + 270) % 360) + "deg",
                },
              ],
            }}
          >
            <Image
              source={require("../assets/icons/Icons/user_placeholder.png")}
              style={{ width: 40, height: 40 }}
            />
          </Marker.Animated>
        ) : null}
      </MapView>
      <View style={liveTrackStyle.detailBox}>
        <Text
          style={[mainStyle.textlg, mainStyle.fontmd, mainStyle.marginLeft10]}
        >
          Send Your Live Location
        </Text>
        <View
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <Button
            title="1 Hour"
            type={button1type}
            onPress={() => {
              setButton1Type("solid");
              setButton2Type("outline");
              setButton3Type("outline");
              setExpiryTime(1);
            }}
          // buttonStyle={{
          //   borderColor: "#f39820",
          // }}
          // titleStyle={{ color: "#f39820" }}
          />
          <Button
            title="8 Hour"
            type={button2type}
            onPress={() => {
              setButton1Type("outline");
              setButton2Type("solid");
              setButton3Type("outline");
              setExpiryTime(8);
            }}
          // buttonStyle={{ borderColor: "#f39820" }}
          // titleStyle={{ color: "#f39820" }}
          />
          <Button
            title="12 Hour"
            type={button3type}
            onPress={() => {
              setButton1Type("outline");
              setButton2Type("outline");
              setButton3Type("solid");
              setExpiryTime(12);
            }}
          // buttonStyle={{ borderColor: "#f39820" }}
          // titleStyle={{ color: "#f39820" }}
          />
          <Icon
            name="arrow-circle-right"
            type="font-awesome"
            reverse={true}
            onPress={() => {
              if (expiry_time == 0) {
                setExpiryTime(1);
              }
              shareLocation();
            }}
            color="#f39820"
          />
        </View>
      </View>
    </View>
  );
};

export default SendLiveLocation;