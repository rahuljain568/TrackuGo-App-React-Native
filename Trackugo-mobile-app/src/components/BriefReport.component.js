/**
 * Component to handle reports related operations.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  TextInput,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ToastAndroid
} from 'react-native';

import { Icon } from 'react-native-elements';
import DateTimePicker from "react-native-modal-datetime-picker";

import ButtonComponent from './partials/Button.component';

import UriConfig from '../config/uri.config';

import mainStyle from '../styles/main.style';
import reportStyle from '../styles/report.style';

import Loader from '../modules/loader.module';
import Colors from '../modules/colors.module';
import Icons from '../modules/icons.module';

import ApiService from '../services/api.service';
import GeneralService from '../services/general.service';
import NavigationService from '../services/navigation.service';

import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class BriefReportComponent extends Component {

  static navigationOptions = ({ navigation }) => {
    let params = navigation.state.params || {};

    return {
      headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
      ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
      headerTitle: (
        <View>
          <Text style={mainStyle.titleTextMain}>Report</Text>
          <Text style={mainStyle.titleTextSub}>{params ? params.device.license_plate : null}</Text>
        </View>
      ),
      headerRight: (
        <TouchableOpacity style={mainStyle.pad10} onPress={() => params ? params.toggleModal() : null}>
          <Image source={Icons.controls} />
        </TouchableOpacity>
      )
    };
  };

  constructor() {
    super();

    this.state = {
      loading: false,
      tabSelected: 'today',

      from_date: GeneralService.dateFormat(null, 'd/m/Y') + " 00:00",
      to_date: GeneralService.dateFormat(new Date(), 'd/m/Y H:i'),
      errors: {
        from_date: false,
        to_date: false
      },
      current_picker: null,

      isModalVisible: false,

      values: []
    };
  }

  componentDidMount() {

    let { navigation } = this.props,
      device = navigation.getParam('device', null);

    this.props.navigation.setParams({
      device: device,
      toggleModal: this.toggleModal
    });

    this.setState({
      device: device
    }, () => {
      this.getReport();
    });

  }

  toggleModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible });
  }

  onInput = (value, name) => {
    this.setState({ values: { ...this.state.values, [name]: value } });
  }

  showDateTimePicker = (pickerElement) => {
    this.setState({
      current_picker: pickerElement,
      isDateTimePickerVisible: true
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

  tabSelect = (tab) => {
    this.setState({
      tabSelected: tab,
      content: null
    }, () => {
      if (tab.toLowerCase() != 'custom') {
        this.getReport();
      }
    });
  }

  getReport = () => {

    let { device, from_date, to_date, tabSelected } = this.state,
      fromDate = null,
      toDate = null;

    switch (tabSelected.toLowerCase()) {

      case "yesterday":
        fromDate = GeneralService.dateModify(null, '-1 DAY', 'Y-m-d') + " 00:00:00";
        toDate = GeneralService.dateFormat(null, 'Y-m-d') + " 00:00:00";
        break;

      case "week":
        fromDate = GeneralService.dateModify(null, '-7 DAY', 'Y-m-d') + " 00:00:00";
        toDate = GeneralService.dateFormat(null, 'Y-m-d') + " 00:00:00";
        break;

      case "custom":
        fromDate = GeneralService.dateFormat(GeneralService.correctDate(from_date + ":00"), 'Y-m-d H:i:s');
        toDate = GeneralService.dateFormat(GeneralService.correctDate(to_date + ":00"), 'Y-m-d H:i:s');
        break;

      default:
        fromDate = GeneralService.dateFormat(null, 'Y-m-d') + " 00:00:00";
        toDate = GeneralService.dateFormat(new Date(), 'Y-m-d H:i:s');
        break;
    }

    let params = {
      from_date: fromDate,
      to_date: toDate,
      offset: new Date().getTimezoneOffset()
    };
    this.setState({
      loading: true,
      content: null,
      from_date: fromDate,
      to_date: toDate,
    });

    ApiService.call('post', UriConfig.uri.REPORT_CONSOLIDATED + "/" + device._id, params, (content) => {

      this.setState({
        loading: false,
        content: content
      });
console.log('content',content);
    }, (error, errors, content) => {
      this.setState({ loading: false });
    });
  }

  saveFuelSettings = () => {
    let { device, values } = this.state;

    this.setState({ loading: true });

    ApiService.call('post', UriConfig.uri.DEVICE_FUEL_SETTINGS + "/" + device._id, values, (content, status) => {

      ToastAndroid.show(status.message, ToastAndroid.SHORT)

      this.setState({
        loading: false,
        isModalVisible: false
      });

    }, (error, errors, content) => {
      this.setState({ loading: false });
    });
  }

  render() {

    let { tabSelected, content, isModalVisible, values, device, from_date, to_date } = this.state,
      mileage = values.mileage || (device ? device.mileage : 0),
      fuelPrice = values.fuel_price || (device ? device.fuel_price : 0),
      fuelCousumed = parseFloat(content && mileage > 0 ? content.total_distance / mileage : 0).toFixed(2),
      fuelCost = parseFloat(fuelCousumed * fuelPrice).toFixed(2);

    return (

      <View style={mainStyle.body}>

        <Loader loading={this.state.loading} />
        <View style={mainStyle.contentArea}>

          {
            device &&

            <TouchableWithoutFeedback onPress={() => { }}>
              <Modal
                transparent={true}
                animationType={'none'}
                onRequestClose={() => this.toggleModal()}
                visible={isModalVisible}>
                <View style={mainStyle.modalBackground}>
                  <View style={mainStyle.modalForm}>

                    <View style={mainStyle.formBody}>

                      <Text style={[mainStyle.textxl, mainStyle.marginBottom10, mainStyle.fontmd, mainStyle.whiteText]}>Fuel Settings</Text>

                      <View style={mainStyle.formInput}>
                        <TextInput
                          style={[mainStyle.formInputField, mainStyle.whiteText]}
                          value={"" + (fuelPrice || "")}
                          onChangeText={(value) => this.onInput(value, 'fuel_price')}
                          placeholder="Fuel Price"
                          keyboardType="numeric"
                          placeholderTextColor={Colors.theme.lightText}
                        />
                      </View>

                      <View style={mainStyle.formInput}>
                        <TextInput
                          style={[mainStyle.formInputField, mainStyle.whiteText]}
                          value={"" + (mileage || "")}
                          onChangeText={(value) => this.onInput(value, 'mileage')}
                          placeholder="Mileage"
                          keyboardType="numeric"
                          placeholderTextColor={Colors.theme.lightText}
                        />
                      </View>

                      <View style={mainStyle.formInput}>
                        <TextInput
                          style={[mainStyle.formInputField, mainStyle.whiteText]}
                          value={values.fuel_type || device.fuel_type || ""}
                          onChangeText={(value) => this.onInput(value, 'fuel_type')}
                          placeholder="Fuel Type (Diesel, Petrol)"
                          keyboardType="numeric"
                          placeholderTextColor={Colors.theme.lightText}
                        />
                      </View>

                      <ButtonComponent text="Save" onClick={this.saveFuelSettings.bind(this)} />

                    </View>
                  </View>
                </View>
              </Modal>
            </TouchableWithoutFeedback>
          }

          <View style={reportStyle.tabs}>
            <Text style={[reportStyle.tab, mainStyle.fontmd, tabSelected == "today" ? reportStyle.tabActive : null]} onPress={() => this.tabSelect('today')}>Today</Text>
            <Text style={[reportStyle.tab, mainStyle.fontmd, tabSelected == "yesterday" ? reportStyle.tabActive : null]} onPress={() => this.tabSelect('yesterday')}>Yesterday</Text>
            <Text style={[reportStyle.tab, mainStyle.fontmd, tabSelected == "week" ? reportStyle.tabActive : null]} onPress={() => this.tabSelect('week')}>Last Week</Text>
            <Text style={[reportStyle.tab, mainStyle.fontmd, tabSelected == "custom" ? reportStyle.tabActive : null]} onPress={() => this.tabSelect('custom')}>Custom</Text>
          </View>
          <ScrollView>

            {
              tabSelected == "custom" &&
              <View style={mainStyle.formBody}>

                <TouchableOpacity onPress={() => this.showDateTimePicker('from_date')}>
                  <TextInput
                    editable={false}
                    value={this.state.from_date}
                    style={[mainStyle.formInput, this.state.errors.from_date ? mainStyle.inputError : null]} placeholder="From Date Time"
                    placeholderTextColor={this.state.errors.from_date ? "red" : null}
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => this.showDateTimePicker('to_date')}>
                  <TextInput
                    editable={false}
                    value={this.state.to_date}
                    style={[mainStyle.formInput, this.state.errors.to_date ? mainStyle.inputError : null]} placeholder="To Date Time"
                    placeholderTextColor={this.state.errors.to_date ? "red" : null}
                  />
                </TouchableOpacity>

                <DateTimePicker
                  mode={'datetime'}
                  onConfirm={this.handleDatePicked}
                  onCancel={this.hideDateTimePicker}
                  maximumDate={new Date()}
                  isVisible={this.state.isDateTimePickerVisible}
                />

                <ButtonComponent text="Proceed" onClick={this.getReport.bind(this)} />
              </View>
            }

            {
              content &&
              <View style={{ paddingBottom: 50 }}>

                <View style={reportStyle.reportsRow}>
                  <TouchableOpacity style={[reportStyle.reportsRowItem2, reportStyle.leftItem]} onPress={() => NavigationService.navigate('homeStack', 'Playback', { device: device, params: { start_time: from_date, end_time: to_date } })}>
                    <Text style={[mainStyle.textnm, mainStyle.fontrg, mainStyle.marginBottom5]}>Distance Travelled</Text>
                    <Text style={[mainStyle.textlg, mainStyle.fontmd]}>{content.total_distance} kms</Text>
                    <Image source={Icons.distance} style={reportStyle.reportItemIcon} />
                  </TouchableOpacity>
                  <View style={reportStyle.reportsRowItem2}>
                    <Text style={[mainStyle.textnm, mainStyle.fontrg, mainStyle.marginBottom5]}>Average Speed</Text>
                    <Text style={[mainStyle.textlg, mainStyle.fontmd]}>{content.average_speed} km/h</Text>
                    <Image source={Icons.speedometer} style={reportStyle.reportItemIcon} />
                  </View>
                </View>

                <View style={reportStyle.reportsRow}>
                  <View style={[reportStyle.reportsRowItem2, reportStyle.leftItem]}>
                    <Text style={[mainStyle.textnm, mainStyle.fontrg, mainStyle.marginBottom5]}>Max Speed</Text>
                    <Text style={[mainStyle.textlg, mainStyle.fontmd]}>{content.max_speed} km/h</Text>

                    <View style={reportStyle.reportItemIcon}>
                      <Icon name='bolt' type='font-awesome' size={35} color={Colors.red} />
                    </View>
                  </View>
                  <View style={reportStyle.reportsRowItem2}>
                    <Text style={[mainStyle.textnm, mainStyle.fontrg, mainStyle.marginBottom5]}>Engine On Time</Text>
                    <Text style={[mainStyle.textlg, mainStyle.fontmd]}>{content.engine_on_time}</Text>

                    <Image source={Icons.engine} style={reportStyle.reportItemIcon} />
                  </View>
                </View>

                <View style={reportStyle.reportsRow}>
                  <View style={[reportStyle.reportsRowItem2, reportStyle.leftItem]}>
                    <Text style={[mainStyle.textnm, mainStyle.fontrg, mainStyle.marginBottom5]}>Stoppage Time</Text>
                    <Text style={[mainStyle.textlg, mainStyle.fontmd]}>{content.stoppage_time}</Text>

                    <View style={reportStyle.reportItemIcon}>
                      <Icon name='clock-o' type='font-awesome' size={35} color={Colors.red} />
                    </View>
                  </View>
                  <TouchableOpacity style={reportStyle.reportsRowItem2} onPress={() => NavigationService.navigate('homeStack', 'Playback', { device: device, params: { start_time: from_date, end_time: to_date } })}>
                    <Text style={[mainStyle.textnm, mainStyle.fontrg, mainStyle.marginBottom5]}>Number of Stops</Text>
                    <Text style={[mainStyle.textlg, mainStyle.fontmd]}>{content.stoppage_count}</Text>
                    <Image source={Icons.stopHand} style={reportStyle.reportItemIcon} />
                  </TouchableOpacity>
                </View>

                <View style={reportStyle.reportsRow}>
                  <View style={[reportStyle.reportsRowItem2, reportStyle.leftItem]}>
                    <Text style={[mainStyle.textnm, mainStyle.fontrg, mainStyle.marginBottom5]}>Fuel Consumed</Text>
                    <Text style={[mainStyle.textlg, mainStyle.fontmd]}>{fuelCousumed} ltr</Text>
                    <Image source={Icons.fuel1} style={reportStyle.reportItemIcon} />
                  </View>
                  <View style={reportStyle.reportsRowItem2}>
                    <Text style={[mainStyle.textnm, mainStyle.fontrg, mainStyle.marginBottom5]}>Fuel Cost</Text>
                    <Text style={[mainStyle.textlg, mainStyle.fontmd]}>{GeneralService.amountString(fuelCost)}</Text>
                    <Image source={Icons.fuel2} style={reportStyle.reportItemIcon} />
                  </View>
                </View>

              </View>

            }

          </ScrollView>
        </View>
      </View>
    );
  };
}