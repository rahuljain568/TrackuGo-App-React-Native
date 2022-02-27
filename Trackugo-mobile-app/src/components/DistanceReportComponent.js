import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList, ScrollView, TextInput, Modal, Image } from 'react-native';
// import { Input } from 'react-native-elements';
// import Icon from 'react-native-vector-icons/Entypo'
import SearchIcon from 'react-native-vector-icons/AntDesign'
import DeleteIcon from 'react-native-vector-icons/MaterialIcons'
import ShareIcon from 'react-native-vector-icons/FontAwesome'
import CopyIcon from 'react-native-vector-icons/Ionicons'
import BackIcon from "react-native-vector-icons/Entypo"
import VoiceIcon from 'react-native-vector-icons/MaterialIcons'
import CarIcon from 'react-native-vector-icons/Fontisto'
import RoadIcon from 'react-native-vector-icons/FontAwesome'
import BedIcon from 'react-native-vector-icons/FontAwesome'
import LocationIcon from 'react-native-vector-icons/Entypo'
import ClockIcon from 'react-native-vector-icons/AntDesign'
import RightIcon from 'react-native-vector-icons/AntDesign'
import { Icon } from 'react-native-elements';
import Colors from '../modules/colors.module';
import mainStyle from '../styles/main.style';
import Icons from '../modules/icons.module';

