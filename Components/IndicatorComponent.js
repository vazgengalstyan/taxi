import React, {Component} from 'react';
import {View,Dimensions} from 'react-native';
import {MaterialIndicator} from 'react-native-indicators';

export class  Indicator extends React.Component {

    constructor(props) {

        super(props);
        this.state = {};

    }

    render() {

        return (

                <View style={{width: Dimensions.get('window').width, height: Dimensions.get('window').height,position: 'absolute',zIndex: 50}}>

                        <MaterialIndicator color='rgb(0,0,0)'/>

                </View>

        );

    }

}
