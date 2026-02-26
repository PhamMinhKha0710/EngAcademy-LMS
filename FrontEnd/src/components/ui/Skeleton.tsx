import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
    return (
        <div
            className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md ${className}`}
        />
    );
};

export const LessonSkeleton = () => (
    <div className="card p-6">
        <Skeleton className="h-4 w-1/4 mb-4" />
        <Skeleton className="h-6 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-6" />
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-1/4 rounded-full" />
        </div>
    </div>
);

export const DashboardStatSkeleton = () => (
    <div className="card p-6">
        <div className="flex justify-between items-start mb-4">
            <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
        <Skeleton className="h-3 w-32" />
    </div>
);

export const ExamSkeleton = () => (
    <div className="card p-6">
        <div className="flex gap-4">
            <Skeleton className="h-16 w-16 rounded-xl flex-shrink-0" />
            <div className="flex-1">
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex gap-3 mt-4">
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                </div>
            </div>
            <div className="flex flex-col justify-between items-end">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
        </div>
    </div>
);

export const VocabularySkeleton = () => (
    <div className="card p-6 text-center">
        <div className="flex justify-between w-full mb-4">
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-8 w-1/2 mx-auto mb-4" />
        <Skeleton className="h-4 w-3/4 mx-auto mb-2" />
        <Skeleton className="h-4 w-2/3 mx-auto" />
    </div>
);
