import React, { Component, useReducer } from 'react';
import {
  ImageBackground,
  Text,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
 } from 'react-native';

import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';

import backgroundImage from '../../assets/images/login.jpg';
import commonStyles from '../commonStyles';
import AuthInput from '../components/AuthInput';
import { server, showError, showSucces } from '../common';

const initialState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  stageNew: false,
};

export default class Auth extends Component {
  state ={ 
    ...initialState,
  }

  signinOrSignup = () => {
    if (this.state.stageNew) {
      this.signup();
    } else {
      this.signin();
    }
  }

  signup = async () => {
    try {
      await axios.post(`${server}/signup`, {
        name: this.state.name,
        email: this.state.email,
        password: this.state.password,
        confirmPassword: this.state.confirmPassword,
      })

      showSucces('Usuário cadastrado!');
      this.setState({ ...initialState });

    } catch (e){
      showError(e);
    }
  }

  signin = async () => {
    try {
      const res = await axios.post(`${server}/signin`, {
        email: this.state.email,
        password: this.state.password,
      });

      AsyncStorage.setItem('userData', JSON.stringify(res.data));
      axios.defaults.headers.common['Authorization'] = `bearer ${res.data.token}`
        this.props.navigation.navigate('Home', res.data);

    } catch (e) {
      showError(e);
    }
  }

  render() {
    const validations = []
    validations.push(this.state.email && this.state.email.includes('@'));
    validations.push(this.state.password && this.state.password.length >= 6);

    if (this.state.stageNew) {
      validations.push(this.state.name && this.state.name.trim().length >= 3);
      validations.push(this.state.password === this.state.confirmPassword);
    }

    const validForm = validations.reduce((t, a) => t && a);

    return (
      <ImageBackground source={backgroundImage} style={styles.background}>
        <Text style={styles.title}>Tarefas</Text>
        <View style={styles.formContainer}>
          <Text style={styles.subTitle}>
            {this.state.stageNew ? 'Crie a sua conta' : 'Informe seu login'}
          </Text>
          {this.state.stageNew &&
             <AuthInput
             icon="user"
             placeholder="Nome"
             value={this.state.name}
             style={styles.input}
             onChangeText={name => this.setState({ name })}
             />
          }
          <AuthInput
          icon="at"
          placeholder="E-mail"
          value={this.state.email}
          style={styles.input}
          onChangeText={email => this.setState({ email })}
          keyboardType="email-address"
          autoCapitalize="words"
          />
          <AuthInput
          icon="lock"
          placeholder="Senha"
          value={this.state.password}
          style={styles.input}
          onChangeText={password => this.setState({ password })}
          secureTextEntry={true}
          autoCapitalize="none"
          />
            {this.state.stageNew && 
              <AuthInput
              icon="asterisk"
              placeholder="Confirme sua senha"
              value={this.state.confirmPassword}
              style={styles.input}
              onChangeText={confirmPassword => this.setState({ confirmPassword })}
              secureTextEntry={true}
              autoCapitalize="none"
              />
            }
          <TouchableOpacity onPress={this.signinOrSignup} disabled={!validForm}>
            <View style={[styles.button, validForm ? {} : { backgroundColor: '#AAA' }]}>
              <Text 
                style={styles.buttonText}>
                {this.state.stageNew ? 'Registrar' : 'Entrar'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={{ padding: 20 }}
          onPress={() => this.setState({ stageNew: !this.state.stageNew })}
        >
          <Text style={styles.buttonTextQuestionAccount}>
            {this.state.stageNew ? 'Já possui conta?' : 'Ainda não possui conta?'}
          </Text>
        </TouchableOpacity>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: commonStyles.fontFamily,
    color: commonStyles.colors.secondary,
    fontSize: 80,
    marginBottom: 10,
  },
  subTitle: {
    fontFamily: commonStyles.fontFamily,
    fontSize: 20,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  formContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
    width: '90%',
    borderRadius: 20
  },
  input: {
    backgroundColor: '#FFF',
    marginTop: 15,
  },
  button: {
    backgroundColor: '#080',
    marginTop: 15,
    marginBottom: 10,
    padding: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontFamily: commonStyles.fontFamily,
    fontSize: 20,
  },
  buttonTextQuestionAccount: {
    color: '#FFF',
    fontFamily: commonStyles.fontFamily,
    fontSize: 18, 
  },
});