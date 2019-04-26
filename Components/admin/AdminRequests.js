import React, {Component} from 'react';
import {
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    Alert,
    AsyncStorage,
    View,
    Dimensions,
    FlatList,
    Animated,
    Clipboard,
    BackHandler,
    StatusBar
} from 'react-native';
import {YellowBox} from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {Indicator} from "../IndicatorComponent";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FCM from "react-native-fcm";
import {MaterialIndicator} from 'react-native-indicators';

YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);


export class AdminRequests extends Component {

    static navigationOptions = {

        headerStyle: {
            display: 'none',
            backgroundColor: 'rgb(255,255,255)',
        },

    };

    constructor(props) {

        super(props);
        this.state = {
            xPosition: new Animated.Value(-Dimensions.get('window').width),
            auth_key: '',
            loaderVisible: true,
            refreshingList: false,
            data: [],
        };

    }

    componentDidMount(){

        this.getData();

        BackHandler.addEventListener('hardwareBackPress', () => {

            BackHandler.exitApp();
            return true;

        });

        FCM.getFCMToken().then(token => {

           AsyncStorage.getItem('auth_key').then((auth_key)=>{

               fetch('https://taxi-center.org/api/admin/set-token', {
                   method: 'post',
                   dataType: 'json',
                   headers: {
                       'Accept': 'application/json',
                       'Content-Type': 'application/json; charset=UTF-8'
                   },
                   body: JSON.stringify({
                       fcm_token: token,
                       auth_key: auth_key
                   })
               }).then(response => response.json()).then(response => {

                   console.log(response)

               });

           });

        });

    }

