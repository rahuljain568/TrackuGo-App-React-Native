/**
 * Component to handle reports related operations.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity
} from 'react-native';

import { Icon } from 'react-native-elements';

import mainStyle from '../styles/main.style';
import reportStyle from '../styles/report.style';

import Colors from '../modules/colors.module';
import Icons from '../modules/icons.module';

import GeneralService from '../services/general.service';
import NavigationService from '../services/navigation.service';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class ReportMenuComponent extends Component {

  static navigationOptions = ({ navigation }) => {
    let params = navigation.state.params || {};

    return {
      headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
      ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
      headerTitle: (
        <View>
          <Text style={mainStyle.titleTextMain}>Reports</Text>
          <Text style={mainStyle.titleTextSub}>{params ? params.device.license_plate : null}</Text>
        </View>
      )
    };
  };

  constructor() {
    super();

    this.state = {
      device: null
    }
  }

  componentDidMount() {

    let { navigation } = this.props,
      device = navigation.getParam('device', null);

    this.props.navigation.setParams({ device: device });

    this.setState({ device: device });
  }

  render() {

    let { device } = this.state;
    let { navigation } = this.props;
    let devices = navigation.getParam("devices", null);
    return (
      <View style={mainStyle.body}>
        <View style={mainStyle.contentArea}>

          <View style={reportStyle.reportsRow}>
            <TouchableOpacity style={reportStyle.reportsRowItem} onPress={() => device ? NavigationService.navigate('homeStack', 'DistanceReport', { device: device, devices: devices }) : null}>
              <Image style={reportStyle.imageIcon} source={Icons.distance}></Image>
              <Text style={[reportStyle.reportItemText, mainStyle.fontmd]}>Distance</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity style={reportStyle.reportsRowItem} onPress={() => device ? NavigationService.navigate('homeStack', 'Reports', { device: device, report_type: 'Distance' }) : null}>
              <Image style={reportStyle.imageIcon} source={Icons.distance}></Image>
              <Text style={[reportStyle.reportItemText, mainStyle.fontmd]}>Distance</Text>
            </TouchableOpacity> */}
            {/* <TouchableOpacity style={reportStyle.reportsRowItem} onPress={() => device ? NavigationService.navigate('homeStack', 'Reports', { device: device, report_type: 'Trip', devices: devices }) : null}>
               <Icon name='road' type='font-awesome' size={50} color={Colors.black} />
               <Text style={[reportStyle.reportItemText, mainStyle.fontmd]}>Trip</Text>
             </TouchableOpacity> */}
            <TouchableOpacity style={reportStyle.reportsRowItem} onPress={() => device ? NavigationService.navigate('homeStack', 'TripReport', { device: device, devices: devices }) : null}>
              <Icon name='road' type='font-awesome' size={50} color={Colors.black} />
              <Text style={[reportStyle.reportItemText, mainStyle.fontmd]}>Trip</Text>
            </TouchableOpacity>
          </View>
          <View style={reportStyle.reportsRow}>
            <TouchableOpacity style={reportStyle.reportsRowItem} onPress={() => device ? NavigationService.navigate('homeStack', 'DetailedReport', { device: device, devices: devices }) : null}>
              <Image style={reportStyle.imageIcon} source={Icons.detailed}></Image>
              <Text style={[reportStyle.reportItemText, mainStyle.fontmd]}>Detailed</Text>
            </TouchableOpacity>
            <TouchableOpacity style={reportStyle.reportsRowItem} onPress={() => device ? NavigationService.navigate('homeStack', 'DailyReport', { device: device, devices: devices }) : null}>
              <Icon name='history' type='font-awesome' size={50} color={Colors.yellow} />
              <Text style={[reportStyle.reportItemText, mainStyle.fontmd]}>Daily Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={reportStyle.reportsRowItem} onPress={() => device ? NavigationService.navigate('homeStack', 'DailyReportSummery', { device: device, devices: devices }) : null}>
              <Icon name='history' type='font-awesome' size={50} color={Colors.black} />
              <Text style={[reportStyle.reportItemText, mainStyle.fontmd]}>Summery Report</Text>
            </TouchableOpacity>
          </View>
          <View style={reportStyle.reportsRow}>
            {/* <TouchableOpacity style={reportStyle.reportsRowItem} onPress={() => device ? NavigationService.navigate('homeStack', 'Reports', { device: device, report_type: 'Stoppage' }) : null}>
               <Icon name='stop-circle' type='font-awesome' size={50} color={Colors.red} />
               <Text style={[reportStyle.reportItemText, mainStyle.fontmd]}>Stoppage</Text>
             </TouchableOpacity> */}
            {/* <TouchableOpacity style={reportStyle.reportsRowItem} onPress={() => device ? NavigationService.navigate('homeStack', 'Reports', { device: device, report_type: 'Idle' }) : null}>
               <Icon name='clock-o' type='font-awesome' size={50} color={Colors.yellow} />
               <Text style={[reportStyle.reportItemText, mainStyle.fontmd]}>Idle</Text>
             </TouchableOpacity> */}
            <TouchableOpacity style={reportStyle.reportsRowItem} onPress={() => device ? NavigationService.navigate('homeStack', 'StopageReport', { device: device, devices: devices }) : null}>
            <Icon name='stop-circle' type='font-awesome' size={50} color={Colors.red} />
              <Text style={[reportStyle.reportItemText, mainStyle.fontmd]}>Stoppage</Text>
            </TouchableOpacity>
            <TouchableOpacity style={reportStyle.reportsRowItem} onPress={() => device ? NavigationService.navigate('homeStack', 'IdleReport', { device: device, devices: devices }) : null}>
              <Icon name='clock-o' type='font-awesome' size={50} color={Colors.yellow} />
              <Text style={[reportStyle.reportItemText, mainStyle.fontmd]}>Idle</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity style={reportStyle.reportsRowItem} onPress={() => device ? NavigationService.navigate('homeStack', 'Reports', { device: device, report_type: 'Detailed' }) : null}>
              <Image style={reportStyle.imageIcon} source={Icons.detailed}></Image>
              <Text style={[reportStyle.reportItemText, mainStyle.fontmd]}>Detailed</Text>
            </TouchableOpacity> */}
          </View>

          <View style={reportStyle.reportsRow}>
            <TouchableOpacity style={reportStyle.reportsRowItem} onPress={() => device ? NavigationService.navigate('homeStack', 'Playback', { device: device }) : null}>
              <Icon name='history' type='font-awesome' size={50} color={Colors.blue} />
              <Text style={[reportStyle.reportItemText, mainStyle.fontmd]}>Playback</Text>
            </TouchableOpacity>
            <TouchableOpacity style={reportStyle.reportsRowItem} onPress={() => device ? GeneralService.openMapApp(device.location.coordinates[1], device.location.coordinates[0]) : null}>
              <Icon name='directions' type='font-awesome-5' size={50} color={Colors.red} />
              <Text style={[reportStyle.reportItemText, mainStyle.fontmd]}>Navigate</Text>
            </TouchableOpacity> 
            <TouchableOpacity style={reportStyle.reportsRowItem} onPress={() => device ? NavigationService.navigate('homeStack', 'InactiveReport', { device: device, devices: devices }) : null}>
              <Icon name='stop-circle' type='font-awesome' size={50} color={Colors.black} />
              <Text style={[reportStyle.reportItemText, mainStyle.fontmd]}>Inactive Report</Text>
            </TouchableOpacity>
          </View>
          

        </View>
      </View>
    );
  };
}