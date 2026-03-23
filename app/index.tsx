import { View, Text, TextInput, TouchableOpacity, Platform, Dimensions } from "react-native";
import LottieView from "lottie-react-native";

export default function SignIn() {
  const isWeb = Platform.OS === "web";
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const globeSize = screenWidth * 0.9;

  return (
    <View className="flex-1 bg-white">

      {/* Полета горе */}
      <View style={{ 
        width: isWeb ? 360 : "100%", 
        paddingHorizontal: 32,
        paddingTop: 80,
        alignSelf: "center"
      }}>
        <Text className="text-3xl font-bold mb-10">
          Sign In
        </Text>

        <TextInput
          placeholder="email@ect."
          className="border border-gray-300 rounded-full px-5 py-3 mb-4 text-base"
        />

        <TextInput
          placeholder="password"
          secureTextEntry
          className="border border-gray-300 rounded-full px-5 py-3 mb-6 text-base"
        />

        <TouchableOpacity className="bg-black rounded-full py-4 items-center">
          <Text className="text-white text-base font-semibold">Sign In</Text>
        </TouchableOpacity>
      </View>

      {/* Земя — огромна, отрязана в долния ляв ъгъл */}
      <LottieView
        source={require("../assets/images/Globe.json")}
        autoPlay
        loop
        style={{
          width: globeSize,
          height: globeSize,
          position: "absolute",
          bottom: -globeSize * 0.35,
          left: -globeSize * 0.25,
        }}
      />

    </View>
  );
}