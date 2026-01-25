const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Note: NativeWind removed - app uses StyleSheet, not className
module.exports = config;
