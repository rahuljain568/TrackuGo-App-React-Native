/**
 * Component to handle device product related operations.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  Dimensions,
  SafeAreaView,
  TouchableOpacity, TouchableNativeFeedback
} from 'react-native';

import { colors, Icon } from 'react-native-elements';
import ButtonComponent from '../components/partials/Button.component';

import UriConfig from '../config/uri.config';

import mainStyle from '../styles/main.style';
import productStyle from '../styles/product.style';

import Loader from '../modules/loader.module';
import Colors from '../modules/colors.module';
import Icons from '../modules/icons.module';

import ApiService from '../services/api.service';
import GeneralService from '../services/general.service';
import StorageService from '../services/storage.service';
import NavigationService from '../services/navigation.service';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class ProductsComponent extends Component {
  static navigationOptions = ({ navigation }) => { 
    let params = navigation.state.params || {},
    device = params.device || null;
    return {
      headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
      ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
    };
  };
  constructor() {
    super();

    this.state = {
      refreshing: false,
      products: [],
      cartProducts: [],
      tabSelected: '',
    };
  }

  async componentDidMount() {

    let baseUrl = await StorageService.fetch('assets_url'),
      folders = JSON.parse(await StorageService.fetch('folders'));

    this.setState({ imagesBaseUrl: baseUrl + folders.device_images });

    this.props.navigation.addListener('didFocus', (payload) => {
      this.getProducts();
    });
  }

  getProducts = () => {

    this.setState({ refreshing: true });

    ApiService.call('get', UriConfig.uri.DEVICE_MODELS + "?category=" + this.state.tabSelected, {}, (content) => {

      this.setState({
        refreshing: false,
        products: content.device_models
      });

      this.getCartProducts();

    }, (error, errors, content) => {
      this.setState({ refreshing: false });
    });
  }

  getCartProducts = () => {

    ApiService.call('get', UriConfig.uri.USER_CART, {}, (content) => {

      this.setState({ cartProducts: content.cart_items });
      // if (content.cart_items.length == 0) {
      //   alert("Currently no data are available!..")
      //   return;
      // }
    }, (error, errors, content) => {

    });
  }

  alterCartProduct = (id, change) => {

    let selectedItem = this.itemFromCart(id),
      newQuantity = (selectedItem ? selectedItem.quantity : 0) + change,
      methodType = 'post';

    if (newQuantity <= 0) {
      methodType = 'delete';
      newQuantity = 0;
    } else if (selectedItem) {
      methodType = 'put';
    }

    let params = {
      device_model_id: id,
      quantity: newQuantity
    };

    ApiService.call(methodType, UriConfig.uri.USER_CART + (selectedItem ? "/" + id : ""), params, (content) => {

      this.getCartProducts();

    }, (error, errors, content) => {

    });
  }

  itemFromCart = (id) => {
    let { cartProducts } = this.state,
      selectedItem = null;

    for (let cartProduct of cartProducts) {
      if (cartProduct.device_model._id == id) {
        selectedItem = cartProduct;
      }
    }
    return selectedItem;
  }

  tabSelect = (tab) => {
    this.setState({ tabSelected: tab }, () => {
      this.getProducts();
    });
  }

  render() {

    let { refreshing, products, cartProducts, tabSelected } = this.state;
    let size = Dimensions.get('window').width / 2;

    return (
      <View style={mainStyle.flexOne}>
        <View style={[mainStyle.contentArea, { paddingBottom: 80 }]}>

          <View style={productStyle.tabs}>
            <Text style={[productStyle.tab, mainStyle.fontmd, tabSelected == "" ? productStyle.tabActive : null]} onPress={() => this.tabSelect('')}>All</Text>
            <Text style={[productStyle.tab, mainStyle.fontmd, tabSelected == "2_WHEELER" ? productStyle.tabActive : null]} onPress={() => this.tabSelect('2_WHEELER')}>2 Wheeler</Text>
            <Text style={[productStyle.tab, mainStyle.fontmd, tabSelected == "4_WHEELER" ? productStyle.tabActive : null]} onPress={() => this.tabSelect('4_WHEELER')}>4 Wheeler</Text>
          </View>

          <FlatList
            // numColumns={2}
            data={products}
            refreshing={refreshing}
            onRefresh={() => this.getProducts()}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => item._id}
            ListEmptyComponent={this.renderEmptyContainer()}
            renderItem={({ item, index, separators }) => {

              let cartItem = this.itemFromCart(item._id);

              return (

                <TouchableOpacity activeOpacity={0.80}
                  onPress={() => NavigationService.navigate('homeStack', 'ProductDetail', { id: item._id })}
                  style={productStyle.productItem}>
                  {/* <View style={[productStyle.productItem, { width: size - 20 }]}> */}
                  <View style={{
                    flex: 4.5, backgroundColor: Colors.lightGray, borderRadius: 10, marginVertical: 5
                  }}>
                    <View style={mainStyle.itemsCenter}>
                      {this.renderProductImage(item.image_files)}
                    </View>
                  </View>
                  <View style={{
                    flex: 5.5, paddingLeft: 10
                  }}>
                    <Text style={[productStyle.productTitle, mainStyle.fontbl]}>{item.model_name}</Text> 
                    <Text style={[productStyle.productAmount, mainStyle.fontmd]}>{GeneralService.amountString(item.price)}</Text>
                    <Text style={[productStyle.productDetail, mainStyle.fontlt]} numberOfLines={3}>{item.model_description}</Text>

                    <View style={[mainStyle.itemsCenter, {
                      position: 'absolute', bottom: 5, right: 0, left: 10,
                      // flexDirection: 'row', justifyContent: 'space-between',
                      justifyContent:'center',alignItems:'center' 
                    }]}> 

                      <View style={productStyle.productButtonView}>
                        <TouchableOpacity onPress={() => this.alterCartProduct(item._id, -1)}>
                          <View style={[productStyle.productButton, { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 }]}>
                            <Icon name='minus' type='font-awesome' size={12} color={Colors.white} />
                          </View>
                        </TouchableOpacity>
                        <Text style={productStyle.productCount}>{cartItem ? cartItem.quantity : 0}</Text>
                        <TouchableOpacity onPress={() => this.alterCartProduct(item._id, 1)}>
                          <View style={[productStyle.productButton, { borderTopRightRadius: 20, borderBottomRightRadius: 20 }]}>
                            <Icon name='plus' type='font-awesome' size={12} color={Colors.white} />
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            }}
          />

        </View>

        {
          cartProducts && cartProducts.length > 0 &&
          <View style={productStyle.cartButtonView}>
            <ButtonComponent text={"Go to Cart (" + cartProducts.length + ")"} onClick={this.navigateToCart.bind(this)} />
          </View>
        }
      </View>
    );
  }

  navigateToCart = () => {
    return NavigationService.navigate('homeStack', 'Cart');
  }

  renderProductImage(imageFiles) {
    let imageFile = imageFiles && imageFiles.length > 0 ? imageFiles[0] : null,
      imageFileUrl = this.state.imagesBaseUrl && imageFile ? (this.state.imagesBaseUrl + imageFile.file_name) : null;

    if (imageFileUrl) {
      return (
        // <Image source={{ uri: imageFileUrl }} style={productStyle.productImage} />
        <Image source={{ uri: 'https://www.letstrack.in/img/Products/Big/Image1/11_3.png' }} style={productStyle.productImage} />
      );
    } else {
      return (
        // <Icon name='microchip' type='font-awesome' size={60} color={Colors.gray} />
        <Image source={{ uri: 'https://www.letstrack.in/img/Products/Big/Image1/11_3.png' }} style={productStyle.productImage} />
      );
    }
  }

  renderEmptyContainer() {
    return (
      <View style={mainStyle.itemsCenter}>
        <Text style={mainStyle.fontrg}>{this.state.refreshing ? "Fetching products..." : "No products found."}</Text>
      </View>
    );
  }

}

