/**
 * Offline Settings Screen
 * Allows users to manage offline mode settings and data synchronization
 */
import React, { useState, useEffect } from 'react';
import { 
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOffline } from '../../contexts/OfflineContext';
import { 
  registerBackgroundSync,
  unregisterBackgroundSync,
  getSyncSchedule,
  isBackgroundSyncRegistered,
  triggerSync
} from '../../utils/syncManager';
import { getCacheSize, clearCache } from '../../services/offlineStorage';
import theme from '../../theme';

const OfflineSettingsScreen = ({ navigation }) => {
  // State
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [syncInterval, setSyncInterval] = useState('hourly');
  const [cacheSize, setCacheSize] = useState('Calculating...');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Offline context
  const { 
    isOnline,
    pendingActions,
    lastSyncTime,
    syncNow,
    clearOfflineCache
  } = useOffline();
  
  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);
  
  // Load saved settings
  const loadSettings = async () => {
    setIsCalculating(true);
    
    try {
      // Load sync settings
      const isRegistered = await isBackgroundSyncRegistered();
      setSyncEnabled(isRegistered);
      
      const schedule = await getSyncSchedule();
      setSyncInterval(schedule);
      
      // Calculate cache size
      await calculateCacheSize();
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsCalculating(false);
    }
  };
  
  // Calculate cache size
  const calculateCacheSize = async () => {
    try {
      const sizeByte = await getCacheSize();
      
      // Convert to readable format
      let size = '';
      if (sizeByte < 1024) {
        size = `${sizeByte} B`;
      } else if (sizeByte < 1024 * 1024) {
        size = `${(sizeByte / 1024).toFixed(1)} KB`;
      } else {
        size = `${(sizeByte / (1024 * 1024)).toFixed(1)} MB`;
      }
      
      setCacheSize(size);
    } catch (error) {
      console.error('Failed to calculate cache size:', error);
      setCacheSize('Unknown');
    }
  };
  
  // Toggle background sync
  const toggleBackgroundSync = async (value) => {
    try {
      if (value) {
        const success = await registerBackgroundSync(syncInterval);
        setSyncEnabled(success);
      } else {
        const success = await unregisterBackgroundSync();
        setSyncEnabled(!success);
      }
    } catch (error) {
      console.error('Failed to toggle background sync:', error);
      Alert.alert(
        'Error',
        'Failed to update sync settings. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Change sync interval
  const handleIntervalChange = async (interval) => {
    try {
      // Unregister existing task
      await unregisterBackgroundSync();
      
      // Register with new interval
      const success = await registerBackgroundSync(interval);
      
      if (success) {
        setSyncInterval(interval);
      }
    } catch (error) {
      console.error('Failed to change sync interval:', error);
      Alert.alert(
        'Error',
        'Failed to update sync interval. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Clear offline cache
  const handleClearCache = async () => {
    try {
      setIsClearing(true);
      
      // Confirm first
      Alert.alert(
        'Clear Cache',
        'This will remove all cached data. You will need an internet connection to reload data. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Clear', 
            style: 'destructive',
            onPress: async () => {
              const success = await clearOfflineCache();
              
              if (success) {
                await calculateCacheSize();
                Alert.alert('Success', 'Cache cleared successfully');
              } else {
                Alert.alert('Error', 'Failed to clear cache');
              }
              
              setIsClearing(false);
            }
          },
        ]
      );
    } catch (error) {
      console.error('Failed to clear cache:', error);
      Alert.alert(
        'Error',
        'Failed to clear cache. Please try again later.',
        [{ text: 'OK' }]
      );
      setIsClearing(false);
    }
  };
  
  // Manual sync
  const handleManualSync = async () => {
    if (!isOnline) {
      Alert.alert(
        'Offline',
        'Cannot sync while offline. Please connect to the internet and try again.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      setIsSyncing(true);
      
      // Trigger sync
      await syncNow();
      
      // Reload settings to get updated cache size
      await loadSettings();
      
      Alert.alert('Success', 'Data synchronized successfully');
    } catch (error) {
      console.error('Failed to sync:', error);
      Alert.alert(
        'Error',
        'Failed to synchronize data. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Format last sync time
  const getLastSyncTimeText = () => {
    if (!lastSyncTime) return 'Never';
    
    const date = new Date(lastSyncTime);
    return date.toLocaleString();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offline Settings</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Status section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Connection:</Text>
            <View style={styles.connectionStatus}>
              <View 
                style={[
                  styles.statusDot,
                  { backgroundColor: isOnline ? '#2ecc71' : '#e74c3c' }
                ]} 
              />
              <Text style={styles.infoValue}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pending Actions:</Text>
            <Text style={styles.infoValue}>
              {pendingActions > 0 
                ? `${pendingActions} action${pendingActions > 1 ? 's' : ''} pending`
                : 'None'
              }
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Synced:</Text>
            <Text style={styles.infoValue}>{getLastSyncTimeText()}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cache Size:</Text>
            <Text style={styles.infoValue}>
              {isCalculating ? 'Calculating...' : cacheSize}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.syncButton,
              { opacity: isSyncing || !isOnline ? 0.5 : 1 }
            ]}
            onPress={handleManualSync}
            disabled={isSyncing || !isOnline}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="sync" size={18} color="white" />
            )}
            <Text style={styles.syncButtonText}>
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Background Sync section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Background Sync</Text>
          
          <View style={styles.row}>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Enable Background Sync</Text>
              <Text style={styles.rowDescription}>
                Periodically sync data in the background
              </Text>
            </View>
            <Switch
              value={syncEnabled}
              onValueChange={toggleBackgroundSync}
              trackColor={{ 
                false: theme.colors.background.tertiary, 
                true: theme.colors.primary.main 
              }}
              thumbColor="white"
            />
          </View>
          
          {/* Sync interval */}
          {syncEnabled && (
            <View style={styles.intervalContainer}>
              <Text style={styles.intervalTitle}>Sync Frequency</Text>
              
              <View style={styles.intervalOptions}>
                <TouchableOpacity
                  style={[
                    styles.intervalOption,
                    syncInterval === 'minimum' && styles.intervalOptionSelected
                  ]}
                  onPress={() => handleIntervalChange('minimum')}
                >
                  <Text style={styles.intervalOptionText}>Frequent</Text>
                  <Text style={styles.intervalOptionSubtext}>(15 min)</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.intervalOption,
                    syncInterval === 'hourly' && styles.intervalOptionSelected
                  ]}
                  onPress={() => handleIntervalChange('hourly')}
                >
                  <Text style={styles.intervalOptionText}>Hourly</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.intervalOption,
                    syncInterval === 'daily' && styles.intervalOptionSelected
                  ]}
                  onPress={() => handleIntervalChange('daily')}
                >
                  <Text style={styles.intervalOptionText}>Daily</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        
        {/* Cache Management section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cache Management</Text>
          
          <TouchableOpacity
            style={[
              styles.clearCacheButton,
              { opacity: isClearing ? 0.5 : 1 }
            ]}
            onPress={handleClearCache}
            disabled={isClearing}
          >
            {isClearing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="trash-outline" size={18} color="white" />
            )}
            <Text style={styles.clearCacheButtonText}>
              {isClearing ? 'Clearing...' : 'Clear Cache'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.clearCacheDescription}>
            Clearing cache removes all stored data. You will need an internet connection to reload data.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.background.secondary,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    ...theme.typography.styles.h5,
    color: theme.colors.text.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: theme.colors.background.card,
    borderRadius: 12,
    padding: 16,
    ...theme.shadow.medium,
  },
  sectionTitle: {
    ...theme.typography.styles.h6,
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
  },
  infoValue: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary.main,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  syncButtonText: {
    ...theme.typography.styles.button,
    color: 'white',
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rowTextContainer: {
    flex: 1,
  },
  rowTitle: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.primary,
  },
  rowDescription: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
  },
  intervalContainer: {
    marginTop: 4,
  },
  intervalTitle: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  intervalOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  intervalOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: theme.colors.background.tertiary,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  intervalOptionSelected: {
    backgroundColor: theme.colors.primary.main,
  },
  intervalOptionText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.primary,
  },
  intervalOptionSubtext: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  clearCacheButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.error.main,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  clearCacheButtonText: {
    ...theme.typography.styles.button,
    color: 'white',
    marginLeft: 8,
  },
  clearCacheDescription: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default OfflineSettingsScreen;