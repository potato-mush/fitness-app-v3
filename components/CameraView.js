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