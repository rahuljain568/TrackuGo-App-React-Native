import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import moment from 'moment';
import { Icon, Button } from 'react-native-elements';
import RoadIcon from 'react-native-vector-icons/FontAwesome'
import UriConfig from '../config/uri.config';
import Loader from '../modules/loader.module';
import NavigationService from '../services/navigation.service';
import BackIcon from "react-native-vector-icons/Entypo"
import Colors from '../modules/colors.module';

import ApiService from '../services/api.service';
import GeneralService from '../services/general.service';
import DateTimePicker from "react-native-modal-datetime-picker";
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class TripReportComponent extends React.Component {
  static navigationOptions = ({ navigation }) => { 
    let params = navigation.state.params || {},
    device = params.device || null;
    return {
      headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
      ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false, refreshing: false,
      vehicle: '',
      report: null,
      device: null,
      loading: false,
      report_data: [],

      from_date: GeneralService.dateFormat(null, 'd/m/Y') + " 00:00",
      to_date: GeneralService.dateFormat(new Date(), 'd/m/Y H:i'),
      errors: {
        from_date: false,
        to_date: false
      },
      current_picker: null, isLoading: false, shorting: 0
    };
  }

  setModalVisible = (visible) => {
    this.setState({ modalVisible: visible });
  };

  showDateTimePicker = (pickerElement) => {
    this.setState({
      current_picker: pickerElement,
      isDateTimePickerVisible: true,
      shorting: 0
    });
  }

  hideDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: false });
  }

  handleDatePicked = (date) => {
    if (this.state.current_picker) {
      this.setState({
        [this.state.current_picker]: GeneralService.dateFormat(date, 'd/m/Y H:i'),
        errors: { ...this.state.errors, [this.state.current_picker]: false }
      });
    }
    this.hideDateTimePicker();
  }
  componentDidMount() {
    try {
      let { navigation } = this.props;
      let device = navigation.getParam("device", null);
      this.setState({
        device: device, vehicle: device.license_plate
      }, () => {
        this.getReport();
      });
    } catch (error) {

    }
  }
  getReport() {
    try {
      this.setState({ isLoading: true, refreshing: true });
      let { from_date, to_date, device } = this.state;

      let fromDate = from_date, toDate = to_date;

      let params = {
        from_date: GeneralService.dateFormat(GeneralService.correctDate(fromDate + ":00"), 'Y-m-d H:i:s'),
        to_date: GeneralService.dateFormat(GeneralService.correctDate(toDate + ":00"), 'Y-m-d H:i:s'),
        offset: new Date().getTimezoneOffset()
      },
        uri = UriConfig.uri.REPORT_TRIP;

      this.setState({
        loading: true,
        content: null,
        report_data: []
      });
      ApiService.call('post', uri + "/" + device._id, params, (content) => {
        console.log("content",content);
        this.setState({
          loading: false,
          isLoading: false, refreshing: false
        });
        if (content.report_data.length == 0) {
          alert("No trips are available!..")
          return;
        }
        let tmp = [];
        let temp=[];
        temp=content.report_data.filter(element=>Number(element.distance)>=1);
       console.log("asd",temp)
        // content.report_data.forEach(element => {
        //   if (Number(element.distance) >= 1) {
        //     tmp.push(element)
        //   }
        // });
        this.setState({ report_data: temp, });
        if (temp.length == 0) {
          alert("No trips are available!..")
          return;
        }
      }, (error, errors, content) => {
        this.setState({ loading: false, refreshing: false });
      });
    } catch (error) {
      console.log(error);
    }
  }
  getDuration(startdate, enddate) {
    var startDate = moment(startdate);
    var endDate = moment(enddate);
    var mins = endDate.diff(startDate, 'minutes')
    var h = mins / 60 | 0,
      m = mins % 60 | 0;
    if (h > 0)
      return moment.utc().hours(h).format("hh") + " hrs " + moment.utc().minutes(m).format("mm") + " mins";
    else
      return "0 hrs " + moment.utc().minutes(m).format("mm") + " mins";
  }
  setRange(item_) {
    try {
      let to_date, from_date;
      if (item_ == 'Today') {
        from_date = this.getDate('startoftoday');
        to_date = this.getDate('endoftoday');
      } else if (item_ == 'Yesterday') {
        from_date = this.getDate('startofyesterday');
        to_date = this.getDate('endofyesterday');
      } else if (item_ == 'Week') {
        from_date = this.getDate('startofweek');
        to_date = this.getDate('endoftoday');
      } else if (item_ == 'Month') {
        from_date = this.getDate('startofmonth');
        to_date = this.getDate('endoftoday');
      }
      this.setState({
        from_date: from_date, to_date: to_date
      }, () => {
        this.getReport();
        this.shortingBy(item_)
      });
    } catch (error) {

    }
  }
  getDate(item) {
    if (item == 'startoftoday')
      return moment().startOf('day').format('DD/MM/YYYY HH:mm');
    if (item == 'endoftoday')
      return moment().endOf('day').format('DD/MM/YYYY HH:mm');
    if (item == 'startofyesterday')
      return moment().startOf('day').subtract(1, 'days').format('DD/MM/YYYY HH:mm');
    if (item == 'endofyesterday')
      return moment().endOf('day').subtract(1, 'days').format('DD/MM/YYYY HH:mm');
    if (item == 'startofweek')
      return moment().startOf('week').format('DD/MM/YYYY HH:mm');
    if (item == 'startofmonth')
      return moment().startOf('month').format('DD/MM/YYYY HH:mm');
  }
  setVehicle(item) {
    try {
      this.setModalVisible(!this.state.modalVisible);
      this.setState({
        vehicle: item.license_plate, device: item
      }, () => {
        this.getReport();
      });
    } catch (error) {
      console.log();
    }
  }
  shortingBy(flag) {
    try {
      if (flag == "Today") {
        this.setState({ shorting: 1 })
      } else if (flag == "Yesterday") {
        this.setState({ shorting: 2 })
      } else if (flag == "Week") {
        this.setState({ shorting: 3 })
      } else if (flag == "Month") {
        this.setState({ shorting: 4 })
      }
    } catch (error) {

    }
  }
  render() {
    let { navigation } = this.props;
    let { report_data, vehicle, device, refreshing, shorting } = this.state;
    let devices = navigation.getParam("devices", null);
    // console.log('report_data22', report_data);
    // console.log('device1111', device);
    // console.log('report_data', report_data); 
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => { this.setModalVisible(!this.state.modalVisible) }}>
          <View
            style={{
              // paddingHorizontal: 15,
              // borderRadius: 20,
              width: '100%',
              height: '100%',
              // backgroundColor: '#00000040',
              backgroundColor: '#fff',
              // alignItems: 'center',
              // justifyContent: 'space-evenly', 
              alignSelf: 'center',
              // justifyContent: 'center',
              // paddingHorizontal:10,
              alignItems: 'center',
            }}>
            <View
              style={{
                height: '8%',
                width: '100%',
                backgroundColor: '#595959',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
              <View
                style={{
                  width: '70%',
                  height: '100%',
                  justifyContent: 'center',
                  paddingLeft: '5%',
                }}>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 22,
                    fontWeight: 'bold',
                    color: 'white',
                  }}>
                  Select Vehicle
             </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  this.setModalVisible(!this.state.modalVisible);
                }}
                style={{
                  marginRight: '2%',
                  width: '15%',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                }}>

                <Icon
                  name="close"
                  type="Ionicons"
                  size={30}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
            {
              devices.length > 0 &&
              <FlatList
                data={devices}
                style={{ paddingVertical: 5, alignSelf: 'center', width: '90%', marginTop: 15 }}
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.device_id.toString()}
                renderItem={({ item, index }) => {
                  return (
                    <TouchableOpacity onPress={() => { this.setVehicle(item) }}
                      style={{
                        width: '100%',
                        paddingVertical: 15,
                        borderRadius: 5,
                        alignSelf: 'center',
                      }}>
                      <Text style={{ color: '#333', fontSize: 16, fontWeight: 'bold' }}>{item.license_plate}</Text>
                    </TouchableOpacity>
                  );
                }}
                ItemSeparatorComponent={() => <View style={{ marginVertical: 5, height: 1, width: '100%', backgroundColor: 'gray' }} />}
              />
            }
          </View>
        </Modal>
        <TouchableOpacity
          onPress={() => { this.setModalVisible(!this.state.modalVisible) }}
          style={{ width: '100%', height: 50, alignItems: 'center' }}>
          <TextInput
            editable={false}
            value={vehicle}
            placeholder="Select Vehicle"
            placeholderTextColor={Colors.gray}
            style={{ width: '90%', height: 40, borderBottomWidth: 1, color: '#333' }}
          />
          <View
            onPress={() => {
              this.setModalVisible(!this.state.modalVisible);
            }}
            style={{
              height: 30,
              width: 30,
              backgroundColor: 'transparent',
              position: 'absolute',
              right: '5%',
              top: 5,
            }}>
            <BackIcon name="chevron-down" size={30} color='#333' />
          </View>
        </TouchableOpacity>

        <View
          style={{
            width: '100%',
            height: 50,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}>
          <TouchableOpacity
            onPress={() => {
              this.setRange('Today');
            }}
            style={{
              width: 80,
              height: 30,
              borderRadius: 15,
              // backgroundColor: Colors.yellow,
              backgroundColor: shorting == 1 ? Colors.red : Colors.yellow,
              // borderWidth: 2,
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontSize: 14,
                color: 'white',
                textAlign: 'center',
              }}>
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              this.setRange('Yesterday');
            }}
            style={{
              width: 80,
              height: 30,
              borderRadius: 15,
              // backgroundColor: Colors.yellow,
              backgroundColor: shorting == 2 ? Colors.red : Colors.yellow,
              // borderWidth: 2,
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontSize: 14,
                color: 'white',
                textAlign: 'center',
              }}>
              Yesterday
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              this.setRange('Week');
            }}
            style={{
              width: 80,
              height: 30,
              borderRadius: 15,
              // backgroundColor: Colors.yellow,
              backgroundColor: shorting == 3 ? Colors.red : Colors.yellow,
              // borderWidth: 2,
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontSize: 14,
                color: 'white',
                textAlign: 'center',
              }}>
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              this.setRange('Month');
            }}
            style={{
              width: 80,
              height: 30,
              borderRadius: 15,
              // backgroundColor: Colors.yellow,
              backgroundColor: shorting == 4 ? Colors.red : Colors.yellow,
              // borderWidth: 2,
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontSize: 14,
                color: 'white',
                textAlign: 'center',
              }}>
              Month
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            marginTop: 10,
            width: '100%',
            backgroundColor: 'white',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <TouchableOpacity onPress={() => this.showDateTimePicker('from_date')}
            style={{
              width: '40%',
              height: '100%',
              alignSelf: 'center',
            }}>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 16,
              }}>
              From Date
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 14,
                color: 'green',
              }}>
              {this.state.from_date}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.showDateTimePicker('to_date')}
            style={{
              width: '40%',
              height: '100%',
              alignSelf: 'center',
            }}>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 16,
              }}>
              To Date
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 14,
                color: 'red',
                marginLeft: 5
              }}>
              {this.state.to_date}
            </Text>
            <DateTimePicker
              mode={'datetime'}
              onConfirm={this.handleDatePicked}
              onCancel={this.hideDateTimePicker}
              maximumDate={new Date()}
              isVisible={this.state.isDateTimePickerVisible}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => this.getReport()}
            style={{
              width: '10%',
              height: '100%',
              alignSelf: 'center',
              alignItems: 'center',
              alignItems: 'flex-end',
            }}>
            <Icon
              name="search"
              type="Ionicons"
              size={30}
              color="black"
            />
          </TouchableOpacity>
        </View>

        {
          report_data.length > 0 &&
          <FlatList
            data={report_data}
            style={{ paddingVertical: 5 }}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60 }}
            refreshing={refreshing}
            onRefresh={() => this.getReport()}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity activeOpacity={0.70} onPress={() => NavigationService.navigate('homeStack', 'Playback', { device: device, params: { start_time: item.start_time, end_time: item.end_time } })}
                  style={{
                    marginTop: 20,
                    width: '90%',
                    // borderRadius: 5,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    alignSelf: 'center',
                    shadowColor: 'black',
                    shadowOpacity: 0.26,
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 10,
                    elevation: 5,
                    backgroundColor: 'white',
                  }}>
                  <View
                    style={{
                      width: '100%',
                      height: 40,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold'
                      }}>
                      {device.license_plate}
                    </Text>
                    {/* <View
                      style={{
                        height: 25, 
                        paddingHorizontal: 10, 
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={{
                          fontSize: 14,
                          color: '#333',
                          textAlign: 'center',
                        }}>
                        {moment(item.start_time).format('LL')} 
                      </Text>
                    </View> */}
                  </View>

                  <View style={{ width: '100%', flexDirection: 'row', paddingHorizontal: 10 }}>
                    <View
                      style={{
                        height: '100%',
                        width: '100%',
                      }}>
                      <View
                        style={{
                          width: '100%',
                          paddingVertical: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                          //  backgroundColor: 'green',
                        }}>
                        <View style={{ marginRight: 2 }}>
                          <Icon
                            name="clockcircleo"
                            type="antdesign"
                            size={20}
                            color="green"
                          />
                        </View>

                        <View
                          style={{ width: '90%', backgroundColor: 'transparent' }}>
                          <Text
                            style={{
                              paddingLeft: 10,
                              fontSize: 14,
                              color: 'gray',
                            }}>
                            {moment(item.start_time).format('DD MMMM YYYY hh:mm: A')}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          width: '100%',
                          paddingVertical: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                          //  backgroundColor: 'green',
                        }}>
                        <View style={{ marginRight: 2 }}>
                          <Icon
                            name="location-pin"
                            type="entypo"
                            size={25}
                            color="green"
                          />
                        </View>

                        <View
                          style={{ width: '90%', backgroundColor: 'transparent' }}>
                          <Text
                            style={{
                              paddingLeft: 10,
                              fontSize: 14,
                              color: 'gray',
                            }}>
                            {item.start_point}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          width: '100%',
                          paddingVertical: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <View style={{ marginRight: 2 }}>
                          <Icon
                            name="clockcircleo"
                            type="antdesign"
                            size={20}
                            color="red"
                          />
                        </View>
                        <View
                          style={{
                            width: '90%',
                          }}>
                          <Text
                            style={{
                              paddingLeft: 10,
                              fontSize: 14,
                              color: 'gray',
                            }}>
                            {moment(item.end_time).format('DD MMMM YYYY hh:mm: A')}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          width: '100%',
                          paddingVertical: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <View style={{ marginRight: 2 }}>
                          <Icon
                            name="location-pin"
                            type="entypo"
                            size={25}
                            color="red"
                          />
                        </View>

                        <View
                          style={{
                            width: '90%',
                          }}>
                          <Text
                            style={{
                              paddingLeft: 10,
                              fontSize: 14,
                              color: 'gray',
                            }}>
                            {item.end_point}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View
                    style={{
                      width: '100%',
                      marginBottom: 10,
                      flexDirection: 'row',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                    }}>
                    {/* <Text style={{ color: 'gray', paddingLeft: '5%' }}>
                      {Number(item.distance).toFixed(0) == 0 ? "" : item.distance + ' Kms'}
                    </Text> */}
                    <View style={{ justifyContent: 'center', alignItems: 'center', width: '30%' }}>
                      <RoadIcon name="road" size={24} color="#333" />
                      <Text style={{ fontSize: 14, color: 'black', fontWeight: 'bold', textAlign: 'center' }}>{item.distance} KMS</Text>
                    </View>
                    <View style={{ justifyContent: 'center', alignItems: 'center', width: '30%' }}>
                      <Icon name="clockcircleo" size={24} color="#333" type="antdesign" />
                      <Text style={{ fontSize: 14, color: 'black', fontWeight: 'bold', textAlign: 'center' }}>{this.getDuration(item.start_time, item.end_time)}</Text>
                    </View>
                    {/* <Text style={{ color: 'gray', paddingRight: '5%' }}>
                      Duration {this.getDuration(item.start_time, item.end_time)}
                    </Text> */}
                  </View>
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={{ height: 5, width: 10 }} />}
          />
        }

        <View
          style={{
            width: '100%',
            backgroundColor: 'gray',
            height: '6%',
            position: 'absolute',
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>
            Total Trips {report_data.length}
          </Text>

        </View>
        <Loader loading={this.state.isLoading} />
      </SafeAreaView>
    );
  }
}
