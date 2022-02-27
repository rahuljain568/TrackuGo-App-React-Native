/**
 * Component to handle reports related operations.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';

import { Icon } from 'react-native-elements';
import DateTimePicker from "react-native-modal-datetime-picker";

import ButtonComponent from '../components/partials/Button.component';

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

export default class ReportsComponent extends Component {

  static navigationOptions = ({ navigation }) => {
    let params = navigation.state.params || {};

    return {
      headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
      ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
      headerTitle: (
        <View>
          <Text style={mainStyle.titleTextMain}>{params.report_type || null} Report</Text>
          <Text style={mainStyle.titleTextSub}>{params ? params.device.license_plate : null}</Text>
        </View>
      )
    };
  };

  constructor() {
    super();

    this.state = {
      report: null,
      device: null,
      loading: false,

      from_date: GeneralService.dateFormat(null, 'd/m/Y') + " 00:00",
      to_date: GeneralService.dateFormat(new Date(), 'd/m/Y H:i'),
      errors: {
        from_date: false,
        to_date: false
      },
      current_picker: null,
    };
  }

  componentDidMount() {

    let { navigation } = this.props,
      device = navigation.getParam('device', null),
      reportType = navigation.getParam('report_type', null);

    this.props.navigation.setParams({
      device: device,
      report_type: reportType,
      toggleForm: this.toggleForm
    });

    this.setState({
      device: device,
      report: {
        report_type: reportType.toUpperCase()
      }
    });

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

  getReport = () => {

    let { report, device, from_date, to_date } = this.state,
      reportType = report.report_type;

    let params = {
      from_date: GeneralService.dateFormat(GeneralService.correctDate(from_date + ":00"), 'Y-m-d H:i:s'),
      to_date: GeneralService.dateFormat(GeneralService.correctDate(to_date + ":00"), 'Y-m-d H:i:s'),
      offset: new Date().getTimezoneOffset()
    },
      uri = null;

    switch (reportType) {
      case 'DETAILED':
        uri = UriConfig.uri.REPORT_DETAILED;
        break;
      case 'TRIP':
        uri = UriConfig.uri.REPORT_TRIP;
        break;
      case 'IDLE':
        uri = UriConfig.uri.REPORT_IDLE;
        break;
      case 'STOPPAGE':
        uri = UriConfig.uri.REPORT_STOPPAGE;
        break;
      case 'DISTANCE':
        uri = UriConfig.uri.REPORT_DISTANCE;
        break;

      default:
        return false;
    }

    this.setState({
      loading: true,
      content: null
    });

    ApiService.call('post', uri + "/" + device._id, params, (content) => {

      this.setState({
        loading: false,
        content: content
      });

    }, (error, errors, content) => {
      this.setState({ loading: false });
    });
  }

  renderReportComponent = () => {
    let { content, report, device } = this.state;

    let { navigation } = this.props;
    let devices = navigation.getParam("devices", null);

    if (content) {
      switch (report.report_type) {
        case 'DETAILED':
          return (
            <DetailedReportComponent content={content} device={device} />
          );
        case 'TRIP':
          return (
            <TripReportComponent content={content} device={device} />
          );
        case 'IDLE':
          return (
            <IdleReportComponent content={content} device={device} />
          );
        case 'STOPPAGE':
          return (
            <StoppageReportComponent content={content} device={device} />
          );

        case 'DISTANCE':
          return (
            <DistanceReportComponent content={content} device={device} />
          );

        default:
          return (
            <View style={mainStyle.itemsCenter}>
              <Text style={mainStyle.fontrg}>Invalid Report Type.</Text>
            </View>
          );
      }
    }
  }

  render() {

    return (
      <SafeAreaView>
        <ScrollView>
          <View style={mainStyle.body}>
            <Loader loading={this.state.loading} />
            <View style={mainStyle.contentArea}>

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

              {this.renderReportComponent()}

            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };
}

class DistanceReportComponent extends Component {

  render() {

    let { content, device } = this.props,
      reportData = content.report_data || null,
      keys = reportData ? Object.keys(reportData) : [];

    return (
      <View>
        {
          keys.map((key) => {

            let distance = reportData[key];

            return (
              <View style={reportStyle.infoRow} key={"distance" + key}>
                <View style={mainStyle.itemsCenter}>
                  <Image style={reportStyle.imageIconSm} source={Icons.distance} />

                  <View style={mainStyle.dividerVertical}>
                    <View style={mainStyle.dividerVerticalInner} />
                  </View>
                </View>

                <View style={reportStyle.infoBlock}>

                  <TouchableOpacity style={mainStyle.flexRow} onPress={() => NavigationService.navigate('homeStack', 'Playback', { device: device, params: { date: key } })}>
                    <Text style={[mainStyle.textlg, mainStyle.fontbl, mainStyle.marginBottom10, mainStyle.blueText]}>{GeneralService.dateFormat(key, 'd M Y')} </Text>
                    <Icon name='angle-right' type='font-awesome' color={Colors.blue} size={20} />
                  </TouchableOpacity>

                  <View style={mainStyle.itemsCenter}>
                    <Icon name='road' type='font-awesome' size={20} />
                    <Text style={mainStyle.fontmd}>{parseFloat(distance).toFixed(2)} kms</Text>
                  </View>
                </View>
              </View>
            )
          })

        }

        {
          content && keys.length <= 0 &&
          <View style={mainStyle.itemsCenter}>
            <Text style={mainStyle.fontrg}>No Record Found.</Text>
          </View>
        }

      </View>
    );
  };
}

class TripReportComponent extends Component {

  render() {

    let { content, device } = this.props;

    return (
      <View>
        {
          content.report_data && content.report_data.length > 0 ?
            (content.report_data.map((record) => {
              return (
                <View style={reportStyle.infoRow} key={record.id}>
                  <View style={mainStyle.itemsCenter}>
                    <Icon name='road' type='font-awesome' size={20} color={Colors.green} />
                    <View style={mainStyle.dividerVertical}>
                      <View style={mainStyle.dividerVerticalInner} />
                    </View>
                  </View>
                  <View style={reportStyle.infoBlock}>

                    <TouchableOpacity style={mainStyle.flexRow} onPress={() => NavigationService.navigate('homeStack', 'Playback', { device: device, params: { start_time: record.start_time, end_time: record.end_time } })}>
                      <Text style={[mainStyle.textlg, mainStyle.fontbl, mainStyle.marginBottom10, mainStyle.blueText]}>Trip {record.id} - {record.distance} kms </Text>
                      <Icon name='angle-right' type='font-awesome' color={Colors.blue} size={20} />
                    </TouchableOpacity>

                    <Text style={[mainStyle.fontrg, mainStyle.marginBottom5]}>
                      <Text style={mainStyle.fontmd}>{GeneralService.dateFormat(record.start_time, 'h:i A, d/m/y')}</Text>  {record.start_point}
                    </Text>
                    <Text style={mainStyle.fontrg}>
                      <Text style={mainStyle.fontmd}>{GeneralService.dateFormat(record.end_time, 'h:i A, d/m/y')}</Text>  {record.end_point}
                    </Text>
                  </View>
                </View>
              )
            })
            ) : (
              <View style={mainStyle.itemsCenter}>
                <Text style={mainStyle.fontrg}>No Record Found.</Text>
              </View>
            )
        }

      </View>
    );
  };
}

class StoppageReportComponent extends Component {

  render() {

    let { content, device } = this.props;

    return (
      <View>
        {
          content.report_data && content.report_data.length > 0 ?
            (content.report_data.map((record) => {
              return (
                <View style={reportStyle.infoRow} key={record.id}>
                  <View style={mainStyle.itemsCenter}>
                    <Icon name='stop-circle' type='font-awesome' size={20} color={Colors.red} />
                    <View style={mainStyle.dividerVertical}>
                      <View style={mainStyle.dividerVerticalInner} />
                    </View>
                  </View>
                  <View style={reportStyle.infoBlock}>

                    <TouchableOpacity style={mainStyle.flexRow} onPress={() => NavigationService.navigate('homeStack', 'MapView', { device: device, record: record, type: "stoppage" })}>
                      <Text style={[mainStyle.textlg, mainStyle.fontbl, mainStyle.marginBottom10, mainStyle.blueText]}>Stoppage {record.id} - {record.stoppage_time} </Text>
                      <Icon name='angle-right' type='font-awesome' color={Colors.blue} size={20} />
                    </TouchableOpacity>

                    <Text style={[mainStyle.fontrg, mainStyle.marginBottom5]}>{GeneralService.dateFormat(record.start_time, 'h:i A, d/m/y')} to {GeneralService.dateFormat(record.end_time, 'h:i A, d/m/y')}</Text>
                    <Text style={mainStyle.fontrg}>{record.address}</Text>
                  </View>
                </View>
              )
            })
            ) : (
              <View style={mainStyle.itemsCenter}>
                <Text style={mainStyle.fontrg}>No Record Found.</Text>
              </View>
            )
        }

      </View>
    );
  };
}

class IdleReportComponent extends Component {

  render() {

    let { content, device } = this.props;

    return (
      <View>
        {
          content.report_data && content.report_data.length > 0 ?
            (content.report_data.map((record) => {
              return (
                <View style={reportStyle.infoRow} key={record.id}>
                  <View style={mainStyle.itemsCenter}>
                    <Icon name='clock-o' type='font-awesome' size={20} color={Colors.yellow} />
                    <View style={mainStyle.dividerVertical}>
                      <View style={mainStyle.dividerVerticalInner} />
                    </View>
                  </View>

                  <View style={reportStyle.infoBlock}>

                    <TouchableOpacity style={mainStyle.flexRow} onPress={() => NavigationService.navigate('homeStack', 'MapView', { device: device, record: record, type: "idle" })}>
                      <Text style={[mainStyle.textlg, mainStyle.fontbl, mainStyle.marginBottom10, mainStyle.blueText]}>Idle {record.id} - {record.idle_time} </Text>
                      <Icon name='angle-right' type='font-awesome' color={Colors.blue} size={20} />
                    </TouchableOpacity>

                    <Text style={[mainStyle.fontrg, mainStyle.marginBottom5]}>{GeneralService.dateFormat(record.start_time, 'h:i A, d/m/y')} to {GeneralService.dateFormat(record.end_time, 'h:i A, d/m/y')}</Text>
                    <Text style={mainStyle.fontrg}>{record.address}</Text>
                  </View>
                </View>
              )
            })
            ) : (
              <View style={mainStyle.itemsCenter}>
                <Text style={mainStyle.fontrg}>No Record Found.</Text>
              </View>
            )
        }

      </View>
    );
  };
}

class DetailedReportComponent extends Component {

  render() {

    let { content, device } = this.props;

    return (

      <View>

        <View style={reportStyle.infoBlock}>
          <Text style={[mainStyle.fontrg, mainStyle.marginBottom5]}>
            Start Address:  <Text style={mainStyle.fontmd}>{content.start_point}</Text>
          </Text>
          <Text style={[mainStyle.fontrg, mainStyle.marginBottom5]}>
            End Address:  <Text style={mainStyle.fontmd}>{content.end_point}</Text>
          </Text>
        </View>

        <View style={mainStyle.divider} />

        <View style={reportStyle.iconsSection}>
          <View style={[mainStyle.flexOne, mainStyle.itemsCenter, mainStyle.borderRight]}>
            <Icon name='road' type='font-awesome' size={20} />
            <Text style={[mainStyle.textCenter, mainStyle.fontmd]}>{content.total_distance} kms</Text>
            <Text style={[mainStyle.textCenter, mainStyle.fontrg]}>Distance</Text>
          </View>
          <View style={[mainStyle.flexOne, mainStyle.itemsCenter]}>
            <Icon name='clock-o' type='font-awesome' size={20} color={Colors.blue} />
            <Text style={[mainStyle.textCenter, mainStyle.fontmd]}>{content.total_time}</Text>
            <Text style={[mainStyle.textCenter, mainStyle.fontrg]}>Total Time</Text>
          </View>
        </View>
        <View style={mainStyle.divider} />
        <View style={reportStyle.iconsSection}>
          <View style={[mainStyle.flexOne, mainStyle.itemsCenter, mainStyle.borderRight]}>
            <Icon name='sun-o' type='font-awesome' size={20} color={Colors.green} />
            <Text style={[mainStyle.textCenter, mainStyle.fontmd]}>{content.running_time || "--"}</Text>
            <Text style={[mainStyle.textCenter, mainStyle.fontrg]}>Running Time</Text>
          </View>
          <View style={[mainStyle.flexOne, mainStyle.itemsCenter, mainStyle.borderRight]}>
            <Icon name='fire' type='font-awesome' size={20} color={Colors.yellow} />
            <Text style={[mainStyle.textCenter, mainStyle.fontmd]}>{content.idle_time || "--"}</Text>
            <Text style={[mainStyle.textCenter, mainStyle.fontrg]}>Idle Time</Text>
          </View>
          <View style={[mainStyle.flexOne, mainStyle.itemsCenter]}>
            <Icon name='stop-circle' type='font-awesome' size={20} color={Colors.red} />
            <Text style={[mainStyle.textCenter, mainStyle.fontmd]}>{content.stoppage_time || "--"}</Text>
            <Text style={[mainStyle.textCenter, mainStyle.fontrg]}>Stoppage Time</Text>
          </View>
        </View>

        <View style={mainStyle.dividerWithMargin} />

        <TouchableOpacity style={[mainStyle.flexRow, mainStyle.justifyCenter]} onPress={() => NavigationService.navigate('homeStack', 'Playback', { device: device, params: { start_time: content.start_time, end_time: content.end_time } })}>
          <Icon name='map' type='font-awesome' size={20} color={Colors.blue} />
          <Text style={[mainStyle.fontmd, mainStyle.textlg]}> View on Map</Text>
        </TouchableOpacity>

      </View>
    );
  };
}

