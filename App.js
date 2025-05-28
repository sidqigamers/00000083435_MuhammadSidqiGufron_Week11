import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  StyleSheet,
  View,
  Text,
  Button,
  Platform,
  Image,
  PermissionsAndroid,
} from "react-native";
import { db, storage } from "./firebaseConfig";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { useState } from "react";
import Geolocation from "react-native-geolocation-service";

export default function App() {
  const [uri, setUri] = useState("");
  const [isAvail, setIsAvail] = useState(false);
  const [lat, setLat] = useState("");
  const [long, setLong] = useState("");
  const [url, setUrl] = useState("");
  const [isSend, setIsSend] = useState(false);
  const openImagePicker = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
      },
      handleResponse
    );
  };

  const handleCameraLaunch = () => {
    launchCamera(
      {
        mediaType: "photo",
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
      },
      handleResponse
    );
  };

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "This app needs access to your camera to take photos.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Camera permission granted");
        handleCameraLaunch();
      } else {
        console.log("Camera permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const uploadImageToFirebase = async (uri) => {
    const filename = uri.split("/").pop();
    const storageRef = ref(storage, "images/" + filename);
    const img = await fetch(uri);
    const bytes = await img.blob();
    try {
      await uploadBytes(storageRef, bytes);
      const downloadURL = await getDownloadURL(storageRef);
      setUrl(downloadURL);
      setIsSend(true);
      console.log("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image or storing metadata:", error);
    }
  };

  const handleResponse = async (response) => {
    if (response.didCancel) {
      console.log("User cancelled image picker");
    } else if (response.error) {
      console.log("Image picker error: ", response.error);
    } else if (response.assets && response.assets.length > 0) {
      const imageUri = response.assets[0].uri;
      uploadImageToFirebase(imageUri);
      setUri(imageUri);
    } else {
      console.log("No assets found in the response");
    }
  };

  const addData = async () => {
    const tempData = {
      longitude: long,
      latitude: lat,
      photo_url: url,
    };
    try {
      const docRef = await addDoc(collection(db, "photo_coords"), tempData);
      setIsAvail(false);
      setIsSend(false);
      if (Platform.OS === "android") {
        console.log("Document written from phone with ID: ", docRef.id);
      } else {
        console.log("Document written with ID: ", docRef.id);
      }
    } catch (err) {
      console.error("Error occured ", err);
    }
  };

  const hasLocationPermission = async () => {
    if (Platform.OS === "android" && Platform.Version < 23) {
      return true;
    }

    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if (status === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }

    if (status === PermissionsAndroid.RESULTS.DENIED) {
      console.log("Location permission denied by user.");
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      console.log("Location permission denied by user.");
    }

    return false;
  };

  const getLocation = async () => {
    const hasPermission = await hasLocationPermission();

    if (!hasPermission) {
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLong(position.coords.longitude);
        setIsAvail(true);
        console.log(position);
      },
      (error) => {
        console.error(`Code ${error.code}`, error.message);
        console.log(error);
      },
      {
        accuracy: {
          android: "high",
        },
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 0,
        forceRequestLocation: true,
        forceLocationManager: true,
        showLocationDialog: true,
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text>Muhammad Sidqi Gufron - 00000083435</Text>
      <Button
        title="Open Camera"
        onPress={() => {
          if (Platform.OS === "android") {
            requestCameraPermission();
          } else {
            handleCameraLaunch();
          }
        }}
        disabled={!isAvail}
      />
      <Button
        title="Open Gallery"
        onPress={openImagePicker}
        disabled={!isAvail}
      />
      <Button title="Get Geolocation" onPress={getLocation} />
      <Button
        title="Send Data"
        onPress={addData}
        disabled={!isAvail || !isSend}
      />
      {uri && (
        <Image source={{ uri: uri }} style={{ width: 200, height: 200 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
});