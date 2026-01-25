import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  FadeIn,
  FadeInLeft,
  FadeOut,
  SlideInLeft,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { Colors, Gradients, Shadows } from '@/theme';
import { ChatSession } from '@/types';
import { hapticLight, hapticMedium } from '@/lib/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(320, SCREEN_WIDTH * 0.85);

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
}

// Helper to group sessions by date
function groupSessionsByDate(sessions: ChatSession[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const weekAgo = today - 7 * 86400000;

  const groups: { title: string; data: ChatSession[] }[] = [
    { title: 'Today', data: [] },
    { title: 'Yesterday', data: [] },
    { title: 'This Week', data: [] },
    { title: 'Earlier', data: [] },
  ];

  sessions.forEach((session) => {
    const sessionDate = new Date(session.updatedAt).setHours(0, 0, 0, 0);
    if (sessionDate >= today) {
      groups[0].data.push(session);
    } else if (sessionDate >= yesterday) {
      groups[1].data.push(session);
    } else if (sessionDate >= weekAgo) {
      groups[2].data.push(session);
    } else {
      groups[3].data.push(session);
    }
  });

  return groups.filter((g) => g.data.length > 0);
}

export default function Sidebar({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}: SidebarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const backdropOpacity = useSharedValue(0);

  // Update animation values when isOpen changes
  React.useEffect(() => {
    if (isOpen) {
      translateX.value = withSpring(0, { damping: 28, stiffness: 220 });
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      translateX.value = withSpring(-SIDEBAR_WIDTH, { damping: 28, stiffness: 220 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isOpen]);

  // Gesture for swipe to close
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = Math.max(-SIDEBAR_WIDTH, event.translationX);
      }
    })
    .onEnd((event) => {
      if (event.translationX < -80 || event.velocityX < -400) {
        translateX.value = withSpring(-SIDEBAR_WIDTH, { damping: 28, stiffness: 220 });
        backdropOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(onClose)();
      } else {
        translateX.value = withSpring(0, { damping: 28, stiffness: 220 });
      }
    });

  const sidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
    pointerEvents: backdropOpacity.value > 0 ? 'auto' : 'none',
  }));

  // Sort and group sessions
  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => b.updatedAt - a.updatedAt),
    [sessions]
  );

  const groupedSessions = useMemo(
    () => groupSessionsByDate(sortedSessions),
    [sortedSessions]
  );

  const handleSessionPress = useCallback(
    (sessionId: string) => {
      hapticLight();
      onSelectSession(sessionId);
    },
    [onSelectSession]
  );

  const handleDeletePress = useCallback(
    (sessionId: string) => {
      hapticMedium();
      onDeleteSession(sessionId);
    },
    [onDeleteSession]
  );

  const handleNewChat = useCallback(() => {
    hapticLight();
    onNewChat();
  }, [onNewChat]);

  const renderSession = useCallback(
    ({ item, index }: { item: ChatSession; index: number }) => {
      const isActive = item.id === currentSessionId;
      const messagePreview =
        item.messages.length > 0
          ? item.messages[item.messages.length - 1].content.slice(0, 60)
          : 'No messages yet';

      return (
        <Animated.View entering={FadeInLeft.delay(index * 30).duration(200)}>
          <TouchableOpacity
            style={[
              styles.sessionItem,
              {
                backgroundColor: isActive
                  ? colors.primary + '12'
                  : 'transparent',
              },
            ]}
            onPress={() => handleSessionPress(item.id)}
            activeOpacity={0.6}
          >
            <View style={styles.sessionContent}>
              <Text
                style={[
                  styles.sessionTitle,
                  {
                    color: isActive ? colors.primary : colors.foreground,
                    fontWeight: isActive ? '600' : '500',
                  },
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text
                style={[styles.sessionPreview, { color: colors.muted }]}
                numberOfLines={2}
              >
                {messagePreview}
              </Text>
            </View>

            {/* Swipe hint indicator */}
            <TouchableOpacity
              style={[
                styles.deleteButton,
                { backgroundColor: colors.error + '15' }
              ]}
              onPress={() => handleDeletePress(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="trash-2" size={14} color={colors.error} />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      );
    },
    [currentSessionId, colors, handleSessionPress, handleDeletePress]
  );

  const renderSectionHeader = useCallback(
    (title: string) => (
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.muted }]}>
          {title}
        </Text>
      </View>
    ),
    [colors]
  );

  if (!isOpen && translateX.value === -SIDEBAR_WIDTH) {
    return null;
  }

  return (
    <>
      {/* Backdrop with warm tint */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Sidebar */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.sidebar,
            sidebarStyle,
            { width: SIDEBAR_WIDTH },
            Shadows.xl,
          ]}
        >
          {/* Background */}
          {Platform.OS === 'ios' && (
            <BlurView
              intensity={90}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          )}

          {/* Warm cream/espresso overlay */}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: isDark
                  ? 'rgba(26, 22, 20, 0.92)'
                  : 'rgba(250, 248, 245, 0.95)',
              },
            ]}
          />

          <View
            style={[
              styles.sidebarContent,
              {
                paddingTop: insets.top + 16,
                paddingBottom: insets.bottom + 20,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.sidebarHeader}>
              <Text style={[styles.sidebarTitle, { color: colors.foreground }]}>
                Chats
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeButton, { backgroundColor: colors.card }]}
              >
                <Feather name="x" size={18} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {/* New Chat Button with terracotta gradient */}
            <TouchableOpacity
              onPress={handleNewChat}
              style={styles.newChatContainer}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={Gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.newChatButton, Shadows.glowPrimary]}
              >
                <Feather name="plus" size={20} color="white" />
                <Text style={styles.newChatText}>New Chat</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Sessions List with date grouping */}
            <FlatList
              data={groupedSessions}
              keyExtractor={(item) => item.title}
              renderItem={({ item: group }) => (
                <View>
                  {renderSectionHeader(group.title)}
                  {group.data.map((session, index) =>
                    renderSession({ item: session, index })
                  )}
                </View>
              )}
              contentContainerStyle={styles.sessionsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '15' }]}>
                    <Feather name="message-circle" size={32} color={colors.primary} />
                  </View>
                  <Text style={[styles.emptyText, { color: colors.foreground }]}>
                    No chat history
                  </Text>
                  <Text style={[styles.emptySubtext, { color: colors.muted }]}>
                    Start a conversation to see it here
                  </Text>
                </View>
              }
            />
          </View>
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 22, 20, 0.4)',
    zIndex: 998,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 999,
    overflow: 'hidden',
  },
  sidebarContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sidebarTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  newChatContainer: {
    marginBottom: 24,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 10,
  },
  newChatText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  sessionsList: {
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 4,
  },
  sessionContent: {
    flex: 1,
    marginRight: 12,
  },
  sessionTitle: {
    fontSize: 15,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  sessionPreview: {
    fontSize: 13,
    lineHeight: 18,
  },
  deleteButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
