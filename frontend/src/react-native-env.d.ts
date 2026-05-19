import React from 'react';
import {
  ViewProps,
  TextProps,
  TextInputProps,
  ImageProps,
  ScrollViewProps,
  FlatListProps,
  SectionListProps,
  SafeAreaViewProps,
  KeyboardAvoidingViewProps,
  ActivityIndicatorProps,
  SwitchProps,
  StatusBarProps,
  ModalProps,
  TouchableHighlightProps,
  TouchableOpacityProps,
  TouchableWithoutFeedbackProps,
  ButtonProps,
} from 'react-native';

declare module 'react' {
  // Restore the `props` property that was removed in @types/react 19.
  // React Native's JSX element type resolution requires this property
  // to exist on class component instances.
  interface Component<P = {}, S = {}, SS = any> {
    props: Readonly<P> & Readonly<{ children?: React.ReactNode }>;
  }
}

declare module 'react-native' {
  interface View extends React.Component<ViewProps> {}
  interface Text extends React.Component<TextProps> {}
  interface TextInput extends React.Component<TextInputProps> {}
  interface Image extends React.Component<ImageProps> {}
  interface ScrollView extends React.Component<ScrollViewProps> {}
  interface FlatList<ItemT = any> extends React.Component<FlatListProps<ItemT>> {}
  interface SectionList<ItemT = any, SectionT = any> extends React.Component<SectionListProps<ItemT, SectionT>> {}
  interface SafeAreaView extends React.Component<SafeAreaViewProps> {}
  interface KeyboardAvoidingView extends React.Component<KeyboardAvoidingViewProps> {}
  interface ActivityIndicator extends React.Component<ActivityIndicatorProps> {}
  interface Switch extends React.Component<SwitchProps> {}
  interface StatusBar extends React.Component<StatusBarProps> {}
  interface Modal extends React.Component<ModalProps> {}
  interface TouchableHighlight extends React.Component<TouchableHighlightProps> {}
  interface TouchableOpacity extends React.Component<TouchableOpacityProps> {}
  interface TouchableWithoutFeedback extends React.Component<TouchableWithoutFeedbackProps> {}
  interface Button extends React.Component<ButtonProps> {}
}
