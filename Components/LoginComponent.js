import React, {Component} from 'react';
import {
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    Alert,
    AsyncStorage,
    ScrollView,
    View,
    TextInput,
    Linking,
    PermissionsAndroid,
    StatusBar,
    BackHandler
} from 'react-native';
import {createStackNavigator} from 'react-navigation';
import DeviceInfo from 'react-native-device-info';
import {YellowBox} from 'react-native';
import {Indicator} from './IndicatorComponent';
import FCM from "react-native-fcm";

YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);

export class Login extends Component {

    static navigationOptions = {

        headerStyle: {
            display: 'none',
            backgroundColor:  'rgb(255,255,255)',
        },

    };

    constructor(props) {

        super(props);
        this.state = {
            loaderVisible: true,
            phoneNumber: '+7',
            messageSend: false,
            codeAuthorization: '',
            registration: false
        };

    }

    componentDidMount(){

        BackHandler.addEventListener('hardwareBackPress', () => {

            BackHandler.exitApp();
            return true;

        });

        this.getPermissions();

        fetch('https://taxi-center.org/api/version', {
            method: 'get',
            dataType: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            }
        }).then(response => response.json()).then(response => {

            if(response.success){

                if(DeviceInfo.getVersion()<response.data.version){

                    this.props.navigation.push('VersionControl');
                    return

                }else {

                    AsyncStorage.getItem('auth_key').then(auth_key=>{

                        if(auth_key && auth_key !== '' && typeof auth_key === 'string'){

                            if(auth_key === 'q9xdi8go2kob3ir9'){

                                this.props.navigation.push('Admin');
                                return

                            }else {

                                this.props.navigation.push('Home');
                                return

                            }

                        }else {

                            this.setLoaderVisible(false)

                        }

                    });

                }

            }

        });

    };

    getPermissions = async ()=>{

        const granted2 = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        const granted3 = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);

    };

    setLoaderVisible = (visible)=>{

        this.setState({loaderVisible: visible});

    };

    registration = async ()=>{

        await this.setLoaderVisible(true)
        await this.setState({registration: !this.state.registration})
        setTimeout(()=>{
            this.setLoaderVisible(false)
        },1000)

    };

    changePhoneInput = async (text) => {

        if(text.length<2 && text!=='+7'){
            return
        }

        await this.setState({phoneNumber: text});

        if(text.length === 12){

            this.sendMessage();

        }

    };

    changeCodeAuthorization = async (text)=>{

        await this.setState(({codeAuthorization: text}));

        if(text.length===4){

            this.login()

        }

    };

    sendMessage = ()=>{

        if(this.state.phoneNumber === '+7' || !this.state.phoneNumber){

            Alert.alert(
                '',
                'Укажите ваш номер телефона'
            );
            return

        }

        this.setLoaderVisible(true);

        fetch('https://taxi-center.org/api/register', {
            method: 'post',
            dataType: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({
                phone: this.state.phoneNumber,
            })
        }).then(response => response.json()).then(response => {

             if(response.success){

                this.setState({messageSend: true});
                this.setLoaderVisible(false);

             }

        });

    };

    login = ()=>{

        if(!this.state.codeAuthorization){

            Alert.alert(
                '',
                'Введите проверочный код '
            );
            return

        }

        fetch('https://taxi-center.org/api/verify', {
            method: 'post',
            dataType: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({
                code: this.state.codeAuthorization,
            })
        }).then(response => response.json()).then(response => {

           if(response.success){

                this.aut(response.data.auth_key,response.data.id)

           }else {

               Alert.alert(
                   '',
                   'Неверный код подтверждения'
               );
               return

           }

        });

    };

    aut = async (auth_key,id)=>{

       auth_key = ""+auth_key;
       id = ""+id;

       await AsyncStorage.setItem('auth_key', auth_key);
       await AsyncStorage.setItem('user_id', id);

        this.setState({messageSend: false,
            phoneNumber: '+7',
            codeAuthorization: ''
        });

        if(auth_key === 'q9xdi8go2kob3ir9'){

            this.props.navigation.navigate('Admin');

        }else{

            this.props.navigation.push('Home',{registration: this.state.registration});

        }

    };

    render() {

        return (

            this.state.loaderVisible?<Indicator/>:<View style={styles.container}>

                <StatusBar
                    backgroundColor='rgb(0,0,0)'
                    barStyle="light-content"
                />

                <View style={{flex: 0.9, paddingTop: 50, paddingHorizontal: 50}}>

                    {!this.state.messageSend?
                        <View>

                            <Text style={styles.fontBold}>{this.state.registration?'Регистрация':'Авторизация'}</Text>
                            <Text>Введите номер вашего телефона</Text>

                            <View style={styles.inputContainer}>

                                <TextInput
                                    keyboardType = 'numeric'
                                    underlineColorAndroid={'transparent'}
                                    onChangeText={(text) => {this.changePhoneInput(text)}}
                                    placeholder="+7 ___ ______"
                                    style={{fontSize: 14, padding: 3}}
                                    value={this.state.phoneNumber}
                                />

                            </View>

                            <Text>{!this.state.registration?'Введите номер телефона который вы зарегистрировали в Яндекс такси или в Ситимобил.':
                                'Мы отправим на него 4-х значный код подтверждения'}</Text>

                        </View>:
                        <View>

                            <Text style={styles.fontBold}>{this.state.registration?'Регистрация':'Авторизация'}</Text>
                            <View style={{marginTop: 25}}>

                                <Text style={[styles.fontBold,styles.fontSize16]}>Проверочный код выслан на номер</Text>
                                <Text style={[styles.fontBold,styles.fontSize16]}>{this.state.phoneNumber}</Text>

                                <Text style={{marginTop: 30,color: 'rgb(135,135,135)'}}>Проверочный код из СМС</Text>

                                <View style={styles.inputContainer}>

                                    <TextInput
                                        keyboardType = 'numeric'
                                        underlineColorAndroid={'transparent'}
                                        onChangeText={(text) => this.changeCodeAuthorization(text)}
                                        style={{fontSize: 14, padding: 3}}
                                        value={this.state.codeAuthorization}
                                    />

                                </View>

                                <TouchableWithoutFeedback onPress={()=>{this.sendMessage(); Alert.alert('', 'Повторный код отправлен');}}>

                                    <View style={[{marginTop: 40}]}>

                                        <Text style={[styles.fontBold,{textAlign: 'center',color: 'rgb(135,135,135)'}]}>Отправить смс с кодом повторно</Text>

                                    </View>

                                </TouchableWithoutFeedback>

                                <TouchableWithoutFeedback onPress={()=>{this.setState({messageSend: false})}}>

                                    <View style={[{marginTop: 10}]}>

                                        <Text style={[styles.fontBold,{textAlign: 'center'}]}>Изменить номер</Text>

                                    </View>

                                </TouchableWithoutFeedback>

                            </View>

                        </View>}

                </View>

                {!this.state.messageSend?<View style={[{flex: 0.1},styles.textContainer]}>

                    <View style={[styles.textContainer]}>

                        <Text style={styles.fontBold} onPress={()=>this.registration()}>{!this.state.registration?'Регистрация':'Назад'}</Text>

                    </View>

                </View>:null}

            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgb(255,255,255)',
    },
    fontBold: {
        fontWeight: 'bold',
        fontSize: 18,
        color: 'rgb(0,0,0)'
    },
    inputContainer: {
        borderWidth: 2,
        borderColor: 'rgb(0,0,0)',
        paddingLeft: 10,
        paddingRight: 10,
        marginVertical: 10
    },
    textContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    fontSize16: {
        fontSize: 16
    }
});