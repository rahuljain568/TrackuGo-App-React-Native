
import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    Alert,
    FlatList,
    TouchableOpacity,
    ToastAndroid
} from 'react-native';

import ButtonComponent from '../../components/partials/Button.component';

import AppConfig from '../../config/app.config';
import UriConfig from '../../config/uri.config';

import mainStyle from '../../styles/main.style';
import circleDetailsStyle from '../../styles/circlePackage.style';

import Colors from '../../modules/colors.module';
import Loader from '../../modules/loader.module';

import ApiService from '../../services/api.service';
import GeneralService from '../../services/general.service';
import StorageService from '../../services/storage.service';
import NavigationService from '../../services/navigation.service';
import RazorpayCheckout from 'react-native-razorpay';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';



export default class CirclePackagesComponent extends Component {
    static navigationOptions = ({ navigation }) => {
        let params = navigation.state.params || {};
        let device = params.device || null;
        return {
            headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
            ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
            headerTitle: (
                <View>
                    <Text style={mainStyle.titleTextMain}>Circle Packages</Text>
                    {/* <Text style={mainStyle.titleTextSub}>{device ? device.license_plate : null}</Text> */}
                </View>
            )
        };
    };

    constructor() {
        super();
        this.state = {
            loading: false,
            refreshing: false,
            user: null,
            packageId: ""
        };
    }

    async componentDidMount() {
        let user = JSON.parse(await StorageService.fetch('user'));
        this.setState({ user: user }, () => {
            this.getPackages();
        });

        this.props.navigation.addListener('didFocus', (payload) => {
            let { subscription } = this.state;
            if (subscription) {
                NavigationService.reset([{
                    routeName: 'Payments'
                },
                {
                    routeName: 'PaymentDetail',
                    data: { id: subscription.payment }
                }]);
            }
        });

    }

    getPackages = () => {
        this.setState({ refreshing: true });
        ApiService.call('get', UriConfig.uri.PACKAGES + "?package_type=Circle", {}, (content) => {
            this.setState({
                refreshing: false,
                packages: content.packages
            });
            console.log('content111111', content);
        }, (error, errors, content) => {
            this.setState({ refreshing: false });
        });
    }

    selectPackage = (item) => {
        let { user } = this.state, packageId = item._id;

        this.setState({
            loading: true,
            selectedPackage: null,
            packageId: item._id
        });

        // ApiService.call('get', UriConfig.uri.PACKAGE_VALIDATE + "?package_type=Circle" + "&package=" + packageId + "&package_type=" + "Circle" + "&user_id=" + user._id, (content) => {
        ApiService.call('post', UriConfig.uri.PACKAGE_VALIDATE + "?package_type=Circle", { package: packageId, "package_type": "Circle", user_id: user._id }, (content) => {
            console.log(content, 'content');
            this.setState({
                loading: false,
                selectedPackage: content.package
            });
        }, (error, errors, content) => {
            this.setState({ loading: false });

            if (error) {
                Alert.alert('Error', error);
            }

        });
    }

    purchasePackage = (item) => {
        console.log(item, 'item');
        let { packageId, user } = this.state;
        this.setState({ loading: true });
        ApiService.call('post', UriConfig.uri.PACKAGE_PURCHASE + "/circle", { package: packageId, "package_type": "Circle", user_id: user._id }, (content) => {
            this.setState({
                loading: false,
                subscription: content.subscription
            });
            this.payment(content);
        }, (error, errors, content) => {
            this.setState({ loading: false });
        });
    }

    async payment(content) {
        try {
            console.log(content, 'content payment');
            // let amount = content.razorpay_order.amount;
            let amount = content.subscription.paid_amount;
            let user = JSON.parse(await StorageService.fetch('user'));
            console.log(user, 'user');
            var options = {
                description: '',
                // image: 'https://i.imgur.com/3g7nmJC.png',
                currency: 'INR',
                key: AppConfig.razorpay_key,
                amount: amount * 100,
                name: 'TrackUGo',
                order_id: content.razorpay_order.id,
                prefill: {
                    email: user.email,
                    contact: user.phone,
                    name: user.username,
                },
                theme: { color: Colors.theme.mainColor }
            }
            RazorpayCheckout.open(options).then((data) => {
                console.log(data, 'RazorpayCheckout');
                this.verifyPayment(content, data);
            }).catch((error) => {
                console.log(error, 'RazorpayCheckout error');
                ToastAndroid.show('Payment failed', ToastAndroid.LONG);
            });
        } catch (error) {
            console.log(error);
        }
    }

