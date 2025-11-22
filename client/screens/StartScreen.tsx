import React, { useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { IP_ADDRESS, PORT } from "@env";

type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Start: undefined;
  Meal: undefined;
  Symptom: undefined;
  Dashboard: undefined;
  RoommateDashboard: undefined;
  Fridge: undefined;
  CreateGroup: undefined;
  ChoreTracker: undefined;
  Rules: undefined;
  NomiStart: undefined;
};

export default function StartScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "Start">>();

  useEffect(() => {
    console.log("Loaded IP_ADDRESS:", IP_ADDRESS);

    const url = `http://${IP_ADDRESS}:${PORT}/user/`;
    console.log("Testing URL:", url);

    fetch(url)
      .then((res) => {
        console.log("HTTP Status:", res.status);
        return res.text();
      })
      .then((body) => {
        console.log("Response body:", body);
      })
      .catch((err) => {
        console.error("Fetch error:", err.message);
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>dygest</Text>

      <TouchableOpacity
        style={styles.logInbutton}
        onPress={() => navigation.navigate("NomiStart")}
      >
        <Text style={styles.buttonText}>login</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>don't have an account yet?</Text>

      <TouchableOpacity
        style={styles.signUpbutton}
        onPress={() => navigation.navigate("Signup")}
      >
        <Text style={styles.buttonText}>signup</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("RoommateDashboard")}
      >
        <Text style={styles.buttonText}>open roommate dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("CreateGroup")}
      >
        <Text style={styles.buttonText}>create group</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("NomiStart")}
      >
        <Text style={styles.buttonText}>nomi start</Text>
      </TouchableOpacity>

      {/* <Text style={styles.subtitle}>log a meal - testing for now</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Meal")}
      >
        <Text style={styles.buttonText}>meal</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>log a symptom - testing</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Symptom")}
      >
        <Text style={styles.buttonText}>symptom</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Dashboard")}
      >
        <Text style={styles.buttonText}>Dashboard</Text>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // white
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontFamily: "Inter",
    fontSize: 40, // dygestTitle
    fontWeight: "800", // extrabold
    color: "#7D60A3", // dygestPurple
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontFamily: "Inter",
    fontSize: 15, // smallText
    fontWeight: "400", // normal
    color: "#000000", // black
    textAlign: "center",
    marginTop: 15,
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#DAC4F7", // purple
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
    width: 240,
    alignItems: "center",
  },
  signUpbutton: {
    backgroundColor: "#FFB563", // orange
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
    width: 240,
    alignItems: "center",
  },
  logInbutton: {
    backgroundColor: "#D8F793", // green
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
    width: 240,
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "Inter",
    fontSize: 20, // loginSignup
    fontWeight: "400", // extrabold
    color: "#00000", // white
  },
  testSection: {
    marginTop: 50,
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    width: "100%",
    alignItems: "center",
  },
  testLabel: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    marginBottom: 12,
  },
  testButton: {
    backgroundColor: "#7D60A3", // dygestPurple
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#DAC4F7",
    width: 240,
    alignItems: "center",
  },
  testButtonText: {
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
