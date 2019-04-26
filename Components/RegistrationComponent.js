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
    Dimensions, PermissionsAndroid
} from 'react-native';
import {YellowBox} from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {Indicator} from "./IndicatorComponent";
import ImagePicker from 'react-native-image-picker';
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);

export class Registration extends Component {

    static navigationOptions = ({ navigation })=>({

        title: 'Регистрация',
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
            data: [
                [{description: 'Водительское удостоверение лицевая сторона',photoExample: require('../images/photo_registration/3.jpg')},
                    {description: 'Водительское удостоверение обратная сторона',photoExample:  require('../images/photo_registration/4.jpg')}],
                [{description: 'Паспорт разворот с фотографией', photoExample: require('../images/photo_registration/2.jpg')}],
                [{description: 'Ваша фотография', photoExample: require('../images/photo_registration/1.jpg')}],
                [{description: 'Тех.паспорт на авто сторона с номером',photoExample: require('../images/photo_registration/6.jpg')},
                    {description: 'Тех.паспорт на авто лицевая сторона',photoExample:  require('../images/photo_registration/5.jpg')}],
                [{description: 'Лицензия на такси лицевая сторона',photoExample:  require('../images/photo_registration/7.jpg')},
                    {description: 'Лицензия на такси обратная сторона', photoExample:  require('../images/photo_registration/8.jpg')}],
                [{description: 'Страховой осаго', photoExample:  require('../images/photo_registration/9.jpg')}],
                [{description: 'Фото автомобиля с переди', photoExample:  require('../images/photo_registration/10.jpg')},
                    {description: 'фото автомобиля с переднего бока 45 градусов', photoExample: require('../images/photo_registration/11.jpg')},
                    {description: 'фото автомобиля с зади', photoExample: require('../images/photo_registration/12.jpg')},
                    {description: 'фото автомобиля с заднего бока 45 градусов', photoExample: require('../images/photo_registration/13.jpg')}]
            ],
            buttonActive: false,
            page_index: 0,
            auth_key: this.props.navigation.getParam('auth_key'),
            user_id: this.props.navigation.getParam('user_id'),
            loaderVisible: false,
            popUpUploadVisible: false,
            phone: this.props.navigation.getParam('phone'),
            userImages: [['',''],[''],[''],['',''],['',''],[''],['','','','']],
            current_item: {},
            yPosition: new Animated.Value(800),
            windowHeight: Dimensions.get('window').height
        };

    }

    componentDidMount(){

        BackHandler.addEventListener('hardwareBackPress', () => {
            this.props.navigation.push('Home');
            return true;
        });

    };

    setLoaderVisible = (visible)=>{

        this.setState({loaderVisible: visible});

    };

    setPopUpUploadVisible = async (visible,item,index)=>{

        if(visible){
            await this.setState({yPosition: new Animated.Value(this.state.windowHeight)});
            const granted2 = PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
            const granted3 = PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);

            Animated.timing(this.state.yPosition,{toValue: 0, duration: 100}).start();

        }else {
            await this.setState({yPosition: new Animated.Value(0)});

            Animated.timing(this.state.yPosition,{toValue: 800, duration: 100}).start();

        }

        this.setState({current_item: {item: item, index: index}});