    getData = async ()=>{

        let auth_key = await AsyncStorage.getItem('auth_key');
        this.setState({auth_key: auth_key});
        let  apiUrl = 'https://taxi-center.org/api/admin/requests?auth_key='+auth_key+'&status=0&skip=0&take=10000';

        fetch(apiUrl, {
            method: 'get',
            dataType: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            }
        }).then(response => response.json()).then(response => {

            if(response.success){

                this.setState({data: response.data, refreshingList: false});

                this.setLoaderVisible(false);

            }else {

                Alert.alert(
                    '',
                    response.message
                );

            }

        });

    };

    setLoaderVisible = (visible) => {

        this.setState({loaderVisible: visible});

    };

    setMenuVisible = async (visible) => {

        if(visible){
            Animated.timing(this.state.xPosition,{toValue: 0, duration: 200}).start();
        }else {
            Animated.timing(this.state.xPosition,{toValue: -Dimensions.get('window').width, duration: 200}).start();
        }

    };

    openLogOutPopUp = ()=>{

        Alert.alert(
            'Выход',
            'Вы действительно хотите выйти?',
            [
                {text: 'ОТМЕНА', onPress: () => {return false}, style: 'cancel'},
                {text: 'ДА', onPress: () => {this.signOut()}},
            ],
            { cancelable: false }
        )

    };

    signOut = async ()=>{

        await AsyncStorage.setItem('auth_key','');
        this.props.navigation.push('Login');

    };

    clickItem=(item,index)=>{

        Alert.alert(
            'Платеж',
            '',
            [
                {text: 'ОТМЕНА', onPress: () => {return false}, style: 'cancel'},
                {text: 'ОПЛАТИТЬ СЕЙЧАС', onPress: () => {this.payNow(item,index)}},
                {text: 'ОПЛАЧЕНО', onPress: () => {this.paymentMade(item,index)}}
            ],
            { cancelable: false }
        )

    };

    payNow = (item,index)=>{

        let cloneRequests = [...this.state.data];

        for(let i = 0; i < cloneRequests.length; i++) {
            if(cloneRequests[i].id === item.id) {
                cloneRequests.splice(i, 1);
                break;
            }
        }

        this.setState({data: cloneRequests});

        fetch('https://taxi-center.org/api/admin/charge-payment', {
            method: 'post',
            dataType: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({
                payment_request_id: item.id,
                auth_key: this.state.auth_key,
            })
        }).then(response => response.json()).then(response => {

            if(response.success){

                Alert.alert(
                    '',
                    'Операция выполнена успешно'
                );

            }else {

                Alert.alert(
                    '',
                    response.message
                );

            }

        });

    };

    paymentMade = (item,index)=>{

        let cloneRequests = [...this.state.data];

        for(let i = 0; i < cloneRequests.length; i++) {
            if(cloneRequests[i].id === item.id) {
                cloneRequests.splice(i, 1);
                break;
            }
        }

        this.setState({data: cloneRequests});

        fetch('https://taxi-center.org/api/admin/set-paid', {
            method: 'post',
            dataType: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({
                payment_id: item.id,
                auth_key: this.state.auth_key,
            })
        }).then(response => response.json()).then(response => {

            if(response.success){

                Alert.alert(
                    '',
                    'Операция выполнена успешно'
                );

            }else {

                Alert.alert(
                    '',
                    response.message
                );

            }

        });

    };

    render() {

        let animationStyle = {

            transform: [{translateX: this.state.xPosition}]

        };

        return (

            this.state.loaderVisible ? <Indicator/>:<View style={styles.container}>

                <StatusBar
                    backgroundColor='rgb(0,0,0)'
                    barStyle="light-content"
                />

                <View style={styles.header}>

                    <TouchableWithoutFeedback onPress={()=>{this.setMenuVisible(true)}}>

                        <View style={{width: 27}}>

                            <MaterialIcons
                                name='menu'
                                color={'rgb(255,255,255)'}
                                size={25}
                            />

                        </View>

                    </TouchableWithoutFeedback>

                    <Text style={styles.headerTitle}>Запросы</Text>

                </View>

                <TouchableWithoutFeedback onPress={()=>{this.setMenuVisible(false)}}>

                    <Animated.View style={[styles.menu,animationStyle]}>

                        <TouchableWithoutFeedback onPress={()=>{return}}>

                            <View style={styles.menuContainer}>

                                <View>

                                    <TouchableWithoutFeedback onPress={()=>{this.setMenuVisible(false)}}>
                                        <View style={styles.menuItemsContainer}>
                                            <Text style={styles.menuItemsText}>Запросы</Text>
                                        </View>
                                    </TouchableWithoutFeedback>

                                    <TouchableWithoutFeedback onPress={()=>{this.props.navigation.push('AdminPaid')}}>
                                        <View style={styles.menuItemsContainer}>
                                            <Text style={styles.menuItemsText}>Оплаченные</Text>
                                        </View>
                                    </TouchableWithoutFeedback>

                                    <TouchableWithoutFeedback onPress={()=>{this.props.navigation.push('AdminRegistration',{auth_key: this.state.auth_key})}}>
                                        <View style={styles.menuItemsContainer}>
                                            <Text style={styles.menuItemsText}>Регистрация</Text>
                                        </View>
                                    </TouchableWithoutFeedback>

                                    <TouchableWithoutFeedback onPress={()=>{this.props.navigation.push('ChangeNumber')}}>
                                        <View style={styles.menuItemsContainer}>
                                            <Text style={styles.menuItemsText}>Замена номера тел.</Text>
                                        </View>
                                    </TouchableWithoutFeedback>

                                    <TouchableWithoutFeedback onPress={()=>{this.props.navigation.push('AdminNotifications',{auth_key: this.state.auth_key})}}>
                                        <View style={styles.menuItemsContainer}>
                                            <Text style={styles.menuItemsText}>Рассылка</Text>
                                        </View>
                                    </TouchableWithoutFeedback>

                                </View>

                                <View style={styles.menuFooterContainer}>

                                    <TouchableWithoutFeedback onPress={()=>{this.openLogOutPopUp()}}>

                                        <View style={{flexDirection: 'row'}}>

                                            <FontAwesome
                                                name='sign-out'
                                                color={'rgb(255,255,255)'}
                                                size={18}
                                            />

                                            <Text style={[styles.menuItemsText,{fontSize: 14,fontWeight: 'normal'}]}> Выйти из аккаунта</Text>

                                        </View>

                                    </TouchableWithoutFeedback>

                                </View>

                            </View>

                        </TouchableWithoutFeedback>

                    </Animated.View>

                </TouchableWithoutFeedback>

                <FlatList
                    data={this.state.data}
                    onRefresh={() => {this.setState({refreshingList: true});this.getData()}}
                    refreshing={this.state.refreshingList}
                    showsVerticalScrollIndicator={false}
                    renderItem={({item,index}) =>
                        <TouchableWithoutFeedback onPress={()=>{this.clickItem(item,index)}}>

                            <View style={styles.itemContainer}>

                                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>

                                    <Text>{item.user_name}</Text>
                                    <Text selectable={true} onLongPress={()=>{Clipboard.setString(''+item.phone)}}>{item.phone}</Text>

                                </View>

                                <View style={{flexDirection: 'row', justifyContent: 'center',  marginTop: 10}}>

                                    <Text>{item.request_date}</Text>

                                </View>

                                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>

                                    <Text>Сумма -  {item.price} руб.</Text>
                                    <View style={{flexDirection: 'row'}}>

                                        <Text>карта -  </Text>

                                        <Text selectable={true} onLongPress={()=>{Clipboard.setString(''+item.credit_card)}}>{item.credit_card}</Text>

                                    </View>

                                </View>

                            </View>

                        </TouchableWithoutFeedback>
                    }
                    keyExtractor={(item, index) => index.toString()}
                />

            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgb(255,255,255)',
    },
    header: {
        backgroundColor: 'rgb(0,0,0)',
        padding: 10,
        flexDirection: 'row',
        elevation: 10
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'rgb(255,255,255)',
        width: Dimensions.get('window').width-65
    },
    menu: {
        position: 'absolute',
        zIndex: 5,
        backgroundColor: 'transparent',
        width: '100%',
        height: Dimensions.get('window').height
    },
    menuContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '75%',
        height: '100%',
        backgroundColor: 'rgb(0,0,0)',
        marginTop: 45,
        paddingHorizontal: 20
    },
    menuItemsContainer: {
        marginTop: 30,
        marginHorizontal: 20
    },
    menuItemsText: {
        color: 'rgb(255,255,255)',
        fontSize: 18,
        fontWeight: 'bold',
    },
    menuFooterContainer: {
        marginBottom: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    itemContainer: {
        borderBottomWidth: 0.7,
        padding: 10,
        borderBottomColor: 'rgb(170,170,170)'
    }
});