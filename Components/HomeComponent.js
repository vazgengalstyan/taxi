import React, {Component} from 'react';
import {
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    Alert,
    AsyncStorage,
    ScrollView,
    View,
    BackHandler,
    StatusBar,
    Dimensions,
    Animated,
    AppState
} from 'react-native';
import {YellowBox} from 'react-native';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {Indicator} from "./IndicatorComponent";
import call from "react-native-phone-call";
import sms from "react-native-sms-linking";
import FCM,{FCMEvent} from "react-native-fcm";
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);

export class Home extends Component {

    static navigationOptions = {

        headerStyle: {
            display: 'none',
            backgroundColor: 'rgb(255,255,255)',
        },

    };

    constructor(props) {

        super(props);
        this.state = {
            loaderVisible: true,
            noteAut: false,
            notificationCount: 0,
            yandex_balance: '',
            citymobil_balance: '',
            credit_card: '',
            auth_key: '',
            user_phone: '',
            user_id: '',
            adminFCMToken: '',
            not_id: '',
            xPosition: new Animated.Value(-Dimensions.get('window').width),
            windowWidth: Dimensions.get('window').width
        };

    }

    componentDidMount(){

        BackHandler.addEventListener('hardwareBackPress', () => {

            BackHandler.exitApp();
            return true;

        });

        this.getUserData();

    };

