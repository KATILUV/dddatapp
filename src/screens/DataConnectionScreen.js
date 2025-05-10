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
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import GlassmorphicCard from '../components/GlassmorphicCard';
import Button from '../components/Button';
import DataConnectionVisualizer from '../components/DataConnectionVisualizer';
import theme from '../theme';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

/**
 * Data Connection screen for managing data sources
 * @returns {React.ReactElement} - Rendered component
 */
const DataConnectionScreen = ({ navigation }) => {
  const { user, isAuthenticated } = useAuth();
  const [dataSources, setDataSources] = useState([]);
  const [connectedSources, setConnectedSources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Available data source providers
  const dataSourceProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: 'logo-google',
      description: 'Search history, Gmail, Calendar, and more',
      color: '#DB4437'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: 'logo-twitter',
      description: 'Tweets, likes, follows, and interests',
      color: '#1DA1F2'
    },
    {
      id: 'spotify',
      name: 'Spotify',
      icon: 'musical-notes',
      description: 'Music preferences, playlists, and listening habits',
      color: '#1DB954'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: 'logo-instagram',
      description: 'Photos, comments, likes, and interactions',
      color: '#E1306C'
    },
  ];
  
  // Fetch user's connected data sources on load
  useEffect(() => {
    const fetchDataSources = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data = await api.getDataSources();
        setConnectedSources(data);
      } catch (error) {
        console.error('Error fetching data sources:', error);
        Alert.alert('Error', 'Failed to fetch your connected data sources.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDataSources();
  }, [isAuthenticated, user]);
  
  /**
   * Handles file upload for a specific data source
   * @param {string} sourceId - ID of the data source to upload to
   */
  const handleFileUpload = async (sourceId) => {
    // This would be implemented using document picker in a real app
    Alert.alert(
      'Upload Files',
      'In a real app, this would open a document picker for uploading files.',
      [{ text: 'OK' }]
    );
  };
  
  /**
   * Handle removing a data source
   * @param {string} sourceId - ID of the source to remove
   */
  const handleRemoveSource = async (sourceId) => {
    Alert.alert(
      'Remove Data Source',
      'Are you sure you want to disconnect this data source? This will remove all associated data and insights.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              // Find the source in our connected sources
              const source = connectedSources.find(s => s.sourceType === sourceId);
              if (source) {
                await api.removeDataSource(source.id);
                setConnectedSources(connectedSources.filter(s => s.id !== source.id));
              }
            } catch (error) {
              console.error('Error removing data source:', error);
              Alert.alert('Error', 'Failed to remove the data source.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };
  
  // Connect a new data source
  const handleConnectSource = async (sourceId) => {
    try {
      setLoading(true);
      // Get the provider details for the name
      const provider = dataSourceProviders.find(p => p.id === sourceId) || { name: sourceId };
      
      // Add the data source with the API
      const newSource = await api.addDataSource({
        name: provider.name,
        sourceType: sourceId,
        status: 'connected',
        lastSynced: new Date().toISOString(),
        dataSize: Math.floor(Math.random() * 10000) // Random size for demo
      });
      
      // Add to the local state to show immediately
      setConnectedSources(prev => [...prev, newSource]);
      
      Alert.alert('Success', `Connected to ${provider.name} successfully!`);
    } catch (error) {
      console.error('Error connecting to data source:', error);
      Alert.alert('Error', 'Failed to connect to the selected service.');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Format file size to human-readable string
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted file size (e.g., "2.5 MB")
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
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
  
  // Render each connected data source
  const renderConnectedSource = (source, index) => {
    // Find the provider details
    const provider = dataSourceProviders.find(p => p.id === source.sourceType) || {
      name: source.displayName,
      icon: 'cloud-outline',
      color: theme.colors.accent.tertiary,
    };
    
    return (
      <GlassmorphicCard 
        key={source.id || index}
        style={styles.connectedSourceCard}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: provider.color }]}>
            <Ionicons name={provider.icon} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{source.displayName}</Text>
            <Text style={styles.cardSubtitle}>
              Connected on {formatDate(source.createdAt)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleRemoveSource(source.sourceType)}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.cardDivider} />
        
        <View style={styles.cardFooter}>
          <Text style={styles.lastSyncText}>
            {source.lastSynced 
              ? `Last synchronized: ${formatDate(source.lastSynced)}`
              : 'Not yet synchronized'
            }
          </Text>
          
          <TouchableOpacity
            onPress={() => handleFileUpload(source.sourceType)}
            style={styles.uploadButton}
          >
            <Ionicons name="cloud-upload-outline" size={16} color={theme.colors.text.primary} />
            <Text style={styles.uploadButtonText}>Upload Files</Text>
          </TouchableOpacity>
        </View>
      </GlassmorphicCard>
    );
  };
  
  // Render each available data source
  const renderAvailableSource = (provider) => {
    // Check if already connected
    const isConnected = connectedSources.some(s => s.sourceType === provider.id);
    
    if (isConnected) return null;
    
    return (
      <TouchableOpacity
        key={provider.id}
        onPress={() => handleConnectSource(provider.id)}
        style={styles.availableSourceWrapper}
      >
        <GlassmorphicCard style={styles.availableSourceCard}>
          <View style={styles.availableSourceContent}>
            <View style={[styles.iconContainer, { backgroundColor: provider.color }]}>
              <Ionicons name={provider.icon} size={24} color="#FFFFFF" />
            </View>
            <View style={styles.availableSourceTextContainer}>
              <Text style={styles.availableSourceTitle}>{provider.name}</Text>
              <Text style={styles.availableSourceDescription}>{provider.description}</Text>
            </View>
            <Ionicons name="add-circle" size={24} color={theme.colors.accent.primary} />
          </View>
        </GlassmorphicCard>
      </TouchableOpacity>
    );
  };
  
  if (!isAuthenticated) {
    return (
      <GradientBackground>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Login Required</Text>
          <Text style={styles.emptyText}>
            Please log in to access and manage your data connections.
          </Text>
          <Button
            title="Log In"
            onPress={() => navigation.navigate('Login')}
            variant="primary"
            style={styles.loginButton}
          />
        </View>
      </GradientBackground>
    );
  }
  
  return (
    <GradientBackground>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent.primary} />
          <Text style={styles.loadingText}>Loading your data connections...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Your Data Connections</Text>
            <Text style={styles.subtitle}>
              Connect your data from various services to generate deeper insights. 
              Your data is analyzed securely on-device and never shared.
            </Text>
          </View>
          
          {/* Visualizer */}
          <DataConnectionVisualizer 
            dataSources={connectedSources}
            insights={[]} // We'll implement insights fetching later
            style={styles.visualizer}
          />
          
          {connectedSources.length > 0 ? (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Connected Sources</Text>
              <View style={styles.connectedSourcesContainer}>
                {connectedSources.map(renderConnectedSource)}
              </View>
            </View>
          ) : (
            <View style={styles.emptySourcesContainer}>
              <Ionicons name="cloud-offline-outline" size={48} color={theme.colors.text.secondary} />
              <Text style={styles.emptyTitle}>No Connected Sources</Text>
              <Text style={styles.emptyText}>
                Connect your first data source to start generating insights
              </Text>
            </View>
          )}
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Available Sources</Text>
            <View style={styles.availableSourcesContainer}>
              {dataSourceProviders.map(renderAvailableSource)}
            </View>
          </View>
        </ScrollView>
      )}
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  visualizer: {
    marginVertical: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.styles.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.secondary,
    lineHeight: theme.lineHeights.body * 1.1,
  },
  sectionContainer: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  connectedSourcesContainer: {
    gap: theme.spacing.md,
  },
  connectedSourceCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleContainer: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  cardTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.primary,
  },
  cardSubtitle: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.tertiary,
  },
  actionButton: {
    padding: theme.spacing.sm,
  },
  cardDivider: {
    height: 1,
    backgroundColor: theme.colors.background.tertiary,
    marginVertical: theme.spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastSyncText: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.tertiary,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  uploadButtonText: {
    ...theme.typography.styles.buttonSmall,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.xs,
  },
  availableSourcesContainer: {
    gap: theme.spacing.md,
  },
  availableSourceWrapper: {
    marginBottom: theme.spacing.sm,
  },
  availableSourceCard: {
    padding: theme.spacing.md,
  },
  availableSourceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availableSourceTextContainer: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  availableSourceTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.primary,
  },
  availableSourceDescription: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptySourcesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  emptyTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  loginButton: {
    marginTop: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
});

export default DataConnectionScreen;