import React from 'react';
import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';

import { useTheme } from '@/src/theme/useTheme';
import { fontFamilies } from '@/src/theme/tokens';
import { useTranslation } from '@/src/i18n/useTranslation';

export default function TabLayout() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.surfaceBorder,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamilies.sans,
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTintColor: theme.textPrimary,
        headerTitleStyle: {
          fontFamily: fontFamilies.sans,
          fontWeight: '700',
          fontSize: 17,
        },
        headerShown: false,
      }}>
      {/* 1. Home / Dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.home,
          headerTitle: t.tabs.headerHome,
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
          title: t.tabs.contribute,
          headerTitle: t.tabs.headerContribute,
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
          title: t.tabs.draw,
          headerTitle: t.tabs.headerDraw,
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
          title: t.tabs.winner,
          headerTitle: t.tabs.headerWinner,
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'star.circle.fill', android: 'military_tech', web: 'military_tech' }}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />

      {/* 5. Admin & More */}
      <Tabs.Screen
        name="admin"
        options={{
          title: t.tabs.more,
          headerTitle: t.tabs.headerMore,
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'ellipsis.circle.fill', android: 'more_horiz', web: 'more_horiz' }}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />

      {/* Hidden Sub-screens (Routable via direct links) */}
      <Tabs.Screen
        name="verify"
        options={{
          href: null,
          title: 'Verify',
        }}
      />
      <Tabs.Screen
        name="engine"
        options={{
          href: null,
          title: 'Math & Engine',
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          href: null,
          title: 'Rules & Ambiguities',
        }}
      />
    </Tabs>
  );
}
