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
    Platform, BackHandler, StatusBar
} from 'react-native';
import {createStackNavigator} from 'react-navigation';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import {Indicator} from "./IndicatorComponent";
import {YellowBox} from 'react-native';
import FontAwesome from "react-native-vector-icons/FontAwesome";
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);


export class AwaitRegistration extends Component {

    static navigationOptions = ({ navigation })=>({
        headerStyle: {
            display: 'none',
            backgroundColor: 'rgb(255,255,255)',
        }
    });

    constructor(props) {

        super(props);
        this.state = {
            loaderVisible: false,
        };

    }

    componentDidMount(){

        BackHandler.addEventListener('hardwareBackPress', () => {

            BackHandler.exitApp();
            return true;

        });

        fetch('https://taxi-center.org/api/connect-step3', {
            method: 'post',
            dataType: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({
                auth_key: this.props.navigation.getParam('auth_key'),
                id: this.props.navigation.getParam('user_id')
            })
        }).then(response => response.json()).then(response => {

            console.log(response);

        });

    }

    setLoaderVisible = (visible)=>{

        this.setState({loaderVisible: visible});

    };

    render() {

        return (

            <View style={styles.container}>

                <StatusBar
                    backgroundColor='rgb(0,0,0)'
                    barStyle="light-content"
                />

                <View style={styles.titleContainer}>

                    <Text style={styles.fontBold}>Регистрация</Text>

                </View>

                <View style={styles.contentContainer}>

                    <FontAwesome
                        name='check-circle'
                        color={'rgb(0,0,0)'}
                        size={45}
                    />

                    <Text style={[styles.fontBold,{fontWeight: 'bold'}]}>Заявка принята</Text>

                    <Text style={styles.text}>После обработки заявки наш оператор свяжется с вами по телефону.</Text>

                </View>

            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgb(255,255,255)',
    },
    titleContainer: {
        padding: 15,
        borderBottomWidth: 1,
        borderColor: 'rgb(170,170,170)',
    },
    contentContainer: {
        margin: 20,
        borderColor: 'rgb(0,0,0)',
        elevation: 3,
        borderRadius: 10,
        flexDirection: 'column',
        alignItems: 'center',
        padding: 10
    },
    text: {
        fontSize: 18,
        color: 'rgb(0,0,0)',
        textAlign: 'center',
        marginTop: 30
    },
    fontBold: {
        fontSize: 22,
        color: 'rgb(0,0,0)',
        textAlign: 'center'
    },
});