module.exports = {
  name: "EmotiGlass",
  slug: "emotiglass",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.emotiglass.app"
  },
  android: {
    package: "com.emotiglass.app",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF"
    }
  },
  web: {},
  extra: {
    // Define any platform constants here
    platformConstants: {
      isAndroid: true,
      isIOS: false,
      isWeb: false
    }
  },
  plugins: [
    "expo-camera",
    "expo-av",
    "expo-file-system"
  ]
}; 