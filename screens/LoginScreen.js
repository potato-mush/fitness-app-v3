import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [torch, setTorch] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email) {
        navigation.replace('Home');
      }
    });

    return unsubscribe;
  }, [navigation]);

  const handleBarCodeScanned = ({ type, data }) => {
    if (type !== BarCodeScanner.Constants.BarCodeType.qr) {
      Alert.alert('Invalid Code', 'Please scan a valid QR code');
      return;
    }
    setScanned(true);
    setUserId(data);
    setShowScanner(false);
  };

  const handleLogin = async () => {
    try {
      if (!userId || !password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      
      const email = `${userId}@yourdomain.com`; // Convert userId to email format
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const QRframeSVG = () => (
    <View style={styles.qrFrame}>
      <View style={styles.qrCorner} />
      <View style={[styles.qrCorner, { right: 0 }]} />
      <View style={[styles.qrCorner, { bottom: 0 }]} />
      <View style={[styles.qrCorner, { right: 0, bottom: 0 }]} />
    </View>
  );

  if (hasPermission === null) {
    return <Text>Requesting camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {showScanner ? (
        <View style={styles.scannerContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
            barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
            flashMode={torch ? 'torch' : 'off'}
          />
          <QRframeSVG />
          <View style={styles.scannerControls}>
            <TouchableOpacity
              style={styles.torchButton}
              onPress={() => setTorch(!torch)}
            >
              <Ionicons 
                name={torch ? "flashlight" : "flashlight-outline"} 
                size={24} 
                color="white" 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowScanner(false);
                setTorch(false);
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.title}>Login</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputWithIcon}
              placeholder="User ID"
              value={userId}
              onChangeText={setUserId}
              editable={false}
            />
            <TouchableOpacity
              style={styles.qrIconButton}
              onPress={() => {
                setScanned(false);
                setShowScanner(true);
              }}
            >
              <MaterialCommunityIcons name="qrcode-scan" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center', // Center vertically
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    maxWidth: 300, // Limit width of inputs
    alignSelf: 'center', // Center horizontally
    width: '100%',
  },
  inputWithIcon: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 5,
    paddingRight: 40, // Space for the icon
  },
  qrIconButton: {
    position: 'absolute',
    right: 8,
    padding: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 15,
    borderRadius: 5,
    maxWidth: 300,
    alignSelf: 'center',
    width: '100%',
  },
  loginButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    maxWidth: 300,
    alignSelf: 'center',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 5,
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  qrFrame: {
    position: 'absolute',
    top: '25%',
    left: '15%',
    right: '15%',
    bottom: '25%',
    borderRadius: 10,
  },
  qrCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#fff',
    borderWidth: 2,
  },
  scannerControls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  torchButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 15,
    borderRadius: 50,
  },
});
