/**
 * Custom hook for managing data sources with offline support
 */
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useOffline } from '../contexts/OfflineContext';

const useDataSources = () => {
  // State
  const [dataSources, setDataSources] = useState([]);
  const [filteredSources, setFilteredSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: null,
    status: null,
    searchQuery: '',
  });
  
  // Offline context
  const { 
    fetchWithOfflineSupport, 
    performOfflineAction,
    isOnline
  } = useOffline();
  
  // Fetch data sources with offline support
  const fetchDataSources = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const result = await fetchWithOfflineSupport('/api/data-sources', {}, 'dataSources');
      
      if (result && result.data) {
        setDataSources(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch data sources:', error);
      Alert.alert(
        'Error',
        'Failed to load data sources. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithOfflineSupport]);
  
  // Initial fetch
  useEffect(() => {
    fetchDataSources();
  }, [fetchDataSources]);
  
  // Apply filters when data sources or filters change
  useEffect(() => {
    let filtered = [...dataSources];
    
    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(source => source.sourceType === filters.type);
    }
    
    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(source => source.status === filters.status);
    }
    
    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(source =>
        source.name.toLowerCase().includes(query)
      );
    }
    
    // Sort by freshness (most recent first)
    filtered.sort((a, b) => {
      // Sort by connection status first (connected sources first)
      if (a.status === 'connected' && b.status !== 'connected') return -1;
      if (a.status !== 'connected' && b.status === 'connected') return 1;
      
      // Then by data freshness
      const aFreshness = a.dataFreshness || 0;
      const bFreshness = b.dataFreshness || 0;
      return bFreshness - aFreshness;
    });
    
    setFilteredSources(filtered);
  }, [dataSources, filters]);
  
  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);
  
  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      type: null,
      status: null,
      searchQuery: '',
    });
  }, []);
  
  // Get source types and statuses from data sources
  const getMetadata = useCallback(() => {
    const types = new Set();
    const statuses = new Set();
    
    dataSources.forEach(source => {
      if (source.sourceType) types.add(source.sourceType);
      if (source.status) statuses.add(source.status);
    });
    
    return {
      types: [...types],
      statuses: [...statuses]
    };
  }, [dataSources]);
  
  // Add a new data source
  const addDataSource = useCallback(async (sourceData) => {
    try {
      // Perform the action with offline support
      const result = await performOfflineAction(
        'add',
        'dataSource',
        sourceData
      );
      
      if (result.success) {
        // Refresh data sources list
        await fetchDataSources();
      } else {
        Alert.alert(
          'Error',
          'Failed to add data source. Please try again later.',
          [{ text: 'OK' }]
        );
      }
      
      return result.success;
    } catch (error) {
      console.error('Failed to add data source:', error);
      
      Alert.alert(
        'Error',
        'Failed to add data source. Please try again later.',
        [{ text: 'OK' }]
      );
      
      return false;
    }
  }, [performOfflineAction, fetchDataSources]);
  
  // Update a data source
  const updateDataSource = useCallback(async (sourceId, sourceData) => {
    try {
      // Optimistic update
      setDataSources(prev => prev.map(source => 
        source.id === sourceId 
          ? { ...source, ...sourceData } 
          : source
      ));
      
      // Perform the action with offline support
      const result = await performOfflineAction(
        'update',
        'dataSource',
        { id: sourceId, ...sourceData }
      );
      
      if (!result.success) {
        // Refresh to get accurate data if update failed
        await fetchDataSources();
        
        Alert.alert(
          'Error',
          'Failed to update data source. Please try again later.',
          [{ text: 'OK' }]
        );
      }
      
      return result.success;
    } catch (error) {
      console.error('Failed to update data source:', error);
      
      // Refresh to get accurate data
      await fetchDataSources();
      
      Alert.alert(
        'Error',
        'Failed to update data source. Please try again later.',
        [{ text: 'OK' }]
      );
      
      return false;
    }
  }, [performOfflineAction, fetchDataSources]);
  
  // Remove a data source
  const removeDataSource = useCallback(async (sourceId) => {
    try {
      // Optimistic update
      setDataSources(prev => prev.filter(source => source.id !== sourceId));
      
      // Perform the action with offline support
      const result = await performOfflineAction(
        'delete',
        'dataSource',
        { id: sourceId }
      );
      
      if (!result.success) {
        // Refresh to get accurate data if remove failed
        await fetchDataSources();
        
        Alert.alert(
          'Error',
          'Failed to remove data source. Please try again later.',
          [{ text: 'OK' }]
        );
      }
      
      return result.success;
    } catch (error) {
      console.error('Failed to remove data source:', error);
      
      // Refresh to get accurate data
      await fetchDataSources();
      
      Alert.alert(
        'Error',
        'Failed to remove data source. Please try again later.',
        [{ text: 'OK' }]
      );
      
      return false;
    }
  }, [performOfflineAction, fetchDataSources]);
  
  // Refresh a data source
  const refreshDataSource = useCallback(async (sourceId) => {
    if (!isOnline) {
      Alert.alert(
        'Offline',
        'Refreshing data sources requires an internet connection.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    try {
      // Update source status to show refreshing
      setDataSources(prev => prev.map(source => 
        source.id === sourceId 
          ? { ...source, status: 'refreshing' } 
          : source
      ));
      
      // Perform the action with offline support
      const result = await performOfflineAction(
        'refresh',
        'dataSource',
        { id: sourceId }
      );
      
      // Refresh the list regardless of result
      await fetchDataSources();
      
      if (!result.success) {
        Alert.alert(
          'Error',
          'Failed to refresh data source. Please try again later.',
          [{ text: 'OK' }]
        );
      }
      
      return result.success;
    } catch (error) {
      console.error('Failed to refresh data source:', error);
      
      // Refresh to get accurate data
      await fetchDataSources();
      
      Alert.alert(
        'Error',
        'Failed to refresh data source. Please try again later.',
        [{ text: 'OK' }]
      );
      
      return false;
    }
  }, [performOfflineAction, fetchDataSources, isOnline]);
  
  // Schedule data source sync
  const scheduleDataSourceSync = useCallback(async (sourceId, frequency) => {
    try {
      // Optimistic update
      setDataSources(prev => prev.map(source => 
        source.id === sourceId 
          ? { ...source, syncFrequency: frequency } 
          : source
      ));
      
      // Perform the action with offline support
      const result = await performOfflineAction(
        'schedule',
        'dataSource',
        { id: sourceId, frequency }
      );
      
      if (!result.success) {
        // Refresh to get accurate data if update failed
        await fetchDataSources();
        
        Alert.alert(
          'Error',
          'Failed to schedule data source sync. Please try again later.',
          [{ text: 'OK' }]
        );
      }
      
      return result.success;
    } catch (error) {
      console.error('Failed to schedule data source sync:', error);
      
      // Refresh to get accurate data
      await fetchDataSources();
      
      Alert.alert(
        'Error',
        'Failed to schedule data source sync. Please try again later.',
        [{ text: 'OK' }]
      );
      
      return false;
    }
  }, [performOfflineAction, fetchDataSources]);
  
  // Get freshness label for a data source
  const getFreshnessLabel = useCallback((dataSource) => {
    if (!dataSource.lastSynced) {
      return 'Never synced';
    }
    
    const freshness = dataSource.dataFreshness || 0;
    
    if (freshness > 80) return 'Up to date';
    if (freshness > 50) return 'Recent';
    if (freshness > 20) return 'Needs refresh';
    return 'Outdated';
  }, []);
  
  return {
    dataSources: filteredSources,
    allDataSources: dataSources,
    isLoading,
    filters,
    updateFilters,
    resetFilters,
    refreshDataSources: fetchDataSources,
    getMetadata,
    addDataSource,
    updateDataSource,
    removeDataSource,
    refreshDataSource,
    scheduleDataSourceSync,
    getFreshnessLabel
  };
};

export default useDataSources;