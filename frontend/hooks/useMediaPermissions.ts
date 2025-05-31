import { useState, useEffect } from 'react';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import { Alert } from 'react-native';

interface PermissionState {
  camera: boolean | null;
  audio: boolean | null;
  loading: boolean;
  error: string | null;
}

interface PermissionActions {
  requestCameraPermission: () => Promise<boolean>;
  requestAudioPermission: () => Promise<boolean>;
  requestAllPermissions: () => Promise<{ camera: boolean; audio: boolean }>;
}

/**
 * Custom hook to manage camera and audio permissions
 * @returns Permission state and actions to request permissions
 */
export const useMediaPermissions = (): [PermissionState, PermissionActions] => {
  // Initial permission state
  const [permissionState, setPermissionState] = useState<PermissionState>({
    camera: null,
    audio: null,
    loading: true,
    error: null,
  });

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  // Check all permissions
  const checkPermissions = async () => {
    try {
      setPermissionState(prev => ({ ...prev, loading: true, error: null }));
      
      // Check camera permission
      const cameraPermission = await Camera.getCameraPermissionsAsync();
      
      // Check audio permission
      const audioPermission = await Audio.getPermissionsAsync();
      
      setPermissionState({
        camera: cameraPermission.status === 'granted',
        audio: audioPermission.status === 'granted',
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
      setPermissionState({
        camera: false,
        audio: false,
        loading: false,
        error: 'Failed to check permissions',
      });
    }
  };

  // Request camera permission
  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const granted = status === 'granted';
      
      setPermissionState(prev => ({
        ...prev,
        camera: granted,
        error: granted ? null : 'Camera permission denied',
      }));
      
      return granted;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setPermissionState(prev => ({
        ...prev,
        camera: false,
        error: 'Failed to request camera permission',
      }));
      
      Alert.alert(
        'Permission Error',
        'Failed to request camera permission. Please try again or check your device settings.'
      );
      
      return false;
    }
  };

  // Request audio permission
  const requestAudioPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      const granted = status === 'granted';
      
      setPermissionState(prev => ({
        ...prev,
        audio: granted,
        error: granted ? null : 'Audio permission denied',
      }));
      
      return granted;
    } catch (error) {
      console.error('Error requesting audio permission:', error);
      setPermissionState(prev => ({
        ...prev,
        audio: false,
        error: 'Failed to request audio permission',
      }));
      
      Alert.alert(
        'Permission Error',
        'Failed to request microphone permission. Please try again or check your device settings.'
      );
      
      return false;
    }
  };

  // Request all permissions at once
  const requestAllPermissions = async (): Promise<{ camera: boolean; audio: boolean }> => {
    const camera = await requestCameraPermission();
    const audio = await requestAudioPermission();
    
    return { camera, audio };
  };

  return [
    permissionState,
    {
      requestCameraPermission,
      requestAudioPermission,
      requestAllPermissions,
    },
  ];
}; 