import React from 'react';
import { ScrollView, View, SafeAreaView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerItems } from 'react-navigation-drawer';

import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

import { Gravatar } from 'react-native-gravatar';
import commonStyles from '../commonStyles';

export default props => {
  const logout = () => {
    delete axios.defaults.headers.common['Authorization'];
    AsyncStorage.removeItem('userData');
    props.navigation.navigate('AuthOrApp');
  }

  return (
    <ScrollView>
      <SafeAreaView style={styles.header}>
        <Text style={styles.title}>Tarefas</Text>
        <Gravatar style={styles.avatar} options={{
          email: props.navigation.getParam('email'),
          secure: true
        }} />
        <View style={styles.userInfo}>
          <Text style={styles.name}> {props.navigation.getParam('name')} </Text>
          <Text style={styles.email}> {props.navigation.getParam('email')} </Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <View style={styles.logoutIcon}>
            <Icon name="sign-out" size={30} color="#800" /> 
          </View>
        </TouchableOpacity>
      </SafeAreaView>
      <DrawerItems {...props} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  title: {
    color: '#333',
    fontFamily: commonStyles.fontFamily,
    fontSize: 30,
    paddingTop: 20,
    padding: 10,
    fontWeight: 'bold',
  },
  avatar: {
    width: 60,
    height: 60,
    borderWidth: 3,
    borderRadius: 30,
    marginBottom: 10,
    marginTop: 5,
    marginLeft: 10,
  },
  userInfo: {
    marginLeft: 10,
  },
  name: {
    fontFamily: commonStyles.fontFamily,
    fontSize: 20,
    color: commonStyles.colors.subText,
    marginBottom: 5,
  },
  email: {
    fontFamily: commonStyles.fontFamily,
    fontSize: 15,
    color: commonStyles.colors.subText,
    marginBottom: 10,
  },
  logoutIcon: {
    marginLeft: 10,
    marginBottom: 10,
  },
});