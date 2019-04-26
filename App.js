import React, {Component} from 'react';
import {createStackNavigator} from 'react-navigation';
import {Login} from './Components/LoginComponent';
import {Home} from './Components/HomeComponent';
import {Withdraw} from './Components/WithdrawComponent';
import {AdminRequests} from './Components/admin/AdminRequests';
import {AdminPaid} from './Components/admin/AdminPaid';
import {CreditCard} from './Components/CreateCardComponent';
import {ChangeNumber} from './Components/admin/ChangeNumberComponent';
import {Registration} from './Components/RegistrationComponent';
import {AwaitRegistration} from './Components/AwaitRegistrationComponent';
import {VersionControl} from './Components/AppVersionComponent';
import {DriverTransfers} from './Components/DriverTransfersComponent';
import {AdminRegistration} from './Components/admin/AdminRegistrationComponent';
import {DriverNotifications} from './Components/DriverNotificationsComponent';
import {AdminNotifications} from './Components/admin/AdminNotificationsComponent';

const RootStack = createStackNavigator(
    {
        Login: Login,
        Home: Home,
        Withdraw: Withdraw,
        Admin: AdminRequests,
        AdminPaid: AdminPaid,
        CreditCard: CreditCard,
        ChangeNumber: ChangeNumber,
        Registration: Registration,
        AwaitRegistration: AwaitRegistration,
        VersionControl: VersionControl,
        DriverTransfers: DriverTransfers,
        AdminRegistration: AdminRegistration,
        DriverNotifications: DriverNotifications,
        AdminNotifications: AdminNotifications
    },
    {
        initialRouteName: 'Login',
    }
);

export default RootStack;