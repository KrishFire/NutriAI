import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeScreenNavigationProp } from '../types/navigationTypes';
import { Button, DailyProgress } from '../components';
import { useAuth } from '../contexts/AuthContext';

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, signOut } = useAuth();

  // Mock data for demonstration
  const mockDailyData = {
    calories: { current: 850, target: 2000 },
    protein: { current: 45, target: 150 },
    carbs: { current: 120, target: 250 },
    fat: { current: 35, target: 67 },
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          const { error } = await signOut();
          if (error) {
            Alert.alert('Error', 'Failed to sign out');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>NutriAI</Text>
              <Text style={styles.subtitle}>AI-Powered Nutrition Tracking</Text>
            </View>
            <Button
              title="Sign Out"
              onPress={handleLogout}
              variant="outline"
              size="small"
            />
          </View>
          {user && (
            <Text style={styles.welcomeText}>
              Welcome back, {user.user_metadata?.full_name || user.email}!
            </Text>
          )}
        </View>

        <View style={styles.progressContainer}>
          <DailyProgress {...mockDailyData} />
        </View>

        <View style={styles.actionContainer}>
          <Button
            title="📷 Log Meal"
            onPress={() => navigation.navigate('Camera')}
            variant="primary"
            size="large"
          />

          <Button
            title="📊 View History"
            onPress={() => {
              // navigation.navigate('History'); // Will be enabled when History screen exists
              console.log('History navigation would happen here');
            }}
            variant="outline"
            size="large"
          />
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionRow}>
            <Button
              title="🎤 Voice Log"
              onPress={() => console.log('Voice logging')}
              variant="secondary"
              size="medium"
              style={styles.quickActionButton}
            />
            <Button
              title="📝 Manual Entry"
              onPress={() => console.log('Manual entry')}
              variant="secondary"
              size="medium"
              style={styles.quickActionButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: '#34495e',
    fontWeight: '500',
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 8,
  },
  progressContainer: {
    padding: 20,
  },
  actionContainer: {
    padding: 20,
    gap: 16,
  },
  quickActions: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
  },
});
