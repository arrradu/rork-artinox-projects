import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppContext } from "@/contexts/AppContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Înapoi" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="project/[id]" 
        options={{ 
          headerShown: false,
          presentation: "card",
        }} 
      />
      <Stack.Screen 
        name="create-project" 
        options={{ 
          presentation: "modal",
          title: "Proiect nou",
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppContext>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </AppContext>
    </QueryClientProvider>
  );
}
