import React, {Component} from 'react';
import {
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    Alert,
    AsyncStorage,
    View,
    TextInput,
    BackHandler, Animated, Dimensions
} from 'react-native';
import {YellowBox} from 'react-native';
import {Indicator} from "../IndicatorComponent";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);

export class ChangeNumber extends Component {

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
            loaderVisible: false,
            oldPhoneNumber: '+7',
            newPhoneNumber: '+7',
            auth_key: ''
        };

    }

    componentDidMount(){

        BackHandler.addEventListener('hardwareBackPress', () => {

            this.props.navigation.push('Admin');
            return true;

        });

        this.setAuthKey();

    }

    setAuthKey = async ()=>{

        let auth_key = await AsyncStorage.getItem('auth_key');
        this.setState({auth_key: auth_key});

    }

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

    setLoaderVisible = (visible)=>{

        this.setState({loaderVisible: visible});

    };

    changePhoneNumber = ()=>{

        if(!this.state.newPhoneNumber || this.state.newPhoneNumber==="+7" || !this.state.oldPhoneNumber || this.state.oldPhoneNumber==='+7'){

            Alert.alert(
                '',
                'Заполните поля.'
            );

            return

        }

        this.setLoaderVisible(true);

        AsyncStorage.getItem('auth_key').then((auth_key)=>{

            fetch('https://taxi-center.org/api/admin/change-phone', {
                method: 'post',
                dataType: 'json',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json; charset=UTF-8'
                },
                body: JSON.stringify({
                    auth_key: auth_key,
                    old_phone: this.state.oldPhoneNumber,
                    new_phone: this.state.newPhoneNumber
                })
            }).then(response => response.json()).then(response => {

                if(response.success){

                    Alert.alert(
                        '',
                        'Номер телефона изменён.'
                    );

                    this.setState({oldPhoneNumber: '+7', newPhoneNumber: '+7'})

                }else {

                    Alert.alert(
                        '',
                        'Неправельный номер.'
                    );

                }

                this.setLoaderVisible(false);

            });

        });

    };

    render() {

        let animationStyle = {

            transform: [{translateX: this.state.xPosition}]

        };

        return (

            this.state.loaderVisible?<Indicator/>:<View style={styles.container}>

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

                    <Text style={styles.headerTitle}>Замена номера телефона</Text>

                </View>

                <TouchableWithoutFeedback onPress={()=>{this.setMenuVisible(false)}}>

                    <Animated.View style={[styles.menu,animationStyle]}>

                        <TouchableWithoutFeedback onPress={()=>{return}}>

                            <View style={styles.menuContainer}>

                                <View>

                                    <TouchableWithoutFeedback onPress={()=>{this.props.navigation.push('Admin')}}>
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

                                    <TouchableWithoutFeedback onPress={()=>{this.setMenuVisible(false)}}>
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

                <Text style={[styles.fontBold,{textAlign: 'center', marginTop: 10, marginBottom: 50}]}>Изменить номер водителя</Text>

                <Text style={{marginLeft: 50, marginRight: 50}}>Старый номер телефона</Text>

                <View style={styles.inputContainer}>

                    <TextInput
                        keyboardType = 'numeric'
                        underlineColorAndroid={'transparent'}
                        onChangeText={(text) => {if(text.length<2 && text!=='+7'){return} this.setState({oldPhoneNumber: text})}}
                        placeholder="+7 ___ ______"
                        style={{fontSize: 14, padding: 3}}
                        value={this.state.oldPhoneNumber}
                    />

                </View>

                <Text style={{marginLeft: 50, marginRight: 50, marginTop: 15}}>Новый номер телефона</Text>

                <View style={styles.inputContainer}>

                    <TextInput
                        keyboardType = 'numeric'
                        underlineColorAndroid={'transparent'}
                        onChangeText={(text) => {if(text.length<2 && text!=='+7'){return} this.setState({newPhoneNumber: text})}}
                        placeholder="+7 ___ ______"
                        style={{fontSize: 14, padding: 3}}
                        value={this.state.newPhoneNumber}
                    />

                </View>

                <TouchableWithoutFeedback onPress={()=>{this.changePhoneNumber()}}>

                    <View style={styles.sendButton}>

                        <Text style={[styles.fontBold,{color: 'rgb(255,255,255)'}]}>Изменить</Text>

                    </View>

                </TouchableWithoutFeedback>

            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgb(255,255,255)',
    },
    inputContainer: {
        borderWidth: 2,
        borderColor: 'rgb(0,0,0)',
        marginTop: 15,
        marginLeft: 50,
        marginRight: 50,
        paddingLeft: 10,
        paddingRight: 10
    },
    fontBold: {
        fontWeight: 'bold',
        fontSize: 18,
        color: 'rgb(0,0,0)'
    },
    sendButton: {
        height: 50,
        marginLeft: 50,
        marginRight: 50,
        backgroundColor: 'rgb(0,0,0)',
        marginTop: 30,
        justifyContent: 'center',
        alignItems: 'center',
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
});