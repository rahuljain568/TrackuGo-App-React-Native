/**
 * Define the navigation between screen.
 */

import React, { Component } from 'react';
import { Text, TouchableOpacity, TouchableHighlight, Alert } from "react-native";
import { Icon } from "react-native-elements";

import { createDrawerNavigator, createStackNavigator, createAppContainer } from 'react-navigation';

import mainStyle from '../styles/main.style';

import Colors from '../modules/colors.module';

import CartComponent from '../components/Cart.component';
import SearchComponent from '../components/Search.component';
import AlertsComponent from '../components/Alerts.component';
import WebviewComponent from '../components/Webview.component';
import ReportsComponent from '../components/Reports.component';
import DevicesComponent from '../components/Devices.component';
import SettingsComponent from '../components/Settings.component';
import HomepageComponent from '../components/Homepage.component';
import GroupMapComponent from '../components/GroupMap.component';
import MapViewComponent from '../components/MapView.component';
import PlaybackComponent from '../components/Playback.component';
import ReportMenuComponent from '../components/ReportMenu.component';
import DrawerComponent from '../components/partials/Drawer.component';
import BriefReportComponent from '../components/BriefReport.component';
import LocationViewComponent from '../components/LocationView.component';
import LiveTrackPersonalComponent from '../components/LiveTrackPersonal.component';
import HeaderBackImageComponent from '../components/partials/HeaderBackImage.component';
import ProfileComponent, { ChangePasswordComponent } from '../components/Profile.component';
import PaymentsComponent, { PaymentDetailComponent } from '../components/Payments.component';
import ProductsComponent, { ProductDetailComponent } from '../components/Products.component';
import GPSListComponent, { GeoFenceAllComponent } from '../components/GPSList.component';
import GeoFencingComponent, { GeoFenceDetailComponent, GeoFenceComponent } from '../components/GeoFencing.component';
import NotificationsComponent, { NotificationViewComponent } from '../components/Notifications.component';
import SharedLocationsComponent, { SharedLocationComponent } from '../components/SharedLocations.component';
import LiveTrackComponent, { DriverComponent, DeviceDocumentsComponent } from '../components/LiveTrack.component';
import ParkingLocationsComponent, { ParkingLocationDetailComponent } from '../components/ParkingLocations.component';
import SubscriptionsComponent, { SubscriptionComponent, PackagesComponent } from '../components/Subscriptions.component';
import ImmobilizerComponent from "../components/Immobilizer.component";
import ChatComponent from "../components/Chat.component";
import ChatBoxComponent from "../components/ChatBox.component";
import ChatInfoComponent from "../components/ChatInfo.component";
import CameraRoute from "../components/Camera.component";
import UserLiveTrackComponent from "../components/UserLiveTrack.component";
import SendLiveLocation from "../components/SendLiveLocation.component";
import TripReportComponent from "../components/TripReportComponent";
import IdleReportComponent from "../components/IdleReportComponent";
import StopageReportComponent from "../components/StopageReportComponent";
import DetailedReportComponent from "../components/DetailedReportComponent";
import DailyReportComponent from "../components/DailyReportComponent";
import DailyReportSummeryComponent from "../components/DailyReportSummeryComponent";
import DistanceReportComponent from "../components/DistanceReportComponent";
import InactiveReportComponent from "../components/InactiveReportComponent";
import CircleListComponent from "../components/mycircle/CircleListComponent";
import CircleDetailsComponent from "../components/mycircle/CircleDetailsComponent";
import CircleSingleComponent from "../components/mycircle/CircleSingleComponent"; 
import CirclePackagesComponent from "../components/mycircle/CirclePackagesComponent"; 

import ParkingListComponent from "../components/ParkingList.component";

import NavigationService from '../services/navigation.service';

