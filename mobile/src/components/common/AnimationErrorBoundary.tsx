import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

export class AnimationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service
    console.error('Animation Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  handleHardReset = () => {
    // Navigate to home or safe state
    // This would need navigation prop passed down
    this.setState({ hasError: false, error: null, retryCount: 0 });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <View className="flex-1 items-center justify-center p-4">
          <AlertCircle size={48} color="#EF4444" />
          <Text className="text-lg font-semibold mt-4 text-gray-800">
            Something went wrong
          </Text>
          <Text className="text-sm text-gray-600 mt-2 text-center">
            We encountered an error while loading animations
          </Text>
          {this.state.retryCount < 2 ? (
            <TouchableOpacity
              onPress={this.handleReset}
              className="mt-6 bg-primary px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-medium">Try Again</Text>
            </TouchableOpacity>
          ) : (
            <View className="items-center">
              <Text className="text-sm text-gray-600 mt-4 text-center mb-4">
                The error persists. Try refreshing the app.
              </Text>
              <TouchableOpacity
                onPress={this.handleHardReset}
                className="bg-gray-200 px-6 py-3 rounded-xl"
              >
                <Text className="text-gray-700 font-medium">Refresh App</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}
