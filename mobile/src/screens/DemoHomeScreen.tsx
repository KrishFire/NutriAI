import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  Mic,
  Scan,
  Search,
  MessageSquare,
  Bell,
} from 'lucide-react-native';

export default function DemoHomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 8,
          }}
        >
          <View>
            <Text style={{ fontSize: 14, color: '#6B7280' }}>
              Good afternoon,
            </Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000' }}>
              Alex
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                backgroundColor: '#320DFF',
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 999,
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 16,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  marginRight: 4,
                }}
              />
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '500' }}>
                7
              </Text>
            </View>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                backgroundColor: '#F3F4F6',
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Bell size={20} color="#374151" />
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 20,
                  height: 20,
                  backgroundColor: '#EF4444',
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}
                >
                  3
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Progress */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 24,
              padding: 24,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#F3F4F6',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#6B7280', fontSize: 14 }}>
                Daily Progress
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '500' }}>Jul 28</Text>
            </View>

            <View
              style={{
                width: 192,
                height: 192,
                marginBottom: 24,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  width: 192,
                  height: 192,
                  borderRadius: 96,
                  borderWidth: 12,
                  borderColor: '#E5E7EB',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  width: 192,
                  height: 192,
                  borderRadius: 96,
                  borderWidth: 12,
                  borderColor: '#320DFF',
                  borderTopColor: 'transparent',
                  borderRightColor: 'transparent',
                  transform: [{ rotate: '45deg' }],
                }}
              />
              <View>
                <Text
                  style={{
                    fontSize: 48,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  1450
                </Text>
                <Text
                  style={{
                    color: '#6B7280',
                    fontSize: 10,
                    textAlign: 'center',
                  }}
                >
                  of 2000 cal
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                width: '100%',
              }}
            >
              {[
                {
                  name: 'carbs',
                  value: 180,
                  goal: 250,
                  percentage: 72,
                  color: '#FFA726',
                },
                {
                  name: 'protein',
                  value: 95,
                  goal: 150,
                  percentage: 63,
                  color: '#42A5F5',
                },
                {
                  name: 'fat',
                  value: 48,
                  goal: 65,
                  percentage: 74,
                  color: '#66BB6A',
                },
              ].map(macro => (
                <View key={macro.name} style={{ alignItems: 'center' }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      marginBottom: 4,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <View
                      style={{
                        position: 'absolute',
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        borderWidth: 4,
                        borderColor: '#E5E7EB',
                      }}
                    />
                    <View
                      style={{
                        position: 'absolute',
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        borderWidth: 4,
                        borderColor: macro.color,
                        borderTopColor: 'transparent',
                        borderRightColor: 'transparent',
                        transform: [
                          { rotate: `${macro.percentage * 3.6 - 90}deg` },
                        ],
                      }}
                    />
                    <Text style={{ fontSize: 10, fontWeight: '600' }}>
                      {macro.percentage}%
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: '#6B7280',
                      fontSize: 10,
                      textTransform: 'capitalize',
                      marginTop: 4,
                    }}
                  >
                    {macro.name}
                  </Text>
                  <Text style={{ fontSize: 10, fontWeight: '500' }}>
                    {macro.value}/{macro.goal}g
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Today's Meals */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 16 }}>
            Today's Meals
          </Text>

          {[
            {
              name: 'Breakfast',
              time: '8:30 AM',
              calories: 420,
              carbs: 65,
              protein: 15,
              fat: 12,
            },
            {
              name: 'Lunch',
              time: '12:45 PM',
              calories: 650,
              carbs: 75,
              protein: 45,
              fat: 22,
            },
            {
              name: 'Snack',
              time: '3:30 PM',
              calories: 180,
              carbs: 25,
              protein: 5,
              fat: 8,
            },
          ].map((meal, index) => (
            <View
              key={meal.name}
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 13,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#F3F4F6',
                flexDirection: 'row',
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  backgroundColor: '#F3F4F6',
                  borderRadius: 8,
                  marginRight: 12,
                }}
              />
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '500' }}>
                      {meal.name}
                    </Text>
                    <Text
                      style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}
                    >
                      {meal.time}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '500' }}>
                    {meal.calories} cal
                  </Text>
                </View>
                <View
                  style={{
                    height: 8,
                    backgroundColor: '#F3F4F6',
                    borderRadius: 4,
                    overflow: 'hidden',
                    flexDirection: 'row',
                  }}
                >
                  <View
                    style={{
                      width: `${(meal.carbs / (meal.carbs + meal.protein + meal.fat)) * 100}%`,
                      backgroundColor: '#FFA726',
                    }}
                  />
                  <View
                    style={{
                      width: `${(meal.protein / (meal.carbs + meal.protein + meal.fat)) * 100}%`,
                      backgroundColor: '#42A5F5',
                    }}
                  />
                  <View
                    style={{
                      width: `${(meal.fat / (meal.carbs + meal.protein + meal.fat)) * 100}%`,
                      backgroundColor: '#66BB6A',
                    }}
                  />
                </View>
                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  <Text
                    style={{ fontSize: 10, color: '#6B7280', marginRight: 8 }}
                  >
                    C: {meal.carbs}g
                  </Text>
                  <Text
                    style={{ fontSize: 10, color: '#6B7280', marginRight: 8 }}
                  >
                    P: {meal.protein}g
                  </Text>
                  <Text style={{ fontSize: 10, color: '#6B7280' }}>
                    F: {meal.fat}g
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
          <View style={{ flexDirection: 'row', marginHorizontal: -4 }}>
            {[
              { icon: Camera, label: 'Camera' },
              { icon: Mic, label: 'Voice' },
              { icon: Scan, label: 'Barcode' },
              { icon: Search, label: 'Search' },
            ].map(action => (
              <TouchableOpacity
                key={action.label}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 12,
                  backgroundColor: '#F9FAFB',
                  borderRadius: 12,
                  marginHorizontal: 4,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'rgba(50, 13, 255, 0.1)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 4,
                  }}
                >
                  <action.icon size={18} color="#320DFF" />
                </View>
                <Text style={{ fontSize: 10, color: '#374151' }}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Feedback */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: 16,
          }}
        >
          <MessageSquare size={14} color="#9CA3AF" />
          <Text style={{ fontSize: 10, color: '#6B7280', marginLeft: 4 }}>
            Share feedback
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 64,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
        }}
      >
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <View
            style={{
              width: 24,
              height: 24,
              backgroundColor: '#320DFF',
              borderRadius: 4,
            }}
          />
          <Text
            style={{
              fontSize: 10,
              color: '#320DFF',
              marginTop: 4,
              fontWeight: '500',
            }}
          >
            Home
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <View
            style={{
              width: 24,
              height: 24,
              backgroundColor: '#9CA3AF',
              borderRadius: 4,
            }}
          />
          <Text style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>
            History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: 'center', marginTop: -12 }}>
          <View
            style={{
              width: 56,
              height: 56,
              backgroundColor: '#320DFF',
              borderRadius: 28,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#320DFF',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 24 }}>+</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <View
            style={{
              width: 24,
              height: 24,
              backgroundColor: '#9CA3AF',
              borderRadius: 4,
            }}
          />
          <Text style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>
            Insights
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <View
            style={{
              width: 24,
              height: 24,
              backgroundColor: '#9CA3AF',
              borderRadius: 4,
            }}
          />
          <Text style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
