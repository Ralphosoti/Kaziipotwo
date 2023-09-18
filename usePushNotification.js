import { useEffect, useRef, useState } from 'react';
import { useUserContext } from "./userContext";
import firebase from './firebase';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const usePushNotification = () => {
  const user = firebase.auth().currentUser;
  const [me, setMe] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [username, setUsername] = useState('');
  const [notifyDD, setNotifyD] = useState('');

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const userId = firebase.auth().currentUser.uid;

        const userRef = firebase.firestore().collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          const userUsername = userData.fullName;
          const notifyD = userData.notifyDistance;
          setUsername(userUsername);
          setNotifyD(notifyD);
        } else {
          console.log('User not found in Firestore');
        }
      } catch (error) {
        console.error('Error getting user data from Firestore:', error);
      }
    };

    fetchUsername();
  }, []);


  const generateUniqueId = () => {
    const randomText = Math.random().toString(36).substring(2, 10);
    const timestamp = new Date().getTime();
    const randomChars = Math.random().toString(36).substring(2, 10);
    return `${randomText.replace(/\s+/g, '_')}_${timestamp}_${randomChars}`;
  };


  var notificationId = generateUniqueId();
  async function schedulePushNotification(locale,task) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "KAZI IPO! 🔔",
        body: `Hey, ${username} You are Almost at ${locale}\nFor this Job: ${task}`,
        data: { data: '' },
      },
      trigger: { seconds: 1 },
    });

    const currentDate = new Date().toISOString();
    await firebase.firestore().collection('notifications').add({
      id: notificationId,
      body: `Hey, ${username} You are Almost at ${locale}\nFor this Job: ${task}`,
      date: currentDate,
      userId: user.uid,
    })
  }
  
  const calculateRealDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; 
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };
  

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
      } catch (error) {
        console.error('Error getting location:', error);
      }
    }, 1000); // Check location every 2 secs

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (userLocation) {
      // Fetch task locations from Firebase
      const fetchTaskLocations = async () => {
        try {
          const querySnapshot = await firebase.firestore().collection('locations').where('user', '==', user.uid).get();
          const taskLocations = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            location: doc.data().location,
            task: doc.data().task,
            latitude: doc.data().latitude || 0,
            longitude: doc.data().longitude || 0,
          }));
          
          //console.log(`Current User: ${user.uid}`);
          // Compare user location with task locations
          taskLocations.forEach(async (taskLocation) => {
            const distance = calculateRealDistance(
              userLocation.coords.latitude,
              userLocation.coords.longitude,
              taskLocation.latitude,
              taskLocation.longitude
            );

            //console.log(notifyDD);
            

            if (notifyDD === null || notifyDD === ''){
              if (distance <= 1) { 
                // Send push notification
                console.log('new notification!');
                await schedulePushNotification(taskLocation.location, taskLocation.task);
              }
            }else{
              if (notifyDD <= distance) { 
                // Send push notification
                console.log('new notification!');
                await schedulePushNotification(taskLocation.location, taskLocation.task);
              }
            }
          });
        } catch (error) {
          console.log('Error fetching task locations:', error);
        }
      };

      fetchTaskLocations();
    }
  }, [userLocation]);

  return null; 
};

export default usePushNotification;