        this.setState({popUpUploadVisible: visible});

    };

    changePhoneNumber = async (text)=>{

       await this.setState({phone: text});
        this.formValid()

    };

    imageUpLoad = async (item,index,type)=>{

        const options = {
            quality: 1.0,
            mediaType: 'photo',
            storageOptions: {
                skipBackup: true,
                path: 'all',
            },
        };

       await this.setPopUpUploadVisible(false);

        if(type === 'camera'){

            await ImagePicker.launchCamera(options, (response) => {

                if (response.didCancel) {
                    return
                }
                else if (response.error) {
                    return
                }
                else {

                    let dataCopy = [...this.state.data];
                    dataCopy[this.state.page_index][index].photoExample = {uri: response.uri};
                    this.setState({data: dataCopy});
                    let userImgCopy = [...this.state.userImages];
                    userImgCopy[this.state.page_index][index] = response.data;
                    this.setState({userImages: userImgCopy});
                    this.formValid();

                }

            });

        }else {

            await ImagePicker.launchImageLibrary(options, (response) => {

                if (response.didCancel) {
                    return
                }
                else if (response.error) {
                    return
                }
                else {

                    let dataCopy = [...this.state.data];
                    dataCopy[this.state.page_index][index].photoExample = {uri: response.uri};
                    this.setState({data: dataCopy});
                    let userImgCopy = [...this.state.userImages];
                    userImgCopy[this.state.page_index][index] = response.data;
                    this.setState({userImages: userImgCopy});
                    this.formValid();

                }

            });

        }

    };

    formValid=()=>{

        let valid = true;

        for(let i = 0; i < this.state.userImages[this.state.page_index].length; i++){

            if(!this.state.userImages[this.state.page_index][i]){

                valid = false;

            }

        }

        if(this.state.page_index === 0){

            if(this.state.phone === '+7'){

                valid = false;

            }

        }

        if(valid){

            this.setState({buttonActive: true})

        }else {

            this.setState({buttonActive: false})

        }

    };

    next = async ()=>{

        if(!this.state.buttonActive){

            return

        }

        this.setLoaderVisible(true);

        let folder_name = '';
        let photos = [];

        switch (this.state.page_index) {
            case 0:
                folder_name = "Водительское_удостоверение";
                photos = this.state.userImages[this.state.page_index];
                break;
            case 1:
                folder_name = "Паспорт";
                photos = this.state.userImages[this.state.page_index];
                break;
            case 2:
                folder_name = "Водитель";
                photos = this.state.userImages[this.state.page_index];
                break;
            case 3:
                folder_name = "Тех_паспорт";
                photos = this.state.userImages[this.state.page_index];
                break;
            case 4:
                folder_name = "Лицензия";
                photos = this.state.userImages[this.state.page_index];
                break;
            case 5:
                folder_name = "Страховой";
                photos = this.state.userImages[this.state.page_index];
                break;
            case 6:
                folder_name = "Автомобил";
                photos = this.state.userImages[this.state.page_index];
        }

        fetch('https://taxi-center.org/api/connect-step2', {
            method: 'post',
            dataType: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({
                auth_key: this.state.auth_key,
                id: this.state.user_id,
                phone: this.state.phone,
                folder_name: folder_name,
                photos: photos
            })
        }).then(response => response.json()).then(response => {

            if(response.success){

                if(this.state.page_index === 6){

                    let adminFCMToken = this.props.navigation.getParam('adminFCMToken')

                    fetch('https://fcm.googleapis.com/fcm/send', {
                        method: 'post',
                        dataType: 'json',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json; charset=UTF-8',
                            'Authorization': 'key=AAAAgntE4fE:APA91bFJm7M5XPEgYMewjRRfOCtUXLCYsT9-G6vVApWJVfxc2IK6aytfKFzQqohw_VqXZi7XEanJU3ZoEA26a-AqftnRKhmDyBaqmHd4OAl1QpHAuImw_yIgo9NNm7cX74st9OV2Vdza'
                        },
                        body: JSON.stringify({
                            "to" : adminFCMToken,
                            "notification" : {
                                "body" : 'Новый запрос на регистрацию.',
                                "title" : "Таксомат",
                                "content_available" : true,
                                "priority" : "high",
                                "sound" : "default"
                            }
                        })
                    }).then(response => response.json()).then(response => {

                        console.log(response)

                        this.props.navigation.push('AwaitRegistration',{auth_key: this.state.auth_key,user_id: this.state.user_id});
                        return

                    });

                }else {

                    this.setState({page_index: this.state.page_index+1, buttonActive: false});
                    this.setLoaderVisible(false);

                }

            }else {

                Alert.alert(
                    '',
                    response.message
                );

                this.setLoaderVisible(false);

            }

        });

    };

    renderItem = ()=>{

        return this.state.data[this.state.page_index].map((item,index)=>{

            return(

                <View key={index}>

                    <View style={{borderColor: 'rgb(0,0,0)', margin: 15, elevation: 4, borderRadius: 10, paddingHorizontal: 10}}>

                        <Text style={[styles.fontBold,{textAlign: 'center', marginTop: 30}]}>{item.description}</Text>

                        <View style={styles.imgContainer}>

                            <Image style={{width: 230, height: 160, marginTop: 15, resizeMode: 'contain', borderRadius: 10}} source={item.photoExample} />

                        </View>

                        <View style={styles.imgContainer}>

                            <TouchableWithoutFeedback onPress={()=>{this.setPopUpUploadVisible(true,item,index)}}>
                                <View style={styles.createImageButton}>

                                    <Text style={{color: 'rgb(0,0,0)'}}>Добавить фото</Text>

                                </View>
                            </TouchableWithoutFeedback>

                        </View>

                    </View>

                </View>

            )

        })

    };

    render() {

        let animationStyleModal = {

            transform: [{translateY: this.state.yPosition}]

        };

        return (

            this.state.loaderVisible?<Indicator/>:<View style={styles.container}>
                <View style={styles.container}>

                    <ScrollView showsVerticalScrollIndicator={false}>

                        {this.renderItem()}

                    </ScrollView>

                </View>

                {this.state.page_index<6?<View style={styles.footerContainer}>

                    <TouchableWithoutFeedback onPress={()=>{this.next()}}>

                        <View style={[styles.sendButton,!this.state.buttonActive?{backgroundColor: 'rgb(170,170,170)'}:{}]}>

                            <Text style={{color: 'rgb(255,255,255)', fontSize: 18}}>Далее</Text>

                        </View>

                    </TouchableWithoutFeedback>

                </View>:null}

                {this.state.page_index===6?<View style={styles.footerContainer}>

                    <TouchableWithoutFeedback onPress={()=>{this.next()}}>

                        <View style={[styles.sendButton,!this.state.buttonActive?{backgroundColor: 'rgb(170,170,170)'}:{}]}>

                            <Text style={{color: 'rgb(255,255,255)', fontSize: 18}}>Готова</Text>

                        </View>

                    </TouchableWithoutFeedback>

                </View>:null}

                <TouchableWithoutFeedback onPress={()=>{this.setPopUpUploadVisible(false)}}><Animated.View style={[styles.popUpUpload,animationStyleModal]}>

                    <TouchableWithoutFeedback onPress={()=>{}}>
                        <View style={styles.popUpUploadContainer}>

                            <View style={{marginTop: 10}}>

                                <TouchableWithoutFeedback onPress={()=>{this.imageUpLoad(this.state.current_item.item,this.state.current_item.index,'camera')}}>

                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>

                                        <MaterialIcons name='camera-alt'
                                                       color='rgb(0,0,0)'
                                                       size={24}/>

                                        <Text style={{fontSize: 18, color: 'rgb(0,0,0)'}}> Сделать фото</Text>

                                    </View>

                                </TouchableWithoutFeedback>

                            </View>

                            <View style={{marginTop: 30}}>

                                <TouchableWithoutFeedback onPress={()=>{this.imageUpLoad(this.state.current_item.item,this.state.current_item.index,'gallery')}}>

                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>

                                        <MaterialIcons name='collections'
                                                       color='rgb(0,0,0)'
                                                       size={24}/>

                                        <Text style={{fontSize: 18, color: 'rgb(0,0,0)'}}> Выбрать из галереи</Text>

                                    </View>

                                </TouchableWithoutFeedback>

                            </View>

                            <View style={{marginTop: 30, alignItems: 'flex-end'}}>

                                <TouchableWithoutFeedback onPress={()=>{this.setPopUpUploadVisible(false)}}>

                                    <View>

                                        <Text style={{fontSize: 16, color: 'rgb(35,161,149)'}}>Отмена</Text>

                                    </View>

                                </TouchableWithoutFeedback>

                            </View>

                        </View>
                    </TouchableWithoutFeedback>

                    </Animated.View></TouchableWithoutFeedback>

            </View>

        );
    }
}

const styles = StyleSheet.create({
    popUpUploadContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '80%',
        height: 200,
        backgroundColor: 'rgb(255,255,255)',
        borderRadius: 10,
        padding: 20,
        elevation: 17,
    },
    popUpUpload: {
        backgroundColor: 'rgba(170,170,170,0.5)',
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        flex: 1,
        backgroundColor: 'rgb(255,255,255)',
    },
    fontBold: {
        fontWeight: 'bold',
        fontSize: 18,
        color: 'rgb(0,0,0)'
    },
    imgContainer: {
        marginTop: 10,
        alignItems: 'center',
    },
    createImageButton: {
        marginBottom: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: 'rgb(0,0,0)',
        borderRadius: 30
    },
    footerContainer: {
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: 'rgb(170,170,170)',
        padding: 15,
    },
    sendButton: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        backgroundColor: 'rgb(0,0,0)',
        borderRadius: 30
    }
});