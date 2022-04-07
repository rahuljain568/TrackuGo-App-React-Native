import React from 'react';
import {
    Text, View, FlatList, TouchableOpacity,
    StyleSheet, Dimensions, Image, ScrollView,
    Modal, TextInput, ToastAndroid, TouchableWithoutFeedback
} from 'react-native'
import BarIcon from "react-native-vector-icons/Octicons"
import FilterIcon from 'react-native-vector-icons/Fontisto'
import SearchIcon from 'react-native-vector-icons/AntDesign'
// import truck from '../assets/truck.jpeg'

import DistanceIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import AvgSpeedIcon from 'react-native-vector-icons/Ionicons'
import MaxSpeedIcon from 'react-native-vector-icons/FontAwesome5'
import EngineIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import PriceIcon from 'react-native-vector-icons/Foundation'
import LocationIcon from 'react-native-vector-icons/Entypo'
import { Input } from 'react-native-elements';
import { Images } from '../modules/icons.module';

import moment from 'moment';
import { Icon, Button } from 'react-native-elements';
import RoadIcon from 'react-native-vector-icons/FontAwesome'
import BackIcon from "react-native-vector-icons/Entypo"
import Colors from '../modules/colors.module';

import UriConfig from '../config/uri.config';
import Loader from '../modules/loader.module';
import NavigationService from '../services/navigation.service';
import ApiService from '../services/api.service';
import GeneralService from '../services/general.service';
import DateTimePicker from "react-native-modal-datetime-picker";
import StorageService from '../services/storage.service';

export default class DailyReportComponent extends React.Component {
    constructor() {
        super();

        this.state = {
            loading: false, refreshing: false,
            tabSelected: 'today',
            from_date: GeneralService.dateFormat(null, 'd/m/Y') + " 00:00",
            to_date: GeneralService.dateFormat(new Date(), 'd/m/Y H:i'),
            errors: {
                from_date: false,
                to_date: false
            },
            current_picker: null,
            isModalVisible: false,
            values: [],

            modalVisible: false,
            vehicle: '',
            report: null,
            device: null,
            report_data: [],

            reportData: [], shorting: 1
        };
        this.searchHolder = [];
    }

