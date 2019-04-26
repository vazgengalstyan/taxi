import React, {Component} from 'react';
import {
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    Alert,
    Linking,
    View,
    BackHandler,
    Image, StatusBar
} from 'react-native';
import {createStackNavigator} from 'react-navigation';
import {YellowBox} from 'react-native';
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);


export class VersionControl extends Component {

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

    };

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

                <Image style={{width: 75, height: 75, marginTop: 50}} source={require('../images/logo.png')}/>

                <Text style={{fontSize: 20, fontWeight: 'bold'}}>ТАКСОМАТ</Text>

                <View style={{marginTop: '15%', padding: 20}}>

                    <Text style={{textAlign: 'center',fontSize: 18,}}>Данная версия приложения устарела. Чтобы и дальше использовать «ТАКСОМАТ» установите самое последнее обновление.</Text>

                </View>

                <TouchableWithoutFeedback onPress={()=>Linking.openURL('https://play.google.com/store/apps/details?id=com.takcomat')}>

                    <View style={{marginTop: '30%'}}>

                        <Image style={{width: 200, height: 75,resizeMode: 'contain',}} source={require('../images/google-play-icon.png')}/>

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
        alignItems: 'center',
    },
});