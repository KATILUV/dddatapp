import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  TouchableOpacity,
  Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

import Header from '../components/Header';
import GlassmorphicCard from '../components/GlassmorphicCard';
import Button from '../components/Button';
import IconButton from '../components/IconButton';
import { fadeInUp } from '../utils/animations';
import theme from '../theme';

const SettingsScreen = ({ navigation }) => {
  // State variables
  const [userData, setUserData] = useState({ name: 'Voa' });
  const [isPrivacyEnabled, setIsPrivacyEnabled] = useState(true);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [connectedSources, setConnectedSources] = useState({});
  
  const insets = useSafeAreaInsets();
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  
  useEffect(() => {
    // Load user settings
    const loadSettings = async () => {
      try {
        // Load user data
        const userDataStr = await AsyncStorage.getItem('onboardingData');
        if (userDataStr) {
          setUserData(JSON.parse(userDataStr));
        }
        
        // Load preferences
        const privacyEnabled = await AsyncStorage.getItem('privacyEnabled');
        setIsPrivacyEnabled(privacyEnabled !== 'false');
        
        const notificationsEnabled = await AsyncStorage.getItem('notificationsEnabled');
        setIsNotificationsEnabled(notificationsEnabled !== 'false');
        
        const darkTheme = await AsyncStorage.getItem('darkTheme');
        setIsDarkTheme(darkTheme !== 'false');
        
        // Load connected data sources
        try {
          const sources = await FileSystem.readAsStringAsync(
            FileSystem.documentDirectory + 'connectedSources.json'
          );
          setConnectedSources(JSON.parse(sources));
        } catch (error) {
          console.log('No connected sources file found');
          setConnectedSources({});
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
    
    // Start animations
    headerOpacity.value = withTiming(1, { duration: 600 });
    contentOpacity.value = withDelay(
      300, 
      withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
  }, []);
  
  // Save setting changes
  const saveSetting = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, String(value));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };
  
  // Toggle handlers
  const togglePrivacy = () => {
    const newValue = !isPrivacyEnabled;
    setIsPrivacyEnabled(newValue);
    saveSetting('privacyEnabled', newValue);
  };
  
  const toggleNotifications = () => {
    const newValue = !isNotificationsEnabled;
    setIsNotificationsEnabled(newValue);
    saveSetting('notificationsEnabled', newValue);
  };
  
  const toggleTheme = () => {
    const newValue = !isDarkTheme;
    setIsDarkTheme(newValue);
    saveSetting('darkTheme', newValue);
  };
  
  // Export user data
  const handleExportData = async () => {
    try {
      // Create a temporary directory for export
      const exportDir = FileSystem.cacheDirectory + 'export/';
      await FileSystem.makeDirectoryAsync(exportDir, { intermediates: true }).catch(() => {});
      
      // Gather all user data
      const exportData = {
        userData: userData,
        preferences: {
          privacyEnabled: isPrivacyEnabled,
          notificationsEnabled: isNotificationsEnabled,
          darkTheme: isDarkTheme,
        },
        connectedSources: connectedSources,
      };
      
      // Add conversations if they exist
      try {
        const conversations = await AsyncStorage.getItem('messages');
        if (conversations) {
          exportData.conversations = JSON.parse(conversations);
        }
      } catch (error) {
        console.log('No conversations to export');
      }
      
      // Write to file
      const fileUri = exportDir + 'voa_data_export.json';
      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(exportData, null, 2)
      );
      
      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert(
          'Sharing not available',
          'Sharing is not available on this device'
        );
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert(
        'Export Failed',
        'There was an error exporting your data. Please try again.'
      );
    }
  };
  
  // Import data
  const handleImportData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      
      if (result.type === 'success') {
        const fileContent = await FileSystem.readAsStringAsync(result.uri);
        const importedData = JSON.parse(fileContent);
        
        // Confirm before overwriting
        Alert.alert(
          'Import Data',
          'This will replace your current data. Are you sure you want to continue?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Import',
              onPress: async () => {
                // Store user data
                if (importedData.userData) {
                  await AsyncStorage.setItem(
                    'onboardingData', 
                    JSON.stringify(importedData.userData)
                  );
                  setUserData(importedData.userData);
                }
                
                // Store preferences
                if (importedData.preferences) {
                  const { privacyEnabled, notificationsEnabled, darkTheme } = importedData.preferences;
                  
                  await saveSetting('privacyEnabled', privacyEnabled);
                  await saveSetting('notificationsEnabled', notificationsEnabled);
                  await saveSetting('darkTheme', darkTheme);
                  
                  setIsPrivacyEnabled(privacyEnabled);
                  setIsNotificationsEnabled(notificationsEnabled);
                  setIsDarkTheme(darkTheme);
                }
                
                // Store connected sources
                if (importedData.connectedSources) {
                  await FileSystem.writeAsStringAsync(
                    FileSystem.documentDirectory + 'connectedSources.json',
                    JSON.stringify(importedData.connectedSources)
                  );
                  setConnectedSources(importedData.connectedSources);
                }
                
                // Store conversations
                if (importedData.conversations) {
                  await AsyncStorage.setItem(
                    'messages',
                    JSON.stringify(importedData.conversations)
                  );
                }
                
                Alert.alert('Success', 'Data imported successfully');
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error importing data:', error);
      Alert.alert(
        'Import Failed',
        'There was an error importing your data. Please make sure it is a valid Voa export file.'
      );
    }
  };
  
  // Wipe all data
  const handleWipeData = () => {
    Alert.alert(
      'Wipe All Data',
      'This will permanently delete all your data. This action cannot be undone. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear AsyncStorage
              await AsyncStorage.clear();
              
              // Clear file system - except essential app files
              const dataDir = FileSystem.documentDirectory;
              const items = await FileSystem.readDirectoryAsync(dataDir);
              
              for (const item of items) {
                // Skip certain essential files if needed
                await FileSystem.deleteAsync(dataDir + item).catch(() => {});
              }
              
              // Reset state
              setConnectedSources({});
              setUserData({ name: 'Voa' });
              
              // Return to onboarding
              navigation.reset({
                index: 0,
                routes: [{ name: 'Onboarding' }],
              });
            } catch (error) {
              console.error('Error wiping data:', error);
              Alert.alert(
                'Error',
                'There was a problem wiping your data. Some data may remain.'
              );
            }
          },
        },
      ]
    );
  };
  
  // Animated styles
  const headerStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
    };
  });
  
  const contentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
    };
  });
  
  // Render a setting item
  const renderSetting = (title, description, value, onToggle, icon) => {
    return (
      <View style={styles.settingItem}>
        <View style={styles.settingIcon}>
          <Feather name={icon} size={20} color={theme.colors.accent.primary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{
            false: 'rgba(35, 35, 60, 0.8)',
            true: 'rgba(168, 148, 255, 0.6)',
          }}
          thumbColor={value ? theme.colors.accent.primary : theme.colors.text.secondary}
        />
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <Animated.View style={headerStyle}>
        <Header
          title="Settings"
          leftIcon="arrow-left"
          onLeftPress={() => navigation.goBack()}
        />
      </Animated.View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, contentStyle]}>
          {/* Profile Section */}
          <GlassmorphicCard style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.profileAvatarContainer}>
                <Text style={styles.profileAvatarText}>
                  {userData.name ? userData.name.charAt(0) : 'V'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userData.name || 'Voa'}</Text>
                <Text style={styles.profileTone}>
                  {userData.tone ? `${userData.tone.charAt(0).toUpperCase() + userData.tone.slice(1)} tone` : 'AI Companion'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.profileIntention}>
              {userData.intention || 'Your personal AI companion helping you understand your data patterns.'}
            </Text>
          </GlassmorphicCard>
          
          {/* Privacy & Security */}
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <GlassmorphicCard style={styles.settingsCard}>
            {renderSetting(
              'Enhanced Privacy',
              'Process all data locally without server uploads',
              isPrivacyEnabled,
              togglePrivacy,
              'shield'
            )}
            
            {renderSetting(
              'Notifications',
              'Receive insight updates and reminders',
              isNotificationsEnabled,
              toggleNotifications,
              'bell'
            )}
            
            {renderSetting(
              'Dark Theme',
              'Use dark mode throughout the app',
              isDarkTheme,
              toggleTheme,
              'moon'
            )}
          </GlassmorphicCard>
          
          {/* Data Management */}
          <Text style={styles.sectionTitle}>Data Management</Text>
          <GlassmorphicCard style={styles.settingsCard}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleExportData}
            >
              <View style={styles.actionButtonIcon}>
                <Feather name="download" size={20} color={theme.colors.text.primary} />
              </View>
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTitle}>Export Your Data</Text>
                <Text style={styles.actionButtonDescription}>
                  Save a copy of all your data and insights
                </Text>
              </View>
              <IconButton
                name="chevron-right"
                variant="ghost"
                size={20}
                color={theme.colors.text.secondary}
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleImportData}
            >
              <View style={styles.actionButtonIcon}>
                <Feather name="upload" size={20} color={theme.colors.text.primary} />
              </View>
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTitle}>Import Data</Text>
                <Text style={styles.actionButtonDescription}>
                  Restore from a previous backup
                </Text>
              </View>
              <IconButton
                name="chevron-right"
                variant="ghost"
                size={20}
                color={theme.colors.text.secondary}
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('DataConnection')}
            >
              <View style={styles.actionButtonIcon}>
                <Feather name="link" size={20} color={theme.colors.text.primary} />
              </View>
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTitle}>Manage Data Sources</Text>
                <Text style={styles.actionButtonDescription}>
                  Add or remove connected data sources
                </Text>
              </View>
              <IconButton
                name="chevron-right"
                variant="ghost"
                size={20}
                color={theme.colors.text.secondary}
              />
            </TouchableOpacity>
          </GlassmorphicCard>
          
          {/* Danger Zone */}
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <GlassmorphicCard style={styles.settingsCard}>
            <TouchableOpacity 
              style={styles.dangerButton}
              onPress={handleWipeData}
            >
              <View style={styles.dangerButtonIcon}>
                <Feather name="trash-2" size={20} color={theme.colors.ui.error} />
              </View>
              <View style={styles.actionButtonContent}>
                <Text style={styles.dangerButtonTitle}>Wipe All Data</Text>
                <Text style={styles.actionButtonDescription}>
                  Permanently delete all your data and reset the app
                </Text>
              </View>
            </TouchableOpacity>
          </GlassmorphicCard>
          
          {/* About */}
          <Text style={styles.sectionTitle}>About</Text>
          <GlassmorphicCard style={styles.settingsCard}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Linking.openURL('https://example.com/privacy')}
            >
              <View style={styles.actionButtonIcon}>
                <Feather name="file-text" size={20} color={theme.colors.text.primary} />
              </View>
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTitle}>Privacy Policy</Text>
                <Text style={styles.actionButtonDescription}>
                  How we protect your information
                </Text>
              </View>
              <IconButton
                name="external-link"
                variant="ghost"
                size={18}
                color={theme.colors.text.secondary}
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Linking.openURL('https://example.com/terms')}
            >
              <View style={styles.actionButtonIcon}>
                <Feather name="book" size={20} color={theme.colors.text.primary} />
              </View>
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTitle}>Terms of Service</Text>
                <Text style={styles.actionButtonDescription}>
                  Usage terms and conditions
                </Text>
              </View>
              <IconButton
                name="external-link"
                variant="ghost"
                size={18}
                color={theme.colors.text.secondary}
              />
            </TouchableOpacity>
            
            <View style={styles.versionContainer}>
              <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>
          </GlassmorphicCard>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: theme.spacing.xl,
  },
  // Profile styles
  profileCard: {
    marginBottom: theme.spacing.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  profileAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(168, 148, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  profileAvatarText: {
    fontFamily: theme.typography.fonts.serif.bold,
    fontSize: theme.typography.sizes.heading2,
    color: theme.colors.text.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: theme.typography.fonts.serif.bold,
    fontSize: theme.typography.sizes.heading3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  profileTone: {
    fontFamily: theme.typography.fonts.mono.regular,
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.accent.primary,
  },
  profileIntention: {
    fontFamily: theme.typography.fonts.serif.regular,
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeights.bodySmall,
    fontStyle: 'italic',
  },
  // Section styles
  sectionTitle: {
    fontFamily: theme.typography.fonts.serif.medium,
    fontSize: theme.typography.sizes.heading4,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.l,
    marginBottom: theme.spacing.m,
    paddingHorizontal: theme.spacing.s,
  },
  settingsCard: {
    marginBottom: theme.spacing.l,
  },
  // Setting item styles
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(168, 148, 255, 0.1)',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(168, 148, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  settingContent: {
    flex: 1,
    marginRight: theme.spacing.m,
  },
  settingTitle: {
    fontFamily: theme.typography.fonts.serif.medium,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  settingDescription: {
    fontFamily: theme.typography.fonts.serif.regular,
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.secondary,
  },
  // Action button styles
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(168, 148, 255, 0.1)',
  },
  actionButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(168, 148, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  actionButtonContent: {
    flex: 1,
    marginRight: theme.spacing.s,
  },
  actionButtonTitle: {
    fontFamily: theme.typography.fonts.serif.medium,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  actionButtonDescription: {
    fontFamily: theme.typography.fonts.serif.regular,
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.secondary,
  },
  // Danger zone styles
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
  },
  dangerButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 87, 87, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  dangerButtonTitle: {
    fontFamily: theme.typography.fonts.serif.medium,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.ui.error,
    marginBottom: 2,
  },
  // Version styles
  versionContainer: {
    paddingVertical: theme.spacing.m,
    alignItems: 'center',
  },
  versionText: {
    fontFamily: theme.typography.fonts.mono.regular,
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.muted,
  },
});

export default SettingsScreen;