    async componentDidMount() {

        let baseUrl = await StorageService.fetch('assets_url'),
            folders = JSON.parse(await StorageService.fetch('folders'));

        let { navigation } = this.props,
            device = navigation.getParam('device', null);

        this.props.navigation.setParams({
            device: device,
            toggleModal: this.toggleModal
        });

        this.setState({
            device: device, vehicle: device.license_plate,
            iconBaseUrl: baseUrl + folders.vehicle_icons
        }, () => {
            this.getReport();
        });

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

    toggleModal = () => {
        this.setState({ isModalVisible: !this.state.isModalVisible });
    }

    onInput = (value, name) => {
        this.setState({ values: { ...this.state.values, [name]: value } });
    }

    getReport = () => {
        this.setState({ loading: true, refreshing: true });
        let { navigation } = this.props, devices = [];
        devices = navigation.getParam("devices", []);
        var elementsProcessed = 0;
        devices.forEach((element, index, array) => {
            let { device, from_date, to_date, reportData } = this.state;
            let fromDate = from_date, toDate = to_date;

            let params = {
                from_date: GeneralService.dateFormat(GeneralService.correctDate(fromDate + ":00"), 'Y-m-d H:i:s'),
                to_date: GeneralService.dateFormat(GeneralService.correctDate(toDate + ":00"), 'Y-m-d H:i:s'),
                offset: new Date().getTimezoneOffset()
            };

            this.setState({
                content: null,
                from_date: fromDate,
                to_date: toDate,
            });
            ApiService.call('post', UriConfig.uri.REPORT_CONSOLIDATED + "/" + element._id, params, (content) => {

                this.setState({ content: content });
                console.log('content', content);
                let tmp = [content];
                tmp.forEach(element => {
                    reportData.push(element)
                });
                this.setState({
                }, function () {

                    // In this block you can do something with new state.
                    this.searchHolder = [... this.searchHolder, ...reportData];
                });
            }, (error, errors, content) => {
                this.setState({ loading: false, refreshing: false });
            });

            elementsProcessed++;
            if (elementsProcessed === array.length) {
                this.setState({ loading: false, refreshing: false });
            }
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
    searchFilter(text) {
        const newData = this.searchHolder.filter(function (item) {
            const itemData = item.device.license_plate.toUpperCase()
            const textData = text.toUpperCase()
            return itemData.indexOf(textData) > -1
        })
        this.setState({
            reportData: newData,
            SearchDevice: text
        })
    }
    render() {
        let { content, isModalVisible, values, device, from_date, to_date, vehicle, reportData, refreshing, shorting, iconBaseUrl } = this.state,
            mileage = values.mileage || (device ? device.mileage : 0),
            fuelPrice = values.fuel_price || (device ? device.fuel_price : 0),
            fuelCousumed = parseFloat(content && mileage > 0 ? content.total_distance / mileage : 0).toFixed(2),
            fuelCost = parseFloat(fuelCousumed * fuelPrice).toFixed(2);

        let { navigation } = this.props;
        let devices = navigation.getParam("devices", null);
        var pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 30);
        return (
            <View style={{ backgroundColor: 'white', flex: 1 }}>
                <View style={{
                    flexDirection: 'row',
                    backgroundColor: '#595959',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: 55
                }}>
                    <View style={styles.header}>
                        <TouchableOpacity style={{ marginLeft: 10 }}
                            onPress={() => { NavigationService.back() }}>
                            <BackIcon name="chevron-left" size={30} color='#f2f2f2' />
                        </TouchableOpacity>
                        <View style={styles.headerTextBox}>
                            <Text style={{ fontSize: 22, color: '#cccccc', fontWeight: 'bold' }}>Daily Report</Text>
                        </View>
                    </View>
                    {/* <TouchableOpacity style={{ marginRight: 20 }}
                        onPress={() => { }}>
                        <FilterIcon name="filter" size={24} color='#cccccc' />
                    </TouchableOpacity> */}
                </View>

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
                {/* <TouchableOpacity
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
                </TouchableOpacity> */}

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
                            minimumDate={pastDate}
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

                {/* <View style={styles.header2}>
                    <Input
                        placeholder='Search Devices'
                        inputContainerStyle={styles.searchStyle}
                        leftIcon={<Icon
                            name="search"
                            type="Ionicons"
                            size={25}
                            color="black"
                        />}
                        value={this.state.SearchDevice}
                        onChangeText={(text) => this.searchFilter(text)}
                    />
                </View> */}


                {/* <ScrollView> */}
                {reportData.length > 0 &&
                    < FlatList data={reportData}
                        style={{ marginTop: 15 }}
                        // keyExtractor={item => item.id.toString()}
                        // refreshing={refreshing}
                        // onRefresh={() => this.getReport()}
                        contentContainerStyle={{ paddingBottom: 50 }}
                        renderItem={({ item, index }) => {
                            let iconfile = iconBaseUrl ? iconBaseUrl + GeneralService.deviceSideviewIcon(item.device) : null;
                            return (
                                <View style={styles.mainBox}>
                                    <View style={styles.eachBox}>
                                        <View style={{ flex: 1, paddingHorizontal: 10 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Image source={{ uri: iconfile }} style={{ width: 50, height: 40, resizeMode: 'contain', marginHorizontal: 8 }} />
                                                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.device.license_plate}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                                                <View style={{ width: '30%', justifyContent: 'flex-start' }}>
                                                    <Text style={[styles.txtLabel, styles.txtLabelGreen]}>Running</Text>
                                                    <Text style={styles.txtValue}>{item.engine_on_time ? item.engine_on_time : "N/A"}</Text>
                                                </View>
                                                <View style={{ width: '30%', justifyContent: 'flex-start' }}>
                                                    <Text style={[styles.txtLabel, styles.txtLabelYellow]}>Idle</Text>
                                                    <Text style={styles.txtValue}>N/A</Text>
                                                </View>
                                                <View style={{ width: '30%', justifyContent: 'flex-start' }}>
                                                    <Text style={[styles.txtLabel, styles.txtLabelRed]}>Stop</Text>
                                                    <Text style={styles.txtValue}>{item.stoppage_time ? item.stoppage_time : "N/A"}</Text>
                                                </View>
                                            </View>
                                            <View style={{ height: 1, backgroundColor: '#D4D4D8', width: '100%', marginTop: 6 }} />
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                                                <View style={{ width: '30%', justifyContent: 'flex-start' }}>
                                                    <Text style={[styles.txtLabel, styles.txtLabelGreen]}>Km</Text>
                                                    <Text style={{ color: 'black', fontWeight: 'bold', textAlign: 'center' }}>{item.total_distance ? item.total_distance : "N/A"}</Text>
                                                </View>
                                                <View style={{ width: '30%', justifyContent: 'flex-start' }}>
                                                    <Text style={[styles.txtLabel, styles.txtLabelGreen]}>Avg. Speed</Text>
                                                    <Text style={[styles.txtLabel, styles.txtLabelGray]}>{item.average_speed? item.average_speed+" Km/h" : "N/A"}</Text>
                                                </View>
                                                <View style={{ width: '30%', justifyContent: 'flex-start' }}>
                                                    <Text style={[styles.txtLabel, styles.txtLabelGreen]}>Max. Speed</Text>
                                                    <Text style={[styles.txtLabel, styles.txtLabelGray]}>{item.max_speed?item.max_speed+" Km/h":"N/A"}</Text>
                                                </View>
                                            </View> 
                                            <View style={{ height: 0.5, backgroundColor: '#D4D4D8', width: '100%', marginTop: 10 }} />
                                            {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <View style={styles.subBox}>
                                                    <Text style={[styles.txtLabel, styles.txtLabelGreen]}>Running</Text>
                                                    <Text style={styles.txtValue}>{item.engine_on_time}</Text>
                                                    <Text style={[styles.txtLabel, styles.txtLabelGray]}>N/A</Text>
                                                    <Text style={[styles.txtLabel, styles.txtLabelRed]}>Alert</Text>
                                                </View> 
                                                <View style={styles.subBox}>
                                                    <Text style={styles.txtValue}></Text>
                                                    <Text style={[styles.txtLabel, styles.txtLabelYellow]}>Idle</Text>
                                                    <Text style={[styles.txtLabel, styles.txtLabelGreen]}>Km</Text>
                                                    <Text style={{ color: 'black', fontWeight: 'bold', textAlign: 'center' }}>{item.total_distance}</Text>
                                                </View> 
                                                <View style={styles.subBox}>
                                                    <Text style={[styles.txtLabel, styles.txtLabelRed]}>Stop</Text>
                                                    <Text style={styles.txtValue}>{item.stoppage_time}</Text>
                                                    <Text style={[styles.txtLabel, styles.txtLabelGreen]}>Avg. Speed</Text>
                                                    <Text style={[styles.txtLabel, styles.txtLabelGray]}>{item.average_speed} Km/h</Text>
                                                </View> 
                                                <View style={styles.subBox}>
                                                    <Text style={styles.txtValue}>N/A</Text>
                                                    <Text style={[styles.txtLabel, styles.txtLabelRed]}>Inactive</Text>
                                                    <Text style={[styles.txtLabel, styles.txtLabelGreen]}>Max. Speed</Text>
                                                    <Text style={[styles.txtLabel, styles.txtLabelGray]}>{item.max_speed} Km/h</Text>
                                                </View>
                                            </View> */}
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 15 }}>
                                        <LocationIcon name="location-pin" size={38} color="#00ace6" />
                                        <View>
                                            <Text>{item.device.address}</Text>
                                            {/* <Text style={{ color: 'gray' }}>Last Updated 12:02 PM, 21 Apr</Text> */}
                                            <Text style={{ color: 'gray' }}>Last Updated N/A</Text>
                                        </View>
                                    </View>
                                </View>
                            )
                        }} />
                }
                {/* </ScrollView> */}
                <View style={{ backgroundColor: '#595959', paddingVertical: 7, position: 'absolute', bottom: 0, width: '100%' }}>
                    <Text style={{ fontSize: 19, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>Total number of Veichles {devices.length}</Text>
                </View>
                <Loader loading={this.state.loading} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    header: {
        height: 75,
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerTextBox: {
        marginLeft: 25
    },
    yellowBox: {
        backgroundColor: '#ff8c1a',
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderRadius: 5
    },
    header2: {
        backgroundColor: '#fff',
        marginBottom: -15
    },
    searchStyle: {
        borderWidth: 0.2,
        borderBottomWidth: 1.2,
        paddingHorizontal: 10,
        width: '100%',
        height: 45
    },
    eachBox: {

        flexDirection: 'row',
        alignItems: 'center',

    },
    mainBox: {
        width: '96%',
        marginLeft: '2%',
        borderWidth: 1.5,
        borderRadius: 10,
        marginVertical: 7,
        paddingVertical: 10,
        borderTopWidth: 0.5,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: 'lightgray',
        borderBottomColor: '#cccccc',
    },
    subBox: {
        // backgroundColor: 'red',
        // flex: 1,
        width: '24%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    txtValue: {
        fontWeight: 'bold',
        color: 'gray',
        textAlign: 'center',
        fontSize: 15,
    },
    txtLabel: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    txtLabelGreen: {
        color: '#2eb82e',
    },
    txtLabelRed: {
        color: '#cc0000',
    },
    txtLabelGray: {
        color: '#a6a6a6',
    },
    txtLabelYellow: {
        color: '#ffbb33',
    },
})