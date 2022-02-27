import React from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Dimensions,
    Modal,
    TextInput,
    ScrollView,
    TouchableOpacity,
    ToastAndroid, TouchableWithoutFeedback
} from 'react-native';
import BackIcon from "react-native-vector-icons/Entypo"
import FilterIcon from 'react-native-vector-icons/FontAwesome5'

import DistanceIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import AvgSpeedIcon from 'react-native-vector-icons/Ionicons'
import MaxSpeedIcon from 'react-native-vector-icons/FontAwesome5'
import EngineIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import PriceIcon from 'react-native-vector-icons/Foundation'
import { Icon } from 'react-native-elements';

import moment from 'moment';
import UriConfig from '../config/uri.config';
import Loader from '../modules/loader.module';
import NavigationService from '../services/navigation.service';
import ApiService from '../services/api.service';
import GeneralService from '../services/general.service';
import DateTimePicker from "react-native-modal-datetime-picker";

import ButtonComponent from './partials/Button.component';
import mainStyle from '../styles/main.style';
import reportStyle from '../styles/report.style';
import Colors from '../modules/colors.module';
import Icons from '../modules/icons.module';

export default class DailyReportSummeryComponent extends React.Component {
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
            values: [],

            modalVisible: false,
            vehicle: '',
            report: null,
            device: null,
            report_data: [], shorting: 0
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
            device: device, vehicle: device.license_plate
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

        let { device, from_date, to_date } = this.state;
        let fromDate = from_date, toDate = to_date;

