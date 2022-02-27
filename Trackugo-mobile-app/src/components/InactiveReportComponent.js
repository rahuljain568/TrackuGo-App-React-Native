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
  // componentDidMount() {
  //   try {
  //     let { navigation } = this.props;
  //     let device = navigation.getParam("device", null);
  //     this.setState({
  //       device: device, vehicle: device.license_plate
  //     }, () => {
  //       this.getReport();
  //     });
  //   } catch (error) {

  //   }
  // }
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
        console.log("content", content);
        this.setState({
          loading: false,
          isLoading: false, refreshing: false
        });
        if (content.report_data.length == 0) {
          alert("No trips are available!..")
          return;
        }
        let tmp = [];
        let temp = [];
        temp = content.report_data.filter(element => Number(element.distance) >= 1);
        console.log("asd", temp)
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
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 25, fontWeight: 'bold', color: '#333' }}>Coming Soon</Text> 
      </View>
    );
  }
}
