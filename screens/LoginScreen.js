import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { Camera } from 'expo-camera';
import { auth, db } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        console.log('Camera permission status:', status); // Debug log
        setHasPermission(status === 'granted');
        
        // If permission was denied, try requesting again
        if (status !== 'granted') {
          const { status: newStatus } = await Camera.requestCameraPermissionsAsync();
          setHasPermission(newStatus === 'granted');
        }
      } catch (error) {
        console.log('Error requesting camera permission:', error);
        setHasPermission(true); // Fallback to true if there's an error checking
      }
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email) {
        // Get user data before navigating
        getDoc(doc(db, 'users', user.uid)).then(userDoc => {
          const userData = userDoc.exists() ? userDoc.data() : {};
          navigation.replace('Home', {
            userId: user.uid,
            userStats: userData
          });
        }).catch(error => {
          console.error('Error fetching user data:', error);
          navigation.replace('Home'); // Navigate anyway, HomeScreen will handle missing data
        });
      }
    });

    return unsubscribe;
  }, [navigation]);

  const handleBarCodeScanned = ({ data }) => {
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

      // Get user document directly using the userId (UID)
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        Alert.alert('Error', 'User not found');
        return;
      }

      const userData = userDoc.data();
      
      // Authenticate with email and password
      const userCredential = await signInWithEmailAndPassword(auth, userData.email, password);
      
      // Navigate to Home screen with user data
      navigation.replace('Home', {
        userId: userId,
        userStats: userData
      });
      
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Error',
        'Invalid user ID or password. Please try again.'
      );
    }
  };

  const LoginForm = () => {
    const [localUserId, setLocalUserId] = useState(userId);
    const [localPassword, setLocalPassword] = useState('');

    const handleLocalLogin = () => {
      setUserId(localUserId);
      setPassword(localPassword);
      handleLogin();
    };

    return (
      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputWithIcon}
            placeholder="Email"
            value={localUserId}
            onChangeText={setLocalUserId}
            editable={true}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
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
          value={localPassword}
          onChangeText={setLocalPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleLocalLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const QRFrame = () => (
    <View style={styles.qrFrame}>
      <View style={styles.qrCorner} />
      <View style={[styles.qrCorner, { right: 0 }]} />
      <View style={[styles.qrCorner, { bottom: 0 }]} />
      <View style={[styles.qrCorner, { right: 0, bottom: 0 }]} />
    </View>
  );

  const CameraView = () => {
    if (Platform.OS === 'web' && !('mediaDevices' in navigator)) {
      return (
        <View style={styles.container}>
          <Text>Camera is not available in this browser</Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowScanner(false)}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </View>
      );
    }
  
    if (!Camera || !Camera.Constants || !Camera.Constants.BarCodeType) {
      return (
        <View style={styles.container}>
          <Text>Camera module is not available</Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowScanner(false)}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </View>
      );
    }
  
    return (
      <View style={styles.scannerContainer}>
        <View style={styles.cameraWrapper}>
          <Camera
            style={styles.camera}
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            barCodeScannerSettings={{
              barCodeTypes: [Camera.Constants.BarCodeType.qr],
            }}
          >
            <View style={styles.overlayContainer}>
              <QRFrame />
              <View style={styles.scannerControls}>
                {Platform.OS !== 'web' && (
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
                )}
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
          </Camera>
        </View>
      </View>
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showScanner ? <CameraView /> : <LoginForm />}
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
  cameraWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  },
  camera: {
    width: '100%',
    height: '100%'
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  }
});
