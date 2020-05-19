import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
  TextInput,
  Button,
} from 'react-native';
import Voice from '@react-native-community/voice';
import axios from 'axios';

axios.defaults.baseURL =
  'http://ec2-52-211-229-144.eu-west-1.compute.amazonaws.com:81';
axios.defaults.headers.common['Content-Type'] = 'application/json';
export default class VoiceNative extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recognized: '',
      pitch: '',
      error: '',
      end: '',
      started: '',
      results: [],
      partialResults: [],
      searchTerm: '',
      searchSuccess: false,
    };
    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechRecognized = this.onSpeechRecognized;
    Voice.onSpeechEnd = this.onSpeechEnd;
    Voice.onSpeechError = this.onSpeechError;
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.onSpeechPartialResults = this.onSpeechPartialResults;
    Voice.onSpeechVolumeChanged = this.onSpeechVolumeChanged;
    this.onSearch = this.onSearch.bind(this);
  }

  componentWillUnmount() {
    Voice.destroy().then(Voice.removeAllListeners);
  }

  onSpeechStart = (e) => {
    console.log('onSpeechStart: ', e);
    this.setState({
      started: '√',
    });
  };

  onSpeechRecognized = (e) => {
    console.log('onSpeechRecognized: ', e);
    this.setState({
      recognized: '√',
    });
  };

  onSpeechEnd = (e) => {
    console.log('onSpeechEnd: ', e);
    this.setState({
      end: '√',
      searchTerm: this.state.results.toString(),
    });
  };

  onSpeechError = (e) => {
    console.log('onSpeechError: ', e);
    this.setState({
      error: JSON.stringify(e.error),
    });
  };

  onSpeechResults = (e) => {
    console.log('onSpeechResults: ', e);
    this.setState({
      results: e.value,
    });
  };

  onSpeechPartialResults = (e) => {
    console.log('onSpeechPartialResults: ', e);
    this.setState({
      partialResults: e.value,
    });
  };

  onSpeechVolumeChanged = (e) => {
    console.log('onSpeechVolumeChanged: ', e);
    this.setState({
      pitch: e.value,
    });
  };

  _startRecognizing = async () => {
    this.setState({
      recognized: '',
      pitch: '',
      error: '',
      started: '',
      results: [],
      partialResults: [],
      end: '',
      searchTerm: '',
      searchSuccess: false,
    });

    try {
      await Voice.start('en-US');
    } catch (e) {
      console.error(e);
    }
  };

  _stopRecognizing = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  };

  _cancelRecognizing = async () => {
    try {
      await Voice.cancel();
    } catch (e) {
      console.error(e);
    }
  };

  _destroyRecognizer = async () => {
    try {
      await Voice.destroy();
    } catch (e) {
      console.error(e);
    }
    this.setState({
      recognized: '',
      pitch: '',
      error: '',
      started: '',
      results: [],
      partialResults: [],
      end: '',
      searchTerm: '',
      searchSuccess: false,
    });
  };
  onSearch() {
    const term = this.state.results.toString();
    console.log('search', term);
    this.setState({
      searchTerm: term,
    });
    axios
      .get(`/lm/api/v1/searchPub?_format=json&searchTerm=${term}&limit=10`)
      .then((response) => {
        console.log('response', response);
        if (
          response &&
          response.status &&
          Number(response.status) === 200 &&
          response.data
        ) {
          this.setState({ searchSuccess: true });
        }
      })
      .catch((error) => {
        console.log('error', error);
      });
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to React Native Voice!</Text>
        <Text style={styles.instructions}>
          Press the button and start speaking or type it.
        </Text>
        <TextInput
          style={styles.inputStyle}
          autoCapitalize="none"
          autoCorrect={false}
          value={this.state.searchTerm}
          onChangeText={(val) => this.setState({ searchTerm: val })}
        />
        <Button
          style={styles.buttonStyle}
          title="Search"
          onPress={this.onSearch}
        />
        {/* <Text style={styles.stat}>{`Started: ${this.state.started}`}</Text>
        <Text
          style={styles.stat}>{`Recognized: ${this.state.recognized}`}</Text>
        <Text style={styles.stat}>{`Pitch: ${this.state.pitch}`}</Text>
        <Text style={styles.stat}>{`Error: ${this.state.error}`}</Text> */}
        <Text style={styles.stat}>Results</Text>
        {this.state.results.map((result, index) => {
          return (
            <Text key={`result-${index}`} style={styles.stat}>
              {result}
            </Text>
          );
        })}
        {/* <Text style={styles.stat}>Partial Results</Text>
        {this.state.partialResults.map((result, index) => {
          return (
            <Text key={`partial-result-${index}`} style={styles.stat}>
              {result}
            </Text>
          );
        })} */}
        <Text style={styles.stat}>{`End: ${this.state.end}`}</Text>
        <TouchableHighlight onPress={this._startRecognizing}>
          <Image style={styles.button} source={require('./button.png')} />
        </TouchableHighlight>
        <TouchableHighlight onPress={this._stopRecognizing}>
          <Text style={styles.action}>Stop Recognizing</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={this._cancelRecognizing}>
          <Text style={styles.action}>Cancel</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={this._destroyRecognizer}>
          <Text style={styles.action}>Destroy</Text>
        </TouchableHighlight>
        {this.state.searchSuccess && (
          <Text style={styles.instructions}>Search Successful</Text>
        )}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  action: {
    textAlign: 'center',
    color: '#0000FF',
    marginVertical: 5,
    fontWeight: 'bold',
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  stat: {
    textAlign: 'center',
    color: '#B0171F',
    marginBottom: 1,
  },
  inputStyle: {
    borderColor: 'black',
    borderWidth: 1,
    margin: 15,
    width: 100,
  },
  buttonStyle: {
    color: 'red',
    fontSize: 30,
    backgroundColor: 'black',
  },
});

// AppRegistry.registerComponent('VoiceNative', () => VoiceNative);
