module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "babel-preset-expo",
      // Note: nativewind/babel preset removed since app uses StyleSheet, not className
    ],
    plugins: [
      "react-native-reanimated/plugin",
    ],
  };
};
