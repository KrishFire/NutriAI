import React from 'react';
interface SkeletonProps {
  className?: string;
}
export const Skeleton: React.FC<SkeletonProps> = ({
  className
}) => {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`}></div>;
};
export const SkeletonText: React.FC<SkeletonProps> = ({
  className
}) => {
  return <Skeleton className={`h-4 ${className}`} />;
};
export const SkeletonCircle: React.FC<SkeletonProps> = ({
  className
}) => {
  return <Skeleton className={`rounded-full ${className}`} />;
};
export const SkeletonImage: React.FC<SkeletonProps> = ({
  className
}) => {
  return <Skeleton className={`${className}`} />;
};
export const MealCardSkeleton: React.FC = () => {
  return <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
      <div className="flex items-center">
        <SkeletonImage className="w-16 h-16 rounded-lg mr-3" />
        <div className="flex-1">
          <SkeletonText className="w-24 mb-1" />
          <SkeletonText className="w-16 h-3 mb-2" />
          <Skeleton className="h-2 rounded-full w-full mt-2" />
          <div className="flex mt-1 space-x-2">
            <SkeletonText className="w-8 h-3" />
            <SkeletonText className="w-8 h-3" />
            <SkeletonText className="w-8 h-3" />
          </div>
        </div>
      </div>
    </div>;
};
export const HomeScreenSkeleton: React.FC = () => {
  return <div className="flex flex-col min-h-screen bg-white pb-20 px-4">
      <div className="pt-12 pb-4 flex justify-between items-center">
        <div>
          <SkeletonText className="w-32 mb-2" />
          <SkeletonText className="w-48 h-6" />
        </div>
        <div className="flex items-center">
          <Skeleton className="w-10 h-5 rounded-full mr-4" />
          <SkeletonCircle className="w-10 h-10" />
        </div>
      </div>
      <div className="py-6 bg-white">
        <Skeleton className="rounded-3xl p-6 h-64" />
      </div>
      <div className="py-4">
        <SkeletonText className="w-40 h-6 mb-4" />
        <div className="space-y-3">
          <MealCardSkeleton />
          <MealCardSkeleton />
          <MealCardSkeleton />
        </div>
      </div>
    </div>;
};
export const OnboardingSkeleton: React.FC = () => {
  return <div className="flex flex-col min-h-screen bg-white p-6">
      <div className="flex justify-between items-center mb-8">
        <SkeletonCircle className="w-10 h-10" />
        <div className="flex space-x-2">
          <SkeletonCircle className="w-2 h-2" />
          <SkeletonCircle className="w-2 h-2" />
          <SkeletonCircle className="w-2 h-2" />
        </div>
        <SkeletonText className="w-12 h-4" />
      </div>
      <div className="flex-1 flex flex-col">
        <Skeleton className="w-full h-64 rounded-2xl mb-8" />
        <SkeletonText className="w-3/4 h-8 mx-auto mb-2" />
        <SkeletonText className="w-full h-4 mb-12 mx-auto" />
      </div>
      <div className="flex justify-center">
        <SkeletonCircle className="w-12 h-12" />
      </div>
    </div>;
};
export const AnalyzingScreenSkeleton: React.FC = () => {
  return <div className="flex flex-col min-h-screen bg-white p-6 items-center justify-center">
      <SkeletonCircle className="w-24 h-24 mb-8" />
      <SkeletonText className="w-3/4 h-6 mb-2" />
      <SkeletonText className="w-1/2 h-4 mb-12" />
      <div className="w-full max-w-xs">
        <Skeleton className="w-full h-2 rounded-full mb-8" />
      </div>
      <div className="w-full max-w-sm">
        <SkeletonText className="w-full h-4 mb-2" />
        <SkeletonText className="w-3/4 h-4 mb-2" />
        <SkeletonText className="w-5/6 h-4 mb-2" />
      </div>
    </div>;
};