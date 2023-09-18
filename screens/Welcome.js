import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Alert, SafeAreaView } from 'react-native';
import Header from "./Header";
import GoogleMap from "./GoogleMap";
import TaskList from "./TaskList";
import AddTask from "./AddTask";
import Footer from "./Footer";
import SaveLocations from "./SavedLocations";
import { useUserContext } from "../userContext";
import firebase from '../firebase';
import NotificationList from "./NotificationList";
import ProfileTab from "./ProfileTab";

const Welcome = () => {
  const { user } = useUserContext(); 
  const [activeTab, setActiveTab] = useState('map');


  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };



  const renderActiveTab = () => {
    switch (activeTab) {
      case 'map':
        return <GoogleMap />;
      case 'addLocation':
        return <AddTask  />;
      case 'tasks':
        return (
          <TaskList/>
        );
      case 'savedLocations':
        return <SaveLocations/>
        case 'notifications':
          return <NotificationList/>
        case 'profile':
          return <ProfileTab/>
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <Header
          title={'Kazi Ipo'}
          activeTab={activeTab}
          handleTabClick={handleTabClick}
        />
        {renderActiveTab()}
        <Footer
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingTop: 10,
  },
});

export default Welcome;
