import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Header = ({ handleTabClick, activeTab }) => {

  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.tabContainer, activeTab === 'map' && styles.activeTab]}
          onPress={() => handleTabClick('map')}
        >
          <MaterialCommunityIcons name="map-marker" size={24} color={activeTab === 'map' ? "#111" : "#888"} style={styles.icon} />
          <Text style={[styles.caption, activeTab === 'map' && styles.activeCaption]}>Places</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabContainer, activeTab === 'tasks' && styles.activeTab]}
          onPress={() => handleTabClick('tasks')}
        >
          <MaterialCommunityIcons name="format-list-bulleted" size={24} color={activeTab === 'tasks' ? "#111" : "#888"} style={styles.icon} />
          <Text style={[styles.caption, activeTab === 'tasks' && styles.activeCaption]}>Tasks</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

Header.defaultProps = {
  title: "Kazi Ipo"
}

const styles = StyleSheet.create({
  header: {
    marginTop: -9,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 5,
  },
  caption: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 22,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#111',
  },
  activeCaption: {
    color: '#111',
  },
});

export default Header;
