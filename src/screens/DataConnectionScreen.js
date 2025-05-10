/**
 * Data Connection Screen
 * Screen for browsing, connecting to, and managing data sources
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import GradientBackground from '../components/GradientBackground';
import GlassmorphicCard from '../components/GlassmorphicCard';
import DataSourceConnector from '../components/DataSourceConnector';
import Button from '../components/Button';
import dataSourceManager, { DATA_SOURCE_TYPES } from '../services/dataSources/dataSourceManager';
import { useAuth } from '../hooks/useAuth';

/**
 * DataConnectionScreen component
 * @returns {React.ReactElement} - Rendered component
 */
export default function DataConnectionScreen({ navigation }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [connectedSources, setConnectedSources] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Load connected sources
  const loadConnectedSources = useCallback(async () => {
    try {
      await dataSourceManager.initialize();
      const sources = dataSourceManager.getConnectedSources();
      setConnectedSources(sources);
    } catch (error) {
      console.error('Failed to load connected sources:', error);
    }
  }, []);
  
  // Load initial data
  useEffect(() => {
    loadConnectedSources();
  }, [loadConnectedSources]);
  
  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadConnectedSources();
    setIsRefreshing(false);
  };
  
  // Handle source connected
  const handleSourceConnected = (source) => {
    // Update the connected sources list
    setConnectedSources(prev => {
      // Add if not already in the list
      if (!prev.find(s => s.id === source.id)) {
        return [...prev, source];
      }
      return prev;
    });
  };
  
  // Handle source disconnected
  const handleSourceDisconnected = (source) => {
    // Remove from connected sources
    setConnectedSources(prev => 
      prev.filter(s => s.id !== source.id)
    );
  };
  
  // Get current tab content
  const getCurrentTabContent = () => {
    switch (activeTab) {
      case 'all':
        return <DataSourceConnector 
          onSourceConnected={handleSourceConnected}
          onSourceDisconnected={handleSourceDisconnected}
        />;
      case 'health':
        return <DataSourceConnector 
          filterType={DATA_SOURCE_TYPES.HEALTH}
          onSourceConnected={handleSourceConnected}
          onSourceDisconnected={handleSourceDisconnected}
        />;
      case 'music':
        return <DataSourceConnector 
          filterType={DATA_SOURCE_TYPES.MUSIC}
          onSourceConnected={handleSourceConnected}
          onSourceDisconnected={handleSourceDisconnected}
        />;
      case 'productivity':
        return <DataSourceConnector 
          filterType={DATA_SOURCE_TYPES.PRODUCTIVITY}
          onSourceConnected={handleSourceConnected}
          onSourceDisconnected={handleSourceDisconnected}
        />;
      case 'social':
        return <DataSourceConnector 
          filterType={DATA_SOURCE_TYPES.SOCIAL}
          onSourceConnected={handleSourceConnected}
          onSourceDisconnected={handleSourceDisconnected}
        />;
      case 'location':
        return <DataSourceConnector 
          filterType={DATA_SOURCE_TYPES.LOCATION}
          onSourceConnected={handleSourceConnected}
          onSourceDisconnected={handleSourceDisconnected}
        />;
      default:
        return <DataSourceConnector 
          onSourceConnected={handleSourceConnected}
          onSourceDisconnected={handleSourceDisconnected}
        />;
    }
  };
  
  // Render a tab button
  const renderTabButton = (id, label, icon) => {
    const isActive = activeTab === id;
    
    return (
      <TouchableOpacity
        style={[styles.tabButton, isActive && styles.activeTabButton]}
        onPress={() => setActiveTab(id)}
      >
        <Ionicons 
          name={icon} 
          size={18} 
          color={isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'} 
        />
        <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // Render the connected sources summary
  const renderConnectedSourcesSummary = () => {
    if (connectedSources.length === 0) {
      return (
        <GlassmorphicCard style={styles.emptySourcesCard}>
          <Ionicons name="cloud-offline-outline" size={36} color="rgba(255, 255, 255, 0.5)" />
          <Text style={styles.emptySourcesText}>
            No data sources connected yet
          </Text>
          <Text style={styles.emptySourcesSubtext}>
            Connect to your favorite services to start generating insights from your data
          </Text>
        </GlassmorphicCard>
      );
    }
    
    return (
      <GlassmorphicCard style={styles.connectedSourcesCard}>
        <View style={styles.connectedSourcesHeader}>
          <Text style={styles.connectedSourcesTitle}>Connected Sources</Text>
          <Text style={styles.connectedSourcesCount}>
            {connectedSources.length} {connectedSources.length === 1 ? 'source' : 'sources'}
          </Text>
        </View>
        
        <View style={styles.connectedSourcesList}>
          {connectedSources.map(source => (
            <View key={source.id} style={styles.connectedSourceItem}>
              <View style={styles.connectedSourceIcon}>
                <Ionicons name={source.icon || 'cube-outline'} size={18} color={source.color || '#FFFFFF'} />
              </View>
              <Text style={styles.connectedSourceName}>{source.name}</Text>
              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={() => {
                  dataSourceManager.disconnectSource(source.id)
                    .then(() => handleSourceDisconnected(source))
                    .catch(error => console.error(`Failed to disconnect ${source.name}:`, error));
                }}
              >
                <Ionicons name="close-circle" size={18} color="rgba(255, 255, 255, 0.5)" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        
        <View style={styles.syncInfoContainer}>
          <Ionicons name="sync-outline" size={16} color="rgba(255, 255, 255, 0.6)" />
          <Text style={styles.syncInfoText}>
            Data sources sync automatically in the background
          </Text>
        </View>
      </GlassmorphicCard>
    );
  };
  
  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Data Sources</Text>
            <Text style={styles.subtitle}>
              Connect your data for personalized insights
            </Text>
          </View>
          
          <Button
            title="Insights"
            variant="outline"
            size="small"
            iconRight="arrow-forward"
            onPress={() => navigation.navigate('InsightsDashboard')}
          />
        </View>
        
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#a388ff"
              colors={["#a388ff"]}
            />
          }
        >
          {/* Connected Sources Summary */}
          {renderConnectedSourcesSummary()}
          
          {/* Category Tabs */}
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
              {renderTabButton('all', 'All Sources', 'apps-outline')}
              {renderTabButton('health', 'Health', 'fitness-outline')}
              {renderTabButton('music', 'Music', 'musical-notes-outline')}
              {renderTabButton('productivity', 'Productivity', 'calendar-outline')}
              {renderTabButton('social', 'Social', 'people-outline')}
              {renderTabButton('location', 'Location', 'navigate-outline')}
            </ScrollView>
          </View>
          
          {/* Data Source Connector */}
          <View style={styles.connectorContainer}>
            {getCurrentTabContent()}
          </View>
        </ScrollView>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 5,
  },
  content: {
    paddingBottom: 80,
  },
  emptySourcesCard: {
    alignItems: 'center',
    padding: 25,
    marginBottom: 20,
  },
  emptySourcesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySourcesSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  connectedSourcesCard: {
    padding: 15,
    marginBottom: 20,
  },
  connectedSourcesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  connectedSourcesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  connectedSourcesCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  connectedSourcesList: {
    marginBottom: 15,
  },
  connectedSourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  connectedSourceIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  connectedSourceName: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  disconnectButton: {
    padding: 5,
  },
  syncInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    borderRadius: 10,
  },
  syncInfoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 5,
  },
  tabsContainer: {
    marginBottom: 20,
  },
  tabsScroll: {
    paddingVertical: 10,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  activeTabButton: {
    backgroundColor: 'rgba(163, 136, 255, 0.3)',
  },
  tabButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 5,
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  connectorContainer: {
    flex: 1,
    minHeight: 300,
  },
});