const tmpPackage = [
  {
    package: '1 year package',
    price: 250,
    year: '1 Year',
    checked: false
  },
  {
    package: '2 year package',
    price: 500,
    year: '2 Year',
    checked: false
  },
  {
    package: '3 year package',
    price: 600,
    year: '3 Year',
    checked: false
  },
  {
    package: '4 year package',
    price: 800,
    year: '4 Year',
    checked: false
  },
]
export class ProductDetailComponent extends Component {



  constructor() {
    super();

    this.state = {
      loading: false,
      product: null,
      cartProducts: [],
      checkedPackage: 0
    };
    // this.reRenderSomething = this.props.navigation.addListener('focus', () => {
    //   this.getProduct();
    // });
  }

  async componentDidMount() {
    let baseUrl = await StorageService.fetch('assets_url'),
      folders = JSON.parse(await StorageService.fetch('folders'));

    this.setState({ imagesBaseUrl: baseUrl + folders.device_images });

    this.getProduct();
  } 

  getProduct = () => {

    let { navigation } = this.props,
      id = navigation.getParam('id', null);

    this.setState({ loading: true });

    ApiService.call('get', UriConfig.uri.DEVICE_MODEL_DETAILS + "/" + id, {}, (content, status) => {

      this.setState({
        loading: false,
        product: content.device_model
      });

      this.getCartProducts();

    }, (error, errors, content) => {
      this.setState({ refreshing: false });
    });
  }