    setFCMToken = async (value)=>{

       FCM.getFCMToken().then(token => {

           let userToken = value?token:'';

            fetch('https://taxi-center.org/api/set-token', {
                method: 'post',
                dataType: 'json',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json; charset=UTF-8'
                },
                body: JSON.stringify({
                    fcm_token: userToken,
                    auth_key: this.state.auth_key
                })
            }).then(response => response.json()).then(response => {

                AsyncStorage.setItem('fcm_token', token);

            });

        });


    };

    setNotificationListener = async ()=>{

       await FCM.requestPermissions();
       let auth_key = await AsyncStorage.getItem('auth_key');

        this.notificationListener = await FCM.on(FCMEvent.Notification,async notif => {

            if(notif.click_action === "ACTION"){

                await AsyncStorage.setItem('not_id', notif.id);
                this.notificationListener.remove();
                this.props.navigation.push('DriverNotifications',{auth_key: auth_key,user_id: this.state.user_id});

            }

            let not_id =  await AsyncStorage.getItem('not_id');
            await AsyncStorage.setItem('not_id', notif['google.message_id']);

            if(notif.opened_from_tray && not_id !== notif['google.message_id']) {

                this.notificationListener.remove();
                this.props.navigation.push('DriverNotifications', {auth_key: auth_key, user_id: this.state.user_id});

            }else if(AppState.currentState === 'active' && not_id !== notif['google.message_id']){

                await AsyncStorage.setItem('not_id', notif['google.message_id']);

                FCM.presentLocalNotification({
                    title: notif.fcm.title, // as FCM payload
                    body: notif.fcm.body, // as FCM payload (required)
                    sound: "default", // "default" or filename
                    priority: "high", // as FCM payload
                    color: "black",
                    click_action: "ACTION", // as FCM payload - this is used as category identifier on iOS.
                    icon: "@mipmap/ic_notif", // as FCM payload, you can relace this with custom icon you put in mipmap
                    vibrate: 300, // Android only default: 300, no vibration if you pass 0
                    lights: true, // Android only, LED blinking (default false)
                    show_in_foreground: true // notification when app is in foreground (local & remote)
                });

                this.setState({notificationCount: this.state.notificationCount+1})

            }

            FCM.getInitialNotification().then(async (notif)=> {

                let not_id =  await AsyncStorage.getItem('not_id');
                await AsyncStorage.setItem('not_id', notif['google.message_id']);

                if(notif.targetScreen==='DriverNotifications' && not_id !== notif['google.message_id'] && AppState.currentState==='active'){

                    this.notificationListener.remove();
                    this.props.navigation.push('DriverNotifications',{auth_key: auth_key,user_id: this.state.user_id})

                }

            });

        });

    };

    getMessageCount = async () =>{

        let auth_key = await AsyncStorage.getItem('auth_key');
        let user_id = await AsyncStorage.getItem('user_id');

        let url = 'https://taxi-center.org/api/balances?auth_key='+auth_key+'&id='+user_id;

        fetch(url, {
            method: 'get',
            dataType: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            }
        }).then(response => response.json()).then(response => {

            if(response.success && response.message_count !== this.state.notificationCount){

                this.setState({notificationCount: response.message_count});

            }

        });

    };

    setLoaderVisible = (visible)=>{

        this.setState({loaderVisible: visible});

    };

    getUserData = async ()=>{

        let auth_key = await AsyncStorage.getItem('auth_key');
        let user_id = await AsyncStorage.getItem('user_id');
        let url = 'https://taxi-center.org/api/balances?auth_key='+auth_key+'&id='+user_id;

        await this.setState({auth_key: auth_key, user_id: user_id});

        fetch(url, {
            method: 'get',
            dataType: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            }
        }).then(response => response.json()).then(response => {

            if(response.success) {

                if(response.user.register_status === 3){
                    this.props.navigation.push('AwaitRegistration',{auth_key: auth_key,user_id: user_id});
                    return
                }

                if(!response.data[0]){

                    let reg = this.props.navigation.getParam('registration');

                    if(reg){
                        this.setState({noteAut: true,user_phone: response.user.phone, adminFCMToken: response.fcm_token})
                        this.registration()
                        return
                    }else {
                        this.setState({noteAut: true,user_phone: response.user.phone, adminFCMToken: response.fcm_token})
                    }

                }else {

                    this.setState({yandex_balance: response.data[0].yandex?response.data[0].yandex:'0.00',
                                   citymobil_balance: response.data[0].citymobil?response.data[0].citymobil:'0.00',
                                   user_phone: response.user.phone, credit_card: response.user.credit_card,
                                   adminFCMToken: response.fcm_token,notificationCount: response.message_count});

                    this.setFCMToken(true);
                    this.setNotificationListener();

                }

                this.setLoaderVisible(false)

            }else {

                Alert.alert(
                    '',
                    response.message
                );

            }

        });

    };

    callAdmin = ()=>{

        const args = {
            number: '+74952950080',
            prompt: false
        };

        call(args).catch(console.error)

    };

    smsAdmin=()=>{

        sms('+79267461179').catch(console.error)

    };

    signOut = async ()=>{

        await AsyncStorage.setItem('auth_key','');
        if(this.notificationListener){
            this.notificationListener.remove();
            await this.setFCMToken(false);
        }
        this.props.navigation.push('Login');

    };

    openLogOutPopUp=()=>{

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

    registration = async ()=>{

       await this.setLoaderVisible(true);

        fetch('https://taxi-center.org/api/connect-step1', {
            method: 'post',
            dataType: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({
                auth_key: this.state.auth_key,
                id: this.state.user_id
            })
        }).then(response => response.json()).then(response => {

            if(response.success){

                this.props.navigation.push('Registration',{auth_key: this.state.auth_key,user_id: this.state.user_id,phone: this.state.user_phone,adminFCMToken: this.state.adminFCMToken});

            }else {

                Alert.alert(
                    '',
                    response.message
                );

            }

        });

    };

    goWithdrow = (type)=>{

        if(!this.state.credit_card || this.state.credit_card === 'null'){
            this.notificationListener.remove();
            this.props.navigation.push('CreditCard',{auth_key: this.state.auth_key,user_id: this.state.user_id,credit_card: this.state.credit_card});

        }else {

            if(type === 'yandex'){
                this.notificationListener.remove();
                this.props.navigation.push('Withdraw',{serviceName: 'Яндекс такси',
                    type: 'yandex',
                    balance: this.state.yandex_balance,
                    auth_key: this.state.auth_key,
                    user_id: this.state.user_id,
                    user_phone: this.state.user_phone,
                    adminFCMToken: this.state.adminFCMToken})

            }else {
                this.notificationListener.remove();
                this.props.navigation.push('Withdraw',{serviceName: 'Ситимобил',
                    type: 'citymobil',
                    balance: this.state.citymobil_balance,
                    auth_key: this.state.auth_key,
                    user_id: this.state.user_id,
                    user_phone: this.state.user_phone,
                    adminFCMToken: this.state.adminFCMToken})

            }

        }

    };


    render() {

        return (

            this.state.loaderVisible?<Indicator/>:<View style={styles.container}>

                <StatusBar
                    backgroundColor='rgb(0,0,0)'
                    barStyle="light-content"
                />

                {this.state.noteAut?<Text style={[styles.notAutText]}>ВЫ НЕ ЗАРЕГИСТРИРОВАНЫ</Text>:<ScrollView>

                    <TouchableWithoutFeedback onPress={()=>{this.goWithdrow('yandex')}}>

                        <View style={[styles.itemContainer]}>

                            <View style={{ flex: 0.8}}>

                                <Text style={styles.fontBold}>Яндекс такси</Text>

                                <View style={styles.iconContainer}>

                                    <Text>Баланс</Text>

                                </View>

                                <View style={styles.iconContainer}>

                                    <Text style={styles.countMoney}>{+this.state.yandex_balance===0 && this.state.yandex_balance.charAt(0)==='-'?this.state.yandex_balance.slice(1):this.state.yandex_balance}</Text>

                                    <FontAwesome
                                        name='ruble'
                                        color={'rgb(0,0,0)'}
                                        size={18}
                                    />

                                </View>

                            </View>

                            <View style={styles.withdraw}>

                                <FontAwesome
                                    name='chevron-right'
                                    color={'rgb(0,0,0)'}
                                    size={18}
                                />

                            </View>

                        </View>

                    </TouchableWithoutFeedback>

                    <TouchableWithoutFeedback onPress={()=>{this.goWithdrow('citymobil')}}>

                        <View style={styles.itemContainer}>

                            <View style={{ flex: 0.8}}>

                                <Text style={styles.fontBold}>Ситимобил</Text>

                                <View style={styles.iconContainer}>

                                    <Text>Баланс</Text>

                                </View>


                                <View style={styles.iconContainer}>

                                    <Text style={styles.countMoney}>{+this.state.citymobil_balance===0 && this.state.citymobil_balance.charAt(0)==='-'?this.state.citymobil_balance.slice(1):this.state.citymobil_balance}</Text>

                                    <FontAwesome
                                        name='ruble'
                                        color={'rgb(0,0,0)'}
                                        size={18}
                                    />

                                </View>

                            </View>


                            <View style={styles.withdraw}>

                                <FontAwesome
                                    name='chevron-right'
                                    color={'rgb(0,0,0)'}
                                    size={18}
                                />

                            </View>

                        </View>

                    </TouchableWithoutFeedback>

                </ScrollView>}

                <View style={styles.adminConnect}>

                    <TouchableWithoutFeedback onPress={()=>{this.callAdmin()}}>

                        <View style={[styles.callIconContainer,{marginRight: 25}]}>

                            <FontAwesome
                                name='phone'
                                color={'rgb(255,255,255)'}
                                size={24}
                            />

                        </View>

                    </TouchableWithoutFeedback>

                    <TouchableWithoutFeedback onPress={()=>{this.smsAdmin()}}>

                        <View style={[styles.callIconContainer,{marginLeft: 25}]}>

                            <MaterialCommunityIcons
                                name='message-outline'
                                color={'rgb(255,255,255)'}
                                size={24}
                            />

                        </View>

                    </TouchableWithoutFeedback>

                </View>

                {this.state.noteAut?<View style={[styles.textContainer, {paddingBottom: 10}]}>

                    <Text style={styles.fontBold} onPress={()=>this.registration()}>Регистрация</Text>

                </View>:null}

                {!this.state.noteAut?<View style={styles.footerContainer}>

                    <TouchableWithoutFeedback onPress={()=>{this.notificationListener.remove();this.props.navigation.push('DriverTransfers',{auth_key: this.state.auth_key,
                                                                                                        user_id: this.state.user_id,
                                                                                                        credit_card: this.state.credit_card})}}>
                        <View style={styles.footerItem}>

                            <FontAwesome
                                name='credit-card'
                                color={'rgb(0,0,0)'}
                                size={18}
                                style={{marginBottom: 5}}
                            />
                            <Text style={styles.footerItemText}>Карта и переводы</Text>

                        </View>
                    </TouchableWithoutFeedback>

                    <TouchableWithoutFeedback onPress={()=>{this.notificationListener.remove();this.props.navigation.push('DriverNotifications',{auth_key: this.state.auth_key,user_id: this.state.user_id})}}>
                        <View style={styles.footerItem}>

                            <MaterialIcons
                                name='notifications'
                                color={'rgb(0,0,0)'}
                                size={22}
                                style={{marginBottom: 1}}
                            />
                            <Text style={styles.footerItemText}>Уведомления ({this.state.notificationCount})</Text>

                        </View>
                    </TouchableWithoutFeedback>

                    <TouchableWithoutFeedback onPress={()=>{this.openLogOutPopUp()}}>
                        <View style={styles.footerItem}>

                            <FontAwesome
                                name='sign-out'
                                color={'rgb(0,0,0)'}
                                size={18}
                                style={{marginBottom: 5}}
                            />
                            <Text style={styles.footerItemText}>Выйти из аккаунта</Text>

                        </View>
                    </TouchableWithoutFeedback>

                </View>:null}

                {this.state.noteAut?
                    <View style={[styles.iconContainer,{justifyContent: 'center', padding: 15, width: '100%', position: 'absolute', bottom: 0}]}>

                        <TouchableWithoutFeedback onPress={()=>{this.openLogOutPopUp()}}>

                            <View style={{flexDirection: 'row',justifyContent: 'center'}}>

                                <FontAwesome
                                    name='sign-out'
                                    color={'rgb(0,0,0)'}
                                    size={18}
                                />

                                <Text>  Выйти</Text>

                            </View>

                        </TouchableWithoutFeedback>

                    </View>

               :null}

            </View>

        );
    }
}

