import { Alert, Platform } from 'react-native';

const server = Platform.OS === 'ios' 
  ? 'http://localhost:3000' : 'http://10.0.2.2:3000'
  
function showError(err) {
  if (err.response && err.response.data) {
    Alert.alert('Ops! ocorreu um erro', `${err.response.data}`);
  } else {
    Alert.alert('Ops! ocorreu um erro', `${err}`);
  }
}

function showSucces(msg) {
  Alert.alert('Sucesso!', msg);
}

export { server, showError, showSucces };