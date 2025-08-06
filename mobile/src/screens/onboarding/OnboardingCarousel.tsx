import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';
import { MotiView } from 'moti';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from '../../contexts/OnboardingContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  description: string;
  image: any;
}

const OnboardingCarousel = () => {
  const { goToNextStep, goToPreviousStep } = useOnboarding();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [backPressed, setBackPressed] = useState(false);
  const [skipPressed, setSkipPressed] = useState(false);
  const [nextPressed, setNextPressed] = useState(false);

  const slides: Slide[] = [
    {
      id: 'camera',
      title: 'Just Take a Photo',
      description:
        'Our AI instantly identifies your meals and calculates nutrition',
      image: require('../../../assets/berry/berry_taking_picture.png'),
    },
    {
      id: 'multimodal',
      title: 'Log Your Way',
      description: 'Snap, speak, scan, or search - whatever works for you',
      image: require('../../../assets/berry/berry_using_voicetext.png'),
    },
    {
      id: 'goals',
      title: 'Reach Your Goals',
      description: 'Get personalized insights and celebrate your progress',
      image: require('../../../assets/berry/Download_berry_goals_whiteeyes.png'),
    },
  ];

  const handleNext = () => {
    hapticFeedback.selection();
    if (currentSlide < slides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollViewRef.current?.scrollTo({
        x: nextSlide * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      hapticFeedback.impact();
      goToNextStep();
    }
  };

  const handleSkip = () => {
    hapticFeedback.selection();
    goToNextStep();
  };

  const handleBack = () => {
    hapticFeedback.selection();
    if (currentSlide > 0) {
      const prevSlide = currentSlide - 1;
      setCurrentSlide(prevSlide);
      scrollViewRef.current?.scrollTo({
        x: prevSlide * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      goToPreviousStep();
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH
    );
    if (
      slideIndex !== currentSlide &&
      slideIndex >= 0 &&
      slideIndex < slides.length
    ) {
      setCurrentSlide(slideIndex);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MotiView
          animate={{
            scale: backPressed ? 0.95 : 1,
          }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 400,
          }}
        >
          <TouchableOpacity
            onPress={handleBack}
            onPressIn={() => setBackPressed(true)}
            onPressOut={() => setBackPressed(false)}
            style={styles.backButton}
            activeOpacity={1}
          >
            <ChevronLeft size={20} color="#000" />
          </TouchableOpacity>
        </MotiView>

        {/* Progress dots */}
        <View style={styles.progressContainer}>
          {slides.map((_, index) => (
            <MotiView
              key={index}
              animate={{
                backgroundColor: index === currentSlide ? '#320DFF' : '#E5E7EB',
              }}
              transition={{ type: 'timing', duration: 300 }}
              style={[
                styles.progressDot,
                index > 0 && styles.progressDotSpacing,
              ]}
            />
          ))}
        </View>

        <MotiView
          animate={{
            scale: skipPressed ? 0.95 : 1,
          }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 400,
          }}
        >
          <TouchableOpacity
            onPress={handleSkip}
            onPressIn={() => setSkipPressed(true)}
            onPressOut={() => setSkipPressed(false)}
            style={styles.skipButton}
            activeOpacity={1}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </MotiView>
      </View>

      {/* Slides Container */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        testID="carousel-scroll-view"
        style={styles.scrollView}
      >
        {slides.map(slide => (
          <View
            key={slide.id}
            style={styles.slideContainer}
            testID="slide-container"
          >
            <View style={styles.slideContent} testID="slide-content">
              {/* Illustration */}
              <View style={styles.illustrationContainer}>
                <Image source={slide.image} style={styles.illustration} />
              </View>

              {/* Content */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 100 }}
                style={styles.textContainer}
              >
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>
              </MotiView>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Next button */}
      <View style={styles.buttonContainer}>
        <MotiView
          animate={{
            scale: nextPressed ? 0.95 : 1,
          }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 400,
          }}
        >
          <TouchableOpacity
            onPress={handleNext}
            onPressIn={() => setNextPressed(true)}
            onPressOut={() => setNextPressed(false)}
            style={styles.nextButton}
            activeOpacity={1}
          >
            <ChevronRight size={28} color="white" />
          </TouchableOpacity>
        </MotiView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    height: 68,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  progressDotSpacing: {
    marginLeft: 8,
  },
  skipButton: {
    paddingVertical: 4,
    paddingHorizontal: 0,
    minWidth: 40,
  },
  skipText: {
    fontSize: 11.9,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'System',
  },
  scrollView: {
    flex: 1,
  },
  slideContainer: {
    width: SCREEN_WIDTH,
  },
  slideContent: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  illustrationContainer: {
    width: '100%',
    height: 288,
    backgroundColor: 'rgba(50, 13, 255, 0.05)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  illustration: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 25.5,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
    marginBottom: 16,
    lineHeight: 36,
    fontFamily: 'System',
  },
  description: {
    fontSize: 15.3,
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 28,
    fontFamily: 'System',
  },
  buttonContainer: {
    alignItems: 'center',
    paddingBottom: 32,
    paddingTop: 16,
  },
  nextButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#320DFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 6,
  },
});

export default OnboardingCarousel;
