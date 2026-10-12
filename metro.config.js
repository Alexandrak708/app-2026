const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Claude Code keeps git worktrees (whole copies of the app, some with their own
// node_modules) in .claude/. Metro would crawl and watch all of them, which made
// `expo start` time out with "Failed to start watch mode". The app never imports
// anything from there, so leave it out entirely.
config.resolver.blockList = [
  ...[].concat(config.resolver.blockList ?? []),
  /(^|[\\/])\.claude([\\/]|$)/,
];

module.exports = withNativeWind(config, { input: "./global.css" });