  getCartProducts = () => {

    ApiService.call('get', UriConfig.uri.USER_CART, {}, (content) => {

      this.setState({ cartProducts: content.cart_items });

    }, (error, errors, content) => {

    });
  }

  alterCartProduct = (id, change) => {

    let selectedItem = this.itemFromCart(id),
      newQuantity = (selectedItem ? selectedItem.quantity : 0) + change,
      methodType = 'post';

    if (newQuantity <= 0) {
      methodType = 'delete';
      newQuantity = 0;
    } else if (selectedItem) {
      methodType = 'put';
    }

    let params = {
      device_model_id: id,
      quantity: newQuantity
    };

    ApiService.call(methodType, UriConfig.uri.USER_CART + (selectedItem ? "/" + id : ""), params, (content) => {

      this.getCartProducts();

    }, (error, errors, content) => {

    });
  }

  itemFromCart = (id) => {
    let { cartProducts } = this.state,
      selectedItem = null;

    for (let cartProduct of cartProducts) {
      if (cartProduct.device_model._id == id) {
        selectedItem = cartProduct;
      }
    }
    return selectedItem;
  }

  render() {

    let { loading, product, cartProducts } = this.state;
    let cartItem = product ? this.itemFromCart(product._id) : null;
    return (
      <View style={{ flex: 1 }}>
        {/* <View style={[mainStyle.contentArea, { paddingHorizontal: 0, paddingVertical: 0, }]}> */}
        <Loader loading={loading} />
        {
          product &&
          <ScrollView>
            <View style={productStyle.DetailTopCard}>
              <View style={{ flexDirection: 'row', marginTop: -10 }}>
                <View style={{ flex: 4 }}>
                  {this.renderProductImage(product.image_files)}
                </View>
                <View style={{ flex: 6, marginTop: 10 }}>
                  <Text style={[productStyle.productTitle, mainStyle.fontbl, mainStyle.marginBottom5,]}>{product.model_name}</Text>
                  <Text style={[mainStyle.fontrg, mainStyle.lightText, mainStyle.marginBottom5]}>{product.model_description}
                  In marketing, a product is an object or system made available for consumer use; it is anything that can be offered to a market to satisfy the desire or need</Text>

                </View>
              </View>
              <View style={productStyle.DetailPriceVw}>
                <Text style={[mainStyle.fontmd, mainStyle.textxl, mainStyle.textxl, mainStyle.yellowText]}>Price: {GeneralService.amountString(product.price)}</Text>
                <View style={productStyle.productButtonView}>
                  <TouchableOpacity onPress={() => this.alterCartProduct(product._id, -1)}>
                    <View style={[productStyle.productButton, { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 }]}>
                      <Icon name='minus' type='font-awesome' size={12} color={Colors.white} />
                    </View>
                  </TouchableOpacity>
                  <Text style={productStyle.productCount}>{cartItem ? cartItem.quantity : 0}</Text>
                  <TouchableOpacity onPress={() => this.alterCartProduct(product._id, 1)}>
                    <View style={[productStyle.productButton, { borderTopRightRadius: 20, borderBottomRightRadius: 20 }]}>
                      <Icon name='plus' type='font-awesome' size={12} color={Colors.white} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={productStyle.DetailCenterCard}>
              {
                product.default_package &&
                <View>
                  <Text style={[mainStyle.textlg, mainStyle.lightText, mainStyle.fontmd]}>Free Plan</Text>
                  <Text style={[mainStyle.textlg, mainStyle.lightText, mainStyle.fontlt]}>{product.default_package.package_name}</Text>
                  <Text style={[mainStyle.textlg, mainStyle.lightText, mainStyle.fontlt, mainStyle.marginBottom5,]}>{product.default_package.package_description}</Text>

                  {/* <View style={productStyle.packageListVw}>
                    <View style={productStyle.packageListCol1Vw}>
                      <Text style={[mainStyle.textlg, mainStyle.lightText, mainStyle.fontmd]}>Package</Text>
                    </View>
                    <View style={productStyle.packageListCol2Vw}>
                      <Text style={[mainStyle.textlg, mainStyle.lightText, mainStyle.fontmd]}>Total Year</Text>
                    </View>
                    <View style={productStyle.packageListCol2Vw}>
                      <Text style={[mainStyle.textlg, mainStyle.lightText, mainStyle.fontmd]}>Price</Text>
                    </View>
                    <View style={productStyle.packageListCol3Vw}>
                      <Text style={[mainStyle.textlg, mainStyle.lightText, mainStyle.fontmd]}>Select</Text>
                    </View>
                  </View> */}
                  {/* <View style={{ marginTop: 0 }}>
                    <FlatList
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={(item, index) => String(index)}
                      data={tmpPackage}
                      renderItem={({ item, index }) => this.renderItem(item, index)}
                      ItemSeparatorComponent={this.FlatListItemSeparator}
                      contentContainerStyle={{ paddingBottom: 15 }}
                    />
                  </View> */}
                  <Text style={[mainStyle.fontlt, mainStyle.lightText, mainStyle.marginBottom5]}>You will get free plan with device of worth
                     {GeneralService.amountString(product.default_package.price)} which will be valid for
                     {product.default_package.period} Days.</Text>
                </View>
              }
            </View>

            <View style={[productStyle.DetailBottomCard, {
              marginBottom: 0
            }]}>
              <View style={productStyle.DetailBottomCardRow}>
                <Text style={[mainStyle.textlg, mainStyle.lightText, mainStyle.fontlt,]}>Delivery Time</Text>
                <Text style={[mainStyle.textlg, mainStyle.lightText, mainStyle.fontlt,]}>{product.delivery_time}</Text>
              </View>
            </View>

            <View style={productStyle.DetailBottomCard}>
              <View style={productStyle.DetailBottomCardRow}>
                <Text style={[mainStyle.textlg, mainStyle.lightText, mainStyle.fontlt,]}>Price</Text>
                <Text style={[mainStyle.textlg, mainStyle.lightText, mainStyle.fontlt,]}>{GeneralService.amountString(product.price)}</Text>
              </View>
              <View style={productStyle.DetailBottomCardRow}>
                <Text style={[mainStyle.textlg, mainStyle.lightText, mainStyle.fontlt,]}>Delivery Charges</Text>
                <Text style={[mainStyle.textlg, mainStyle.lightText, mainStyle.fontlt,]}>{GeneralService.amountString(product.delivery_charges)}</Text>
              </View>
              <View style={productStyle.DetailBottomCardLine} />
              {cartItem != null &&
                <View style={[productStyle.DetailBottomCardRow, productStyle.DetailBottomCardRowTotal]}>
                  <Text style={[mainStyle.textlg, { color: Colors.yellow }, mainStyle.fontbl,]}>Total Amount</Text>
                  <Text style={[mainStyle.textlg, { color: Colors.yellow }, mainStyle.fontbl,]}>{GeneralService.amountString((product.price * cartItem.quantity) + product.delivery_charges + this.state.checkedPackage)}</Text>
                </View>
              }
            </View>
            {/* </View> */}
          </ScrollView>
        }
        {
          cartProducts && cartProducts.length > 0 &&
          <View style={productStyle.cartButtonView}>
            <ButtonComponent text={"Go to Cart (" + cartProducts.length + ")"} onClick={this.navigateToCart.bind(this)} />
          </View>
        }
      </View>
    );
  }

