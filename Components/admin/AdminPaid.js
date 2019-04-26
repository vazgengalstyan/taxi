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
import {ScrollIndicator} from "../ScrollLoader";

YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);


export class AdminPaid extends Component {

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
            skip: 0,
            auth_key: '',
            loaderVisible: true,
            refreshingList: false,
            scrollLoaderVisible: false,
            data: [],
        };

    }

    componentDidMount(){

        this.getData();

        BackHandler.addEventListener('hardwareBackPress', () => {

            this.props.navigation.push('Admin');
            return true;

        });

    }

    getData = async ()=>{

        let auth_key = await AsyncStorage.getItem('auth_key');
        this.setState({auth_key: auth_key,skip: 0});
        let apiUrl = 'https://taxi-center.org/api/admin/requests?auth_key='+auth_key+'&status=1&skip=0&take=10';

        fetch(apiUrl, {
            method: 'get',
            dataType: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            }
        }).then(response => response.json()).then(response => {

            if(response.success){

                this.setState({data: response.data, refreshingList: false, skip: 0});

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

    setScrollLoaderVisible = (visible) => {

        this.setState({scrollLoaderVisible: visible});

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

    scrollDown= async (e)=>{

        if(e.nativeEvent.layoutMeasurement.height + e.nativeEvent.contentOffset.y >= e.nativeEvent.contentSize.height-1){

            await this.setScrollLoaderVisible(true);

            let auth_key = this.state.auth_key;
            let skip = this.state.skip+10;
            this.setState({skip: skip});

            let apiUrl = 'https://taxi-center.org/api/admin/requests?auth_key='+auth_key+'&status=1&skip='+skip+'&take=10';

            fetch(apiUrl, {
                method: 'get',
                dataType: 'json',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json; charset=UTF-8'
                }
            }).then(response => response.json()).then(response => {

                if(response.success){

                    let clonePaid = [...this.state.data];
                    clonePaid = clonePaid.concat(response.data);
                    this.setState({data: clonePaid});
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

                    <Text style={styles.headerTitle}>Оплаченные</Text>

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

                                    <TouchableWithoutFeedback onPress={()=>{this.setMenuVisible(false)}}>
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
                    onScroll={({nativeEvent}) => { this.scrollDown({nativeEvent}) }}
                    ListFooterComponent={this.state.scrollLoaderVisible?<View style={{position: 'absolute', bottom: 11}}><ScrollIndicator/></View>:null}
                    showsVerticalScrollIndicator={false}
                    renderItem={({item,index}) =>
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