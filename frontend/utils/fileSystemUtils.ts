import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Platform, Alert } from 'react-native';

// Define constants for directory paths
export const APP_DIRECTORY = Platform.OS === 'web' 
  ? '/tmp/emotiglass/' 
  : (FileSystem.documentDirectory || '');

export const DRAWINGS_DIR = `${APP_DIRECTORY}drawings/`;
export const MOOD_ENTRIES_DIR = `${APP_DIRECTORY}mood_entries/`;
export const VOICE_RECORDINGS_DIR = `${APP_DIRECTORY}voice_recordings/`;

// Web-specific file system mock
const WebFileSystemMock = {
  documentDirectory: '/tmp/emotiglass/',
  getInfoAsync: async (path: string) => ({
    exists: true,
    isDirectory: true,
    uri: path,
    size: 0,
    modificationTime: Date.now()
  }),
  makeDirectoryAsync: async (path: string) => {
    console.log(`[Web Mock] Creating directory: ${path}`);
    return true;
  },
  writeAsStringAsync: async (path: string, content: string) => {
    console.log(`[Web Mock] Writing to file: ${path}`);
    return true;
  },
  readAsStringAsync: async (path: string) => {
    console.log(`[Web Mock] Reading from file: ${path}`);
    return '';
  },
  deleteAsync: async (path: string) => {
    console.log(`[Web Mock] Deleting file: ${path}`);
    return true;
  }
};

/**
 * Request necessary permissions for file system operations
 * @returns Object containing permission statuses
 */
export const requestFileSystemPermissions = async (): Promise<{
  mediaLibrary: boolean;
  fileSystem: boolean;
}> => {
  if (Platform.OS === 'web') {
    console.warn('Limited file system access on web platform');
    return {
      mediaLibrary: false,
      fileSystem: false
    };
  }

  try {
    // Media library permissions (needed for saving to camera roll)
    const mediaPermission = await MediaLibrary.requestPermissionsAsync();
    const mediaGranted = mediaPermission.status === 'granted';
    
    console.log(`Media library permission: ${mediaPermission.status}`);
    
    // Show warning if permissions are denied
    if (!mediaGranted) {
      console.warn('Media library permission denied');
    }
    
    return {
      mediaLibrary: mediaGranted,
      fileSystem: true
    };
  } catch (error) {
    console.error('Error requesting file system permissions:', error);
    return {
      mediaLibrary: false,
      fileSystem: false
    };
  }
};

/**
 * Check if all required permissions are granted
 * @returns True if all required permissions are granted
 */
export const checkFileSystemPermissions = async (): Promise<boolean> => {
  try {
    // Media library permissions
    const mediaPermission = await MediaLibrary.getPermissionsAsync();
    const mediaGranted = mediaPermission.status === 'granted';
    
    // For now, we only require media library permission for exporting drawings
    return mediaGranted;
  } catch (error) {
    console.error('Error checking file system permissions:', error);
    return false;
  }
};

/**
 * Creates a directory if it doesn't exist
 * @param dirPath The path of the directory to create
 * @returns True if directory exists or was created successfully
 */
export const createDirectoryIfNeeded = async (dirPath: string): Promise<boolean> => {
  try {
    // Check if directory exists
    const dirInfo = await FileSystem.getInfoAsync(dirPath);
    
    if (!dirInfo.exists) {
      console.log(`Creating directory: ${dirPath}`);
      
      try {
        // Create directory with intermediates option
        await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
        
        // Verify directory was created
        const verifyInfo = await FileSystem.getInfoAsync(dirPath);
        if (!verifyInfo.exists) {
          console.error(`Failed to create directory: ${dirPath}`);
          return false;
        }
        
        // Test if directory is writable
        const testFile = `${dirPath}test_${Date.now()}.txt`;
        await FileSystem.writeAsStringAsync(testFile, 'test');
        await FileSystem.deleteAsync(testFile, { idempotent: true });
        
        console.log(`Successfully created directory: ${dirPath}`);
        return true;
      } catch (error) {
        console.error(`Error creating directory ${dirPath}:`, error);
        return false;
      }
    } else {
      // Directory exists, test if it's writable
      try {
        const testFile = `${dirPath}test_${Date.now()}.txt`;
        await FileSystem.writeAsStringAsync(testFile, 'test');
        await FileSystem.deleteAsync(testFile, { idempotent: true });
        console.log(`Directory ${dirPath} is writable`);
        return true;
      } catch (error) {
        console.error(`Directory ${dirPath} exists but is not writable:`, error);
        return false;
      }
    }
  } catch (error) {
    console.error(`Error checking directory ${dirPath}:`, error);
    return false;
  }
};

