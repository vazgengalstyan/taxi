import React, {Component} from 'react';
import {Dimensions, View} from 'react-native';
import {MaterialIndicator} from 'react-native-indicators';

export class  ScrollIndicator extends React.Component {

    constructor(props) {

        super(props);
        this.state = {};

    }

    render() {

        return (

            <View style={{width: Dimensions.get('window').width, height: 30}}>

                <MaterialIndicator size={25} color='rgb(0,0,0)'/>

            </View>

        );

    }

}