const HomeStackNavigator = createStackNavigator(
  {
    // Home: HomepageComponent, 
    Home: {
      screen: HomepageComponent,
      navigationOptions: {
        header: null,
        headerTitle: <Text style={mainStyle.mainTitle}>Home</Text>,
      },
    },
    Search: SearchComponent,
    LiveTrack: LiveTrackComponent,
    Driver: DriverComponent,
    DeviceDocuments: DeviceDocumentsComponent,
    LiveTrackPersonal: LiveTrackPersonalComponent,
    UserLiveTrack: UserLiveTrackComponent,
    Reports: ReportsComponent,
    Playback: PlaybackComponent,
    ReportMenu: ReportMenuComponent,
    BriefReport: BriefReportComponent,
    LiveLocation: {
      screen: SendLiveLocation,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Share Live Location</Text>,
      },
    },
    Settings: {
      screen: SettingsComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Settings</Text>,
      },
    },
    GroupMap: {
      screen: GroupMapComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Group Map</Text>,
      },
    },
    MapView: {
      screen: MapViewComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Map View</Text>,
      },
    },
    Devices: {
      screen: DevicesComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Devices</Text>,
      },
    },
    Immobilizer: {
      screen: ImmobilizerComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Immobilizer</Text>,
      },
    },
    GPSList: {
      screen: GPSListComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Geo Fence</Text>,
      },
    },
    GeoFenceAll: {
      screen: GeoFenceAllComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Geo Fence</Text>,
      },
    },  
    GeoFencing: {
      screen: GeoFencingComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Geo Fence</Text>,
      },
    },
    GeoFence: {
      screen: GeoFenceComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Geo Fence</Text>,
      },
    },
    GeoFenceDetail: GeoFenceDetailComponent,
    Chat: {
      screen: ChatComponent,
      navigationOptions: ({ navigation }) => ({
        headerTitle: <Text style={mainStyle.mainTitle}>Chat</Text>,
        headerRight: (
          <TouchableHighlight
            onPress={() => {
              console.log("Toggle Click", navigation.state.params);
              navigation.state.params.handleToggle();
            }}
            style={{ marginRight: 15 }}
          >
            <Icon
              name="search"
              type="font-awesome"
              color="white"
              size={20}
              style={{ marginRight: 10 }}
            />
          </TouchableHighlight>
        ),
      }),
    },
    ChatInfo: {
      screen: ChatInfoComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Profile</Text>,
      },
    },
    ChatBox: {
      screen: ChatBoxComponent,
      navigationOptions: ({ navigation }) => ({
        headerTitle: (
          <Text style={mainStyle.mainTitle}>
            {navigation.getParam("sendTo", null).profile_name}
          </Text>
        ),
        headerRight: (
          <TouchableOpacity
            onPress={() =>
              NavigationService.navigate("homeStack", "ChatInfo", {
                sendTo: navigation.getParam("sendTo"),
              })
            }
            style={{ marginRight: 15 }}
          >
            <Icon
              name="info-circle"
              type="font-awesome"
              color="white"
              size={20}
            />
          </TouchableOpacity>
        ),
      }),
    },
    Camera: {
      screen: CameraRoute,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Capture Image</Text>,
      },
    },
    ParkingList: {
      screen: ParkingListComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Parkings</Text>,
      },
    },
    ParkingLocations: {
      screen: ParkingLocationsComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Parkings</Text>,
      },
    },
    ParkingLocationDetail: ParkingLocationDetailComponent,
    Notifications: {
      screen: NotificationsComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Notifications</Text>,
      },
    },
    NotificationView: {
      screen: NotificationViewComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Notification View</Text>,
      },
    },
    Alert: {
      screen: AlertsComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Alert Setting</Text>,
      },
    },
    Subscriptions: {
      screen: SubscriptionsComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Manage Devices</Text>,
      },
    },
    Payments: {
      screen: PaymentsComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Payments</Text>,
      },
    },
    PaymentDetail: {
      screen: PaymentDetailComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Payment Detail</Text>,
      },
    },
    Subscription: SubscriptionComponent,
    Packages: PackagesComponent,
    Products: {
      screen: ProductsComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Products</Text>,
      },
    },
    ProductDetail: {
      screen: ProductDetailComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Product Detail</Text>,
      },
    },
    SharedLocations: {
      screen: SharedLocationsComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Sharing</Text>,
      },
    },
    SharedLocation: SharedLocationComponent,
    Cart: {
      screen: CartComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Cart</Text>,
      },
    },
    Profile: {
      screen: ProfileComponent,
      navigationOptions: {
        headerTitle: (
          <Text
            style={[mainStyle.textxl, mainStyle.fontmd, mainStyle.whiteText]}
          >
            Profile
          </Text>
        ),
      },
    },
    ChangePassword: {
      screen: ChangePasswordComponent,
      navigationOptions: {
        headerTitle: (
          <Text
            style={[mainStyle.textxl, mainStyle.fontmd, mainStyle.whiteText]}
          >
            Change Password
          </Text>
        ),
      },
    },
    Webview: {
      screen: WebviewComponent,
      navigationOptions: {
        header: null,
      },
    },
    LocationView: {
      screen: LocationViewComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Location View</Text>,
      },
    },
    TripReport: {
      screen: TripReportComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Trip Report</Text>,
      },
    },
    IdleReport: {
      screen: IdleReportComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Idle Report</Text>,
      },
    },
    StopageReport: {
      screen: StopageReportComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Stopage Report</Text>,
      },
    },
    DetailedReport: {
      screen: DetailedReportComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Detailed Report</Text>,
      },
    },
    DailyReport: {
      screen: DailyReportComponent,
      navigationOptions: {
        header: null,
        headerTitle: <Text style={mainStyle.mainTitle}>Daily Report</Text>,
      },
    },
    DailyReportSummery: {
      screen: DailyReportSummeryComponent,
      navigationOptions: {
        header: null,
        headerTitle: <Text style={mainStyle.mainTitle}>Summary Report</Text>,
      },
    },
    DistanceReport: {
      screen: DistanceReportComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Distance Report</Text>,
      },
    },
    InactiveReport: {
      screen: InactiveReportComponent,
      navigationOptions: {
        headerTitle: <Text style={mainStyle.mainTitle}>Inactive  Report</Text>,
      },
    },
    CircleList:CircleListComponent,
      
    CircleDetails: {
      screen: CircleDetailsComponent,
      navigationOptions: {
        header: null,
        headerTitle: <Text style={mainStyle.mainTitle}>Circles</Text>,
      },
    },
    CircleSingle: CircleSingleComponent,
     
    CirclePackages: CirclePackagesComponent,
  },
  {
    defaultNavigationOptions: {
      headerStyle: {
        height: 60,
        elevation: 2,
        backgroundColor: Colors.theme.backgroundModal,
      },
      headerBackImage: <HeaderBackImageComponent />,
      headerTitleStyle: {
        fontSize: 24,
      },
    },
  }
);

const HomeStackContainer = createAppContainer(HomeStackNavigator);
class HomeStackNavigatorComponent extends Component {
  render() {
    return (
      <HomeStackContainer
        ref={navigatorRef => {
          NavigationService.setNavigator('homeStack', navigatorRef);
        }}
      />
    );
  }
}

const HomeDrawerNavigator = createDrawerNavigator(
  {
    Home: { screen: HomeStackNavigatorComponent }
  },
  {
    contentComponent: DrawerComponent
  }
);

const HomeDrawerContainer = createAppContainer(HomeDrawerNavigator);
export default class HomeNavigator extends Component {
  render() {
    return (
      <HomeDrawerContainer
        ref={navigatorRef => {
          NavigationService.setNavigator('homeDrawer', navigatorRef);
        }}
      />
    );
  }
}