        let params = {
            from_date: GeneralService.dateFormat(GeneralService.correctDate(fromDate + ":00"), 'Y-m-d H:i:s'),
            to_date: GeneralService.dateFormat(GeneralService.correctDate(toDate + ":00"), 'Y-m-d H:i:s'),
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

        }, (error, errors, content) => {
            this.setState({ loading: false });
        });
    }

    saveFuelSettings = () => {
        try {
            let { device, values } = this.state;
            console.log('device', device);
            console.log('values', values);
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
            console.log('flag',flag);
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
        let { tabSelected, content, isModalVisible, values, device, from_date, to_date, vehicle, shorting } = this.state,
            mileage = values.mileage || (device ? device.mileage : 0),
            fuelPrice = values.fuel_price || (device ? device.fuel_price : 0),
            fuelCousumed = parseFloat(content && mileage > 0 ? content.total_distance / mileage : 0).toFixed(2),
            fuelCost = parseFloat(fuelCousumed * fuelPrice).toFixed(2);

        let { navigation } = this.props;
        let devices = navigation.getParam("devices", []);
        console.log('devices', devices);
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
                            <Text style={{ fontSize: 22, color: '#f2f2f2', fontWeight: 'bold' }}>Summary Report</Text>
                            <Text style={{ fontSize: 15, color: '#999999' }}>{vehicle}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={{ marginRight: 20 }}
                        onPress={() => { this.toggleModal() }}>
                        <FilterIcon name="sliders-h" size={24} color='#f2f2f2' />
                    </TouchableOpacity>
                </View>
                <ScrollView>
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

                    {/* <View style={{ flexDirection: 'row', height: 70, justifyContent: 'space-around', alignItems: 'center' }}>
                    <TouchableOpacity style={styles.yellowBox}>
                        <Text style={{ color: '#fff', fontSize: 17 }}>Today</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.yellowBox}>
                        <Text style={{ color: '#fff', fontSize: 17 }}>Yesterday</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.yellowBox}>
                        <Text style={{ color: '#fff', fontSize: 17 }}>Week</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.yellowBox}>
                        <Text style={{ color: '#fff', fontSize: 17 }}>Month</Text>
                    </TouchableOpacity>
                </View> */}
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
                                                    keyboardType="default"
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
                    {
                        content &&
                        <View style={{ marginTop: 10 }}>
                            <View style={styles.vwRow}>
                                <TouchableOpacity style={styles.eachBox} onPress={() => NavigationService.navigate('homeStack', 'Playback', { device: device, params: { start_time: from_date, end_time: to_date } })}>
                                    <View style={{ marginTop: 10 }}>
                                        <DistanceIcon name="map-marker-distance" size={25} color="#000000" />
                                    </View>
                                    <Text style={{ marginVertical: 10 }}>Distance Travelled</Text>
                                    <Text style={{ marginVertical: 0, fontWeight: 'bold' }}>{content.total_distance} kms</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.eachBox}>
                                    <View style={{ marginTop: 10 }}>
                                        <AvgSpeedIcon name="speedometer-outline" size={25} color="#000000" />
                                    </View>
                                    <Text style={{ marginVertical: 10 }}>Average Speed</Text>
                                    <Text style={{ marginVertical: 0, fontWeight: 'bold' }}>{content.average_speed} km/h</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.vwRow}>
                                <TouchableOpacity style={styles.eachBox}>
                                    <View style={{ marginTop: 10 }}>
                                        <MaxSpeedIcon name="bolt" size={25} color="#000000" />
                                    </View>
                                    <Text style={{ marginVertical: 10 }}>Max Speed</Text>
                                    <Text style={{ marginVertical: 0, fontWeight: 'bold' }}>{content.max_speed} km/h</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.eachBox}>
                                    <View style={{ marginTop: 10 }}>
                                        <EngineIcon name="engine-outline" size={25} color="#000000" />
                                    </View>
                                    <Text style={{ marginVertical: 10 }}>Engine On Time</Text>
                                    <Text style={{ marginVertical: 0, fontWeight: 'bold' }}>{content.engine_on_time}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.vwRow}>
                                <TouchableOpacity style={styles.eachBox}>
                                    <View style={{ marginTop: 10 }}>
                                        <AvgSpeedIcon name="alarm-outline" size={25} color="#000000" />
                                    </View>
                                    <Text style={{ marginVertical: 10 }}>Stoppage Time</Text>
                                    <Text style={{ marginVertical: 0, fontWeight: 'bold' }}>{content.stoppage_time}</Text>
                                </TouchableOpacity>
                                {/* <TouchableOpacity style={styles.eachBox} onPress={() => NavigationService.navigate('homeStack', 'Playback', { device: device, params: { start_time: from_date, end_time: to_date } })}> */}
                                <TouchableOpacity style={styles.eachBox} onPress={() => NavigationService.navigate('homeStack', 'StopageReport', { device: device, devices: devices, params: { start_time: from_date, end_time: to_date } })}>
                                    <View style={{ marginTop: 10 }}>
                                        <AvgSpeedIcon name="hand-right" size={25} color="#000000" />
                                    </View>
                                    <Text style={{ marginVertical: 10 }}>Number of Stops</Text>
                                    <Text style={{ marginVertical: 0, fontWeight: 'bold' }}>{content.stoppage_count}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.vwRow}>
                                <TouchableOpacity style={styles.eachBox}>
                                    <View style={{ marginTop: 10 }}>
                                        <DistanceIcon name="fuel" size={25} color="#000000" />
                                    </View>
                                    <Text style={{ marginVertical: 10 }}>Fuel Consumed</Text>
                                    <Text style={{ marginVertical: 0, fontWeight: 'bold' }}>{fuelCousumed} ltr</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.eachBox}>
                                    <View style={{ marginTop: 10 }}>
                                        <PriceIcon name="price-tag" size={25} color="#000000" />
                                    </View>
                                    <Text style={{ marginVertical: 10 }}>Fuel Cost</Text>
                                    <Text style={{ marginVertical: 0, fontWeight: 'bold' }}>{GeneralService.amountString(fuelCost)}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                    {/* <View>
                    <FlatList data={data} numColumns={2}
                        contentContainerStyle={{}}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => {
                            return (

                                <TouchableOpacity style={styles.eachBox}>
                                    <View style={{ marginTop: 10 }}>
                                        {item.icon}
                                    </View>
                                    <Text style={{ marginVertical: 10 }}>{item.name}</Text>
                                    <Text style={{ marginVertical: 0, fontWeight: 'bold' }}>{item.value}</Text>
                                </TouchableOpacity>
                            )
                        }} />
                </View> */}
                    <Loader loading={this.state.loading} />
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    header: {
        height: 70,
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerTextBox: {
        marginLeft: 15
    },
    eachBox: {
        width: '44%',
        borderWidth: 1,
        marginHorizontal: '3%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        marginTop: 5,
        marginBottom: 15,
        borderColor: '#e6e6e6',
        backgroundColor: '#cccccc',
        borderRadius: 5
    },
    yellowBox: {
        backgroundColor: '#ff8c1a',
        paddingHorizontal: 12,
        paddingVertical: 1,
        borderRadius: 5
    },
    vwRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
})