    async verifyPayment(content, razorpay) {
        try {
            let circle_expiry_date = "";
            let uri = UriConfig.uri.circle_paymentresponse,
                params = {
                    "amount": content.subscription.paid_amount,
                    "razorpay_payment_id": razorpay.razorpay_payment_id,
                    "razorpay_order_id": razorpay.razorpay_order_id,
                    // "razorpay_order_id": content.subscription._id,
                    "payment_id": content.subscription.payment,
                    "razorpay_signature": razorpay.razorpay_signature,
                    "message": "message"
                };
            ApiService.call('post', uri + '/' + content.subscription._id, params,async (content) => {
                console.log('PACKAGE_PAYMENT_RESPONSE', content);
                circle_expiry_date = content.subscription.expiry_date;
                await StorageService.store('circle_expiry_date', JSON.stringify(moment(circle_expiry_date).add(1,'M')));
                console.log('Add month', JSON.stringify(moment(circle_expiry_date).add(1,'M')));
                this.setState({ isLoading: false });
                ToastAndroid.show('Payment success', ToastAndroid.LONG);
                NavigationService.navigate('homeStack', 'Home')
            }, (error, errors, content) => {
                ToastAndroid.show('Payment failed', ToastAndroid.LONG);
                this.setState({ circle: [], isLoading: false, });
            });
            

        } catch (error) {
            console.log(error);
        }
    }

    render() {
        let { refreshing, packages, selectedPackage } = this.state;
        return (
            <View style={mainStyle.contentArea}>
                <Loader loading={this.state.loading} />
                {
                    selectedPackage &&
                    <View style={circleDetailsStyle.selectedPackage}>
                        <Text style={[mainStyle.textlg, mainStyle.marginBottom5, mainStyle.fontbl]}>{selectedPackage.package_name}</Text>
                        <Text style={[mainStyle.textnm, mainStyle.marginBottom5, mainStyle.fontrg]}>
                            Validity Period: <Text style={mainStyle.fontmd}>{GeneralService.dateFormat(selectedPackage.start_date, 'd/m/Y')} - {GeneralService.dateFormat(selectedPackage.expiry_date, 'd/m/Y')}</Text>
                        </Text>
                        <TouchableOpacity onPress={() => this.purchasePackage()}>
                            <Text style={[circleDetailsStyle.payButton, mainStyle.fontmd]}>Pay {GeneralService.amountString(selectedPackage.price)}</Text>
                        </TouchableOpacity>
                    </View>
                }
                {
                    selectedPackage &&
                    <View style={[mainStyle.dividerWithMargin, { marginHorizontal: 10 }]} />
                }
                <FlatList
                    data={packages}
                    refreshing={refreshing}
                    onRefresh={() => this.getPackages()}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => item._id}
                    ListEmptyComponent={this.renderEmptyContainer()}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    renderItem={({ item, index, separators }) => {
                        return (
                            <View style={[circleDetailsStyle.packageItem, mainStyle.flexRow]}>
                                <View style={[circleDetailsStyle.packageLeftPart, mainStyle.flexOne]}>
                                    <Text style={[mainStyle.textlg, mainStyle.textCenter, mainStyle.fontbl, circleDetailsStyle.txtPriceList]}>{GeneralService.amountString(item.price)}</Text>
                                    <Text style={[mainStyle.textsm, mainStyle.textCenter, mainStyle.lightText, mainStyle.fontrg]}>{item.period} Days</Text>
                                </View>
                                <View style={mainStyle.flexThree}>
                                    <Text style={[mainStyle.textlg, mainStyle.fontbl, circleDetailsStyle.txtLabelList, { fontWeight: '700' }]}>{item.package_name}</Text>
                                    <Text style={[mainStyle.textsm, mainStyle.lightText, mainStyle.fontrg]}>{item.package_description}</Text>
                                </View>
                                <View style={circleDetailsStyle.vwBtn}>
                                    {/* <Text style={[mainStyle.blueText, mainStyle.fontmd, { color: Colors.white }]} onPress={() => this.purchasePackage(item)}>Apply</Text> */}
                                    <Text style={[mainStyle.blueText, mainStyle.fontmd, { color: Colors.white }]} onPress={() => this.selectPackage(item)}>Apply</Text>
                                </View>
                            </View>
                        )
                    }}
                />
                <View style={{ flexDirection: 'row', width: '100%', height: '10%', marginBottom: '15%', justifyContent: 'center' }}>
                    <TouchableOpacity onPress={() => { NavigationService.navigate('homeStack', 'CircleList') }} style={{
                        marginBottom: 10,
                        alignSelf: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 42,
                        width: '80%',
                        borderRadius: 10,
                        backgroundColor: Colors.black,
                        marginTop: 20
                    }}>
                        <Text style={{
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: 'bold'
                        }}>Circle List</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
    renderEmptyContainer() {
        return (
            <View style={mainStyle.itemsCenter}>
                <Text style={mainStyle.fontrg}>{this.state.refreshing ? "Fetching packages..." : "No package available."}</Text>
            </View>
        );
    }
}