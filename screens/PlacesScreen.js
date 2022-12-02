import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useDispatch, useSelector } from "react-redux";
import { addPlace, removePlace } from "../reducers/user";

export default function PlacesScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value);

  // 1) Création de la variable d'état city
  const [city, setCity] = useState("");

  const handleSubmit = () => {
    // 2) Lorsqu'on rentre des données dans l'input de PlacesScreen on fetch les données du backend pour récupérer les informations relatives à la ville
    if (city.length === 0) {
      return;
    } 
    fetch(`https://api-adresse.data.gouv.fr/search/?q=${city}`)
      .then((response) => response.json())
      .then((data) => {
        // Nothing is done if no city is found by API
        if (data.features.length === 0) {
          return;
        }
        // 3) On créé un objet à partir des données du fetch
        const fistCity = data.features[0];
        const newPlace = {
          name: fistCity.properties.city,
          latitude: fistCity.geometry.coordinates[1],
          longitude: fistCity.geometry.coordinates[0],
        }; 

        // 4) On utilise les informations enregistrées dans l'objet newPlace pour sauvegarder en BDD (fetch Post)...
        fetch("https://locapic-backend-psi.vercel.app/places", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nickname: user.nickname,
            name: newPlace.name,
            latitude: newPlace.latitude,
            longitude: newPlace.longitude,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            // 4)bis .. et aussi dans le reducer (pour affichage dans l'app)
            if (data.result) {
              dispatch(addPlace(newPlace));
              setCity("");
            }
          });
      });
  };

  // 5) On supprime les données dans la BDD..
  const handleDelete = (placeName) => {
    fetch("https://locapic-backend-psi.vercel.app/places", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: user.nickname, name: placeName }),
    })
      .then((response) => response.json())
      .then((data) => {
        // 5)bis .. et aussi dans le reducer (dans l'appli)
        data.result && dispatch(removePlace(placeName));
      });
  };

  const places = user.places.map((data, i) => {
    return (
      <View key={i} style={styles.card}>
        <View>
          <Text style={styles.name}>{data.name}</Text>
          <Text>
            LAT : {Number(data.latitude).toFixed(3)} LON :{" "}
            {Number(data.longitude).toFixed(3)}
          </Text>
        </View>
        <FontAwesome
          name="trash-o"
          onPress={() => dispatch(removePlace(data.name))}
          size={25}
          color="#ec6e5b"
        />
      </View>
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{user.nickname}'s places</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="New city"
          onChangeText={(value) => setCity(value)}
          value={city}
          style={styles.input}
        />
        <TouchableOpacity
          onPress={() => handleSubmit()}
          style={styles.button}
          activeOpacity={0.8}
        >
          <Text style={styles.textButton}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        {places}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
});
