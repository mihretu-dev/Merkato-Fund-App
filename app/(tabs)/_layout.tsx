import React from 'react';
import { SymbolView } from 'expo-symbols';
import { Link, Tabs } from 'expo-router';
import { Pressable, View } from 'react-native';

import Colors from '@/constants/Colors';
import { colors, fontFamilies } from '@/src/theme/tokens';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.dark.textMuted,
        tabBarStyle: {
          backgroundColor: colors.dark.surface,
          borderTopColor: colors.dark.surfaceBorder,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamilies.sans,
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: colors.dark.surface,
        },
        headerTintColor: colors.dark.textPrimary,
        headerTitleStyle: {
          fontFamily: fontFamilies.sans,
          fontWeight: '700',
          fontSize: 17,
        },
        headerShown: useClientOnlyValue(false, true),
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
      }}>
      {/* 1. Member Dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Dashboard',
          headerTitle: 'Merkato Fund — Dashboard',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'house.fill', android: 'home', web: 'home' }}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />

      {/* 2. Daily Contribution */}
      <Tabs.Screen
        name="contribute"
        options={{
          headerShown: false,
          title: 'Contribute',
          headerTitle: 'Daily Micro-Contribution',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'banknote.fill', android: 'payments', web: 'payments' }}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />

      {/* 3. Algorithmic Draw Room */}
      <Tabs.Screen
        name="draw"
        options={{
          title: 'Draw',
          headerTitle: 'Daily Algorithmic Draw',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'ticket.fill', android: 'confirmation_number', web: 'confirmation_number' }}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />

      {/* 4. Winner Experience Hub */}
      <Tabs.Screen
        name="winner"
        options={{
          title: 'Winner',
          headerTitle: 'Winner Escrow & Yield Hub',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'star.circle.fill', android: 'military_tech', web: 'military_tech' }}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />

      {/* 5. Auditor & Compliance Admin */}
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          headerTitle: 'Compliance & Pool Auditor',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'shield.lefthalf.filled', android: 'admin_panel_settings', web: 'admin_panel_settings' }}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />

      {/* 6. Day 2 Verification Screen */}
      <Tabs.Screen
        name="verify"
        options={{
          title: 'Verify',
          headerTitle: 'Day 2 State Verification',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'checkmark.seal.fill', android: 'fact_check', web: 'fact_check' }}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />

      {/* Hidden Sub-screens (Routable via links) */}
      <Tabs.Screen
        name="engine"
        options={{
          href: null,
          title: 'Math & Engine',
          headerTitle: 'Day 1 Math & Engine Playground',
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          href: null,
          title: 'Rules & Ambiguities',
          headerTitle: 'Financial Rules & Ambiguities',
        }}
      />
    </Tabs>
  );
}
