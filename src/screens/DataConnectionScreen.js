/**
 * Data Connection screen for uploading and managing user data sources
 */
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import GradientBackground from '../components/GradientBackground';
import GlassmorphicCard from '../components/GlassmorphicCard';
import Button from '../components/Button';
import theme from '../theme';
import { fadeInUp } from '../utils/animations';
import { getData, storeData } from '../utils/storage';

/**
 * Data Connection screen for managing data sources
 * @returns {React.ReactElement} - Rendered component
 */
const DataConnectionScreen = ({ navigation }) => {
  const [dataSources, setDataSources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  
  // Animation values
  const headerAnim = fadeInUp(100);
  const introAnim = fadeInUp(300);
  const sourcesAnim = fadeInUp(500);
  
  // Load data sources on component mount
  useEffect(() => {
    const loadDataSources = async () => {
      try {
        const storedSources = await getData('dataSources');
        if (storedSources) {
          setDataSources(storedSources);
        }
      } catch (error) {
        console.error('Error loading data sources:', error);
      }
    };
    
    loadDataSources();
  }, []);
  
  // Data source definitions
  const availableSources = [
    {
      id: 'social-media',
      title: 'Social Media',
      description: 'Import data from Instagram, Twitter, or Facebook exports',
      icon: 'people',
      supported: ['json', 'csv', 'zip'],
    },
    {
      id: 'notes',
      title: 'Notes & Journals',
      description: 'Upload exported notes from Apple Notes, Google Keep, or text files',
      icon: 'document-text',
      supported: ['txt', 'json', 'md', 'csv'],
    },
    {
      id: 'email',
      title: 'Email Archives',
      description: 'Analyze patterns from email exports (Gmail, Outlook)',
      icon: 'mail',
      supported: ['mbox', 'eml', 'csv', 'json'],
    },
    {
      id: 'fitness',
      title: 'Fitness & Health',
      description: 'Connect with Apple Health, Fitbit, or Google Fit exports',
      icon: 'fitness',
      supported: ['xml', 'json', 'csv'],
    },
  ];
  
  /**
   * Handles file upload for a specific data source
   * @param {string} sourceId - ID of the data source to upload to
   */
  const handleUpload = async (sourceId) => {
    try {
      setIsLoading(true);
      
      // Pick a document
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled || !result.assets || result.assets.length === 0) {
        setIsLoading(false);
        return;
      }
      
      const file = result.assets[0];
      const source = availableSources.find(s => s.id === sourceId);
      
      // Check if file extension is supported
      const fileExt = file.name.split('.').pop().toLowerCase();
      if (source && !source.supported.includes(fileExt)) {
        setActionMessage(`Unsupported file type. Please upload a ${source.supported.join(', ')} file.`);
        setIsLoading(false);
        setTimeout(() => setActionMessage(''), 3000);
        return;
      }
      
      // Create a new data source entry
      const newSource = {
        id: `${sourceId}-${Date.now()}`,
        sourceType: sourceId,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        fileUri: file.uri,
        fileSize: file.size,
      };
      
      // Add to data sources state
      const updatedSources = [...dataSources, newSource];
      setDataSources(updatedSources);
      
      // Store updated sources
      await storeData('dataSources', updatedSources);
      
      setActionMessage('Data source added successfully!');
      setTimeout(() => setActionMessage(''), 3000);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      setActionMessage('Error uploading file. Please try again.');
      setTimeout(() => setActionMessage(''), 3000);
      setIsLoading(false);
    }
  };
  
  /**
   * Handle removing a data source
   * @param {string} sourceId - ID of the source to remove
   */
  const handleRemoveSource = async (sourceId) => {
    try {
      setIsLoading(true);
      
      // Filter out the source to remove
      const updatedSources = dataSources.filter(source => source.id !== sourceId);
      setDataSources(updatedSources);
      
      // Store updated sources
      await storeData('dataSources', updatedSources);
      
      setActionMessage('Data source removed.');
      setTimeout(() => setActionMessage(''), 3000);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error removing data source:', error);
      setActionMessage('Error removing data source. Please try again.');
      setTimeout(() => setActionMessage(''), 3000);
      setIsLoading(false);
    }
  };
  
  /**
   * Format file size to human-readable string
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted file size (e.g., "2.5 MB")
   */
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  /**
   * Format date to human-readable string
   * @param {string} dateString - ISO date string
   * @returns {string} - Formatted date (e.g., "May 10, 2023")
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  return (
    <GradientBackground>
      <View style={styles.container}>
        <Animated.View style={[styles.header, headerAnim]}>
          <Text style={styles.headerTitle}>DATA SOURCES</Text>
        </Animated.View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Intro section */}
          <Animated.View style={introAnim}>
            <GlassmorphicCard style={styles.introCard}>
              <Text style={styles.introTitle}>Connect Your Data</Text>
              <Text style={styles.introText}>
                Upload your personal data exports for Voa to analyze and generate insights. All data remains on your device.
              </Text>
              <View style={styles.privacyBadge}>
                <Ionicons name="shield-checkmark" size={14} color={theme.colors.success.default} />
                <Text style={styles.privacyText}>Private &amp; Secure</Text>
              </View>
            </GlassmorphicCard>
          </Animated.View>
          
          {/* Data sources section */}
          <Animated.View style={sourcesAnim}>
            <Text style={styles.sectionTitle}>AVAILABLE SOURCES</Text>
            
            {availableSources.map((source) => (
              <GlassmorphicCard key={source.id} style={styles.sourceCard}>
                <View style={styles.sourceHeader}>
                  <View style={styles.sourceIconContainer}>
                    <Ionicons name={source.icon} size={24} color={theme.colors.accent.primary} />
                  </View>
                  <View style={styles.sourceDetails}>
                    <Text style={styles.sourceTitle}>{source.title}</Text>
                    <Text style={styles.sourceDescription}>{source.description}</Text>
                  </View>
                </View>
                
                <View style={styles.sourceActions}>
                  <Text style={styles.supportedText}>
                    Supports: {source.supported.join(', ')}
                  </Text>
                  <Button
                    title="Upload"
                    onPress={() => handleUpload(source.id)}
                    variant="outline"
                    size="small"
                    iconLeft="cloud-upload"
                    disabled={isLoading}
                  />
                </View>
                
                {/* Connected sources list */}
                {dataSources
                  .filter(ds => ds.sourceType === source.id)
                  .map(connectedSource => (
                    <View key={connectedSource.id} style={styles.connectedSource}>
                      <View style={styles.connectedSourceInfo}>
                        <Ionicons name="document" size={16} color={theme.colors.text.secondary} />
                        <View style={styles.connectedSourceDetails}>
                          <Text style={styles.connectedSourceName} numberOfLines={1}>
                            {connectedSource.fileName}
                          </Text>
                          <Text style={styles.connectedSourceMeta}>
                            {formatFileSize(connectedSource.fileSize)} • {formatDate(connectedSource.uploadDate)}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveSource(connectedSource.id)}
                      >
                        <Ionicons name="close" size={16} color={theme.colors.text.tertiary} />
                      </TouchableOpacity>
                    </View>
                  ))
                }
              </GlassmorphicCard>
            ))}
          </Animated.View>
        </ScrollView>
        
        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.accent.primary} />
          </View>
        )}
        
        {/* Action message */}
        {actionMessage ? (
          <View style={styles.actionMessage}>
            <Text style={styles.actionMessageText}>{actionMessage}</Text>
          </View>
        ) : null}
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
  introCard: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  introTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  introText: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 196, 182, 0.1)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  privacyText: {
    ...theme.typography.styles.caption,
    color: theme.colors.success.default,
    marginLeft: theme.spacing.xs,
  },
  sectionTitle: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    letterSpacing: theme.typography.letterSpacing.wide,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  sourceCard: {
    marginBottom: theme.spacing.md,
  },
  sourceHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  sourceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(168, 148, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  sourceDetails: {
    flex: 1,
  },
  sourceTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  sourceDescription: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.secondary,
  },
  sourceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  supportedText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
  },
  connectedSource: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  connectedSourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  connectedSourceDetails: {
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  connectedSourceName: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.primary,
  },
  connectedSourceMeta: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11, 11, 35, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  actionMessage: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: 'rgba(168, 148, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent.primary,
  },
  actionMessageText: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.primary,
  },
});

export default DataConnectionScreen;