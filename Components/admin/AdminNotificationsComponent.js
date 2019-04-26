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
    Clipboard,
    TextInput,
    Dimensions, Animated
} from 'react-native';
import {Indicator} from "../IndicatorComponent";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {ScrollIndicator} from "../ScrollLoader";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Hyperlink from 'react-native-hyperlink'
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);

export class AdminNotifications extends React.Component {

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
            data: [],
            loaderVisible: true,
            auth_key: '',
            text: '',
            offset: 0,
            scrollLoaderVisible: false
        };

    }

    componentDidMount(){

        BackHandler.addEventListener('hardwareBackPress', () => {
            this.props.navigation.push('Admin');
            return true;
        });

        let auth_key =  this.props.navigation.getParam('auth_key');
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

                this.setState({auth_key: auth_key, data: response.data});

            }else {

                Alert.alert(
                    '',
                    response.message
                );

            }

            this.setLoaderVisible(false);

        });

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

    changeText = (text)=>{

        this.setState({text: text})

    };

    sendMessage = ()=>{

        if(!this.state.text.trim()){
            return
        }

        fetch('https://taxi-center.org/api/admin/send-message', {
            method: 'post',
            dataType: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({
                auth_key: this.state.auth_key,
                text: this.state.text
            })
        }).then(response => response.json()).then(response => {

            console.log(response);

        });

        let cloneData = [...this.state.data];
        let date  = new Date();
        date = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
        cloneData = [{message: this.state.text.trim(), date: date}].concat(cloneData);
        this.setState({data: cloneData, text: ''});
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

                    <Text style={styles.headerTitle}>Рассылка</Text>

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

                                    <TouchableWithoutFeedback onPress={()=>{this.props.navigation.push('ChangeNumber')}}>
                                        <View style={styles.menuItemsContainer}>
                                            <Text style={styles.menuItemsText}>Замена номера тел.</Text>
                                        </View>
                                    </TouchableWithoutFeedback>

                                    <TouchableWithoutFeedback onPress={()=>{this.setMenuVisible(false)}}>
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
                    inverted
                    style={{ paddingLeft: 30, paddingRight: 30}}
                    ListFooterComponent={this.state.scrollLoaderVisible?<View style={{position: 'absolute', left: -30}}><ScrollIndicator/></View>:null}
                    data={this.state.data}
                    onScroll={({nativeEvent})=>{this.scrollTop({nativeEvent})}}
                    showsVerticalScrollIndicator={false}
                    renderItem={({item,index})=>
                        <View style={styles.itemContainer}>

                            <Hyperlink linkDefault={true} linkStyle={{ color: '#2980b9'}}>
                                <Text style={{color: 'rgb(0,0,0)', fontSize: 16,lineHeight: 24}}
                                      selectable={true} onLongPress={()=>{Clipboard.setString(''+item.message)}}
                                >{item.message}</Text>
                            </Hyperlink>

                            <View style={styles.dateContainer}>

                                <Text style={{textAlign: 'center', fontSize: 12}}>{item.date}</Text>

                            </View>

                        </View>}
                    keyExtractor={(item, index) => index.toString()}
                />

                <View style={styles.sendMessageContainer}>

                    <View style={styles.inputContainer}>

                        <TextInput
                            ref='textInput'
                            underlineColorAndroid={'transparent'}
                            onChangeText={(text) => {this.changeText(text)}}
                            placeholder="Введите текст"
                            multiline = {true}
                            style={{fontSize: 14, padding: 5, paddingLeft: 10, paddingRight: 10}}
                            value={this.state.text}
                        />

                    </View>

                    <View style={{flex: 0.15,justifyContent: 'flex-end'}}>

                    <TouchableWithoutFeedback onPress={()=>{this.sendMessage()}}>
                        <View style={{ alignItems: 'center', marginBottom: 7}}>

                            <MaterialIcons name='send'
                                           color='rgb(0,0,0)'
                                           size={28}/>

                        </View>
                    </TouchableWithoutFeedback>
                    </View>
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
    sendMessageContainer: {
        width: '100%',
        padding: 20,
        flexDirection: 'row',
        borderTopWidth: 1,
        borderColor: 'rgb(170,170,170)'
    },
    inputContainer: {
        borderColor: 'rgb(0,0,0)',
        borderRadius: 10,
        borderWidth: 2,
        flex: 0.85
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