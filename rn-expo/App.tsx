import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootTabs from './src/navigation/RootTabs';
import { ImpulseProvider } from './src/hooks/useImpulseEngine';
import 'react-native-gesture-handler';

export default function App() {
  return (
    <ImpulseProvider>
      <NavigationContainer>
        <RootTabs />
      </NavigationContainer>
    </ImpulseProvider>
  );
}

