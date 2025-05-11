/**
 * Custom hook for accessing and managing data sources
 * Handles offline-first logic and synchronization
 */
import { useState, useEffect, useCallback } from 'react';
import { useOffline } from '../contexts/OfflineContext';

/**
 * Hook for fetching and managing data sources
 * @param {Object} options - Configuration options
 * @param {string} options.type - Filter by source type
 * @returns {Object} - Data sources and management functions
 */
export default function useDataSources({ 
  type = null
} = {}) {
  // State
  const [dataSources, setDataSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  
  // Get offline context
  const { 
    isOnline, 
    saveDataSources, 
    getDataSources, 
    queueOfflineAction, 
    syncNow 
  } = useOffline();
  
  /**
   * Fetch data sources from API or local storage
   */
  const fetchDataSources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let fetchedSources = [];
      
      if (isOnline) {
        // Fetch from API based on filters
        let endpoint = '/api/data-sources';
        
        if (type) {
          endpoint = `/api/data-sources/type/${type}`;
        }
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        fetchedSources = await response.json();
        
        // Update local storage
        await saveDataSources(fetchedSources);
      } else {
        // Fetch from local storage
        const storedSources = await getDataSources();
        
        if (!storedSources) {
          throw new Error('No data sources available offline');
        }
        
        // Apply filters client-side
        fetchedSources = storedSources.filter(source => {
          // Apply type filter
          if (type && source.type !== type) {
            return false;
          }
          
          return true;
        });
      }
      
      setDataSources(fetchedSources);
      setLastFetched(new Date());
    } catch (error) {
      console.error('Error fetching data sources:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [type, isOnline]);
  
  // Fetch data sources on mount and when filters change
  useEffect(() => {
    fetchDataSources();
  }, [fetchDataSources]);
  
  /**
   * Add a new data source
   * @param {Object} sourceData - Data source details
   * @returns {Promise<Object|null>} - Created data source or null if failed
   */
  const addDataSource = useCallback(async (sourceData) => {
    try {
      if (isOnline) {
        // Send to API
        const response = await fetch('/api/data-sources', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sourceData),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const newSource = await response.json();
        
        // Update state
        setDataSources(prev => [...prev, newSource]);
        
        // Update local storage
        const storedSources = await getDataSources();
        if (storedSources) {
          await saveDataSources([...storedSources, newSource]);
        }
        
        return newSource;
      } else {
        // Generate temporary ID for optimistic UI
        const tempId = `temp-${Date.now()}`;
        const tempSource = {
          ...sourceData,
          id: tempId,
          temporaryId: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Queue offline action
        await queueOfflineAction({
          type: 'ADD_DATA_SOURCE',
          data: sourceData,
        });
        
        // Update state
        setDataSources(prev => [...prev, tempSource]);
        
        // Update local storage
        const storedSources = await getDataSources();
        if (storedSources) {
          await saveDataSources([...storedSources, tempSource]);
        }
        
        return tempSource;
      }
    } catch (error) {
      console.error('Error adding data source:', error);
      setError(error.message);
      return null;
    }
  }, [isOnline]);
  
  /**
   * Update an existing data source
   * @param {number} id - Data source ID
   * @param {Object} sourceData - Updated data source details
   * @returns {Promise<Object|null>} - Updated data source or null if failed
   */
  const updateDataSource = useCallback(async (id, sourceData) => {
    try {
      // Optimistically update UI
      const updatedSource = {
        ...sourceData,
        id,
        updatedAt: new Date().toISOString(),
      };
      
      setDataSources(prev => 
        prev.map(source => 
          source.id === id 
            ? { ...source, ...updatedSource }
            : source
        )
      );
      
      if (isOnline) {
        // Send to API
        const response = await fetch(`/api/data-sources/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sourceData),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Update state with returned data
        setDataSources(prev => 
          prev.map(source => 
            source.id === id 
              ? result 
              : source
          )
        );
        
        // Update local storage
        const storedSources = await getDataSources();
        if (storedSources) {
          await saveDataSources(
            storedSources.map(source => 
              source.id === id 
                ? result 
                : source
            )
          );
        }
        
        return result;
      } else {
        // Queue offline action
        await queueOfflineAction({
          type: 'UPDATE_DATA_SOURCE',
          data: { id, ...sourceData },
        });
        
        // Update local storage
        const storedSources = await getDataSources();
        if (storedSources) {
          await saveDataSources(
            storedSources.map(source => 
              source.id === id 
                ? { ...source, ...updatedSource }
                : source
            )
          );
        }
        
        return updatedSource;
      }
    } catch (error) {
      console.error('Error updating data source:', error);
      
      // Revert optimistic update
      await fetchDataSources();
      
      setError(error.message);
      return null;
    }
  }, [isOnline, fetchDataSources]);
  
  /**
   * Delete a data source
   * @param {number} id - Data source ID
   * @returns {Promise<boolean>} - Whether deletion was successful
   */
  const deleteDataSource = useCallback(async (id) => {
    try {
      // Keep copy for rollback
      const sourceToDelete = dataSources.find(source => source.id === id);
      
      // Optimistically update UI
      setDataSources(prev => prev.filter(source => source.id !== id));
      
      if (isOnline) {
        // Send to API
        const response = await fetch(`/api/data-sources/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        // Update local storage
        const storedSources = await getDataSources();
        if (storedSources) {
          await saveDataSources(
            storedSources.filter(source => source.id !== id)
          );
        }
        
        return true;
      } else {
        // Queue offline action
        await queueOfflineAction({
          type: 'DELETE_DATA_SOURCE',
          data: { id },
        });
        
        // Update local storage
        const storedSources = await getDataSources();
        if (storedSources) {
          await saveDataSources(
            storedSources.filter(source => source.id !== id)
          );
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error deleting data source:', error);
      
      // Revert optimistic update
      await fetchDataSources();
      
      setError(error.message);
      return false;
    }
  }, [isOnline, dataSources, fetchDataSources]);
  
  /**
   * Refresh a data source
   * @param {number} id - Data source ID
   * @returns {Promise<Object|null>} - Refreshed data source or null if failed
   */
  const refreshDataSource = useCallback(async (id) => {
    try {
      if (!isOnline) {
        throw new Error('Cannot refresh data source while offline');
      }
      
      // Send to API
      const response = await fetch(`/api/data-sources/${id}/refresh`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const refreshedSource = await response.json();
      
      // Update state
      setDataSources(prev => 
        prev.map(source => 
          source.id === id 
            ? refreshedSource 
            : source
        )
      );
      
      // Update local storage
      const storedSources = await getDataSources();
      if (storedSources) {
        await saveDataSources(
          storedSources.map(source => 
            source.id === id 
              ? refreshedSource 
              : source
          )
        );
      }
      
      return refreshedSource;
    } catch (error) {
      console.error('Error refreshing data source:', error);
      setError(error.message);
      return null;
    }
  }, [isOnline]);
  
  /**
   * Set sync schedule for a data source
   * @param {number} id - Data source ID
   * @param {string} frequency - Sync frequency (hourly, daily, weekly, monthly)
   * @returns {Promise<Object|null>} - Updated data source or null if failed
   */
  const setSourceSyncSchedule = useCallback(async (id, frequency) => {
    try {
      if (!isOnline) {
        throw new Error('Cannot set sync schedule while offline');
      }
      
      // Send to API
      const response = await fetch(`/api/data-sources/${id}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ frequency }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const updatedSource = await response.json();
      
      // Update state
      setDataSources(prev => 
        prev.map(source => 
          source.id === id 
            ? updatedSource 
            : source
        )
      );
      
      // Update local storage
      const storedSources = await getDataSources();
      if (storedSources) {
        await saveDataSources(
          storedSources.map(source => 
            source.id === id 
              ? updatedSource 
              : source
          )
        );
      }
      
      return updatedSource;
    } catch (error) {
      console.error('Error setting sync schedule:', error);
      setError(error.message);
      return null;
    }
  }, [isOnline]);
  
  /**
   * Get a specific data source by ID
   * @param {number} id - Data source ID
   * @returns {Promise<Object|null>} - Data source or null if not found
   */
  const getDataSourceById = useCallback(async (id) => {
    try {
      if (isOnline) {
        // Fetch from API
        const response = await fetch(`/api/data-sources/${id}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
      } else {
        // Check if source is already in state
        const foundSource = dataSources.find(source => source.id === id);
        if (foundSource) return foundSource;
        
        // Fetch from local storage
        const storedSources = await getDataSources();
        if (!storedSources) return null;
        
        return storedSources.find(source => source.id === id) || null;
      }
    } catch (error) {
      console.error('Error getting data source by ID:', error);
      setError(error.message);
      return null;
    }
  }, [isOnline, dataSources]);
  
  /**
   * Force refresh data sources
   */
  const refreshDataSources = useCallback(async () => {
    // If we're offline, try to sync first
    if (!isOnline) {
      await syncNow();
    }
    
    await fetchDataSources();
  }, [isOnline, fetchDataSources, syncNow]);
  
  return {
    dataSources,
    isLoading,
    error,
    lastFetched,
    refreshDataSources,
    addDataSource,
    updateDataSource,
    deleteDataSource,
    refreshDataSource,
    setSourceSyncSchedule,
    getDataSourceById,
  };
}