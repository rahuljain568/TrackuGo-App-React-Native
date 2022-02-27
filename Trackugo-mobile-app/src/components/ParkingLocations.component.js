/**
 * Component to handle parking locations related operations.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  Alert,
  Image,
  FlatList,
  ToastAndroid,
  TouchableOpacity, StyleSheet, Clipboard
} from 'react-native';
import { Input } from 'react-native-elements';
import SearchIcon from 'react-native-vector-icons/AntDesign'
import DeleteIcon from 'react-native-vector-icons/MaterialIcons'
import ShareIcon from 'react-native-vector-icons/FontAwesome'
import CopyIcon from 'react-native-vector-icons/Ionicons'
import BackIcon from "react-native-vector-icons/Entypo"
import { Icon } from 'react-native-elements';
import MapView, { Marker } from 'react-native-maps';

import mainStyle from '../styles/main.style';

import UriConfig from '../config/uri.config';

import ApiService from '../services/api.service';
import GeneralService from '../services/general.service';
import NavigationService from '../services/navigation.service';

import Icons from '../modules/icons.module';
import Colors from '../modules/colors.module';
import Loader from '../modules/loader.module';

// import mainStyle from '../styles/main.style';
import moment from 'moment';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

// export default class ParkingLocationsComponent extends Component {

//   constructor() {
//     super();

//     this.state = {
//       page: 1,
//       nextPage: null,

//       loading: false,
//       refreshing: false,
//       parkingLocations: []
//     };

//   }

//   componentDidMount() {
//     this.props.navigation.addListener('didFocus', (payload) => {
//       this.getParkingLocations();
//     });
//   }

//   getParkingLocations = (page) => {

//     this.setState({ refreshing: true });

//     if (!page) {
//       this.setState({ parkingLocations: [] });
//     }

//     ApiService.call('get', UriConfig.uri.PARKING_LOCATIONS + (page ? "?page=" + page : ""), {}, (content) => {

//       let parkingLocations = content.parkingLocations;

//       this.setState({
//         refreshing: false,
//         nextPage: parkingLocations.next_page,
//         parkingLocations: [...this.state.parkingLocations, ...parkingLocations.items]
//       });

//     }, (error, errors, content) => {
//       this.setState({ refreshing: false });
//     });
//   }

//   nextPageParkingLocations = () => {
//     let { page, nextPage } = this.state;

//     if (nextPage && nextPage !== page) {
//       this.setState({ page: nextPage }, () => {
//         this.getParkingLocations(nextPage);
//       });
//     }
//   }

//   render() {

//     return (
//       <View style={mainStyle.contentArea}>
//         <Loader loading={this.state.loading} />

//         <FlatList
//           data={this.state.parkingLocations}
//           refreshing={this.state.refreshing}
//           showsVerticalScrollIndicator={false}
//           onRefresh={() => this.getParkingLocations()}
//           keyExtractor={(item, index) => item._id}
//           onEndReached={() => this.nextPageParkingLocations()}
//           ListEmptyComponent={this.renderEmptyContainer()}
//           renderItem={({ item, index, separators }) => (

//             <View style={[mainStyle.list, mainStyle.flexRow]}>
//               <View style={mainStyle.justifyCenter}>
//                 <Image source={Icons.parkingGreen} style={mainStyle.largeIcon} />
//               </View>
//               <View style={mainStyle.flexFour}>
//                 <Text style={[mainStyle.listTitle, mainStyle.fontmd, mainStyle.marginBottom5]}>{item.location_name} - {item.device.license_plate}</Text>
//                 <Text style={[mainStyle.fontrg, mainStyle.lightText]}>{item.address}</Text>
//                 <Text style={[mainStyle.fontrg, mainStyle.lightText, mainStyle.textsm]}>{GeneralService.dateInterval(item.created_at)} ago</Text>
//               </View>
//               <TouchableOpacity style={mainStyle.justifyCenter} onPress={() => NavigationService.navigate('homeStack', 'ParkingLocationDetail', { id: item._id })}>
//                 <Icon name='angle-right' type='font-awesome' color={Colors.darkGray} size={40} />
//               </TouchableOpacity>
//             </View>
//           )}
//         />

//       </View>
//     );
//   }

//   renderEmptyContainer() {
//     return (
//       <View style={mainStyle.itemsCenter}>
//         <Text style={mainStyle.fontrg}>{this.state.refreshing ? "Fetching parking locations..." : "No parking locations found."}</Text>
//       </View>
//     );
//   }
// }
export default class ParkingLocationsComponent extends Component {
  constructor() {
    super();

    this.state = {
      page: 1,
      nextPage: null,

      loading: false,
      refreshing: false,
      parkingLocations: []
    };

  }

  componentDidMount() {
    this.props.navigation.addListener('didFocus', (payload) => {
      this.getParkingLocations();
    });
  }

  getParkingLocations = (page) => {

    this.setState({ refreshing: true });

    if (!page) {
      this.setState({ parkingLocations: [] });
    }

    ApiService.call('get', UriConfig.uri.PARKING_LOCATIONS + (page ? "?page=" + page : ""), {}, (content) => {

      let parkingLocations = content.parkingLocations;
      console.log('parkingLocations', parkingLocations);
      this.setState({
        refreshing: false,
        nextPage: parkingLocations.next_page,
        parkingLocations: [...this.state.parkingLocations, ...parkingLocations.items]
      });

    }, (error, errors, content) => {
      this.setState({ refreshing: false });
    });
  }

  nextPageParkingLocations = () => {
    let { page, nextPage } = this.state;

    if (nextPage && nextPage !== page) {
      this.setState({ page: nextPage }, () => {
        this.getParkingLocations(nextPage);
      });
    }
  }


  deleteParkingLocation(id) {
    Alert.alert(
      'Confirmation',
      'Are you sure to delete parking location?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK', onPress: () => {

            this.setState({ loading: true });

            ApiService.call('delete', UriConfig.uri.PARKING_LOCATION_DELETE + "/" + id, {}, (content, status) => {

              this.setState({ loading: false });

              ToastAndroid.show(status.message, ToastAndroid.SHORT);

              NavigationService.navigate('homeStack', 'ParkingLocations');
            }, (error, errors, content) => {
              this.setState({ loading: false });
            });
          }
        },
      ],
      { cancelable: true }
    );
  }
  copyToClipboard = (item) => { 
    let latLong = item.location.coordinates[0] + " " + item.location.coordinates[1]
    Clipboard.setString(latLong)
    ToastAndroid.show("Location copied", ToastAndroid.SHORT);
  }
  // fetchCopiedText = async () => {
  //   const text = await Clipboard.getString()
  //   ToastAndroid.show(text, ToastAndroid.SHORT);
  // }
  render() {
    return (

      <View style={{ backgroundColor: Colors.theme.lightBackgroundColor, flex: 1 }}>

        {/* <View style={styles.header1}>
          <BackIcon name="chevron-left" size={30} color='#f2f2f2' style={{ marginLeft: 10 }} />
          <View style={styles.headerTextBox}>
            <Text style={{ fontSize: 22, color: '#f2f2f2', fontWeight: 'bold' }}>Parkings</Text>
          </View>
        </View> */}
        <View style={styles.header2}>
          <Input
            placeholder='Search by name'
            placeholderTextColor="#b3b3b3"
            style={{ fontSize: 16 }}
            inputContainerStyle={styles.searchStyle}
            leftIcon={<Icon name="search" type="font-awesome" size={22} color="gray" />}
          />
        </View>
        {/* <ScrollView> */}

        <FlatList
          data={this.state.parkingLocations}
          refreshing={this.state.refreshing}
          showsVerticalScrollIndicator={false}
          onRefresh={() => this.getParkingLocations()}
          keyExtractor={(item, index) => item._id}
          onEndReached={() => this.nextPageParkingLocations()}
          ListEmptyComponent={this.renderEmptyContainer()}
          // keyExtractor={(item) => item.id}
          // contentContainerStyle={{ paddingBottom: 10 }}
          // data={allData}
          renderItem={({ item, index, separators }) => {
            return (
              <View style={{ marginTop: 10 }}>
                <TouchableOpacity style={styles.mainBox}
                  onPress={() => NavigationService.navigate('homeStack', 'ParkingLocationDetail', { id: item._id })}>
                  <View style={{ padding: 10, width: '15%' }}>
                    {/* <IconAdv num={'P'} /> */}
                    <View style={{ flexDirection: 'row' }}>
                      <View style={styles.round}>
                        <Icon name="car" type="font-awesome" size={24} color="gray" />
                      </View>
                    </View>
                  </View>

                  <View style={{ marginLeft: 0, width: '73%' }}>
                    <View>
                      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.location_name}</Text>
                    </View>


                    {/* <View style={styles.textBack}> */}
                    <Text style={{ color: '#a6a6a6', fontSize: 13, fontWeight: 'bold' }}>{item.device.license_plate}</Text>
                    {/* </View> */}

                    <View style={{ marginTop: 0 }}>
                      <Text style={{ color: 'black' }}><Text style={{ color: '#b3b3b3', }}>{item.address}</Text></Text>
                    </View>

                    <Text style={{ marginTop: 5, marginBottom: 5 }}>
                      <Text style={{ color: '#b3b3b3' }}>{moment(item.created_at).format('DD MMM YYYY hh:mm a')} </Text></Text>

                  </View>

                  <View style={styles.sideIconStyle}>
                    <TouchableOpacity style={styles.viewButton}
                      onPress={() => NavigationService.navigate('homeStack', 'ParkingLocationDetail', { id: item._id })}>
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>View</Text>
                      <BackIcon name="chevron-right" size={22} color="#fff" style={{ marginLeft: -4 }} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => this.deleteParkingLocation(item._id)}>
                      <DeleteIcon name="delete" size={24} color="#cccccc" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => { this.copyToClipboard(item) }}>
                      <CopyIcon name="copy" size={23} color="#cccccc" />
                    </TouchableOpacity> 
                    <TouchableOpacity onPress={() => GeneralService.openMapApp(item.location.coordinates[0], item.location.coordinates[1])}>
                      <ShareIcon name="share-square" size={23} color="#cccccc" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </View>
            )
          }} />

        {/* <View style={{ backgroundColor: '#595959', paddingVertical: 7 }}>
        <Text style={{ fontSize: 19, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>Total number of idle  10</Text>
      </View> */}
        {/* </ScrollView> */}
      </View>

    );
  }
  renderEmptyContainer() {
    return (
      <View style={mainStyle.itemsCenter}>
        <Text style={mainStyle.fontrg}>{this.state.refreshing ? "Fetching parking locations..." : "No parking locations found."}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {

  },
  header2: {
    // backgroundColor: '#fff',
    paddingTop: 5,
    // marginHorizontal: -5
  },
  searchStyle: {
    borderWidth: 0.8,
    // borderBottomWidth: 1.4,
    // paddingHorizontal: 5,
    width: '100%',
    // marginBottom: -24,
    height: 42,
    borderColor: '#ccc',
    backgroundColor: 'white'
  },
  mainBox: {
    // paddingVertical: 0,
    // borderWidth: .8,
    width: '95%',
    marginLeft: '2.5%',
    borderRadius: 5,
    // borderColor: '#e6e6e6',
    flexDirection: 'row',
    backgroundColor: 'white',
    elevation: 2
  },
  textStyle: {
    padding: 0,
    borderWidth: 5,
    position: 'absolute',
    marginLeft: 22,
    marginTop: 11,
    borderRadius: 20,
    width: 35,
    height: 35,
    borderColor: 'green',
    justifyContent: 'center',
  },
  iconStyle: {
    width: 55,
    marginLeft: 13
  },
  sideIconStyle: {
    justifyContent: 'space-around',
    // borderBottomEndRadius: 12,
    padding: 5
  },
  header1: {
    height: 70,
    backgroundColor: '#595959',
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerTextBox: {
    marginLeft: 15
  },
  round: {
    borderWidth: 1.5,
    borderRadius: 20,
    borderColor: 'gray',
    height: 36,
    width: 36,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textBack: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 15,
    height: 26,
    justifyContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    width: 110
  },
  viewButton: {
    backgroundColor: '#ff8c1a',
    paddingLeft: 5,
    paddingRight: 0,
    borderRadius: 5,
    flexDirection: 'row',
    marginLeft: -15,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export class ParkingLocationDetailComponent extends Component {

  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
      ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
      headerTitle: (
        <Text style={mainStyle.mainTitle}>{params.parkingLocation ? params.parkingLocation.location_name : "Parking Detail"}</Text>
      ),
      headerRight: (
        <TouchableOpacity style={mainStyle.pad10} onPress={() => params ? params.deleteParkingLocation(params.parkingLocation._id) : null}>
          <Icon name='trash' type='font-awesome' size={30} color={Colors.gray} />
        </TouchableOpacity>
      )
    };
  };

  constructor() {
    super();

    let { latitudeDelta, longitudeDelta } = GeneralService.locationDelta(0.0015);

    this.state = {
      loading: true,
      location: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: latitudeDelta,
        longitudeDelta: longitudeDelta
      },
      parkingLocation: null,
    };

  }

  componentDidMount() {

    let { navigation } = this.props,
      id = navigation.getParam('id', null);

    ApiService.call('get', UriConfig.uri.PARKING_LOCATION_DETAILS + "/" + id, {}, (content) => {

      let parkingLocation = content.parkingLocation,
        coordinates = parkingLocation.location ? parkingLocation.location.coordinates : null;

      this.stateLocation({ latitude: coordinates ? coordinates[1] : 0, longitude: coordinates ? coordinates[0] : 0 });

      this.props.navigation.setParams({
        parkingLocation: parkingLocation,
        deleteParkingLocation: this.deleteParkingLocation
      });

      this.setState({
        loading: false,
        parkingLocation: content.parkingLocation,
      });

    }, (error, errors, content) => {
      this.setState({ loading: false });
    });

  }

  stateLocation(coordinates) {

    var location = { ...this.state.location }
    location.latitude = coordinates.latitude;
    location.longitude = coordinates.longitude;

    this._map.animateToRegion(location, 1000);

    this.setState({ location });
  }

  deleteParkingLocation = (id) => {
    Alert.alert(
      'Confirmation',
      'Are you sure to delete parking location?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK', onPress: () => {

            this.setState({ loading: true });

            ApiService.call('delete', UriConfig.uri.PARKING_LOCATION_DELETE + "/" + id, {}, (content, status) => {

              this.setState({ loading: false });

              ToastAndroid.show(status.message, ToastAndroid.SHORT);

              NavigationService.navigate('homeStack', 'ParkingLocations');
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

    const { parkingLocation, location } = this.state;

    return (
      <View style={mainStyle.map}>
        <Loader loading={this.state.loading} />

        <MapView
          style={mainStyle.map}
          ref={ref => this._map = ref}
          initialRegion={location}
          region={location}
        >
          <Marker coordinate={location}>
            <Image source={Icons.parkingGreen} />
          </Marker>

        </MapView>

        <View style={mainStyle.pad10}>
          <View style={mainStyle.flexRow}>
            <View style={mainStyle.flexThree}>
              <Text style={[mainStyle.textxl, mainStyle.fontmd]}>{parkingLocation ? parkingLocation.device.license_plate : null}</Text>
              <View style={mainStyle.flexRow}>
                <Icon name='map-marker' type='font-awesome' color={Colors.blue} size={25} />
                <Text style={[mainStyle.textnm, mainStyle.fontrg, mainStyle.lightText, mainStyle.marginLeft5]}>{parkingLocation ? parkingLocation.address : null}</Text>
              </View>
            </View>
            <TouchableOpacity style={mainStyle.listRight} onPress={() => GeneralService.openMapApp(location.latitude, location.longitude)}>
              <Icon name='directions' type='font-awesome-5' color={Colors.green} size={50} />
            </TouchableOpacity>
          </View>

          {
            parkingLocation &&
            <Text style={[mainStyle.textsm, mainStyle.fontrg]}>Remarks: {parkingLocation.remarks || "NA"}</Text>
          }

        </View>
      </View>
    );
  };
}