import React, { useRef, useState } from "react";
import { View, Text, Button, Image, StyleSheet, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

export default function App() {
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [image, setImage] = useState<string | null>(null);
  const [damage, setDamage] = useState<number | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const SERVER_URL = "http://172.17.104.122:5000/predict";

  const sendToAI = async (uri: string) => {
    const formData = new FormData();
    formData.append("image", {
      uri,
      name: "photo.jpg",
      type: "image/jpeg",
    } as any);

    try {
      const response = await fetch(SERVER_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setDamage(data.damage_percentage);
    } catch (error) {
      Alert.alert("Error", "Cannot connect to AI server");
    }
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync();
    setImage(photo.uri);
    setShowCamera(false);
    sendToAI(photo.uri);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      sendToAI(uri);
    }
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      Alert.alert("Video Selected", "Currently sending thumbnail frame");
      setImage(uri); // shows preview frame
      sendToAI(uri); // send frame to AI
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Camera permission required</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Road Damage Detector</Text>

      {showCamera ? (
        <>
          <CameraView style={styles.camera} facing="back" ref={cameraRef} />
          <Button title="Capture Photo" onPress={takePhoto} />
          <Button title="Close Camera" onPress={() => setShowCamera(false)} />
        </>
      ) : (
        <>
          <View style={styles.buttonContainer}>
            <Button title="📷 Camera" onPress={() => setShowCamera(true)} />
            <Button title="🖼 Photo" onPress={pickImage} />
            <Button title="🎥 Video" onPress={pickVideo} />
          </View>

          {image && (
            <Image source={{ uri: image }} style={styles.preview} />
          )}

          {damage !== null && (
            <Text style={styles.result}>
              Damage Level: {damage}%
            </Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f6f9" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  buttonContainer: { gap: 10 },
  camera: { height: 400, borderRadius: 10 },
  preview: { height: 250, marginTop: 20, borderRadius: 10 },
  result: { fontSize: 20, fontWeight: "bold", marginTop: 20, textAlign: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});