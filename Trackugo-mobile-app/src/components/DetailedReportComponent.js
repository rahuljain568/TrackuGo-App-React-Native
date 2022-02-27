import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList, ScrollView, TextInput, Modal } from 'react-native';
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
import SunIcon from 'react-native-vector-icons/FontAwesome'
import IdealIcon from 'react-native-vector-icons/Feather'
import StopIcon from 'react-native-vector-icons/Ionicons'
import ViewIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { Icon } from 'react-native-elements';
import Colors from '../modules/colors.module';


import moment from 'moment';
import UriConfig from '../config/uri.config';
import Loader from '../modules/loader.module';
import NavigationService from '../services/navigation.service';
import ApiService from '../services/api.service';
import GeneralService from '../services/general.service';
import DateTimePicker from "react-native-modal-datetime-picker";
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class TrackingDetails extends React.Component {
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
            report_trip: [],

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

            let params = {
                from_date: GeneralService.dateFormat(GeneralService.correctDate(fromDate + ":00"), 'Y-m-d H:i:s'),
                to_date: GeneralService.dateFormat(GeneralService.correctDate(toDate + ":00"), 'Y-m-d H:i:s'),
                offset: new Date().getTimezoneOffset()
            },
                uri = UriConfig.uri.REPORT_DETAILED;
            this.getTripReport(from_date, to_date, device);

            this.setState({
                loading: true,
                deviceDetails: null,
                content: null
            });
            ApiService.call('post', uri + "/" + device._id, params, (content) => {
                console.log(content);
                this.setState({
                    loading: false,
                    deviceDetails: content,
                    isLoading: false, refreshing: false
                });
                if (content == null) {
                    alert("No data available..")
                }
            }, (error, errors, content) => {
                this.setState({ loading: false, refreshing: false });
            });
        } catch (error) {
            console.log(error);
        }
    }

    getTripReport(from_date, to_date, device) {
        try {
            this.setState({ isLoading: true });

            let fromDate = from_date, toDate = to_date;

            let params = {
                from_date: GeneralService.dateFormat(GeneralService.correctDate(fromDate + ":00"), 'Y-m-d H:i:s'),
                to_date: GeneralService.dateFormat(GeneralService.correctDate(toDate + ":00"), 'Y-m-d H:i:s'),
                offset: new Date().getTimezoneOffset()
            },
                uri = UriConfig.uri.REPORT_TRIP;

            this.setState({
                loading: true,
                content: null
            });
            ApiService.call('post', uri + "/" + device._id, params, (content) => {
                console.log(content);
                this.setState({
                    loading: false,
                    isLoading: false
                });
                if (content.report_data.length == 0) {
                    return;
                }
                let tmp = [];
                content.report_data.forEach(element => {
                    if (Number(element.distance) >= 1) {
                        tmp.push(element)
                    }
                });
                console.log('report_trip', tmp);
                this.setState({ report_trip: tmp, });
                if (tmp.length == 0) {
                    alert("No trips are available!..")
                    return;
                }
            }, (error, errors, content) => {
                this.setState({ loading: false });
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
        let { report_trip, vehicle, device, deviceDetails, refreshing, shorting } = this.state;
        let devices = navigation.getParam("devices", null);
        // console.log('device1111', device);
        console.log('deviceDetails', deviceDetails);
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
                        value={vehicle.toString()}
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
                <ScrollView>
                    <View style={{ flex: 1, paddingHorizontal: 15 }}>
                        {/* <View style={{ marginTop: 5, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 70, backgroundColor: 'white' }}>
                    <View>
                        <Text style={{ fontSize: 15 }}>From Date</Text>
                        <Text style={{ fontSize: 15, color: 'green' }}>01-01-2021 02:25 AM</Text>
                        <View style={styles.line1} />
                    </View>

                    <View>
                        <Text style={{ fontSize: 15 }}>From Date</Text>
                        <Text style={{ fontSize: 15, color: 'red' }}>01-01-2021 02:25 AM</Text>
                        <View style={styles.line1} />
                    </View>
                    <SearchIcon name="search1" size={24} />
                </View> */}
                        {deviceDetails != null &&
                            <View>
                                <View style={styles.line1} />
                                <View style={{ marginTop: 12 }}>
                                    <Text style={{ fontSize: 16 }}>Start Address: <Text style={{ fontWeight: 'bold' }}>{deviceDetails.start_point || "Not Available"}</Text></Text>
                                    <Text style={{ fontSize: 16 }}>End Address: <Text style={{ fontWeight: 'bold' }}>{deviceDetails.end_point || "Not Available"}</Text></Text>
                                </View>
                                <View style={styles.line1} />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 10 }}>
                                    <View style={{}}>
                                        <View style={{ alignItems: 'center' }}>
                                            <RoadIcon name="road" size={24} />
                                        </View>
                                        <Text style={{ fontWeight: 'bold' }}>{deviceDetails.total_distance || "--"} kms</Text>
                                        <Text style={{ textAlign: 'center' }}>Distance</Text>
                                    </View>

                                    <View style={styles.verticleLine}></View>

                                    <View style={{}}>
                                        <View style={{ alignItems: 'center' }}>
                                            <ClockIcon name="clockcircleo" size={24} color="#00ace6" />
                                        </View>
                                        <Text style={{ fontWeight: 'bold' }}>{deviceDetails.total_time || "--"}</Text>
                                        <Text style={{ textAlign: 'center' }}>Total Time</Text>
                                    </View>
                                </View>
                                <View style={styles.line1} />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 10 }}>
                                    <View style={{}}>
                                        <View style={{ alignItems: 'center' }}>
                                            <SunIcon name="sun-o" size={24} color="green" />
                                        </View>
                                        {/* <Text style={{ fontWeight: 'bold' }}>14 hrs 20 min</Text> */}
                                        <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>{deviceDetails.running_time || "--"}</Text>
                                        <Text style={{ textAlign: 'center' }}>Running Time</Text>
                                    </View>

                                    <View style={styles.verticleLine}></View>

                                    <View style={{}}>
                                        <View style={{ alignItems: 'center' }}>
                                            <IdealIcon name="framer" size={24} color="#ff8c1a" />
                                        </View>
                                        <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>{deviceDetails.idle_time || "--"}</Text>
                                        <Text style={{ textAlign: 'center' }}>Idle Time</Text>
                                    </View>

                                    <View style={styles.verticleLine}></View>

                                    <View style={{}}>
                                        <View style={{ alignItems: 'center' }}>
                                            <StopIcon name="stop-circle-sharp" size={24} color="red" />
                                        </View>
                                        {/* <Text style={{ fontWeight: 'bold' }}>1 days 4 hrs 18 min</Text> */}
                                        <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>{deviceDetails.stoppage_time || "--"}</Text>
                                        <Text style={{ textAlign: 'center' }}>Stoppage Time</Text>
                                    </View>
                                </View>
                            </View>
                        }
                        <View style={styles.line1} />

                        {/* <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 5, alignItems: 'center' }}>
                        <ViewIcon name="view-column" size={28} color="#00ace6" />
                        <Text style={{ fontWeight: 'bold', fontSize: 16, marginLeft: 10 }}>View on Map</Text>
                    </View> */}
                        <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 5, alignItems: 'center' }}
                            onPress={() => NavigationService.navigate('homeStack', 'Playback', { device: device, params: { start_time: deviceDetails.start_time, end_time: deviceDetails.end_time } })}>
                            <ViewIcon name="view-column" size={28} color="#00ace6" />
                            <Text style={{ fontWeight: 'bold', fontSize: 16, marginLeft: 10 }}>View on Map</Text>
                        </TouchableOpacity>
                        {/* <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                        <TouchableOpacity style={[styles.yellowBox, { paddingVertical: 8, borderRadius: 5 }]}>
                            <Text style={{ color: 'white', fontSize: 16 }}>Export Excel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.yellowBox, { paddingVertical: 8, borderRadius: 5 }]}>
                            <Text style={{ color: 'white', fontSize: 16 }}>Export PDF</Text>
                        </TouchableOpacity>
                    </View> */}

                        {report_trip.length > 0 &&
                            <View style={{ marginVertical: 20, }}>
                                <View style={{ flexDirection: 'row', }}>
                                    <View style={{ width: '14.28%', backgroundColor: '#e6f3ff', borderWidth: 2, borderColor: '#b3daff', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 12 }}>Trips</Text>
                                    </View>
                                    <View style={{ width: '14.28%', backgroundColor: '#e6f3ff', borderWidth: 2, borderColor: '#b3daff', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 12 }}>Start Date</Text>
                                    </View>
                                    <View style={{ width: '14.28%', backgroundColor: '#e6f3ff', borderWidth: 2, borderColor: '#b3daff', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 12 }}>Start Address</Text>
                                    </View>
                                    <View style={{ width: '14.28%', backgroundColor: '#e6f3ff', borderWidth: 2, borderColor: '#b3daff', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 12 }}>End Date</Text>
                                    </View>
                                    <View style={{ width: '14.28%', backgroundColor: '#e6f3ff', borderWidth: 2, borderColor: '#b3daff', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 12 }}>End Address</Text>
                                    </View>
                                    <View style={{ width: '14.28%', backgroundColor: '#e6f3ff', borderWidth: 2, borderColor: '#b3daff', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 12 }}>Trip Time</Text>
                                    </View>
                                    <View style={{ width: '14.28%', backgroundColor: '#e6f3ff', borderWidth: 2, borderColor: '#b3daff', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 12 }}>Dist</Text>
                                    </View>
                                </View>

                                <FlatList data={report_trip}
                                    keyExtractor={(item) => item}
                                    keyExtractor={item => item.id.toString()}
                                    refreshing={refreshing}
                                    onRefresh={() => this.getReport()}
                                    contentContainerStyle={{ paddingBottom: 360 }}
                                    renderItem={({ item, index }) => {
                                        return (
                                            <View style={{ flexDirection: 'row', }}>
                                                <View style={{ width: '14.28%', borderWidth: 2, borderColor: '#b3daff', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Text style={{ fontSize: 10 }}>Trip {index + 1}</Text>
                                                </View>
                                                <View style={{ width: '14.28%', borderWidth: 2, borderColor: '#b3daff', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Text style={{ fontSize: 10 }}>{moment(item.start_time).format('DD MMMM YYYY')}</Text>
                                                    <Text style={{ fontSize: 10 }}>{moment(item.start_time).format('hh:mm: A')}</Text>
                                                </View>
                                                <View style={{ width: '14.28%', borderWidth: 2, borderColor: '#b3daff', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Text style={{ fontSize: 10 }}>{item.start_point}</Text>
                                                </View>
                                                <View style={{ width: '14.28%', borderWidth: 2, borderColor: '#b3daff', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Text style={{ fontSize: 10 }}>{moment(item.end_time).format('DD MMMM YYYY')}</Text>
                                                    <Text style={{ fontSize: 10 }}>{moment(item.end_time).format('hh:mm: A')}</Text>
                                                </View>
                                                <View style={{ width: '14.28%', borderWidth: 2, borderColor: '#b3daff', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Text style={{ fontSize: 10 }}>{item.end_point}</Text>
                                                </View>
                                                <View style={{ width: '14.28%', borderWidth: 2, borderColor: '#b3daff', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Text style={{ fontSize: 10 }}>{this.getDuration(item.start_time, item.end_time)} hours</Text>
                                                </View>
                                                <View style={{ width: '14.28%', borderWidth: 2, borderColor: '#b3daff', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Text style={{ fontSize: 10 }}>{item.distance} kms</Text>
                                                </View>
                                            </View>
                                        )
                                    }} />
                            </View>
                        }
                    </View>
                    {/* <View style={{ backgroundColor: '#595959', paddingVertical: 7, position: 'absolute', bottom: 0, width: '100%' }}>
                <Text style={{ fontSize: 19, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>Total number of idle  10</Text>
            </View> */}
                </ScrollView>
                <Loader loading={this.state.isLoading} />
            </View>
        );
    };
};

const styles = StyleSheet.create({
    container: {

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
        borderRadius: 15,
        marginTop: 12
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
    },
    line1: {
        borderWidth: .7,
        marginTop: 18,
        borderColor: 'gray'
    },
    verticleLine: {
        height: '100%',
        width: 1,
        backgroundColor: '#909090',
    }
})