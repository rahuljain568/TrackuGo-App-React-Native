/**
 * Component to handle payments related operations.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

import { Icon } from 'react-native-elements';

import UriConfig from '../config/uri.config';

import mainStyle from '../styles/main.style';
import paymentStyle from '../styles/payment.style';

import Colors from '../modules/colors.module';
import Loader from '../modules/loader.module';

import ApiService from '../services/api.service';
import GeneralService from '../services/general.service';
import NavigationService from '../services/navigation.service';

export default class PaymentsComponent extends Component {

  constructor() {
    super();

    this.state = {
      page: 1,
      nextPage: null,

      refreshing: false,
      payments: []
    };
  }

  componentDidMount() {
    this.props.navigation.addListener('didFocus', (payload) => {
      this.getPayments();
    });
  }

  getPayments = (page) => {

    this.setState({ refreshing: true });

    if (!page) {
      this.setState({ payments: [] });
    }

    ApiService.call('get', UriConfig.uri.PAYMENTS + (page ? "?page=" + page : ""), {}, (content) => {

      let payments = content.payments;

      this.setState({
        refreshing: false,
        nextPage: payments.next_page,
        payments: [...this.state.payments, ...payments.items]
      });
      // if (payments.items.length == 0) {
      //   alert("Currently no data are available!..")
      //   return;
      // }
    }, (error, errors, content) => {
      this.setState({ refreshing: false });
    });
  }

  nextPagePayments = () => {
    let { page, nextPage } = this.state;

    if (nextPage && nextPage !== page) {
      this.setState({ page: nextPage }, () => {
        this.getPayments(nextPage);
      });
    }
  }

  render() {

    let { payments, refreshing } = this.state;

    return (
      <View style={mainStyle.body}>
        <View style={mainStyle.contentArea}>
          <FlatList
            data={payments}
            refreshing={refreshing}
            onRefresh={() => this.getPayments()}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => item._id}
            onEndReached={() => this.nextPagePayments()}
            ListEmptyComponent={this.renderEmptyContainer()}
            renderItem={({ item, index, separators }) => {


              let iconColor = "black";
              switch (item.payment_status) {
                case "PENDING":
                  iconColor = Colors.yellow;
                  break;

                case "SUCCESS":
                  iconColor = Colors.green;
                  break;

                default:
                  break;
              }

              return (

                <TouchableOpacity onPress={() => { NavigationService.navigate("homeStack", "PaymentDetail", { id: item._id }) }}
                  activeOpacity={0.80}
                  style={[paymentStyle.itemView, { borderLeftColor: iconColor }]}>
                  <View style={[paymentStyle.paymentListRow, { marginTop: 0 }]}>
                    <Text style={[mainStyle.textnm, mainStyle.fontrg, mainStyle.flexOne]}>{item.reference_model}</Text>
                    <Text style={[mainStyle.textsm, mainStyle.fontrg, mainStyle.lightText, mainStyle.flexOne, mainStyle.textRight]}>{GeneralService.dateFormat(item.payment_date, 'd/m/Y h:i A')}</Text>
                  </View>
                  <View>
                    <Text style={[mainStyle.textlg, mainStyle.fontmd]}>{item.reference}</Text>
                  </View>
                  <View style={paymentStyle.paymentListRow}>
                    <Text style={[mainStyle.textnm, mainStyle.fontbl, { color: iconColor }, mainStyle.flexOne]}>Status</Text>
                    <Text style={[mainStyle.textnm, mainStyle.fontbl, { color: iconColor }, mainStyle.flexOne, mainStyle.textRight]}>{item.payment_status}</Text>
                  </View>
                  <View style={paymentStyle.paymentListRow}>
                    <Text style={[mainStyle.textlg, mainStyle.fontmd, mainStyle.flexOne]}>Amount</Text>
                    <Text style={[mainStyle.textlg, mainStyle.fontmd, mainStyle.flexOne, mainStyle.textRight]}>{GeneralService.amountString(item.amount)}</Text>
                  </View>
                </TouchableOpacity>
              )
            }}
          />
        </View>
      </View>
    );
  }

  renderEmptyContainer() {
    return (
      <View style={mainStyle.itemsCenter}>
        <Text style={mainStyle.fontrg}>{this.state.refreshing ? "Fetching payments..." : "No payment found."}</Text>
      </View>
    );
  }

}

export class PaymentDetailComponent extends Component {

  constructor() {
    super();

    this.state = {
      loading: false,
      payment: null,
    };
  }

  componentDidMount() {
    this.getPaymentDetail();
  }

  getPaymentDetail = () => {

    let { navigation } = this.props,
      id = navigation.getParam('id', null);

    this.setState({ loading: true });

    ApiService.call('get', UriConfig.uri.PAYMENT_DETAILS + "/" + id, {}, (content) => {

      this.setState({
        loading: false,
        payment: content.payment
      });

    }, (error, errors, content) => {
      this.setState({ loading: false });
    });
  }

  verifyPaymentStatus = () => {

    let { payment } = this.state,
      uri = null;

    if (payment.reference_model == "Order") {
      uri = UriConfig.uri.ORDER_PAYMENT_VERIFY;
    } else if (payment.reference_model == "Subscription") {
      uri = UriConfig.uri.PACKAGE_PAYMENT_VERIFY;
    } else {
      return;
    }

    this.setState({ loading: true });

    ApiService.call('get', uri + "/" + payment.reference._id, {}, (content) => {

      this.setState({ loading: false });

      this.getPaymentDetail();

    }, (error, errors, content) => {
      this.setState({ loading: false });
    });
  }

  render() {

    let { loading, payment } = this.state;

    return (
      <SafeAreaView>
        <ScrollView>
          <View style={[mainStyle.contentArea, mainStyle.body]}>
            <Loader loading={loading} />

            {
              payment &&
              <View>

                <View style={paymentStyle.detailBox}>
                  <View style={[paymentStyle.paymentListRow, mainStyle.marginBottom5, { marginTop: 0 }]}>
                    <Text style={[mainStyle.textlg, mainStyle.fontmd, mainStyle.flexOne, paymentStyle.labelColor]}>{payment.reference_model}</Text>
                    <View style={mainStyle.flexOne}>
                      {
                        payment.payment_status == "PENDING" &&
                        <View style={mainStyle.listRight}>
                          <TouchableOpacity onPress={() => this.verifyPaymentStatus()}>
                            <Icon name='refresh' type='font-awesome' size={20} color={Colors.yellow} />
                          </TouchableOpacity>
                        </View>
                      }
                    </View>
                  </View>

                  <View style={[paymentStyle.paymentListRow, { marginTop: 0 }]}>
                    <Text style={[mainStyle.fontmd, mainStyle.textlg,paymentStyle.totalColor]}>{payment.reference._id}</Text>
                    <Text style={[mainStyle.textsm, mainStyle.fontrg, mainStyle.lightText, mainStyle.flexOne, mainStyle.textRight]}>{GeneralService.dateFormat(payment.payment_date, 'd/m/Y h:i A')}</Text>
                  </View>
                  <View style={paymentStyle.paymentListRow}>
                    <Text style={[mainStyle.textlg, mainStyle.fontrg, mainStyle.flexOne]}>Payment Ref</Text>
                    <Text style={[mainStyle.textlg, mainStyle.fontrg, mainStyle.flexOne, mainStyle.textRight]}>{[payment._id]}</Text>
                  </View>
                  {
                    payment.payment_mode &&
                    <View style={paymentStyle.paymentListRow}>
                      <Text style={[mainStyle.textlg, mainStyle.fontrg, mainStyle.flexOne]}>Payment Via</Text>
                      <Text style={[mainStyle.textlg, mainStyle.fontrg, mainStyle.flexOne, mainStyle.textRight]}>{[payment.payment_mode]}</Text>
                    </View>
                  }
                  {
                    payment.bank_transaction_id &&
                    <View style={paymentStyle.paymentListRow}>
                      <Text style={[mainStyle.textlg, mainStyle.fontrg, mainStyle.flexOne]}>Bank Ref</Text>
                      <Text style={[mainStyle.textlg, mainStyle.fontrg, mainStyle.flexOne, mainStyle.textRight]}>{[payment.bank_transaction_id]}</Text>
                    </View>
                  }
                  {
                    payment.razorpay_payment_id &&
                    <View style={paymentStyle.paymentListRow}>
                      <Text style={[mainStyle.textlg, mainStyle.fontrg, mainStyle.flexOne]}>Razorpay Ref</Text>
                      <Text style={[mainStyle.textsm, mainStyle.fontrg, mainStyle.flexOne, mainStyle.textRight]}>{[payment.razorpay_payment_id]}</Text>
                    </View>
                  }
                  {
                    payment.payment_message &&
                    <View style={paymentStyle.paymentListRow}>
                      <Text style={[mainStyle.textlg, mainStyle.fontrg, mainStyle.flexOne]}>Message</Text>
                      <Text style={[mainStyle.textlg, mainStyle.fontrg, mainStyle.flexOne, mainStyle.textRight]}>{[payment.payment_message]}</Text>
                    </View>
                  }
                  <View style={paymentStyle.paymentListRow}>
                    <Text style={[mainStyle.textlg, mainStyle.fontrg, mainStyle.flexOne]}>Status</Text>
                    <Text style={[mainStyle.textlg, mainStyle.fontrg, mainStyle.flexOne, mainStyle.textRight, { color: payment.payment_status == "SUCCESS" ? Colors.green : Colors.yellow }]}>{payment.payment_status}</Text>
                  </View>
                  <View style={paymentStyle.paymentListRow}>
                    <Text style={[mainStyle.textlg, mainStyle.fontmd, mainStyle.flexOne,paymentStyle.totalColor]}>Amount</Text>
                    <Text style={[mainStyle.textlg, mainStyle.fontmd, mainStyle.flexOne, mainStyle.textRight,paymentStyle.totalColor]}>{GeneralService.amountString(payment.amount)}</Text>
                  </View>
                  {/* {
                    payment.reference_model == "Order" &&
                    <View style={mainStyle.flexRow}>
                      <Text style={[paymentStyle.textLeft, mainStyle.fontrg]}>Delivery Date</Text>
                      <Text style={[paymentStyle.textRight, mainStyle.fontmd]}>{GeneralService.dateFormat(payment.reference.delivery_date, 'd/m/Y')}</Text>
                    </View>
                  } */}
                </View>

                {
                  payment.reference_model == "Order" &&

                  <View>
                    <View style={paymentStyle.detailBox}>
                      <View style={[paymentStyle.paymentListRow, { marginTop: 0 }]}>
                        <Text style={[mainStyle.textlg, mainStyle.fontmd, mainStyle.flexOne, paymentStyle.labelColor]}>{payment.reference_model} Details</Text>
                      </View>
                      <View style={[paymentStyle.marginVertical5]}>

                        {
                          payment.reference.devices.map((deviceModel) => {
                            return (
                              <View key={deviceModel.device_model._id || null}>
                                {/* <Text style={[mainStyle.textnm, mainStyle.fontmd]}>{deviceModel.device_model.model_name || null}</Text> */}
                                {/* <View style={{ marginVertical: 2 }} /> */}
                                <View style={mainStyle.flexRow}>
                                  <Text style={[paymentStyle.textLeft, mainStyle.fontrg]}>Delivery Date</Text>
                                  <Text style={[paymentStyle.textRight, mainStyle.fontrg]}>{GeneralService.dateFormat(payment.reference.delivery_date, 'd/m/Y')}</Text>
                                </View>
                                <View style={mainStyle.flexRow}>
                                  <Text style={[paymentStyle.textLeft, mainStyle.fontrg]}>Status</Text>
                                  <Text style={[paymentStyle.textRight, mainStyle.fontmd]}>{payment.reference.order_status}</Text>
                                </View>

                                <View style={[mainStyle.divider, { marginVertical: 5 }]} />
                                <Text style={[mainStyle.textnm, mainStyle.fontmd]}>{deviceModel.device_model.model_name || null}</Text>
                                <View style={mainStyle.flexRow}>
                                  <Text style={[paymentStyle.textLeft, mainStyle.fontrg]}>Quantity</Text>
                                  <Text style={[paymentStyle.textRight, mainStyle.fontrg]}>{deviceModel.quantity}</Text>
                                </View>
                                <View style={mainStyle.flexRow}>
                                  <Text style={[paymentStyle.textLeft, mainStyle.fontrg]}>Price</Text>
                                  <Text style={[paymentStyle.textRight, mainStyle.fontrg]}>{GeneralService.amountString(deviceModel.price)}</Text>
                                </View>
                                <View style={mainStyle.flexRow}>
                                  <Text style={[paymentStyle.textLeft, mainStyle.fontrg]}>Total</Text>
                                  <Text style={[paymentStyle.textRight, mainStyle.fontmd]}>{GeneralService.amountString(deviceModel.quantity * deviceModel.price)}</Text>
                                </View>
                              </View>
                            );
                          })
                        }

                      </View>

                      <View style={mainStyle.divider} />

                      <View style={{ marginTop: 5 }}>
                        <View style={mainStyle.flexRow}>
                          <Text style={[paymentStyle.textLeft, mainStyle.fontrg]}>Subtotal</Text>
                          <Text style={[paymentStyle.textRight, mainStyle.fontrg]}>{GeneralService.amountString(payment.reference.items_price)}</Text>
                        </View>
                        <View style={mainStyle.flexRow}>
                          <Text style={[paymentStyle.textLeft, mainStyle.fontrg]}>Delivery Charges</Text>
                          <Text style={[paymentStyle.textRight, mainStyle.fontrg]}>{GeneralService.amountString(payment.reference.delivery_charges)}</Text>
                        </View>
                        <View style={[mainStyle.divider, { marginVertical: 5 }]} />
                        <View style={mainStyle.flexRow}>
                          <Text style={[paymentStyle.textLeft, mainStyle.fontbl,paymentStyle.totalColor]}>Order Total</Text>
                          <Text style={[paymentStyle.textRight, mainStyle.fontbl,paymentStyle.totalColor]}>{GeneralService.amountString(payment.reference.order_total)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={paymentStyle.detailBox}>
                      <Text style={[mainStyle.textlg, mainStyle.fontmd, paymentStyle.labelColor]}>Order Timeline</Text>

                      {
                        payment.reference.order_timeline.map((timeline) => {
                          return (
                            <View key={timeline._id}>
                              <View style={paymentStyle.paymentListRow}>
                                <Text style={[mainStyle.textnm, mainStyle.fontrg]}>{timeline.title}</Text>
                                <Text style={[mainStyle.textxs, mainStyle.fontrg, mainStyle.flexOne, mainStyle.textRight]}>{GeneralService.dateFormat(timeline.time, 'd/m/Y h:i a')}</Text>
                              </View>
                              <View style={paymentStyle.paymentListRow}>
                                <Text style={[mainStyle.textsm, mainStyle.fontrg, mainStyle.flexOne]}>{timeline.description}</Text>
                              </View>
                            </View>
                          );
                        })
                      }
                    </View>
                  </View>
                }

                {
                  payment.reference_model == "Subscription" &&

                  <View>
                    <View style={[paymentStyle.paymentListRow, { marginTop: 0 }]}>
                      <Text style={[mainStyle.textlg, mainStyle.fontmd, mainStyle.flexOne, paymentStyle.labelColor]}>Package Details</Text>
                    </View>

                    <View style={paymentStyle.detailBox}>
                      <View style={mainStyle.flexRow}>
                        <Text style={[paymentStyle.textLeft, mainStyle.fontrg]}>Device</Text>
                        <Text style={[paymentStyle.textRight, mainStyle.fontmd]}>{payment.reference.device.license_plate || null}</Text>
                      </View>

                      <View style={mainStyle.flexRow}>
                        <Text style={[paymentStyle.textLeft, mainStyle.fontrg]}>Package</Text>
                        <Text style={[paymentStyle.textRight, mainStyle.fontmd]}>{payment.reference.package.package_name || null}</Text>
                      </View>

                      <View style={mainStyle.flexRow}>
                        <Text style={[paymentStyle.textLeft, mainStyle.fontrg]}>Validity</Text>
                        <Text style={[paymentStyle.textRight, mainStyle.fontmd]}>{payment.reference.package.period || 0} Days</Text>
                      </View>

                      <View style={mainStyle.flexRow}>
                        <Text style={[paymentStyle.textLeft, mainStyle.fontrg]}>Period</Text>
                        <Text style={[paymentStyle.textRight, mainStyle.fontmd]}>{GeneralService.dateFormat(payment.reference.start_date, 'd/m/y')} - {GeneralService.dateFormat(payment.reference.expiry_date, 'd/m/y')}</Text>
                      </View>

                      <View style={mainStyle.flexRow}>
                        <Text style={[paymentStyle.textLeft, mainStyle.fontrg]}>Amount</Text>
                        <Text style={[paymentStyle.textRight, mainStyle.fontmd]}>{GeneralService.amountString(payment.reference.paid_amount)}</Text>
                      </View>


                      <View style={paymentStyle.detailBox}>

                        <Text style={[mainStyle.textlg, mainStyle.fontmd, mainStyle.marginBottom5, paymentStyle.labelColor]}>Subscription Timeline</Text>

                        {
                          payment.reference.subscription_timeline.map((timeline) => {
                            return (
                              <View style={paymentStyle.deviceItem} key={timeline._id}>
                                <Text style={[mainStyle.textnm, mainStyle.fontrg]}>{timeline.title}</Text>
                                <View style={paymentStyle.paymentListRow}>
                                  <Text style={[mainStyle.textnm, mainStyle.fontrg]}>{timeline.title}</Text>
                                  <Text style={[mainStyle.textxs, mainStyle.fontrg, mainStyle.flexOne, mainStyle.textRight]}>{GeneralService.dateFormat(timeline.time, 'd/m/Y h:i a')}</Text>
                                </View>
                                <View style={paymentStyle.paymentListRow}>
                                  <Text style={[mainStyle.textsm, mainStyle.fontrg, mainStyle.flexOne]}>{timeline.description}</Text>
                                </View>
                              </View>
                            );
                          })
                        }
                      </View>
                    </View>
                  </View>
                }
{
                  payment.reference_model == "Circle Subscription" &&

                  <View>
                    <View style={[paymentStyle.paymentListRow, { marginTop: 0 }]}>
                      <Text style={[mainStyle.textlg, mainStyle.fontmd, mainStyle.flexOne, paymentStyle.labelColor]}>Package Details</Text>
                    </View>

                    <View style={paymentStyle.detailBox}>
                      {/* <View style={mainStyle.flexRow}>
                        <Text style={[paymentStyle.textLeft, mainStyle.fontrg]}>Device</Text>
                        <Text style={[paymentStyle.textRight, mainStyle.fontmd]}>{payment.reference.device.license_plate || null}</Text>
                      </View> */}

                      <View style={mainStyle.flexRow}>
                        <Text style={[paymentStyle.textLeft, mainStyle.fontrg]}>Package</Text>
                        <Text style={[paymentStyle.textRight, mainStyle.fontmd]}>{payment.reference.package.package_name || null}</Text>
                      </View>

                      <View style={mainStyle.flexRow}>
                        <Text style={[paymentStyle.textLeft, mainStyle.fontrg]}>Validity</Text>
                        <Text style={[paymentStyle.textRight, mainStyle.fontmd]}>{payment.reference.package.period || 0} Days</Text>
                      </View>

                      <View style={mainStyle.flexRow}>
                        <Text style={[paymentStyle.textLeft, mainStyle.fontrg]}>Period</Text>
                        <Text style={[paymentStyle.textRight, mainStyle.fontmd]}>{GeneralService.dateFormat(payment.reference.start_date, 'd/m/y')} - {GeneralService.dateFormat(payment.reference.expiry_date, 'd/m/y')}</Text>
                      </View>

                      <View style={mainStyle.flexRow}>
                        <Text style={[paymentStyle.textLeft, mainStyle.fontrg]}>Amount</Text>
                        <Text style={[paymentStyle.textRight, mainStyle.fontmd,mainStyle.textlg,paymentStyle.totalColor]}>{GeneralService.amountString(payment.reference.paid_amount)}</Text>
                      </View>


                      {/* <View style={paymentStyle.detailBox}>

                        <Text style={[mainStyle.textlg, mainStyle.fontmd, mainStyle.marginBottom5, paymentStyle.labelColor]}>Subscription Timeline</Text>

                        {
                          payment.reference.subscription_timeline.map((timeline) => {
                            return (
                              <View style={paymentStyle.deviceItem} key={timeline._id}>
                                <Text style={[mainStyle.textnm, mainStyle.fontrg]}>{timeline.title}</Text>
                                <View style={paymentStyle.paymentListRow}>
                                  <Text style={[mainStyle.textnm, mainStyle.fontrg]}>{timeline.title}</Text>
                                  <Text style={[mainStyle.textxs, mainStyle.fontrg, mainStyle.flexOne, mainStyle.textRight]}>{GeneralService.dateFormat(timeline.time, 'd/m/Y h:i a')}</Text>
                                </View>
                                <View style={paymentStyle.paymentListRow}>
                                  <Text style={[mainStyle.textsm, mainStyle.fontrg, mainStyle.flexOne]}>{timeline.description}</Text>
                                </View>
                              </View>
                            );
                          })
                        }
                      </View> */}
                    
                    </View>
                  </View>
                }

              </View>
            }

          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  renderEmptyContainer() {
    return (
      <View style={mainStyle.itemsCenter}>
        <Text style={mainStyle.fontrg}>{this.state.refreshing ? "Fetching subscriptions..." : "No subscription availed for device."}</Text>
      </View>
    );
  }

  packageButtonRender = () => {
    let { device, user } = this.state;

    if (!device || !user) {
      return null;
    }

    if (user.parent) {
      return (
        <View style={mainStyle.itemsCenter}>
          <Text style={mainStyle.fontrg}>Please ask your adminstrator to extend subscription.</Text>
        </View>
      );
    }

    return (
      <View style={mainStyle.itemsCenter}>
        <TouchableOpacity onPress={() => NavigationService.navigate('homeStack', 'Packages', { device: device })}>
          <Text>See Packages</Text>
        </TouchableOpacity>
      </View>
    );
  }

}