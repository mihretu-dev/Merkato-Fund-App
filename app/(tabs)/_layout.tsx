import React from 'react';
import { SymbolView } from 'expo-symbols';
import { Link, Tabs } from 'expo-router';
import { Pressable, View, Text } from 'react-native';

import Colors from '@/constants/Colors';
import { colors } from '@/src/theme/tokens';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColors.tint,
        tabBarInactiveTintColor: colors.dark.textMuted,
        tabBarStyle: {
          backgroundColor: colors.dark.surface,
          borderTopColor: colors.dark.surfaceBorder,
        },
        headerStyle: {
          backgroundColor: colors.dark.surface,
        },
        headerTintColor: colors.dark.textPrimary,
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Math & Engine',
          headerTitle: 'Merkato Fund — Day 1 Engine',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'function',
                android: 'calculate',
                web: 'calculate',
              }}
              tintColor={color}
              size={24}
            />
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable style={{ marginRight: 16 }}>
                {({ pressed }) => (
                  <View style={{ opacity: pressed ? 0.6 : 1 }}>
                    <SymbolView
                      name={{ ios: 'info.circle.fill', android: 'info', web: 'info' }}
                      size={22}
                      tintColor={colors.accentGold}
                    />
                  </View>
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Rules & Ambiguities',
          headerTitle: 'Financial Rules & Ambiguities',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'doc.text.magnifyingglass',
                android: 'description',
                web: 'description',
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
