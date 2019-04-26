import React, {Component} from 'react';
import {
    Text,
    StyleSheet,
    YellowBox,
    TouchableWithoutFeedback,
    Alert,
    AsyncStorage,
    View,
    ScrollView,
    BackHandler,
    Platform,
    FlatList,
    Clipboard, Dimensions
} from 'react-native';
import FCM from "react-native-fcm";
import {Indicator} from "./IndicatorComponent";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {ScrollIndicator} from "./ScrollLoader";
import MaterialIndicator from "react-native-indicators/src/components/material-indicator";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Hyperlink from 'react-native-hyperlink'
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);

export class DriverNotifications extends React.Component {

    static navigationOptions = ({ navigation })=>({

        title: 'Уведомления',
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
            data: [],
            loaderVisible: true,
            auth_key: '',
            user_id: '',
            offset: 0,
            scrollLoaderVisible: false
        };

    }

    componentDidMount(){

        FCM.removeAllDeliveredNotifications()
        BackHandler.addEventListener('hardwareBackPress', () => {
            this.props.navigation.push('Home');
            return true;
        });

        let auth_key =  this.props.navigation.getParam('auth_key');
        let user_id =  this.props.navigation.getParam('user_id');
        let url = 'https://taxi-center.org/api/admin/get-messages?auth_key='+auth_key+'&limit=10&offset=0';

        fetch(url, {
            method: 'get',
            dataType: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            }
        }).then(response => response.json()).then(response => {

            if(response.success){

                this.setState({auth_key: auth_key, data: response.data,user_id: user_id});

                this.readAllNotification();

            }else {

                Alert.alert(
                    '',
                    response.message
                );

            }

            this.setLoaderVisible(false);

        });

    }

    readAllNotification = ()=>{
        let auth_key =  this.props.navigation.getParam('auth_key');
        let user_id =  this.props.navigation.getParam('user_id');

        fetch('https://taxi-center.org/api/read-message', {
            method: 'post',
            dataType: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({
                auth_key: auth_key,
                message_id: 0
            })
        }).then(response => response.json()).then(response => {

            console.log(response);

        });

    };

    scrollTop = async (e)=>{

        if(e.nativeEvent.contentSize.height-e.nativeEvent.contentOffset.y<=e.nativeEvent.layoutMeasurement.height+3){

            await this.setState({scrollLoaderVisible: true, offset: this.state.offset+10});

            let url = 'https://taxi-center.org/api/admin/get-messages?auth_key='+this.state.auth_key+'&limit=10&offset='+this.state.offset;

            fetch(url, {
                method: 'get',
                dataType: 'json',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json; charset=UTF-8'
                }
            }).then(response => response.json()).then(response => {

                if(response.success){

                    let cloneData = [...this.state.data];
                    cloneData = cloneData.concat(response.data);
                    this.setState({data: cloneData, scrollLoaderVisible: false});

                }else {

                    Alert.alert(
                        '',
                        response.message
                    );

                }


            });

        }

    };

    setLoaderVisible = (visible)=>{

        this.setState({loaderVisible: visible});

    };

    render() {

        return (

            this.state.loaderVisible?<Indicator/>:<View style={styles.container}>

                <FlatList
                    inverted
                    style={{ paddingLeft: 30, paddingRight: 30}}
                    ListFooterComponent={this.state.scrollLoaderVisible?<View style={{position: 'absolute', left: -30}}><ScrollIndicator/></View>:null}
                    data={this.state.data}
                    onScroll={({nativeEvent})=>{this.scrollTop({nativeEvent})}}
                    showsVerticalScrollIndicator={false}
                    renderItem={({item,index})=>
                        <View style={styles.itemContainer}>

                            <Hyperlink linkDefault={true} linkStyle={{ color: '#2980b9'}}>
                                <Text style={{color: 'rgb(0,0,0)', fontSize: 16,lineHeight: 24}}>{item.message}</Text>
                            </Hyperlink>

                            <View style={styles.dateContainer}>

                                <Text style={{textAlign: 'center', fontSize: 12}}>{item.date}</Text>

                            </View>

                        </View>}
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
        alignItems: 'center'
    },
    dateContainer: {
        position: 'absolute',
        width: '100%',
        top: 0,
        left: 15
    },
    itemContainer: {
        width: Dimensions.get('window').width - 100,
        backgroundColor: 'rgb(206,210,218)',
        borderRadius: 10,
        position: 'relative',
        margin: 15,
        padding: 15,
        paddingTop: 20
    }
});