/**
 * Initialize all required directories for the app
 */
export const initializeAppDirectories = async (): Promise<boolean> => {
  const fileSystemToUse = Platform.OS === 'web' ? WebFileSystemMock : FileSystem;

  try {
    const directories = [
      DRAWINGS_DIR,
      MOOD_ENTRIES_DIR,
      VOICE_RECORDINGS_DIR
    ];

    for (const dir of directories) {
      const dirInfo = await fileSystemToUse.getInfoAsync(dir);

      if (!dirInfo.exists) {
        await fileSystemToUse.makeDirectoryAsync(dir, { intermediates: true });
      }
    }

    return true;
  } catch (error) {
    console.error('Error initializing directories:', error);
    return false;
  }
};

/**
 * Safe file write that ensures directory exists before writing
 * @param filePath The path of the file to write
 * @param content The content to write to the file
 * @returns True if file was written successfully
 */
export const safeWriteToFile = async (filePath: string, content: string): Promise<boolean> => {
  try {
    // Extract directory from file path
    const lastSlashIndex = filePath.lastIndexOf('/');
    if (lastSlashIndex === -1) {
      console.error(`Invalid file path: ${filePath}`);
      return false;
    }
    
    const dirPath = filePath.substring(0, lastSlashIndex + 1);
    
    // Ensure directory exists
    const dirCreated = await createDirectoryIfNeeded(dirPath);
    if (!dirCreated) {
      console.error(`Failed to create directory for file: ${filePath}`);
      return false;
    }
    
    // Write file
    await FileSystem.writeAsStringAsync(filePath, content);
    console.log(`Successfully wrote to file: ${filePath}`);
    
    return true;
  } catch (error) {
    console.error(`Error writing to file ${filePath}:`, error);
    return false;
  }
};

/**
 * Safe file read that checks if file exists before reading
 * @param filePath The path of the file to read
 * @returns The file content or null if file doesn't exist
 */
export const safeReadFromFile = async (filePath: string): Promise<string | null> => {
  try {
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      console.error(`File does not exist: ${filePath}`);
      return null;
    }
    
    // Read file
    const content = await FileSystem.readAsStringAsync(filePath);
    return content;
  } catch (error) {
    console.error(`Error reading from file ${filePath}:`, error);
    return null;
  }
};

/**
 * Safe file delete that checks if file exists before deleting
 * @param filePath The path of the file to delete
 * @returns True if file was deleted successfully or didn't exist
 */
export const safeDeleteFile = async (filePath: string): Promise<boolean> => {
  try {
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      console.log(`File does not exist, nothing to delete: ${filePath}`);
      return true;
    }
    
    // Delete file
    await FileSystem.deleteAsync(filePath);
    console.log(`Successfully deleted file: ${filePath}`);
    
    return true;
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    return false;
  }
};

/**
 * Export a file to the media library (e.g., save image to camera roll)
 * @param fileUri The URI of the file to export
 * @param type The type of media (photo, video, etc.)
 * @param album Optional album name to save to
 * @returns The asset ID if successful, null otherwise
 */
export const exportToMediaLibrary = async (
  fileUri: string,
  type: 'photo' | 'video' | 'audio',
  album?: string
): Promise<string | null> => {
  try {
    // Check if we have permission
    const { status } = await MediaLibrary.getPermissionsAsync();
    
    if (status !== 'granted') {
      // Request permission if not granted
      const { status: newStatus } = await MediaLibrary.requestPermissionsAsync();
      
      if (newStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Media library permission is required to save files to your device.',
          [{ text: 'OK' }]
        );
        return null;
      }
    }
    
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      console.error(`File does not exist: ${fileUri}`);
      return null;
    }
    
    // Save to media library
    const asset = await MediaLibrary.createAssetAsync(fileUri);
    
    // Save to album if specified
    if (album) {
      const albums = await MediaLibrary.getAlbumsAsync();
      let targetAlbum = albums.find(a => a.title === album);
      
      if (!targetAlbum) {
        // Create album if it doesn't exist
        targetAlbum = await MediaLibrary.createAlbumAsync(album, asset, false);
      } else {
        // Add to existing album
        await MediaLibrary.addAssetsToAlbumAsync([asset], targetAlbum, false);
      }
    }
    
    console.log(`Successfully exported file to media library: ${fileUri}`);
    return asset.id;
  } catch (error) {
    console.error(`Error exporting file to media library ${fileUri}:`, error);
    return null;
  }
}; 