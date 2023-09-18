import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import firebase from '../firebase';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const querySnapshot = await firebase.firestore().collection('notifications')
          .where('userId', '==', firebase.auth().currentUser.uid)
          .orderBy('date', 'desc') 
          .get();
        
        const notificationData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(notificationData);
        setIsLoading(false); 
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationBody}>{item.body}</Text>
      <Text style={styles.notificationDate}>{new Date(item.date).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#414757" />
      ) : (
        <>
            {notifications.length > 0 ? (
                <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                style={styles.notificationList}
                />
            ) : (
                <Text style={styles.emptyText}>No Notifications Yet!</Text>
            )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  notificationList: {
    marginTop: 10,
  },
  notificationItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  notificationBody: {
    fontSize: 16,
  },
  notificationDate: {
    fontSize: 12,
    color: '#777',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#777',
  },
});

export default NotificationList;
