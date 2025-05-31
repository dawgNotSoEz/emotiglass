/// <reference types="react-native" />

// Global type definitions for the application

// Define types for modules
interface SafeModule {
  getConstants?: () => Record<string, any>;
  [key: string]: any;
}

// Define global object extensions
declare global {
  var HermesInternal: any;
  
  // Native modules
  var PlatformConstants: SafeModule;
  var ExponentConstants: SafeModule;
  var ExpoConstants: SafeModule;
  var RNGestureHandlerModule: SafeModule;
  var RCTDeviceEventEmitter: SafeModule;
  var UIManager: SafeModule;
  var RCTLinkingManager: SafeModule;
  var ExponentAV: SafeModule;
  var ExponentCamera: SafeModule;
  
  // TurboModule registry
  var TurboModuleRegistry: {
    getEnforcing: (name: string) => SafeModule;
  };
  
  // Expo global
  var Expo: {
    Constants: Record<string, any>;
    [key: string]: any;
  };
}

// This export is needed to make this file a module
export {};

// For missing Expo packages
declare module 'expo-linear-gradient' {
  import React from 'react';
  import { ViewProps } from 'react-native';

  export interface LinearGradientProps extends ViewProps {
    colors: string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
  }

  export class LinearGradient extends React.Component<LinearGradientProps> {}
}

declare module 'expo-blur' {
  import React from 'react';
  import { ViewProps } from 'react-native';

  export interface BlurViewProps extends ViewProps {
    intensity?: number;
    tint?: 'light' | 'dark' | 'default';
  }

  export class BlurView extends React.Component<BlurViewProps> {}
}

declare module 'react-native-chart-kit' {
  import React from 'react';
  import { ViewProps } from 'react-native';

  export interface ChartConfig {
    backgroundColor?: string;
    backgroundGradientFrom?: string;
    backgroundGradientTo?: string;
    decimalPlaces?: number;
    color?: (opacity?: number) => string;
    labelColor?: (opacity?: number) => string;
    style?: any;
    propsForDots?: any;
  }

  export interface LineChartProps extends ViewProps {
    data: any;
    width: number;
    height: number;
    chartConfig: ChartConfig;
    bezier?: boolean;
    style?: any;
  }

  export interface BarChartProps extends ViewProps {
    data: any;
    width: number;
    height: number;
    chartConfig: ChartConfig;
    style?: any;
    yAxisLabel?: string;
    yAxisSuffix?: string;
  }

  export interface PieChartProps extends ViewProps {
    data: any;
    width: number;
    height: number;
    chartConfig: ChartConfig;
    accessor: string;
    backgroundColor?: string;
    paddingLeft?: string;
    absolute?: boolean;
  }

  export interface ProgressChartProps extends ViewProps {
    data: any;
    width: number;
    height: number;
    chartConfig: ChartConfig;
    style?: any;
    strokeWidth?: number;
    radius?: number;
    hideLegend?: boolean;
  }

  export interface ContributionGraphProps extends ViewProps {
    values: any[];
    endDate: Date;
    numDays: number;
    width: number;
    height: number;
    chartConfig: ChartConfig;
    style?: any;
    tooltipDataAttrs?: (value: any) => any;
  }

  export class LineChart extends React.Component<LineChartProps> {}
  export class BarChart extends React.Component<BarChartProps> {}
  export class PieChart extends React.Component<PieChartProps> {}
  export class ProgressChart extends React.Component<ProgressChartProps> {}
  export class ContributionGraph extends React.Component<ContributionGraphProps> {}
}

declare module 'expo-secure-store' {
  export function getItemAsync(key: string): Promise<string | null>;
  export function setItemAsync(key: string, value: string): Promise<void>;
  export function deleteItemAsync(key: string): Promise<void>;
}

declare module 'expo-media-library' {
  export interface MediaLibraryPermissionResponse {
    status: 'granted' | 'denied' | 'undetermined';
    expires: 'never';
  }

  export function requestPermissionsAsync(): Promise<MediaLibraryPermissionResponse>;
  export function createAssetAsync(uri: string): Promise<any>;
  export function createAlbumAsync(
    albumName: string,
    asset: any,
    copyAsset?: boolean
  ): Promise<any>;
}

declare module 'expo-image-manipulator' {
  export interface ImageManipulatorOptions {
    compress?: number;
    format?: 'jpeg' | 'png';
    base64?: boolean;
  }

  export enum SaveFormat {
    JPEG = 'jpeg',
    PNG = 'png',
  }

  export function manipulateAsync(
    uri: string,
    actions: any[],
    options?: ImageManipulatorOptions
  ): Promise<{ uri: string; width: number; height: number; base64?: string }>;
}

declare module 'react-native-view-shot' {
  import React from 'react';
  import { ViewProps } from 'react-native';

  export interface ViewShotProps extends ViewProps {
    options?: {
      format?: 'png' | 'jpg' | 'webm' | 'raw';
      quality?: number;
      result?: 'file' | 'base64' | 'data-uri';
      snapshotContentContainer?: boolean;
    };
  }

  export default class ViewShot extends React.Component<ViewShotProps> {
    capture(): Promise<string>;
  }
} 