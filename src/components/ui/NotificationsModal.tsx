/**
 * Merkato Fund — Notifications Modal Component
 *
 * Displays real-time synthetic notifications:
 * - Ticket issues
 * - Contribution confirmations
 * - Escrow yield accruals
 * - Algorithmic draw schedules
 * - Buffer status updates
 *
 * Features:
 * - Full Dark & Light theme compliance
 * - Complete English & Amharic localization
 * - Removable notifications (individual "✕" dismiss button)
 * - "Mark all as read" & "Clear all" actions
 * - Smooth scrollable list with empty state and restore option
 * - Dismissable sheet/modal with backdrop touch
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/src/theme/useTheme';
import { useTranslation } from '@/src/i18n/useTranslation';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  unreadCount: number;
  onMarkAllAsRead: () => void;
  onUpdateUnreadCount?: (count: number) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  visible,
  onClose,
  unreadCount,
  onMarkAllAsRead,
  onUpdateUnreadCount,
}) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { t, isAmharic } = useTranslation();

  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const handleDismissItem = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    const remainingCount = t.notifications.items.filter((item) => !updated.includes(item.id)).length;
    onUpdateUnreadCount?.(remainingCount);
  };

  const handleClearAll = () => {
    const allIds = t.notifications.items.map((i) => i.id);
    setDismissedIds(allIds);
    onMarkAllAsRead();
    onUpdateUnreadCount?.(0);
  };

  const handleRestoreAll = () => {
    setDismissedIds([]);
    onUpdateUnreadCount?.(t.notifications.items.length);
  };

  const activeItems = t.notifications.items.filter((item) => !dismissedIds.includes(item.id));

  const getIconForType = (type: string) => {
    switch (type) {
      case 'ticket':
        return '🎟️';
      case 'payment':
        return '💰';
      case 'yield':
        return '📈';
      case 'draw':
        return '🏆';
      case 'buffer':
        return '🛡️';
      default:
        return '🔔';
    }
  };

  const getBadgeBg = (type: string) => {
    switch (type) {
      case 'ticket':
        return isDark ? 'rgba(245, 158, 11, 0.18)' : 'rgba(245, 158, 11, 0.12)';
      case 'payment':
        return isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(16, 185, 129, 0.12)';
      case 'yield':
        return isDark ? 'rgba(5, 150, 105, 0.18)' : 'rgba(5, 150, 105, 0.12)';
      case 'draw':
        return isDark ? 'rgba(99, 102, 241, 0.18)' : 'rgba(99, 102, 241, 0.12)';
      case 'buffer':
        return isDark ? 'rgba(59, 130, 246, 0.18)' : 'rgba(59, 130, 246, 0.12)';
      default:
        return isDark ? 'rgba(100, 116, 139, 0.18)' : 'rgba(100, 116, 139, 0.12)';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {/* Backdrop overlay tap to dismiss */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: theme.surface,
              borderColor: theme.surfaceBorder,
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}>
              {/* Sheet Drag Handle */}
              <View style={styles.handleBarRow}>
                <View style={[styles.handleBar, { backgroundColor: isDark ? '#334155' : '#CBD5E1' }]} />
              </View>

              {/* Header: Title, Unread Count & Actions */}
              <View style={styles.headerRow}>
                <View style={styles.titleWithBadge}>
                  <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                    {t.notifications.title}
                  </Text>
                  {unreadCount > 0 && activeItems.length > 0 && (
                    <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
                      <Text style={styles.unreadBadgeText}>
                        {unreadCount}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.headerActions}>
                  {unreadCount > 0 && activeItems.length > 0 && (
                    <TouchableOpacity
                      onPress={onMarkAllAsRead}
                      style={styles.actionButton}
                      accessibilityRole="button"
                      accessibilityLabel="Mark all as read">
                      <Text style={[styles.actionButtonText, { color: theme.primary }]}>
                        {t.notifications.markAllRead}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {activeItems.length > 0 && (
                    <TouchableOpacity
                      onPress={handleClearAll}
                      style={styles.actionButton}
                      accessibilityRole="button"
                      accessibilityLabel="Clear all notifications">
                      <Text style={[styles.actionButtonText, { color: theme.textMuted }]}>
                        {isAmharic ? 'ሁሉንም አጽዳ' : 'Clear all'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={onClose}
                    style={[styles.closeButton, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
                    accessibilityRole="button"
                    accessibilityLabel="Close notifications">
                    <Text style={[styles.closeIcon, { color: theme.textSecondary }]}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Subtitle */}
              <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
                {t.notifications.subtitle}
              </Text>

              {/* Notifications List */}
              <ScrollView
                style={styles.scrollList}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.listContent}>
                {activeItems.length > 0 ? (
                  activeItems.map((item) => (
                    <View
                      key={item.id}
                      style={[
                        styles.notificationItem,
                        {
                          backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                          borderColor: theme.surfaceBorder,
                        },
                      ]}>
                      <View style={[styles.iconCircle, { backgroundColor: getBadgeBg(item.type) }]}>
                        <Text style={styles.iconEmoji}>{getIconForType(item.type)}</Text>
                      </View>

                      <View style={styles.itemContent}>
                        <View style={styles.itemHeaderRow}>
                          <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>
                            {item.title}
                          </Text>
                          <Text style={[styles.itemTime, { color: theme.textMuted }]}>
                            {item.time}
                          </Text>
                        </View>
                        <Text style={[styles.itemDescription, { color: theme.textSecondary }]}>
                          {item.description}
                        </Text>
                      </View>

                      {/* Remove "✕" button per notification */}
                      <TouchableOpacity
                        style={[styles.itemRemoveBtn, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' }]}
                        onPress={() => handleDismissItem(item.id)}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        accessibilityRole="button"
                        accessibilityLabel={`Dismiss ${item.title}`}>
                        <Text style={[styles.itemRemoveIcon, { color: theme.textMuted }]}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyEmoji}>🎉</Text>
                    <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                      {t.notifications.emptyTitle}
                    </Text>
                    <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                      {t.notifications.emptyDesc}
                    </Text>
                    {dismissedIds.length > 0 && (
                      <TouchableOpacity
                        style={[styles.restoreBtn, { borderColor: theme.primary }]}
                        onPress={handleRestoreAll}
                        accessibilityRole="button"
                        accessibilityLabel="Restore dismissed notifications">
                        <Text style={[styles.restoreBtnText, { color: theme.primary }]}>
                          {isAmharic ? 'ማሳወቂያዎችን መልስ' : 'Restore All'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </ScrollView>
            </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    maxHeight: '82%',
    paddingTop: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  handleBarRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  unreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
    marginBottom: 16,
  },
  scrollList: {
    maxHeight: 460,
  },
  listContent: {
    gap: 10,
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 18,
  },
  itemContent: {
    flex: 1,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 6,
  },
  itemTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  itemDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  itemRemoveBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    marginTop: 2,
  },
  itemRemoveIcon: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  restoreBtn: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  restoreBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
