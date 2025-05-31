import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';

const SettingsScreen: React.FC = () => {
  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [dataCollection, setDataCollection] = useState(true);
  
  // Placeholder function for clearing data
  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all your emotion data? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: () => {
            // In a real app, this would clear the user's data
            Alert.alert('Success', 'All data has been cleared');
          },
        },
      ]
    );
  };
  
  // Placeholder function for exports
  const handleExportData = () => {
    Alert.alert('Export', 'Your data will be exported (feature not implemented)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        {/* General settings */}
        <View style={styles.settingsGroup}>
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="notifications" size={22} color={theme.colors.primary} />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.colors.lightGray, true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="moon" size={22} color={theme.colors.primary} />
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: theme.colors.lightGray, true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="location" size={22} color={theme.colors.primary} />
              <Text style={styles.settingLabel}>Location Tracking</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: theme.colors.lightGray, true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>
        
        {/* Privacy settings */}
        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        <View style={styles.settingsGroup}>
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="finger-print" size={22} color={theme.colors.primary} />
              <Text style={styles.settingLabel}>Biometric Authentication</Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ false: theme.colors.lightGray, true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="analytics" size={22} color={theme.colors.primary} />
              <Text style={styles.settingLabel}>Anonymous Data Collection</Text>
            </View>
            <Switch
              value={dataCollection}
              onValueChange={setDataCollection}
              trackColor={{ false: theme.colors.lightGray, true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>
        
        {/* Data management */}
        <Text style={styles.sectionTitle}>Data Management</Text>
        <View style={styles.settingsGroup}>
          <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="download" size={22} color={theme.colors.primary} />
              <Text style={styles.settingLabel}>Export Your Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]} 
            onPress={handleClearData}
          >
            <View style={styles.settingLabelContainer}>
              <Ionicons name="trash" size={22} color={theme.colors.error} />
              <Text style={[styles.settingLabel, styles.dangerText]}>Clear All Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
        
        {/* About section */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.settingsGroup}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>2025.05.31</Text>
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            EmotiGlass © 2025
          </Text>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  settingsGroup: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.radii.md,
    ...theme.shadows.light,
    marginBottom: theme.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  dangerButton: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: theme.colors.error,
  },
  infoItem: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  infoLabel: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  infoValue: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
  },
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  footerText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  footerLink: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
});

export default SettingsScreen; 