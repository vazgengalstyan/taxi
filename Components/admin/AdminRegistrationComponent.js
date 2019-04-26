import React, {Component} from 'react';
import {
    Text,
    StyleSheet,
    Image,
    TouchableWithoutFeedback,
    Alert,
    FlatList,
    AsyncStorage,
    ScrollView,
    View,
    TextInput,
    Platform,
    BackHandler,
    Animated,
    CameraRoll,
    PermissionsAndroid,
    Dimensions, Clipboard
} from 'react-native';
import {YellowBox} from 'react-native';
import RNFS from 'react-native-fs';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {Indicator} from "../IndicatorComponent";
import ImagePicker from 'react-native-image-picker';
import {ScrollIndicator} from "../ScrollLoader";
import MaterialIndicator from "react-native-indicators/src/components/material-indicator";
import FontAwesome from "react-native-vector-icons/FontAwesome";
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);

export class AdminRegistration extends Component {

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
            auth_key: '',
            loaderVisible: true,
            refreshingList: false,
            scrollLoaderVisible: false
        };

    }

    componentDidMount(){

        BackHandler.addEventListener('hardwareBackPress', () => {

            this.props.navigation.push('Admin');
            return true;

        });

        this.getData()

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

    setMenuVisible = async (visible) => {

        if(visible){
            Animated.timing(this.state.xPosition,{toValue: 0, duration: 200}).start();
        }else {
            Animated.timing(this.state.xPosition,{toValue: -Dimensions.get('window').width, duration: 200}).start();
        }

    };

    getData =async ()=>{

        let auth_key = await AsyncStorage.getItem('auth_key');
        this.setState({auth_key: auth_key});

        let url ='https://taxi-center.org/api/admin/registration-requests?auth_key=' + auth_key;

        fetch(url, {
            method: 'get',
            dataType: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            }
        }).then(response => response.json()).then(response => {

           if(response.success){

               this.setState({data: response.data,refreshingList: false});
               this.setLoaderVisible(false);

           }else {

               Alert.alert(
                   '',
                   response.message
               );

           }

        });

    };

    changeUserStatus = async (item, index)=>{
        this.setLoaderVisible(true);

        fetch('https://taxi-center.org/api/admin/accept-registration', {
            method: 'post',
            dataType: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({
                user_id: item.id,
                auth_key: this.state.auth_key,
            })
        }).then(response => response.json()).then(response => {

            if(response.success){

                console.log(response);

                let clone = [...this.state.data];
                clone.splice(index, 1);
                this.setState({data: clone});
                this.setLoaderVisible(false);

            }else {

                Alert.alert(
                    '',
                    response.message
                );

                this.setLoaderVisible(false);
            }

        });

    };

    downloadImages = async (item,index)=>{

        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);

        if(granted==='granted'){

            this.setLoaderVisible(true);

            for(let i = 0; i < item.photos.length; i++){

               await RNFS.downloadFile({
                    fromUrl: item.photos[i],
                    toFile: RNFS.DocumentDirectoryPath+'/'+i+'.jpg',

                }).promise.then((res) => {

                    CameraRoll.saveToCameraRoll(RNFS.DocumentDirectoryPath+'/'+i+'.jpg','photo').then((res)=>{

                        console.log(res)

                    }).catch((res)=>{

                        console.log(res)

                    });

                    if(i===item.photos.length-1){

                        Alert.alert(
                            '',
                            'Скачано'
                        );

                        this.setLoaderVisible(false);

                    }


                }).catch((res) => {

                    console.log(res)

                });

            }

        }else {

            return

        }


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

                    <Text style={styles.headerTitle}>Регистрация</Text>

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

                                    <TouchableWithoutFeedback onPress={()=>{this.setMenuVisible(false)}}>
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
                    onRefresh={() => {this.setState({refreshingList: true});this.getData()}}
                    refreshing={this.state.refreshingList}
                    ListFooterComponent={this.state.scrollLoaderVisible?<View style={{position: 'absolute', bottom: 11}}><ScrollIndicator/></View>:null}
                    // onScroll={({nativeEvent})=>{this.scrollDown({nativeEvent})}}
                    data={this.state.data}
                    showsVerticalScrollIndicator={false}
                    renderItem={({item,index})=><View style={styles.itemContainer}>

                        <Text style={styles.fontBold} selectable={true} onLongPress={()=>{Clipboard.setString(''+item.phone)}}>{item.phone}</Text>

                        <TouchableWithoutFeedback onPress={()=>{

                            Alert.alert(
                                'Скачать?',
                                '',
                                [
                                    {text: 'НЕТ', onPress: () => {return false}, style: 'cancel'},
                                    {text: 'ДА', onPress: () => {this.downloadImages(item,index)}},
                                ],
                                { cancelable: false }
                            )

                        }}>

                            <View style={styles.button}>

                                <Text style={[styles.fontBold,{color: 'rgb(255,255,255)'}]}>Скачать</Text>

                            </View>

                        </TouchableWithoutFeedback>

                        <TouchableWithoutFeedback onPress={()=>{

                                Alert.alert(
                                    'Подтвердить?',
                                    '',
                                    [
                                        {text: 'НЕТ', onPress: () => {return false}, style: 'cancel'},
                                        {text: 'ДА', onPress: () => {this.changeUserStatus(item,index)}},
                                    ],
                                    { cancelable: false }
                                )

                        }}>

                            <View style={styles.button}>

                                <Text style={[styles.fontBold,{color: 'rgb(255,255,255)'}]}>Активировать</Text>

                            </View>

                        </TouchableWithoutFeedback>

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
    button: {
        backgroundColor: 'rgb(0,0,0)',
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
        padding: 10,
        marginTop: 10
    },
    fontBold: {
        fontWeight: 'bold',
        fontSize: 18,
        color: 'rgb(0,0,0)'
    },
    itemContainer: {
        padding: 15,
        elevation: 8,
        margin: 10,
        marginLeft: 20,
        marginRight: 20,
        backgroundColor: 'rgb(255,255,255)',
        borderRadius: 10,
        alignItems: 'center'
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