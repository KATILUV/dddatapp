/**
 * Settings screen for configuring app preferences and managing user profile
 */
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import GradientBackground from '../components/GradientBackground';
import GlassmorphicCard from '../components/GlassmorphicCard';
import Button from '../components/Button';
import AnimatedOrb from '../components/AnimatedOrb';
import theme from '../theme';
import { fadeInUp } from '../utils/animations';
import { getData, storeData, removeData } from '../utils/storage';
import { useAuth } from '../hooks/useAuth';

/**
 * Settings screen component
 * @returns {React.ReactElement} - Rendered component
 */
const SettingsScreen = ({ navigation }) => {
  const { user, isAuthenticated, signIn, signOut } = useAuth();
  const [userData, setUserData] = useState(null);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    dataProcessing: true,
    enhancedProfiling: false,
  });
  const [version, setVersion] = useState("1.0.0");
  
  // Animation styles
  const headerAnim = fadeInUp(100);
  const profileAnim = fadeInUp(300);
  const settingsAnim = fadeInUp(500);
  const actionsAnim = fadeInUp(700);
  
  useEffect(() => {
    // Load user data and settings
    const loadData = async () => {
      try {
        const userData = await getData('userData');
        if (userData) {
          setUserData(userData);
        }
        
        const savedSettings = await getData('settings');
        if (savedSettings) {
          setSettings(savedSettings);
        }
      } catch (error) {
        console.error('Error loading settings data:', error);
      }
    };
    
    loadData();
  }, []);
  
  const handleToggleSetting = async (key) => {
    try {
      const updatedSettings = {
        ...settings,
        [key]: !settings[key]
      };
      
      setSettings(updatedSettings);
      await storeData('settings', updatedSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };
  
  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to clear all your data? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Clear Data", 
          style: "destructive",
          onPress: async () => {
            try {
              // Keep user data but clear messages and dataSources
              await removeData('messages');
              await removeData('dataSources');
              
              Alert.alert(
                "Data Cleared",
                "All your data has been successfully cleared."
              );
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert(
                "Error",
                "There was an error clearing your data. Please try again."
              );
            }
          }
        }
      ]
    );
  };
  
  const handleResetOnboarding = () => {
    Alert.alert(
      "Reset Onboarding",
      "This will reset your preferences and take you through the onboarding process again. Continue?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Reset", 
          onPress: async () => {
            try {
              await removeData('userData');
              
              // Navigate back to onboarding
              navigation.reset({
                index: 0,
                routes: [{ name: 'Onboarding' }],
              });
            } catch (error) {
              console.error('Error resetting onboarding:', error);
              Alert.alert(
                "Error",
                "There was an error resetting onboarding. Please try again."
              );
            }
          }
        }
      ]
    );
  };
  
  return (
    <GradientBackground>
      <View style={styles.container}>
        <Animated.View style={[styles.header, headerAnim]}>
          <Text style={styles.headerTitle}>SETTINGS</Text>
        </Animated.View>
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* User Profile */}
          <Animated.View style={profileAnim}>
            <GlassmorphicCard style={styles.profileCard}>
              <View style={styles.profileContent}>
                <View style={styles.profileOrbContainer}>
                  <AnimatedOrb size="small" enhanced3d glow />
                </View>
                <View style={styles.profileDetails}>
                  <Text style={styles.profileName}>
                    {userData?.name || 'User'}
                  </Text>
                  <Text style={styles.profileType}>
                    {userData?.tone ? `${userData.tone.charAt(0).toUpperCase() + userData.tone.slice(1)} communication style` : 'No preferences set'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.editProfileButton}
                onPress={handleResetOnboarding}
              >
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </TouchableOpacity>
            </GlassmorphicCard>
          </Animated.View>
          
          {/* App Settings */}
          <Animated.View style={settingsAnim}>
            <Text style={styles.sectionTitle}>APP SETTINGS</Text>
            
            <GlassmorphicCard style={styles.settingsCard}>
              <View style={styles.settingItem}>
                <View style={styles.settingLabelContainer}>
                  <Ionicons name="notifications" size={20} color={theme.colors.text.primary} />
                  <Text style={styles.settingLabel}>Notifications</Text>
                </View>
                <Switch
                  value={settings.notifications}
                  onValueChange={() => handleToggleSetting('notifications')}
                  trackColor={{ 
                    false: 'rgba(255, 255, 255, 0.1)', 
                    true: 'rgba(168, 148, 255, 0.6)' 
                  }}
                  thumbColor={settings.notifications ? theme.colors.accent.primary : 'rgba(255, 255, 255, 0.5)'}
                  ios_backgroundColor="rgba(255, 255, 255, 0.1)"
                />
              </View>
              
              <View style={styles.settingDivider} />
              
              <View style={styles.settingItem}>
                <View style={styles.settingLabelContainer}>
                  <Ionicons name="moon" size={20} color={theme.colors.text.primary} />
                  <Text style={styles.settingLabel}>Dark Mode</Text>
                </View>
                <Switch
                  value={settings.darkMode}
                  onValueChange={() => handleToggleSetting('darkMode')}
                  trackColor={{ 
                    false: 'rgba(255, 255, 255, 0.1)', 
                    true: 'rgba(168, 148, 255, 0.6)' 
                  }}
                  thumbColor={settings.darkMode ? theme.colors.accent.primary : 'rgba(255, 255, 255, 0.5)'}
                  ios_backgroundColor="rgba(255, 255, 255, 0.1)"
                />
              </View>
              
              <View style={styles.settingDivider} />
              
              <View style={styles.settingItem}>
                <View style={styles.settingLabelContainer}>
                  <Ionicons name="analytics" size={20} color={theme.colors.text.primary} />
                  <Text style={styles.settingLabel}>Data Processing</Text>
                </View>
                <Switch
                  value={settings.dataProcessing}
                  onValueChange={() => handleToggleSetting('dataProcessing')}
                  trackColor={{ 
                    false: 'rgba(255, 255, 255, 0.1)', 
                    true: 'rgba(168, 148, 255, 0.6)' 
                  }}
                  thumbColor={settings.dataProcessing ? theme.colors.accent.primary : 'rgba(255, 255, 255, 0.5)'}
                  ios_backgroundColor="rgba(255, 255, 255, 0.1)"
                />
              </View>
              
              <View style={styles.settingDivider} />
              
              <View style={styles.settingItem}>
                <View style={styles.settingLabelContainer}>
                  <Ionicons name="flask" size={20} color={theme.colors.text.primary} />
                  <Text style={styles.settingLabel}>Enhanced Profiling</Text>
                </View>
                <Switch
                  value={settings.enhancedProfiling}
                  onValueChange={() => handleToggleSetting('enhancedProfiling')}
                  trackColor={{ 
                    false: 'rgba(255, 255, 255, 0.1)', 
                    true: 'rgba(168, 148, 255, 0.6)' 
                  }}
                  thumbColor={settings.enhancedProfiling ? theme.colors.accent.primary : 'rgba(255, 255, 255, 0.5)'}
                  ios_backgroundColor="rgba(255, 255, 255, 0.1)"
                />
              </View>
            </GlassmorphicCard>
          </Animated.View>
          
          {/* Data Management */}
          <Animated.View style={actionsAnim}>
            <Text style={styles.sectionTitle}>DATA MANAGEMENT</Text>
            
            <GlassmorphicCard style={styles.dataCard}>
              <TouchableOpacity 
                style={styles.dataAction}
                onPress={() => navigation.navigate('DataConnection')}
              >
                <View style={styles.dataActionLabelContainer}>
                  <Ionicons name="cloud-upload" size={20} color={theme.colors.text.primary} />
                  <Text style={styles.dataActionLabel}>Manage Data Sources</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
              </TouchableOpacity>
              
              <View style={styles.settingDivider} />
              
              <TouchableOpacity 
                style={styles.dataAction}
                onPress={handleClearData}
              >
                <View style={styles.dataActionLabelContainer}>
                  <Ionicons name="trash" size={20} color={theme.colors.text.primary} />
                  <Text style={styles.dataActionLabel}>Clear All Data</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
              </TouchableOpacity>
            </GlassmorphicCard>
            
            {/* About */}
            <Text style={[styles.sectionTitle, styles.aboutTitle]}>ABOUT</Text>
            
            <GlassmorphicCard style={styles.aboutCard}>
              <View style={styles.aboutRow}>
                <Text style={styles.aboutLabel}>Version</Text>
                <Text style={styles.aboutValue}>{version}</Text>
              </View>
              
              <View style={styles.settingDivider} />
              
              <View style={styles.aboutRow}>
                <Text style={styles.aboutLabel}>Build</Text>
                <Text style={styles.aboutValue}>{Platform.OS} {(new Date()).getFullYear()}</Text>
              </View>
            </GlassmorphicCard>
            
            {/* Authentication */}
            <View style={styles.authContainer}>
              {isAuthenticated ? (
                <Button
                  title="Sign Out"
                  variant="outline"
                  size="medium"
                  iconLeft="log-out-outline"
                  onPress={() => {
                    Alert.alert(
                      "Sign Out",
                      "Are you sure you want to sign out?",
                      [
                        { text: "Cancel", style: "cancel" },
                        { 
                          text: "Sign Out", 
                          style: "destructive",
                          onPress: () => signOut()
                        }
                      ]
                    );
                  }}
                  style={styles.authButton}
                />
              ) : (
                <Button
                  title="Sign In"
                  variant="primary"
                  size="medium"
                  iconLeft="log-in-outline"
                  onPress={() => navigation.navigate('Login')}
                  style={styles.authButton}
                />
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  headerTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  profileCard: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  profileOrbContainer: {
    width: 40,
    height: 40,
    marginRight: theme.spacing.md,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.primary,
  },
  profileType: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },
  editProfileButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: 'rgba(168, 148, 255, 0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 148, 255, 0.3)',
  },
  editProfileText: {
    ...theme.typography.styles.caption,
    color: theme.colors.accent.primary,
  },
  sectionTitle: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    letterSpacing: theme.typography.letterSpacing.wide,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  settingsCard: {
    marginBottom: theme.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
  },
  settingDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dataCard: {
    marginBottom: theme.spacing.lg,
  },
  dataAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  dataActionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataActionLabel: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
  },
  aboutTitle: {
    marginTop: theme.spacing.xl,
  },
  aboutCard: {
    marginBottom: theme.spacing.lg,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  aboutLabel: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.secondary,
  },
  aboutValue: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.primary,
  },
});

export default SettingsScreen;