import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

// Importar as telas que vamos criar
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import NewSurveyScreen from './screens/NewSurveyScreen';
import EnvironmentsScreen from './screens/EnvironmentsScreen';
import CaptureScreen from './screens/CaptureScreen';
import PhotoReviewScreen from './screens/PhotoReviewScreen';
import SurveysScreen from './screens/SurveysScreen';
import AccountScreen from './screens/AccountScreen';

const Stack = createStackNavigator();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null; // Ou uma tela de loading
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {session ? (
          // Usuário logado - mostrar telas principais
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Account" component={AccountScreen} />
            <Stack.Screen name="Surveys" component={SurveysScreen} />
            <Stack.Screen name="NewSurvey" component={NewSurveyScreen} />
            <Stack.Screen name="Environments" component={EnvironmentsScreen} />
            <Stack.Screen name="Capture" component={CaptureScreen} />
            <Stack.Screen name="PhotoReview" component={PhotoReviewScreen} />
          </>
        ) : (
          // Usuário não logado - mostrar tela de login
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}