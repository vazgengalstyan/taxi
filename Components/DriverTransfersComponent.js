import React, {Component} from 'react';
import {
    Text,
    StyleSheet,
    YellowBox,
    TouchableWithoutFeedback,
    Alert,
    AsyncStorage,
    View,
    BackHandler,
    Platform,
    FlatList,
    Clipboard
} from 'react-native';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {Indicator} from "./IndicatorComponent";
import {MaterialIndicator} from 'react-native-indicators';
import {ScrollIndicator} from "./ScrollLoader";
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);

export class  DriverTransfers extends React.Component {

    static navigationOptions = ({ navigation })=>({

        title: 'Карта и переводы',
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
            data: [],
            credit_card_show: '',
            auth_key: this.props.navigation.getParam('auth_key'),
            user_id: this.props.navigation.getParam('user_id'),
            loaderVisible: true,
            offset: 0,
            scrollLoaderVisible: false,
            refreshingList: false
        };

    }

    componentDidMount(){

        this._didFocusSubscription = BackHandler.addEventListener('hardwareBackPress', () => {
            this.props.navigation.goBack();
            return true;
        });

        let credit_card =  this.props.navigation.getParam('credit_card');
        let auth_key =  this.props.navigation.getParam('auth_key');
        let user_id =  this.props.navigation.getParam('user_id');

        let credit_card_show = credit_card;

        if(credit_card_show){

            let str = credit_card_show.slice(0,4);

            credit_card_show = str + ' **** **** ****';

        }

        this.setState({credit_card: credit_card,
            auth_key: auth_key,
            user_id: user_id,
            credit_card_show: credit_card_show});

        this.getData();

    };

    componentWillUnmount() {

        this._didFocusSubscription.remove();

    }

    setLoaderVisible = (visible)=>{

        this.setState({loaderVisible: visible});

    };

    setScrollLoaderVisible = (visible) => {

        this.setState({scrollLoaderVisible: visible});

    };

    getData= async ()=>{

        let auth_key = this.state.auth_key;
        let user_id = this.state.user_id;
        let url = 'https://taxi-center.org/api/my-requests?auth_key='+auth_key+'&id='+user_id+'&limit=10&offset=0';

        fetch(url, {
            method: 'get',
            dataType: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            }
        }).then(response => response.json()).then(response => {

            if(response.success){

                this.setState({data: response.data,refreshingList: false,offset: 0});
                this.setLoaderVisible(false)

            }else {

                Alert.alert(
                    '',
                    response.message
                );

            }

        });

    };

    scrollDown= async (e)=>{

        if(e.nativeEvent.layoutMeasurement.height + e.nativeEvent.contentOffset.y >= e.nativeEvent.contentSize.height-3){

            await this.setScrollLoaderVisible(true);

            let auth_key = this.state.auth_key;
            let user_id = this.state.user_id;
            let offset = this.state.offset + 10;
            let url = 'https://taxi-center.org/api/my-requests?auth_key='+auth_key+'&id='+user_id+'&limit=10&offset='+offset;

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
                    this.setState({data: cloneData, offset: offset});
                    this.setScrollLoaderVisible(false);

                }else {

                    Alert.alert(
                        '',
                        response.message
                    );

                }

            });

        }else {

            return

        }

    };

    render() {

        return (

            this.state.loaderVisible?<Indicator/>:<View style={styles.container}>

                {!this.state.credit_card || this.state.credit_card === 'null'?null:<View style={styles.item}>

                    <Text style={[styles.fontBold,{paddingLeft: 15, paddingTop: 15}]}>Банковская карта</Text>

                    <View style={styles.cardItem}>

                        <Text style={{fontSize: 13}}>{this.state.credit_card_show}</Text>

                        <TouchableWithoutFeedback onPress={()=>{this.props.navigation.push('CreditCard',{auth_key: this.state.auth_key,
                            user_id: this.state.user_id,
                            credit_card: this.state.credit_card})}}>

                            <View>

                                <Text style={{fontSize: 13, color: 'rgb(0,0,0)'}}>Изменить</Text>

                            </View>

                        </TouchableWithoutFeedback>

                    </View>

                </View>}

                <FlatList
                    onRefresh={() => {this.setState({refreshingList: true});this.getData()}}
                    refreshing={this.state.refreshingList}
                    ListFooterComponent={this.state.scrollLoaderVisible?<View style={{position: 'absolute', bottom: 11}}><ScrollIndicator/></View>:null}
                    onScroll={({nativeEvent})=>{this.scrollDown({nativeEvent})}}
                    data={this.state.data}
                    showsVerticalScrollIndicator={false}
                    renderItem={({item,index})=>
                        <View style={styles.itemContainer} key={index}>

                            <View style={styles.itemTextContainer}>

                                <Text style={[styles.fontSize18,{marginBottom: 5}]}>{item.type==='yandex'?'Яндекс':'Ситимобил'} - {item.price}руб.</Text>
                                <Text style={[styles.fontSize18,{marginBottom: 5}]}>{item.request_date}</Text>

                            </View>

                            <View style={styles.itemIconContainer}>

                                {!item.status?<MaterialIndicator size={25} color='rgb(0,0,0)'/>:
                                    <FontAwesome   name='check'
                                                   color='rgb(0,0,0)'
                                                   size={25}/>}

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
    },
    item: {
        borderColor: 'rgb(170,170,170)',
        elevation: 10,
        backgroundColor: 'rgb(255,255,255)',
    },
    cardItem: {
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10
    },
    fontBold: {
        fontWeight: 'bold',
        fontSize: 18,
        color: 'rgb(0,0,0)'
    },
    itemContainer: {
        padding: 15,
        elevation: 10,
        margin: 10,
        marginLeft: 20,
        marginRight: 20,
        backgroundColor: 'rgb(255,255,255)',
        borderRadius: 10,
        flexDirection: 'row'
    },
    itemTextContainer: {
        flex: 0.8
    },
    itemIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 0.2
    },
    fontSize18: {
        fontSize: 18,
        color: 'rgb(0,0,0)'
    }
});
