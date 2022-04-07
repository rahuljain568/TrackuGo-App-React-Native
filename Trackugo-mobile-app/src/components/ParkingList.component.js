import React, { Component } from 'react';

import { Text, View, StyleSheet, TouchableOpacity, FlatList, ScrollView, ToastAndroid, Alert, Clipboard } from 'react-native';
import { Input } from 'react-native-elements';
// import Icon from 'react-native-vector-icons/Entypo'
import SearchIcon from 'react-native-vector-icons/AntDesign'
import DeleteIcon from 'react-native-vector-icons/MaterialIcons'
import ShareIcon from 'react-native-vector-icons/FontAwesome'
import CopyIcon from 'react-native-vector-icons/Ionicons'
import BackIcon from "react-native-vector-icons/Entypo"
import VoiceIcon from 'react-native-vector-icons/MaterialIcons'
import CarIcon from 'react-native-vector-icons/FontAwesome5'
import { locales } from 'moment';
import Colors from '../modules/colors.module';
import { Icon } from 'react-native-elements';
import mainStyle from '../styles/main.style';
import moment from 'moment';
import UriConfig from '../config/uri.config';

import ApiService from '../services/api.service';
import GeneralService from '../services/general.service';
import NavigationService from '../services/navigation.service';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const allData = [
  {
    id: '1',
    parking_name: 'Office area',
    remark: 'remark data 1st',
    veichleName: 'UPMCH-0500',
    Address: 'this is the area of my office , it is around 200 meters position :-6.168033, 106.900467',
    created_at: '12 Aug 2020',
    timestamp: '08:21 pm',
  },
  {
    id: '2',
    parking_name: 'Home area',
    remark: 'remark data 2nd',
    veichleName: 'UPMCH-7648',
    Address: 'this is the area of my Home , it is around 200 meters position :-6.168033, 106.900467',
    created_at: '5 Jan 2021',
    timestamp: '07:35 am',
  },
  {
    id: '3',
    parking_name: 'Lotte Mart area',
    remark: 'remark data 3rd',
    veichleName: 'UPMCH-8923',
    Address: 'this is the area of lotte market side , it is around 200 meters position :-6.168033, 106.900467',
    created_at: '22 Mar 2020',
    timestamp: '12:35 pm',
  }, {
    id: '4',
    parking_name: 'Sunlake area',
    remark: 'remark data 4th',
    veichleName: 'UPMCH-0938',
    Address: 'this is the area of sunlake area side , it is around 200 meters position :-6.168033, 106.900467',
    created_at: '22 Mar 2020',
    timestamp: '06:23 am',
  }, {
    id: '5',
    parking_name: 'Sunlake area',
    remark: 'remark data 4th',
    veichleName: 'UPMCH-0938',
    Address: 'this is the area of sunlake area side , it is around 200 meters position :-6.168033, 106.900467',
    created_at: '22 Mar 2020',
    timestamp: '11:40 pm',
  }
]

const IconAdv = ({ num }) => {
  return (
    <View style={styles.iconStyle}>
      <View style={styles.round}>
        <CarIcon name="car" size={22} color="#cccccc" />
      </View>
    </View>
  )
}

export default class ParkingListComponent extends Component {
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

              // NavigationService.navigate('homeStack', 'ParkingList');
              this.getParkingLocations();
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
    let latLong = item.location.coordinates[1] + " " + item.location.coordinates[0]
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
              <View style={{ marginTop: 10, marginBottom: 2 }}>
                <TouchableOpacity style={styles.mainBox}
                  onPress={() => NavigationService.navigate('homeStack', 'ParkingLocationDetail', { id: item._id })}>
                  <View style={{ flexDirection: 'row', flex: 6.9 }}>

                    <View style={{ padding: 10 }}>
                      {/* <IconAdv num={'P'} /> */}
                      <Icon name="car" type="font-awesome" size={24} color="gray" />
                    </View>

                    <View style={{ marginLeft: 0, width: '73%' }}>
                      <View>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.location_name}</Text>
                      </View>

                      {/* <View style={styles.textBack}> */}
                      {item.device &&
                        <Text style={{ color: '#a6a6a6', fontSize: 13, fontWeight: 'bold' }}>{item.device.license_plate}</Text>
                      }
                      {/* </View> */}

                      <View style={{ marginTop: 0 }}>
                        <Text style={{ color: 'black' }}><Text style={{ color: '#b3b3b3', }}>{item.address}</Text></Text>
                      </View>

                      <Text style={{ marginTop: 5, marginBottom: 5 }}>
                        <Text style={{ color: '#b3b3b3' }}>{moment(item.created_at).format('DD MMM YYYY hh:mm a')} </Text></Text>

                    </View>
                  </View>
                  <View style={{ flex: 3.1, }}>
                    <View style={{
                      flexDirection: 'row', justifyContent: 'flex-end',
                      flex: 3.1,
                    }}>
                      {/* <TouchableOpacity style={styles.viewButton}
                        onPress={() => NavigationService.navigate('homeStack', 'ParkingLocationDetail', { id: item._id })}>
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12,marginRight:-10 }}>View</Text>
                        <BackIcon name="chevron-right" size={22} color="#fff" style={{ marginLeft:5,marginRight:-9 }} />
                      </TouchableOpacity> */}
                    </View>
                    <View style={{
                      flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end',
                      flex: 3.1,
                    }}>
                      <TouchableOpacity onPress={() => this.deleteParkingLocation(item._id)}
                        style={{ marginRight: 20 }}>
                        <DeleteIcon name="delete" size={24} color="#cccccc" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { this.copyToClipboard(item) }}
                        style={{ marginRight: 20 }}>
                        <CopyIcon name="copy" size={23} color="#cccccc" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => GeneralService.openMapApp(item.location.coordinates[1], item.location.coordinates[0])}
                        style={{ marginRight: 5 }}>
                        <ShareIcon name="share-square" size={23} color="#cccccc" />
                      </TouchableOpacity>
                    </View>
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
    borderColor: '#cccccc',
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
    height: 25,
    width: 60,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

