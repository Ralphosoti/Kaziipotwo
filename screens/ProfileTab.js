import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useUserContext } from '../userContext';
import firebase from '../firebase';
import KeyboardAvoidingWrapper from '../components/KeyboardAvoidingWrapper';
import { useNavigation } from '@react-navigation/native';


const ProfileTab = () => {
  const { user } = useUserContext();
  const [tasks, setTasks] = useState([]);
  const [me, setMe] = useState([]);
  const [username, setUsername] = useState('');
  const [notifyD, setNotifyD] = useState('');
  const [locations, setLocations] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifyDistance, setNotifyDistance] = useState('');
  const [logoutDelay, setLogoutDelay] = useState(1500); // 1.5 seconds
  const [showActivityIndicator, setShowActivityIndicator] = useState(false);


  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe1 = firebase.firestore().collection('tasks').where('user', '==', firebase.auth().currentUser.uid)
      .onSnapshot(snapshot => {
        const tasksData = [];
        snapshot.forEach(doc1 => {
          tasksData.push({
            id: doc1.id,
            ...doc1.data()
          });
        });
        setTasks(tasksData);
        setIsLoading(false);
      });

    return () => unsubscribe1();
  }, []);

  useEffect(() => {
    const unsubscribe2 = firebase.firestore().collection('users').where('email', '==', user?.email)
      .onSnapshot(snapshot => {
        const meData = [];
        snapshot.forEach(doc2 => {
          meData.push({
            id: doc2.id,
            ...doc2.data()
          });
        });
        setMe(meData);
        setIsLoading(false);
      });

    return () => unsubscribe2();
  }, []);

  useEffect(() => {
    const unsubscribe3 = firebase.firestore().collection('locations').where('user', '==', firebase.auth().currentUser.uid)
      .onSnapshot(snapshot => {
        const locData = [];
        snapshot.forEach(doc3 => {
            locData.push({
            id: doc3.id,
            ...doc3.data()
          });
        });
        setLocations(locData);
        setIsLoading(false);
      });

    return () => unsubscribe3();
  }, []);


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


  const handleUpdateNotifyDistance = async () => {
    if (notifyDistance !== '') {
      try {
        const parsedDistance = parseFloat(notifyDistance);
        if (!isNaN(parsedDistance)) {
          await firebase.firestore().collection('users').doc(user.uid).update({
            notifyDistance: parsedDistance
          });
          setNotifyDistance('');
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
        } else {
          console.error('Invalid distance value:', notifyDistance);
        }
      } catch (error) {
        console.error('Error updating notifyDistance:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleLogout = () => {
    setShowActivityIndicator(true);
    setTimeout(() => {
      firebase.auth().signOut().then(() => {
        navigation.navigate('Login');
      }).catch(error => console.log(error));
    }, logoutDelay);
  }



  return (
   <KeyboardAvoidingWrapper>
     <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <MaterialIcons name="account-circle" size={100} color="#414757" />
        <Text style={styles.fullname}>{username}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>
        <View style={styles.profileCard}>
                <View style={styles.notifyContainer}>
                <TextInput
                style={styles.input}
                placeholder="Notify Distance"
                value={notifyDistance}
                onChangeText={text => setNotifyDistance(text)}
                />
              <Button  onPress={handleUpdateNotifyDistance} color={'#414757'} title="Update" />
            </View>
                <View style={styles.infoContainer}>
                <Text style={styles.title}>Tasks</Text>
                <Text style={styles.titleLeft}>{tasks.length || 0}</Text>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.title}>Locations</Text>
                <Text style={styles.titleLeft}>{locations.length || 0}</Text>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.title}>Notify me at</Text>
                <Text style={styles.titleLeft}>{notifyD || 0} km</Text>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.title}>Completed Tasks</Text>
            </View>
            {showActivityIndicator && (
            <View style={styles.activityIndicatorContainer}>
              <ActivityIndicator size="large" color="#000" />
            </View>
          )}
            <Button color={'#414757'} title="Logout" onPress={handleLogout} />
        </View>
     
    </View>
   </KeyboardAvoidingWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  activityIndicatorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  profileCard:{
    width: '100%',
    display:'flex',
    flexDirection: 'column',
    justifyContent:'flex-start',
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    padding:10,
    width:'100%'
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  email: {
    marginTop: 2,
    fontSize: 16,
  },
  fullname: {
    marginTop: 8,
    fontSize: 11,
  },
  infoContainer: {
    marginBottom: 26,
    display:'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  titleLeft: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  notifyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom:20
  },
  input: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
});

export default ProfileTab;
