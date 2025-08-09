import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FoodItem } from '../services/foodSearch';

interface FoodResultGroup {
  title: string;
  items: FoodItem[];
  maxDisplayed?: number;
}

interface FoodSearchResultsProps {
  groups: FoodResultGroup[];
  totalRemaining: number;
  onSelectFood: (item: FoodItem) => void;
  onLoadMore: (groupTitle: string) => void;
  isLoading?: boolean;
}

interface FoodItemCardProps {
  item: FoodItem;
  onPress: (item: FoodItem) => void;
}

const FoodItemCard: React.FC<FoodItemCardProps> = ({ item, onPress }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => onPress(item)}
    activeOpacity={0.7}
  >
    <View style={styles.foodInfo}>
      <Text style={styles.foodName} numberOfLines={2}>
        {item.name}
      </Text>
      <View style={styles.foodMeta}>
        {item.brand && <Text style={styles.foodBrand}>{item.brand}</Text>}
        <Text style={styles.foodServing}>
          per {item.servingSize} {item.servingUnit}
        </Text>
      </View>
    </View>
    <View style={styles.nutritionInfo}>
      <Text style={styles.calories}>{Math.round(item.calories)}</Text>
      <Text style={styles.caloriesLabel}>kcal</Text>
      {item.verified && (
        <Ionicons
          name="checkmark-circle"
          size={16}
          color="#4CAF50"
          style={styles.verifiedIcon}
        />
      )}
    </View>
  </TouchableOpacity>
);

interface GroupSectionProps {
  group: FoodResultGroup;
  onSelectFood: (item: FoodItem) => void;
  onShowMore: () => void;
  isExpanded: boolean;
}

const GroupSection: React.FC<GroupSectionProps> = ({
  group,
  onSelectFood,
  onShowMore,
  isExpanded,
}) => {
  const hasItems = group.items.length > 0;
  const isPlaceholder = !hasItems && group.maxDisplayed === 0;

  if (isPlaceholder) {
    // This is a collapsed section with count only
    return (
      <TouchableOpacity style={styles.collapsedSection} onPress={onShowMore}>
        <Text style={styles.collapsedTitle}>{group.title}</Text>
        <Ionicons name="chevron-forward" size={20} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{group.title}</Text>
      {group.items.map((item, index) => (
        <FoodItemCard
          key={`${item.id}-${index}`}
          item={item}
          onPress={onSelectFood}
        />
      ))}
      {group.maxDisplayed && group.items.length >= group.maxDisplayed && (
        <TouchableOpacity style={styles.showMoreButton} onPress={onShowMore}>
          <Text style={styles.showMoreText}>
            Show more {group.title.toLowerCase()}...
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export const FoodSearchResults: React.FC<FoodSearchResultsProps> = ({
  groups,
  totalRemaining,
  onSelectFood,
  onLoadMore,
  isLoading = false,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const handleShowMore = (groupTitle: string) => {
    setExpandedGroups(prev => new Set(prev).add(groupTitle));
    onLoadMore(groupTitle);
  };

  return (
    <View style={styles.container}>
      {groups.map((group, index) => (
        <GroupSection
          key={`${group.title}-${index}`}
          group={group}
          onSelectFood={onSelectFood}
          onShowMore={() => handleShowMore(group.title)}
          isExpanded={expandedGroups.has(group.title)}
        />
      ))}

      {totalRemaining > 0 && !isLoading && (
        <TouchableOpacity
          style={styles.showAllButton}
          onPress={() => onLoadMore('all')}
        >
          <Text style={styles.showAllText}>
            Show all {totalRemaining} remaining results
          </Text>
        </TouchableOpacity>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <LoadingIndicator size="small" />
          <Text style={styles.loadingText}>Loading more results...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  collapsedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    marginBottom: 8,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  collapsedTitle: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodInfo: {
    flex: 1,
    marginRight: 16,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  foodMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  foodBrand: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  foodServing: {
    fontSize: 14,
    color: '#666',
  },
  nutritionInfo: {
    alignItems: 'center',
  },
  calories: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  caloriesLabel: {
    fontSize: 12,
    color: '#666',
  },
  verifiedIcon: {
    marginTop: 4,
  },
  showMoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
  showAllButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  showAllText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});

export default FoodSearchResults;
