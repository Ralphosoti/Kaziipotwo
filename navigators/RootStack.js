import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProvider } from '../userContext'; 

import Login from '../screens/Login';
import SignUp from '../screens/SignUp';
import Welcome from '../screens/Welcome';
import AddTask from '../screens/AddTask';
import Footer from '../screens/Footer';
import GoogleMap from '../screens/GoogleMap';
import Header from '../screens/Header';
import SaveLocations from '../screens/SavedLocations';
import TaskList from '../screens/TaskList';
import { Colors } from '../components/styles';
import NotificationList from '../screens/NotificationList';
import ProfileTab from '../screens/ProfileTab';
import { LogBox } from 'react-native';
import TaskListComplete from '../screens/TaskListComplete';
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const Stack = createNativeStackNavigator();

const RootStack = () => {
    return (
            <NavigationContainer >
                <Stack.Navigator
                
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: 'transparent'
                        },
                        headerTintColor: Colors.tertiary,
                        headerTransparent: true,
                        headerTitle: '',
                        headerBackVisible:false
                    }}
                    initialRouteName={getCurrentRoute}
                >
                    <Stack.Screen name='Login' component={Login} />
                    <Stack.Screen name='SignUp' component={SignUp} />
                    <Stack.Screen options={{ headerTintColor: Colors.primary }} name='welcome' component={Welcome} />
                    <Stack.Screen options={{ headerTintColor: Colors.primary }} name='profile' component={ProfileTab} />
                    <Stack.Screen options={{ headerTintColor: Colors.primary }} name='AddTask' component={AddTask} />
                    <Stack.Screen options={{ headerTintColor: Colors.primary }} name='Footer' component={Footer} />
                    <Stack.Screen options={{ headerTintColor: Colors.primary }} name='GoogleMap' component={GoogleMap} />
                    <Stack.Screen options={{ headerTintColor: Colors.primary }} name='Header' component={Header} />
                    <Stack.Screen options={{ headerTintColor: Colors.primary }} name='SaveLocations' component={SaveLocations} />
                    <Stack.Screen options={{ headerTintColor: Colors.primary }} name='TaskList' component={TaskList} />
                    <Stack.Screen options={{ headerTintColor: Colors.primary }} name='TaskListComplete' component={TaskListComplete} />
                    <Stack.Screen options={{ headerTintColor: Colors.primary }} name='NotificationList' component={NotificationList} />
                </Stack.Navigator>
            </NavigationContainer>
    );
}

const getCurrentRoute = ({ navigation }) => {
    const currentUser = firebase.auth().currentUser;
    return currentUser?.uid ? 'welcome' : 'Login';
};

export default RootStack;
