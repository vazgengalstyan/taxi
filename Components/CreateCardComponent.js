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
    Platform, BackHandler
} from 'react-native';
import TextInputMask from 'react-native-text-input-mask';
import {createStackNavigator} from 'react-navigation';
import {YellowBox} from 'react-native';
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {Indicator} from "./IndicatorComponent";

export class CreditCard extends Component {

    static navigationOptions = ({ navigation })=>({

        title: 'Номер карты',
        headerStyle: {
            backgroundColor: 'rgb(0,0,0)',
        },
        headerTitleStyle: {
            color: 'rgb(255,255,255)',
            flex: 1,
            textAlign: 'center',
            marginRight: Platform.OS !== 'ios' ? 60 : 0
        },
        headerLeft: <MaterialIcons onPress={()=>{navigation.goBack()}}
                                   name='arrow-back'
                                   color='rgb(255,255,255)'
                                   style={{paddingLeft: 20}}
                                   size={24}/>,
    });

    constructor(props) {

        super(props);
        this.state = {
            credit_card_param: this.props.navigation.getParam('credit_card'),
            auth_key: this.props.navigation.getParam('auth_key'),
            user_id: this.props.navigation.getParam('user_id'),
            credit_card: '',
            loaderVisible: false
        };

    }

    componentDidMount(){

        this._didFocusSubscription = BackHandler.addEventListener('hardwareBackPress', () => {

            this.props.navigation.goBack();
            return true;

        });

    };

    componentWillUnmount() {

        this._didFocusSubscription.remove();

    }

    setLoaderVisible = (visible)=>{

        this.setState({loaderVisible: visible});

    };

    createCard = ()=>{

        if(!this.state.credit_card){

            Alert.alert(
                '',
                'Укажите номер банковской карты'
            );

            return

        }

        let reg = new RegExp('^[0-9]+$');
        let credit_card = this.state.credit_card;
        let val = reg.test(credit_card);

        if(!val){

            Alert.alert(
                '',
                'Неправильный номер банковской карты'
            );

            return

        }

        this.setLoaderVisible(true);

        fetch('https://taxi-center.org/api/set-card', {
            method: 'post',
            dataType: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({
                id: this.state.user_id,
                auth_key: this.state.auth_key,
                credit_card: this.state.credit_card
            })
        }).then(response => response.json()).then(response => {

            if(response.success){

                if(this.state.credit_card_param && this.state.credit_card_param !== 'null'){

                    Alert.alert(
                        '',
                        'Операция выполнена успешно'
                    );

                }else {

                    Alert.alert(
                        '',
                        'Номер карты добавлен'
                    );

                }

                this.props.navigation.push('Home');

            }else {

                this.setLoaderVisible(false);

            }

        });

    };


    render() {

        return (

            this.state.loaderVisible?<Indicator/>:<View style={styles.container}>

                {!this.state.credit_card_param || this.state.credit_card_param === 'null'?<Text style={styles.fontBold}>Пожалуйста зарегистрируйте банковскую карту</Text>:null}
                {this.state.credit_card_param && this.state.credit_card_param !== 'null'?<Text style={styles.fontBold}>Изменить банковскую карту</Text>:null}

                <View style={styles.inputContainer}>

                    <TextInputMask
                        underlineColorAndroid={'transparent'}
                        keyboardType = 'numeric'
                        placeholder="Номер банковской карты"
                        value={this.state.credit_card}
                        style={{fontSize: 14, padding: 3}}
                        refInput={ref => { this.input = ref }}
                        onChangeText={(formatted, extracted) => {
                            this.setState({credit_card: extracted});
                        }}
                        mask={"[0000]/[0000]/[0000]/[00000000]"}
                    />

                </View>

                <TouchableWithoutFeedback onPress={()=>{this.createCard()}}>

                    <View style={styles.sendButton}>

                        {this.state.credit_card_param && this.state.credit_card_param !== 'null'?<Text style={[styles.fontBold,{color: 'rgb(255,255,255)'}]}>Сохранить</Text>:
                            <Text style={[styles.fontBold,{color: 'rgb(255,255,255)'}]}>Сохранить</Text>}

                    </View>

                </TouchableWithoutFeedback>

            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 30,
        flex: 1,
        backgroundColor: 'rgb(255,255,255)',
        flexDirection: 'column',
    },
    inputContainer: {
        marginTop: 50,
        borderWidth: 2,
        borderColor: 'rgb(0,0,0)',
        marginLeft: 50,
        marginRight: 50,
        paddingLeft: 10,
        paddingRight: 10
    },
    fontBold: {
        fontWeight: 'bold',
        fontSize: 18,
        color: 'rgb(0,0,0)',
        textAlign: 'center'
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
});