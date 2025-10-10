import { Tabs } from "expo-router";
import { FolderOpen, CheckSquare, User } from "lucide-react-native";
import React from "react";
import colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="projects"
        options={{
          title: "Proiecte",
          tabBarIcon: ({ color }) => <FolderOpen size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color }) => <CheckSquare size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Cont",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
