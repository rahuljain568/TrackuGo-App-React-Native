/**
 * Component to render side drawer for navigation.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StatusBar,
  ScrollView,
  TouchableOpacity
} from 'react-native';

import { Icon } from 'react-native-elements';

import mainStyle from '../../styles/main.style';
import drawerStyle from '../../styles/drawer.style';

import Colors from '../../modules/colors.module';
import Icons, { Images } from '../../modules/icons.module';

import ApiService from '../../services/api.service';
import StorageService from '../../services/storage.service';
import NavigationService from '../../services/navigation.service';
import moment from 'moment';

export default class DrawerComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null, IsPackageExp: false
    }
    this.reRenderSomething = this.props.navigation.addListener('focus', () => {
      this.fetchData();
  });
  
  }

  async componentDidMount() {
    this.fetchData();
  }
 async fetchData()
  {
    let circle_expiry_date = JSON.parse(await StorageService.fetch('circle_expiry_date'));
    let IsPackageExp = false;
    console.log(circle_expiry_date, 'circle_expiry_date1');

    // let expiry_date = moment('2022-01-15');
    // console.log(moment().format('YYYY-MM-DD'),'moment');
    console.log(moment(circle_expiry_date).format('YYYY-MM-DD'), 'expiry_date111');
    console.log(circle_expiry_date == null || moment('2022-04-27', 'YYYY-MM-DD').format('YYYY-MM-DD') >= moment(circle_expiry_date).format('YYYY-MM-DD'))
    if (circle_expiry_date == null || moment('2022-04-27', 'YYYY-MM-DD').format('YYYY-MM-DD') >= moment(circle_expiry_date).format('YYYY-MM-DD')) {
      IsPackageExp = true;
    }
    console.log(IsPackageExp, 'IsPackageExp');
    this.setState({
      user: JSON.parse(await StorageService.fetch('user')), IsPackageExp: IsPackageExp
    })
  }

  render() {

    const drawerMenus = [
      {
        menuName: "Home",
        route: "Home",
        routeType: "homeDrawer",
        icon: Icons.home,
      },
      {
        menuName: "Group Map",
        route: "GroupMap",
        routeType: "homeStack",
        icon: Icons.map,
      },
      {
        menuName: "Devices",
        route: "Devices",
        routeType: "homeStack",
        icon: Icons.list,
      },
      // {
      //   menuName: "Immobilizer",
      //   route: "Immobilizer",
      //   routeType: "homeStack",
      //   icon: Icons.list,
      // },
      // {
      //   menuName: "Parkings",
      //   route: "ParkingLocations",
      //   routeType: "homeStack",
      //   icon: Icons.parkingsGray,
      // },
      {
        menuName: "Parkings",
        route: "ParkingList",
        routeType: "homeStack",
        icon: Icons.parkingsGray,
      },
      {
        menuName: "Geo Fence",
        route: "GPSList",
        routeType: "homeStack",
        icon: Icons.fenceGray,
      },
      // {
      //   menuName: "Geo Fence",
      //   route: "GeoFencing",
      //   routeType: "homeStack",
      //   icon: Icons.fenceGray,
      // },
      // {
      //   menuName: "Sharing",
      //   route: "SharedLocations",
      //   routeType: "homeStack",
      //   icon: Icons.list,
      // },
      // {
      //   menuName: "Chat",
      //   route: "Chat",
      //   routeType: "homeStack",
      //   icon: Icons.chat,
      // },
      // {
      //   menuName: "Products",
      //   route: "Products",
      //   routeType: "homeStack",
      //   icon: Icons.devices,
      // },
      {
        menuName: "My Circle",
        // route: "CirclePackages",
        route:  "CircleList",
        routeType: "homeStack",
        icon: Icons.devices,
      },
      {
        menuName: "More",
        // menuName: "Settings",
        route: "Settings",
        routeType: "homeStack",
        icon: Icons.settings,
      },
      {
        menuName: "Signout",
        callback: () => {
          return ApiService.signout();
        },
        icon: Icons.signout,
      },
    ];

    let { user } = this.state;

    return (
      <ScrollView>
        <StatusBar
          backgroundColor={Colors.theme.backgroundModal}
          barStyle="light-content"
        />

        {user && (
          <View style={drawerStyle.drawerHeader}>
            <View
            >
              <Image source={Images.drawerLogo} />
            </View>

            <Text
              style={[
                mainStyle.textxl,
                mainStyle.fontmd,
                mainStyle.whiteText,
                mainStyle.marginBottom10,
              ]}
            >
              {user.profile_name}
            </Text>
            <View style={mainStyle.flexRow}>
              <Icon
                name="phone"
                type="font-awesome"
                size={18}
                color={Colors.white}
              />
              <Text
                style={[
                  mainStyle.textnm,
                  mainStyle.fontrg,
                  mainStyle.whiteText,
                  mainStyle.marginBottom5,
                  mainStyle.marginLeft5,
                ]}
              >
                {user.phone}
              </Text>
            </View>
            <View style={mainStyle.flexRow}>
              <Icon
                name="envelope"
                type="font-awesome"
                size={16}
                color={Colors.white}
              />
              <Text
                style={[
                  mainStyle.textnm,
                  mainStyle.fontrg,
                  mainStyle.whiteText,
                  mainStyle.marginBottom5,
                  mainStyle.marginLeft5,
                ]}
              >
                {user.email}
              </Text>
            </View>
          </View>
        )}

        <FlatList
          data={drawerMenus}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                item.hasOwnProperty("callback")
                  ? item.callback()
                  : NavigationService.navigate(item.routeType, item.route)
              }
            >
              <View style={drawerStyle.drawerItem}>
                <View style={drawerStyle.drawerItemLeft}>
                  {
                    item.menuName == 'Chat' ?
                      (<Image source={item.icon} style={{ width: 35, height: 35, opacity: 0.4 }} />)
                      :
                      (<Image source={item.icon} />)
                  }

                </View>
                <View style={drawerStyle.drawerItemRight}>
                  <Text
                    style={[drawerStyle.drawerItemText, mainStyle.fontrg]}
                  >
                    {item.menuName}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </ScrollView>
    );
  };
}
