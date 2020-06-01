import React, { Component } from 'react';
import { 
  View,
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

import moment from 'moment';
import 'moment/locale/pt-br';

import commonStyles from '../commonStyles';
import todayImage from '../../assets/imgs/today.jpg';
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
    const state = JSON.parse(stateString) || initialState;
    this.setState(state, this.filterTasks);
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
    AsyncStorage.setItem('taskState', JSON.stringify(this.state));
  }

  toggleTask = taskId => {
    const tasks = [...this.state.tasks];
    tasks.forEach(task => {
      if (task.id === taskId) {
        task.doneAt = task.doneAt ? null : new Date();
      }
    });

    this.setState({ tasks }, this.filterTasks);
  }

  addTask = newTask => {
    if (!newTask.desc || !newTask.desc.trim()) {
      Alert.alert('Dados Inválidos', 'Descrição não informada!');
      return;
    }

    const tasks = [...this.state.tasks];
    tasks.push({
      id: Math.random(),
      desc: newTask.desc,
      estimateAt: newTask.date,
      doneAt: null,
    });

    this.setState({ tasks, showAddTask: false }, this.filterTasks);
  }

  deleteTask = id => {
    const tasks = this.state.tasks.filter(task => task.id !== id);
    this.setState({ tasks }, this.filterTasks);
    Alert.alert('', 'Tarefa excluída com sucesso!') //({[BETA]})
  }

  render() {
    const today = moment().local('pt-br').format('ddd, D [de] MMMM Y')

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#222" />
        <AddTask 
        isVisible={this.state.showAddTask} 
        onCancel={() => this.setState({ showAddTask: false })} 
        onSave={this.addTask}
        />
        <ImageBackground style={styles.backgroundImage} source={todayImage}>
          <View style={styles.iconBar }>
            <TouchableOpacity onPress={this.toggleFilter}>
              <Icon 
              name={this.state.showDoneTasks ? 'eye' : 'eye-slash'} 
              size={25} 
              color={commonStyles.colors.secondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.titleBar}>
            <Text style={styles.title}>Hoje</Text>
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
        style={styles.addButtonTask} 
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
    justifyContent: 'flex-end',
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
    backgroundColor: commonStyles.colors.today,
    justifyContent: 'center',
    alignItems: 'center',
  },
});