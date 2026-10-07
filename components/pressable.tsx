import { Pressable as RNPressable, type PressableProps, type View } from "react-native";

/**
 * React Native's `Pressable`, minus NativeWind's native style interop.
 *
 * On iOS/Android NativeWind wraps every `Pressable` and copies a function
 * `style={(state) => …}` into a plain object — which comes out as `{}`, so the
 * row loses its layout, borders and colours (web is unaffected). We don't style
 * Pressables with `className`, so opting out keeps state-based styles working.
 * Use this instead of the react-native import wherever `style` is a function.
 */
export function Pressable(props: PressableProps & { ref?: React.Ref<View> }) {
  return <RNPressable {...props} cssInterop={false} />;
}
