import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from './lib/supabase';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  data: { eventId?: string };
  is_read: boolean;
  created_at: string;
}

export default function NotificationsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotifications(data);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handlePress = async (item: NotificationItem) => {
    // 1. Mark as read immediately in UI
    const updatedList = notifications.map(n => 
        n.id === item.id ? { ...n, is_read: true } : n
    );
    setNotifications(updatedList);

    // 2. Update in Database (Fire and forget)
    supabase.from('notifications').update({ is_read: true }).eq('id', item.id).then();

    // 3. Navigate
    if (item.data?.eventId) {
      navigation.navigate('EventDetails', { eventId: item.data.eventId });
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity 
      style={[styles.itemContainer, !item.is_read && styles.unreadItem]} 
      onPress={() => handlePress(item)}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="calendar" size={24} color="#007BFF" />
        {!item.is_read && <View style={styles.redDot} />}
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, !item.is_read && styles.unreadText]}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
        <Text style={styles.time}>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  itemContainer: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  unreadItem: { backgroundColor: '#F0F8FF' }, // Light blue background for unread
  iconContainer: { marginRight: 15, justifyContent: 'center' },
  redDot: { position: 'absolute', top: 0, right: -2, width: 10, height: 10, borderRadius: 5, backgroundColor: 'red', borderWidth: 2, borderColor: '#fff' },
  textContainer: { flex: 1 },
  title: { fontSize: 16, color: '#333', marginBottom: 4 },
  unreadText: { fontWeight: 'bold' },
  body: { fontSize: 14, color: '#666', marginBottom: 6 },
  time: { fontSize: 12, color: '#999' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, color: '#888', fontSize: 16 },
});