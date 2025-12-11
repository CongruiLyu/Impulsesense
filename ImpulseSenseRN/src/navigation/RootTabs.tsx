import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import MallScreen from '../screens/MallScreen';
import InsightsScreen from '../screens/InsightsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { Feather } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function RootTabs() {
  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          tabBarIcon: ({color, size}) => <Feather name="home" color={color} size={size} />,
          tabBarLabel: 'Home'
        }} 
      />
      <Tab.Screen 
        name="Mall" 
        component={MallScreen} 
        options={{ 
          tabBarIcon: ({color, size}) => <Feather name="shopping-bag" color={color} size={size} />,
          tabBarLabel: 'Mall'
        }} 
      />
      <Tab.Screen 
        name="Insights" 
        component={InsightsScreen} 
        options={{ 
          tabBarIcon: ({color, size}) => <Feather name="bar-chart-2" color={color} size={size} />,
          tabBarLabel: 'Insights'
        }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ 
          tabBarIcon: ({color, size}) => <Feather name="user" color={color} size={size} />,
          tabBarLabel: 'Settings'
        }} 
      />
    </Tab.Navigator>
  );
}