  navigateToCart = () => {
    return NavigationService.navigate('homeStack', 'Cart');
  }
  renderProductImage(imageFiles) {

    let imageFile = imageFiles && imageFiles.length > 0 ? imageFiles[0] : null,
      imageFileUrl = this.state.imagesBaseUrl && imageFile ? (this.state.imagesBaseUrl + imageFile.file_name) : null;

    if (imageFileUrl) {
      return (
        // <Image source={{ uri: imageFileUrl }} style={productStyle.productDetailImage} />
        <Image source={{ uri: 'https://www.letstrack.in/img/Products/Big/Image1/11_3.png' }} style={productStyle.productDetailImage} />
      );
    } else {
      return (
        // <Icon name='microchip' type='font-awesome' size={100} color={Colors.gray} style={productStyle.productDetailImage} />
        <Image source={{ uri: 'https://www.letstrack.in/img/Products/Big/Image1/11_3.png' }} style={productStyle.productDetailImage} />
      );
    }
  }
  renderItem(item, index) {
    return (
      <TouchableNativeFeedback
        onPress={() => { this.openItem(item) }}
        background={TouchableNativeFeedback.SelectableBackground()}>
        <View style={productStyle.packageListVw}>
          <View style={productStyle.packageListCol1Vw}>
            <Text style={[mainStyle.textlg, mainStyle.lightText, mainStyle.fontmd]}>{item.package}</Text>
          </View>
          <View style={productStyle.packageListCol2Vw}>
            <Text style={[mainStyle.textlg, mainStyle.lightText, mainStyle.fontmd]}>{item.year}</Text>
          </View>
          <View style={productStyle.packageListCol2Vw}>
            <Text style={[mainStyle.textlg, mainStyle.lightText, mainStyle.fontmd]}>{GeneralService.amountString(item.price)}</Text>
          </View>
          <View style={productStyle.packageListCol3Vw}>
            <Image source={item.price == this.state.checkedPackage ? Icons.ic_radiobox_marked : Icons.ic_radiobox_blank}
              style={productStyle.productDetailCheckbox} />
          </View>
        </View>
      </TouchableNativeFeedback>
    )
  }
  openItem(item) {
    try {
      if (this.state.checkedPackage == 0) {
        this.setState({ checkedPackage: item.price })
      } else if (this.state.checkedPackage == item.price) {
        this.setState({ checkedPackage: 0 })
      } else {
        this.setState({ checkedPackage: item.price })
      }
    } catch (error) {

    }
  }
}