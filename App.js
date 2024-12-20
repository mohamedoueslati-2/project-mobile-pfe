import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, AppState } from 'react-native';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TASK_NAME = 'BACKGROUND_FETCH_TASK';

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    const count = await AsyncStorage.getItem('count');
    const newCount = parseInt(count || '0') + 1;
    await AsyncStorage.setItem('count', newCount.toString());
    console.log('Background Fetch exécuté, compteur:', newCount);
    return BackgroundFetch.Result.NewData;
  } catch (error) {
    console.error(error);
    return BackgroundFetch.Result.Failed;
  }
});

async function registerBackgroundFetchAsync() {
  try {
    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
      minimumInterval: 60 * 15, // 15 minutes
      stopOnTerminate: false,   // Continue même si l'application est fermée
      startOnBoot: true,        // Démarrer la tâche au redémarrage du téléphone
    });
    console.log('Tâche de récupération en arrière-plan enregistrée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la tâche de récupération en arrière-plan:', error);
  }
}

export default function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const loadCount = async () => {
      const savedCount = await AsyncStorage.getItem('count');
      setCount(parseInt(savedCount || '0'));
    };

    loadCount();

    const interval = setInterval(() => {
      setCount((currentCount) => {
        const newCount = currentCount + 1;
        AsyncStorage.setItem('count', newCount.toString());
        return newCount;
      });
    }, 1000); // Incrémenter le compteur toutes les 1000 millisecondes (1 seconde)

    registerBackgroundFetchAsync(); // Enregistrer la tâche de récupération en arrière-plan

    return () => clearInterval(interval);
  }, []); // Le tableau vide signifie que cet effet s'exécute une seule fois à la montée du composant

  return (
    <View style={styles.container}>
      <Text style={styles.counterText}>Compteur: {count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    fontSize: 24,
  },
});
