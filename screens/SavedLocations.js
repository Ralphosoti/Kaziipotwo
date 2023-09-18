import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, ActivityIndicator } from 'react-native';
import { useUserContext } from "../userContext";
import firebase from '../firebase';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import * as Location from 'expo-location';

const SaveLocations = () => {
  const { user } = useUserContext(); 
  const [savedLocations, setSavedLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [expandedItems, setExpandedItems] = useState({});


  const [mylocation, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null); 
  const [isLocationLoading, setIsLocationLoading] = useState(true); 

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        setIsLocationLoading(false);
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        setLocationError(null); 
      } catch (error) {
        console.error('Error getting location:', error);
        setLocationError('Failed to get location'); 
      } finally{
        setIsLocationLoading(false);
      }
    })();
  }, []);

  const calculateDistance = (latitude, longitude) => {
    try {
      if (!mylocation) {
        console.log('Initialize location failed');
        return null;
      }
      const userLatitude = mylocation.coords.latitude;
      const userLongitude = mylocation.coords.longitude;
      
      let realDistance = calculateRealDistance(userLatitude, userLongitude,latitude, longitude);
      
      return realDistance;
    } catch (error) {
      console.error('Error calculating distance:', error);
      return null;
    }
  };

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
  
  const renderAccordionContent = (item) => {
    if (expandedItems[item.id]) {
      const distance = calculateDistance(item.latitude, item.longitude);
      return (
        <View>
          <Text style={styles.taskText}>{item.task}</Text>
          {distance !== null && (
            <Text style={styles.distanceText}>
              {distance.toFixed(2)} km away
            </Text>
          )}
        </View>
      );
    }

    return null;
  };

  const renderAccordionButton = (item) => (
    <TouchableOpacity
      style={styles.accordionButton}
      onPress={() => {
        setExpandedItems((prevExpandedItems) => ({
          ...prevExpandedItems,
          [item.id]: !prevExpandedItems[item.id],
        }));
      }}
    >
      <Text style={styles.accordionButtonText}>
        {expandedItems === item.id ? 'Hide Task' : 'Show Task'}
      </Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    fetchSavedLocations();
  }, []);

  const fetchSavedLocations = async () => {
    try {
      const querySnapshot = await firebase.firestore().collection('locations')
      .where('user', '==', user.uid)
      .orderBy('date', 'desc')
      .get();
      const parsedLocations = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        location: doc.data().location,
        task: doc.data().task || '', 
        latitude: doc.data().latitude || 0, 
        longitude: doc.data().longitude || 0,
      }));
      setSavedLocations(parsedLocations);
      setIsLoading(false);
    } catch (error) {
      console.log('Error fetching saved locations:', error);
      setIsLoading(false); 
    }
  };


  const handleDeleteLocation = async (id) => {
    setIsLoading(true);
    try {
      await firebase.firestore().collection('locations').doc(id).delete();
      fetchSavedLocations();
    } catch (error) {
      console.log('Error deleting location:', error);
    }
  };

  const handleConfirmDelete = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this location?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeleteLocation(id),
        },
      ],
      { cancelable: true }
    );
  };
  

  const renderItem = ({ item }) => (
    <View style={styles.locationCard}>
      <TouchableOpacity
        onPress={() => handleConfirmDelete(item.id)}
        style={styles.deleteButton}
      >
        <MaterialIcons name="delete" size={18} color="#FF0000" />
      </TouchableOpacity>
      <Text style={styles.locationText}>{item.location}</Text>
      {item.task && (
          <View>
          {renderAccordionButton(item)}
          {renderAccordionContent(item)}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Locations</Text>
      {isLocationLoading ? ( 
        <ActivityIndicator size="large" color="#00C851" />
      ) : (
        <>
          {locationError && (
            <Text style={styles.errorText}>{locationError}</Text>
          )}
          {isLoading ? (
            <ActivityIndicator size="large" color="#00C851" />
          ) : savedLocations.length > 0 ? (
            <FlatList
              data={savedLocations}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <Text style={styles.emptyText}>No saved locations found</Text>
          )}
        </>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  locationCard: {
    marginBottom: 13,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    padding:10,
    paddingHorizontal: 10,
  },
  locationText: {
    fontSize: 16,
    textAlign: 'left',
    flex: 1,
  },
  deleteButton: {
    padding: 5,
  },
  accordionButton: {
    backgroundColor: '#00C851',
    padding: 5,
    borderRadius: 5,
  },
  accordionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  taskText: {
    fontSize: 16,
    textAlign: 'left',
    marginBottom: 5,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'left',
  },
});

export default SaveLocations;