import moment from 'moment';
import UriConfig from '../config/uri.config';
import Loader from '../modules/loader.module';
import NavigationService from '../services/navigation.service';
import ApiService from '../services/api.service';
import GeneralService from '../services/general.service';
import DateTimePicker from "react-native-modal-datetime-picker";
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class DistanceReportComponent extends React.Component {
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
            current_picker: null, isLoading: false,
            deviceDetails: null, shorting: 0
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
            // this.getReportDetails(device, fromDate, toDate);
            let params = {
                from_date: GeneralService.dateFormat(GeneralService.correctDate(fromDate + ":00"), 'Y-m-d H:i:s'),
                to_date: GeneralService.dateFormat(GeneralService.correctDate(toDate + ":00"), 'Y-m-d H:i:s'),
                offset: new Date().getTimezoneOffset()
            },
                uri = UriConfig.uri.REPORT_DISTANCE;

            this.setState({
                loading: true,
                content: null
            });
           console.log('post', uri + "/" + device._id, params);
                ApiService.call('post', uri + "/" + device._id, params, (content) => {
                console.log("content", content);
                this.setState({
                    loading: false,
                    report_data: content.report_data,
                    isLoading: false, refreshing: false
                });
                if (content.report_data.length == 0) {
                    alert("No data available..");
                }
            }, (error, errors, content) => {
                this.setState({ loading: false, refreshing: false });
            });
        } catch (error) {
            console.log(error);
        }
    }

    getReportDetails = (device, from_date, to_date) => {

        let fromDate = null, toDate = null;

        // let { device, from_date, to_date, tabSelected } = this.state;
        // switch (tabSelected.toLowerCase()) { 
        //     case "yesterday":
        //         fromDate = GeneralService.dateModify(null, '-1 DAY', 'Y-m-d') + " 00:00:00";
        //         toDate = GeneralService.dateFormat(null, 'Y-m-d') + " 00:00:00";
        //         break; 
        //     case "week":
        //         fromDate = GeneralService.dateModify(null, '-7 DAY', 'Y-m-d') + " 00:00:00";
        //         toDate = GeneralService.dateFormat(null, 'Y-m-d') + " 00:00:00";
        //         break; 
        //     case "custom":
        //         fromDate = GeneralService.dateFormat(GeneralService.correctDate(from_date + ":00"), 'Y-m-d H:i:s');
        //         toDate = GeneralService.dateFormat(GeneralService.correctDate(to_date + ":00"), 'Y-m-d H:i:s');
        //         break;  
        //     default:
        //         fromDate = GeneralService.dateFormat(null, 'Y-m-d') + " 00:00:00";
        //         toDate = GeneralService.dateFormat(new Date(), 'Y-m-d H:i:s');
        //         break;
        // }

        fromDate = GeneralService.dateFormat(GeneralService.correctDate(from_date + ":00"), 'Y-m-d H:i:s');
        toDate = GeneralService.dateFormat(GeneralService.correctDate(to_date + ":00"), 'Y-m-d H:i:s');

        let params = {
            from_date: fromDate,
            to_date: toDate,
            offset: new Date().getTimezoneOffset()
        };
        this.setState({
            loading: true,
            deviceDetails: null,
            // from_date: fromDate,
            // to_date: toDate,
        });

        ApiService.call('post', UriConfig.uri.REPORT_CONSOLIDATED + "/" + device._id, params, (content) => {

            this.setState({
                loading: false,
                deviceDetails: content
            });
            console.log('deviceDetails', content);
        }, (error, errors, content) => {
            this.setState({ loading: false });
        });
    }
    getDuration(startdate, enddate) {
        // var startDate = moment("13/04/2016 11:00:00 AM", "DD/MM/YYYY hh:mm:ss AA");
        // var endDate = moment("15/04/2016 04:25:00 PM", "DD/MM/YYYY hh:mm:ss AA");
        var startDate = moment(startdate);
        var endDate = moment(enddate);
        var mins = endDate.diff(startDate, 'minutes')
        // do not include the first validation check if you want, for example,
        // getTimeFromMins(1530) to equal getTimeFromMins(90) (i.e. mins rollover)
        // if (mins >= 24 * 60 || mins < 0) {
        //     throw new RangeError("Valid input should be greater than or equal to 0 and less than 1440.");
        // }
        var h = mins / 60 | 0,
            m = mins % 60 | 0;
        if (h > 0)
            return moment.utc().hours(h).format("hh") + " hrs " + moment.utc().minutes(m).format("mm") + " mins";
        else
            return "0 hrs " + moment.utc().minutes(m).format("mm") + " mins";
        // return moment.utc().hours(h).minutes(m).format("hh") + " hrs " + moment.utc().hours(h).minutes(m).format("mm") + " mins";
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
        let { report_data, vehicle, content, device, deviceDetails, refreshing, shorting } = this.state;
        let devices = navigation.getParam("devices", null);
        // console.log('device1111', device);
        reportData = report_data || null,
            keys = reportData ? Object.keys(reportData) : [];
        return (
            <View style={{ backgroundColor: 'white', flex: 1 }}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => { this.setModalVisible(!this.state.modalVisible) }}>
                    <View
                        style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#fff',
                            alignSelf: 'center',
                            alignItems: 'center',
                        }}>
                        <View
                            style={{
                                height: '8%',
                                width: '100%',
                                backgroundColor: '#333',
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
                            backgroundColor: shorting == 1 ? Colors.red : Colors.yellow,
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
                            backgroundColor: shorting == 2 ? Colors.red : Colors.yellow,
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
                            backgroundColor: shorting == 3 ? Colors.red : Colors.yellow,
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
                            backgroundColor: shorting == 4 ? Colors.red : Colors.yellow,
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
                <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                    <View style={styles.subBox}>
                        <Text style={{ fontSize: 14 }}>Distance HISTORY</Text>
                    </View>
                </View>
                <View>
                    {
                        keys.map((key) => {

                            let distance = reportData[key];

                            return (
                                <View style={{ flexDirection: "row", paddingLeft: 15 }} key={"distance" + key}>
                                    <View style={mainStyle.itemsCenter}>
                                        <Image style={{ width: 25, height: 25 }} source={Icons.distance} />

                                        <View style={mainStyle.dividerVertical}>
                                            <View style={mainStyle.dividerVerticalInner} />
                                        </View>
                                    </View>

                                    <View style={{ marginLeft: 10, paddingBottom: 20 }}>

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
                {/* <View style={{ flex: 1 }} />
                {
                    report_data.length > 0 &&
                    <FlatList data={report_data}
                        keyExtractor={item => item.id.toString()}
                        refreshing={refreshing}
                        onRefresh={() => this.getReport()}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        renderItem={({ item, index }) => {
                            return (
                                <TouchableOpacity activeOpacity={0.70} onPress={() => NavigationService.navigate('homeStack', 'GroupMap', { device: device, record: item, type: "stoppage" })}
                                    style={{ paddingHorizontal: 15 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <ClockIcon name="clockcircleo" size={24} color="red" />
                                            <Text style={{ color: '#00ace6', fontSize: 16, fontWeight: 'bold', marginLeft: 20 }}>Stoppage {item.id}</Text>
                                        </View>

                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ color: '#00ace6', fontSize: 16, fontWeight: 'bold', marginRight: 5 }}>{item.stoppage_time}</Text>
                                            <RightIcon name="right" size={24} color="#00ace6" />
                                        </View>
                                    </View>

                                    <View style={styles.box2}>
                                        <Text>{moment(item.start_time).format('DD MMMM YYYY') + ' To '}{moment(item.end_time).format('DD MMMM YYYY')}</Text>
                                        <Text style={{ marginTop: 5, color: 'gray' }}>{moment(item.start_time).format('hh:mm: A') + ' To '}{moment(item.end_time).format('hh:mm: A')}</Text>
                                        <Text style={{ color: 'gray' }}>{item.address}</Text>
                                        
                                    </View>
                                </TouchableOpacity>
                            )
                        }} />
                }
                <View /> */}
                {/* <View style={{ backgroundColor: '#595959', paddingVertical: 7, position: 'absolute', bottom: 0, width: '100%' }}>
                    <Text style={{ fontSize: 19, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>Total number of idle  {report_data.length}</Text>
                </View> */}
                <Loader loading={this.state.isLoading} />
            </View >
        );
    };
};

const styles = StyleSheet.create({
    container: {

    },
    header2: {
        backgroundColor: '#fff',
        paddingTop: 10
    },
    searchStyle: {
        borderBottomWidth: 1.2,
        paddingHorizontal: 10,
        width: '98%',
        marginBottom: -10,
        marginLeft: '1%',
        height: 38,
        borderColor: 'black'
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

    },
    sideIconStyle: {
        justifyContent: 'space-around',
        borderBottomEndRadius: 12,
        paddingRight: 5
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
    yellowBox: {
        backgroundColor: '#ff8c1a',
        paddingHorizontal: 12,
        paddingVertical: 3,
        borderRadius: 5
    },
    subBox: {
        backgroundColor: '#999999',
        width: 180,
        paddingVertical: 8,
        borderTopEndRadius: 20,
        borderTopLeftRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    box2: {
        borderLeftWidth: 5,
        borderColor: '#ff8c1a',
        paddingHorizontal: 10,
        marginLeft: 10,
        marginVertical: 10
    }
})