const styles = StyleSheet.create({
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        paddingLeft: '5%',
        paddingRight: '5%'
    },
    footerItem: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10
    },
    footerItemText: {
        fontSize: 10,
        textAlign: 'center',
        color: 'rgb(0,0,0)'
    },
    container: {
        flex: 1,
        backgroundColor: 'rgb(255,255,255)',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    textContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemContainer: {
        flexDirection: 'row',
        position: 'relative',
        borderBottomWidth: 1,
        borderColor: 'rgb(170,170,170)',
        padding: 15
    },
    fontBold: {
        fontWeight: 'bold',
        fontSize: 18,
        color: 'rgb(0,0,0)'
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    countMoney: {
        fontSize: 23,
        marginRight: 3
    },
    withdraw: {
        flex: 0.2,
        alignItems: 'center',
        justifyContent: 'center',

    },
    notAutText: {
        fontWeight: 'bold',
        marginBottom: 40,
        fontSize: 18,
        color: 'rgb(0,0,0)',
        textAlign: 'center'
    },
    adminConnect: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 50,
        marginTop: 15
    },
    callIconContainer: {
        width: 50,
        height: 50,
        backgroundColor: 'rgb(0,0,0)',
        borderRadius: 90,
        alignItems: 'center',
        justifyContent: 'center'
    }
});