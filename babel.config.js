module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // No reanimated/worklets plugin here: babel-preset-expo adds it
    // automatically, and listing it again would run the transform twice.
  };
};