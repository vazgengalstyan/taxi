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
    Platform,
    BackHandler
} from 'react-native';
import {createStackNavigator} from 'react-navigation';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {Indicator} from "./IndicatorComponent";
import {YellowBox} from 'react-native';
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);

export class Withdraw extends Component {

    static navigationOptions = ({ navigation })=>({

        title: 'Вывод средств',
        headerStyle: {
            backgroundColor: 'rgb(0,0,0)',
        },
        headerTitleStyle: {
            color: 'rgb(255,255,255)',
            flex: 1,
            textAlign: 'center',
            marginRight: Platform.OS !== 'ios' ? 60 : 0
        },
        headerLeft: <MaterialIcons onPress={()=>{navigation.push('Home')}}
                                   name='arrow-back'
                                   color='rgb(255,255,255)'
                                   style={{paddingLeft: 20}}
                                   size={24}/>,
    });

    constructor(props) {

        super(props);
        this.state = {
            loaderVisible: false,
            amount: '',
            type: this.props.navigation.getParam('type'),
            auth_key: this.props.navigation.getParam('auth_key'),
            user_id: this.props.navigation.getParam('user_id'),
            balance: this.props.navigation.getParam('balance') || '0.00',
        };

    }

    componentDidMount(){

        BackHandler.addEventListener('hardwareBackPress', () => {
            this.props.navigation.push('Home');
            return true;
        });

    };

    change_balance = ()=>{

       this.setLoaderVisible(true);

      setTimeout(()=>{

          let amount = +this.state.amount;
          let maxAmount = amount >= 3000? this.state.balance-400 : this.state.balance-422;

          if(typeof amount !== 'number' || isNaN(amount)){

              this.setLoaderVisible(false);

              Alert.alert(
                  '',
                  'В сумме укажите только цифры'
              );

              return

          }

          if(amount > maxAmount || amount <= 0){

              this.setLoaderVisible(false);

              Alert.alert(
                  'Ошибка',
                  'На вашем счету должно остаться не менее 400 руб.'
              );

              return

          }

          fetch('https://taxi-center.org/api/change-balance', {
              method: 'post',
              dataType: 'json',
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json; charset=UTF-8'
              },
              body: JSON.stringify({
                  id: this.state.user_id,
                  auth_key: this.state.auth_key,
                  type: this.state.type,
                  amount: amount
              })
          }).then(response => response.json()).then(response => {

              if(response.success){

                  this.setState({balance: response.data[this.state.type],amount: ''});

                  fetch('https://fcm.googleapis.com/fcm/send', {
                      method: 'post',
                      dataType: 'json',
                      headers: {
                          'Accept': 'application/json',
                          'Content-Type': 'application/json; charset=UTF-8',
                          'Authorization': 'key=AAAAgntE4fE:APA91bFJm7M5XPEgYMewjRRfOCtUXLCYsT9-G6vVApWJVfxc2IK6aytfKFzQqohw_VqXZi7XEanJU3ZoEA26a-AqftnRKhmDyBaqmHd4OAl1QpHAuImw_yIgo9NNm7cX74st9OV2Vdza'
                      },
                      body: JSON.stringify({
                          "to" : this.props.navigation.getParam('adminFCMToken'),
                          "notification" : {
                              "body" : amount + "руб." + this.props.navigation.getParam('user_phone'),
                              "title" : "Таксомат",
                              "content_available" : true,
                              "priority" : "high",
                              "sound" : "default"
                          }
                      })
                  }).then(response => response.json()).then(response => {

                      console.log(response)

                  });

                  Alert.alert(
                      '',
                      'Перевод в обработке поступит в течение дня.',
                      [
                          {text: 'Ok', onPress: () => {this.props.navigation.push('Home')}},
                      ],
                      { cancelable: false }
                  );

              }else {

                  Alert.alert(
                      '',
                      response.message
                  );
                  this.setLoaderVisible(false);

              }

          });

      },200)

    };

    setLoaderVisible = (visible)=>{

        this.setState({loaderVisible: visible});

    };

    render() {

        const { navigation } = this.props;
        const serviceName = navigation.getParam('serviceName');

        return (

            this.state.loaderVisible?<Indicator/>:<View style={styles.container}>

                <ScrollView>

                    <Text style={styles.serviceName}>{serviceName}</Text>

                    <View style={styles.iconContainer}>

                        <Text style={styles.countMoney}>{+this.state.balance===0 && this.state.balance.charAt(0)==='-'?this.state.balance.slice(1):this.state.balance}</Text>

                        <FontAwesome
                            name='ruble'
                            color={'rgb(0,0,0)'}
                            size={18}
                        />

                    </View>

                    <Text style={{marginLeft: 15,fontSize: 16}}>Сумма к выводу</Text>

                    <View style={styles.content}>

                        <View style={styles.inputContainer}>

                            <TextInput
                                keyboardType = 'numeric'
                                underlineColorAndroid={'transparent'}
                                onChangeText={(text) => this.setState({amount: text})}
                                style={{fontSize: 14, padding: 3}}
                                value={this.state.amount}
                            />

                        </View>

                        <TouchableWithoutFeedback onPress={()=>{this.change_balance()}}>

                            <View style={styles.button}>

                                <FontAwesome
                                    name='chevron-right'
                                    color={'rgb(255,255,255)'}
                                    size={18}
                                />

                            </View>

                        </TouchableWithoutFeedback>

                    </View>

                    <Text style={{marginLeft: 15, fontSize: 10}}>Комиссия сервиса от 0 до 22 руб.</Text>

                </ScrollView>

            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgb(255,255,255)',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    serviceName: {
        fontWeight: 'bold',
        fontSize: 18,
        color: 'rgb(0,0,0)',
        margin: 15
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 0,
        margin: 15,
        marginBottom: 30
    },
    countMoney: {
        fontSize: 23,
        marginRight: 3
    },
    inputContainer: {
        flex: 0.8,
        borderWidth: 2,
        borderColor:  'rgb(0,0,0)',
        marginTop: 15,
        paddingLeft: 10,
        paddingRight: 10
    },
    content: {
        flexDirection: 'row',
        marginRight: 15,
        alignItems: 'center',
        marginLeft: 15
    },
    button: {
        marginTop: 13,
        marginLeft: 15,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:  'rgb(0,0,0)',
        borderRadius: 90
    }
});