/**
 * Component to show homepage.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Modal,
  Share,
  FlatList,
  TextInput,
  ScrollView,
  SafeAreaView,
  ToastAndroid,
  TouchableOpacity,
  Alert
} from 'react-native';

import MapView, { Marker } from 'react-native-maps'; 


import ButtonComponent from '../../components/partials/Button.component';

import mainStyle from '../../styles/main.style';
import homeStyle from '../../styles/home.style';
// let styles = PurchaseHistoryStyles;
import Icons from '../../modules/icons.module';
import Colors from '../../modules/colors.module';
import Loader from '../../modules/loader.module';

import AppConfig from '../../config/app.config';
import UriConfig from '../../config/uri.config';

import ApiService from '../../services/api.service';
import StorageService from '../../services/storage.service';
import GeneralService from '../../services/general.service';
import NavigationService from '../../services/navigation.service';

import { deviceValidation } from '../../services/validation.service';
import moment from "moment";
import axios from "axios";
import { add } from 'react-native-reanimated';
import CarIcon from 'react-native-vector-icons/Fontisto'
import { Icon } from 'react-native-elements';
import { w, h, totalSize } from '../../styles/dimension';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
let timeout;

export default class ActiveTab extends Component {


  render() {
    return (
      <View style={mainStyle.flexOne}>
        <View
          style={{
            height: '100%',
            backgroundColor: Colors.theme.lightBackgroundColor,
          }}>
          <TouchableOpacity style={styles.vwList}
            onPress={() => NavigationService.navigate('homeStack', 'Products')}>
            <View style={styles.vwListChildLeft}>
              <View style={styles.vwImg}>
                <Icon
                  name="shopping-cart"
                  type="Ionicons"
                  size={30}
                  color="#f39820"
                />
              </View>
              <View style={styles.vwName}>
                <Text style={styles.txtList}>Buy GPS</Text>
                <Text style={styles.txtNameList}>Pick a subscriptions plan and order a GPS today</Text>
              </View>
            </View>
            <View style={styles.vwListChildRight}>
              <Icon
                name="chevron-right"
                type="Ionicons"
                size={30}
                color="gray"
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.vwList} 
          onPress={() => NavigationService.navigate('homeStack', 'Payments')}>
            <View style={styles.vwListChildLeft}>
              <View style={styles.vwImg}>
                <Icon
                  name="cubes"
                  type="font-awesome"
                  size={30}
                  color="#f39820"
                />
              </View>
              <View style={styles.vwName}>
                <Text style={styles.txtList}>Track your Order</Text>
                <Text style={styles.txtNameList}>Check the status of order you have placed</Text>
              </View>
            </View>
            <View style={styles.vwListChildRight}>
              <Icon
                name="chevron-right"
                type="Ionicons"
                size={30}
                color="gray"
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.vwList} 
          onPress={() => NavigationService.navigate('homeStack', 'Subscriptions')}>
            <View style={styles.vwListChildLeft}>
              <View style={styles.vwImg}>
                <Icon
                  name="calendar"
                  type="font-awesome"
                  size={30}
                  color="#f39820"
                />
              </View>
              <View style={styles.vwName}>
                <Text style={styles.txtList}>Manage Subscriptions</Text>
                <Text style={styles.txtNameList}>Renew your subscriptions plan and view transaction history</Text>
              </View>
            </View>
            <View style={styles.vwListChildRight}>
              <Icon
                name="chevron-right"
                type="Ionicons"
                size={30}
                color="gray"
              />
            </View>
          </TouchableOpacity>

        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  gradient: {
    flex: 1,
  },
  vwMain: {
    marginTop: h(3),
  },
  vwList: {
    marginTop: h(2),
    width: '95%',
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignSelf: "center",
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 5,
    elevation: 3,
    // borderWidth: 1,
    // borderColor: Colors.gray
  },
  vwListChildLeft: {
    flex: 9,
    alignItems: 'center',
    flexDirection: 'row',
  },
  vwImg: {
    marginLeft: -3,
    height: 80,
    width: 50,
    borderRadius: 15,
    // backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 2.5
  },
  vwName: {
    marginLeft: w(5),
    flex: 7.5
  },
  vwListChildRight: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: -5
  },
  txtList: {
    color: Colors.black,
    // fontFamily: Fonts.semiBoldFont,
    fontSize: 17,
    fontWeight: 'bold',
  },
  txtNameList: {
    color: Colors.darkGray,
    // fontFamily: Fonts.regularFont,
    fontSize: 14,
  },
  imgBookList: {
    height: 60,
    width: 60
  },
  vwSort: {
    height: h(6),
    width: h(17),
    // paddingHorizontal: 20,
    backgroundColor: Colors.colorPrimary,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: h(2)
  },
  txtSort: {
    color: Colors.white,
    // fontFamily: Fonts.semiBoldFont,
    fontSize: 17,
  },
  icSort: {
    marginLeft: 15,
    height: 25,
    width: 25,
    tintColor: Colors.white
  },
  Dialog_transparentView: {
    flex: 1,
    // backgroundColor: Colors.transparentColor,
    justifyContent: 'center',
    alignItems: 'center'
  },
  Dialog_View: {
    width: '55%',
    borderRadius: 15,
    paddingVertical: 15,
    paddingRight: 5,
    paddingLeft: 20,
    backgroundColor: Colors.white,
    elevation: 3,
    alignSelf: 'center',
    position: 'absolute',
    right: 15,
    top: 135
  },
  vwCorner: {
    height: 100,
    width: 100,
    backgroundColor: Colors.white,
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
    right: 20,
    top: 3
  },
  vwDialogBody: {
    width: '100%',
    alignSelf: 'center',
  },
  vwFilterListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  txtDialogLabel: {
    color: Colors.colorPrimary,
    // fontFamily: Fonts.semiBoldFont,
    fontSize: 17,
  },
  vwFilterMainList: {
    marginTop: h(1),
  },
  vwFilterList: {
    paddingVertical: 5,
    paddingLeft: 10,
    paddingRight: 5,
    justifyContent: 'center',
  },
  txtFilterList: {
    color: Colors.gray500,
    // fontFamily: Fonts.regularFont,
    fontSize: 17,
    // fontSize: FontsSize.two,
  },
});