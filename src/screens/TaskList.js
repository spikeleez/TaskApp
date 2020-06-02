import React, { Component } from 'react';
import { 
  View,
  SafeAreaView,
  Text,
  ImageBackground,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';

import moment from 'moment';
import 'moment/locale/pt-br';

import todayImage from '../../assets/images/today.jpg';
import tomorrowImage from '../../assets/images/tomorrow.jpg';
import weekImage from '../../assets/images/week.jpg';
import monthImage from '../../assets/images/month.jpg';

import { server, showError } from '../common';
import commonStyles from '../commonStyles';
import Task from '../components/Task';
import AddTask from './AddTask';

const initialState = {
  showDoneTasks: true,
    showAddTask: false,
    visibleTasks: [],
    tasks: [],
};

export default class TaskList extends Component {
  state = {
    ...initialState
  }

  componentDidMount = async () => {
    const stateString = await AsyncStorage.getItem('taskState');
    const savedState = JSON.parse(stateString) || initialState;
    this.setState({
      showDoneTasks: savedState.showDoneTasks,
    }, this.filterTasks);

    this.loadTasks();
  }

  loadTasks = async () => {
    try {
      const maxDate = moment()
        .add({ days: this.props.daysAhead })
        .format('YYYY-MM-DD 23:59:59');
      const res = await axios.get(`${server}/tasks?date=${maxDate}`);
      this.setState({ tasks: res.data }, this.filterTasks);
    } catch (e) {
      showError(e);
    } 
  }

  toggleFilter = () => {
    this.setState({ showDoneTasks: !this.state.showDoneTasks }, this.filterTasks);
  }

  filterTasks = () => {
    let visibleTasks = null;
    if (this.state.showDoneTasks) {
      visibleTasks = [...this.state.tasks];
    } else {
      const pending = task => task.doneAt === null;
      visibleTasks = this.state.tasks.filter(pending);
    }

    this.setState({ visibleTasks });
    AsyncStorage.setItem('taskState', JSON.stringify({
      showDoneTasks: this.state.showAddTask,
    }))
  }

  toggleTask = async taskId => {
    try {
      await axios.put(`${server}/tasks/${taskId}/toggle`);
      this.loadTasks();
    } catch (e) {
      showError(e);
    }
  }

  addTask = async newTask => {
    if (!newTask.desc || !newTask.desc.trim()) {
      Alert.alert('Dados Inválidos', 'Descrição não informada!');
      return;
    }

    try {
      await axios.post(`${server}/tasks`, {
        desc: newTask.desc,
        estimateAt: newTask.date,
      });

      this.setState({ showAddTask: false }, this.loadTasks);
    } catch (e) {
      showError(e);
    }
  }

  deleteTask = async taskId => {
    try {
      await axios.delete(`${server}/tasks/${taskId}`);
      Alert.alert('', 'Tarefa excluída com sucesso!') //({[BETA]})
      this.loadTasks();
    } catch (e) {
      showError(e);
    }
  }

  getImage = () => {
    switch (this.props.daysAhead) {
      case 0: return todayImage;
      case 1: return tomorrowImage;
      case 7: return weekImage;
      default: return monthImage;
    }
  }
  getColor = () => {
    switch (this.props.daysAhead) {
      case 0: return commonStyles.colors.today;
      case 1: return commonStyles.colors.tomorrow;
      case 7: return commonStyles.colors.week;
      default: return commonStyles.colors.month;
    }
  }

  render() {
    const today = moment().local('pt-br').format('ddd, D [de] MMMM Y')

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <AddTask 
        isVisible={this.state.showAddTask} 
        onCancel={() => this.setState({ showAddTask: false })} 
        onSave={this.addTask}
        />
        <ImageBackground style={styles.backgroundImage} source={this.getImage()}>
          <SafeAreaView style={styles.iconBar }>
            <TouchableOpacity onPress={() => this.props.navigation.openDrawer()}>
              <Icon 
              name="bars" 
              size={25} 
              color={commonStyles.colors.secondary}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={this.toggleFilter}>
              <Icon 
              name={this.state.showDoneTasks ? 'eye' : 'eye-slash'} 
              size={25} 
              color={commonStyles.colors.secondary}
              />
            </TouchableOpacity>
          </SafeAreaView>

          <View style={styles.titleBar}>
            <Text style={styles.title}>{this.props.title}</Text>
            <Text style={styles.subTitle}>{today}</Text>
          </View>

        </ImageBackground>
        <View style={styles.taskList}>
          <FlatList 
          data={this.state.visibleTasks} 
          keyExtractor={item => `${item.id}`} 
          renderItem={({ item }) => <Task {...item} 
            onToggleTask={this.toggleTask} 
            onDelete={this.deleteTask}
            />}
          />
        </View>
        <TouchableOpacity 
        style={[styles.addButtonTask, { backgroundColor: this.getColor() }]} 
        onPress={() => this.setState({ showAddTask: true })}
        activeOpacity={0.7}
        >
          <Icon name="plus" size={20} color={commonStyles.colors.secondary} />
        </TouchableOpacity>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 3,
  },
  taskList: {
    flex: 7,
  },
  titleBar: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    fontFamily: commonStyles.fontFamily,
    color: commonStyles.colors.secondary,
    fontSize: 50,
    marginLeft: 20,
    marginBottom: 20,
  },
  subTitle: {
    fontFamily: commonStyles.fontFamily,
    color: commonStyles.colors.secondary,
    fontSize: 20,
    marginLeft: 20,
    marginBottom: 20,
  },
  iconBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: Platform.OS == 'ios' ? 40 : 15
  },
  addButtonTask: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});