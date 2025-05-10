/**
 * Template selector component for choosing and managing templates
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import GlassmorphicCard from './GlassmorphicCard';
import Button from './Button';
import templateManager from '../templates/templateManager';
import { TEMPLATE_TYPES } from '../templates/templateSchema';

/**
 * Template selector component
 * @param {Object} props - Component props
 * @param {string} props.type - Template type to filter by
 * @param {function} props.onSelectTemplate - Callback when template is selected
 * @param {string} props.activeTemplateId - Currently active template ID
 * @param {Object} props.style - Additional style for the component
 * @returns {React.ReactElement} - Rendered component
 */
export default function TemplateSelector({
  type = TEMPLATE_TYPES.INSIGHT,
  onSelectTemplate,
  activeTemplateId,
  style,
}) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize and load templates
  useEffect(() => {
    const initTemplates = async () => {
      if (!initialized) {
        await templateManager.initialize();
        setInitialized(true);
      }
      
      const templatesOfType = templateManager.getTemplates(type);
      setTemplates(templatesOfType);
      
      // Set active template if it exists
      const activeTemplate = templateManager.getActiveTemplate(type);
      if (activeTemplate) {
        setSelectedTemplate(activeTemplate);
      } else if (templatesOfType.length > 0) {
        // Set first template as selected by default
        setSelectedTemplate(templatesOfType[0]);
      }
    };
    
    initTemplates();
  }, [type, initialized]);

  // Handle template selection
  const handleSelectTemplate = async (template) => {
    setSelectedTemplate(template);
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
    
    // Set as active template
    await templateManager.setActiveTemplate(type, template.id);
  };

  // Show template details
  const showTemplateDetails = (template) => {
    setSelectedTemplate(template);
    setDetailsVisible(true);
  };

  // Render a template card
  const renderTemplateCard = ({ item }) => {
    const isActive = selectedTemplate && selectedTemplate.id === item.id;
    
    return (
      <TouchableOpacity
        style={styles.templateCardContainer}
        onPress={() => handleSelectTemplate(item)}
        onLongPress={() => showTemplateDetails(item)}
      >
        <GlassmorphicCard 
          style={styles.templateCard}
          intensity="medium"
          useBorder={true}
          isActive={isActive}
        >
          <View style={styles.templateHeader}>
            <Ionicons 
              name={item.icon || 'ios-document-text-outline'} 
              size={24} 
              color={isActive ? '#ffffff' : '#cccccc'} 
            />
            <Text style={[styles.templateName, isActive && styles.activeText]}>
              {item.name}
            </Text>
          </View>
          
          <Text style={styles.templateDescription} numberOfLines={2}>
            {item.description}
          </Text>
          
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
          
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </GlassmorphicCard>
      </TouchableOpacity>
    );
  };

  // Template details modal
  const renderTemplateDetails = () => {
    if (!selectedTemplate) return null;
    
    return (
      <Modal
        visible={detailsVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDetailsVisible(false)}
      >
        <BlurView intensity={80} style={styles.modalContainer}>
          <LinearGradient
            colors={['rgba(30, 15, 60, 0.9)', 'rgba(10, 5, 30, 0.95)']}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedTemplate.name}</Text>
              <TouchableOpacity onPress={() => setDetailsVisible(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.sectionText}>{selectedTemplate.description}</Text>
              </View>
              
              {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Tags</Text>
                  <View style={styles.tagsContainer}>
                    {selectedTemplate.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Template Type</Text>
                <Text style={styles.sectionText}>{selectedTemplate.type}</Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Created By</Text>
                <Text style={styles.sectionText}>{selectedTemplate.author}</Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Version</Text>
                <Text style={styles.sectionText}>{selectedTemplate.version}</Text>
              </View>
              
              {selectedTemplate.template.requiredDataFields && selectedTemplate.template.requiredDataFields.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Required Data</Text>
                  <Text style={styles.sectionText}>
                    {selectedTemplate.template.requiredDataFields.join(', ')}
                  </Text>
                </View>
              )}

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Format</Text>
                <Text style={styles.sectionText}>
                  {selectedTemplate.template.outputFormat || 'markdown'}
                </Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>System Prompt</Text>
                <Text style={styles.promptText}>
                  {selectedTemplate.template.systemPrompt}
                </Text>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button 
                title="Select Template" 
                onPress={() => {
                  handleSelectTemplate(selectedTemplate);
                  setDetailsVisible(false);
                }}
                variant="primary"
              />
              <Button 
                title="Cancel" 
                onPress={() => setDetailsVisible(false)}
                variant="outline"
                style={styles.cancelButton}
              />
            </View>
          </LinearGradient>
        </BlurView>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Select Template</Text>
      
      <FlatList
        data={templates}
        renderItem={renderTemplateCard}
        keyExtractor={(item) => item.id}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
      
      {renderTemplateDetails()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  listContent: {
    paddingRight: 20,
  },
  templateCardContainer: {
    marginRight: 12,
    width: 220,
  },
  templateCard: {
    padding: 15,
    height: 140,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#cccccc',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  activeText: {
    color: '#ffffff',
  },
  templateDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  defaultBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(123, 97, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  defaultText: {
    fontSize: 10,
    color: '#b29fff',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  modalBody: {
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  sectionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  promptText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    backgroundColor: 'rgba(123, 97, 255, 0.1)',
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(123, 97, 255, 0.5)',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    marginLeft: 10,
  },
});