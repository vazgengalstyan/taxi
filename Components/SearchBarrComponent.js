import React, {Component} from 'react';
import {
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
    TextInput,
    Platform
} from 'react-native';
import {YellowBox} from 'react-native';
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export class SearchBarr extends Component {

    constructor(props) {

        super(props);
        this.state = {};

    }

    render() {

        return (

            <View style={styles.searchContainer}>

                <MaterialIcons
                    size={24}
                    name='search'
                    color='rgb(0,0,0)'/>

                <TextInput
                    underlineColorAndroid={'transparent'}
                    onChangeText={(text) =>{this.props.search(text)}}
                    style={{fontSize: 14, padding: 3, flex: 1}}
                    placeholder="Поиск по имени..."
                    value={this.props.searchText}
                />

                <MaterialIcons
                    onPress={()=>{this.props.clearSearchText()}}
                    name='close'
                    size={24}
                    color='rgb(0,0,0)'/>

            </View>

        );
    }
}

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgb(0,0,0)',
        padding: 15,
        paddingTop: 3,
        paddingBottom: 3,
        alignItems: 'center'
    }
});