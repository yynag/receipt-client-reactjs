import { Suspense } from 'react';

const Loading = () => <div className="w-full h-full flex items-center justify-center">正在加载中...</div>;

export const LazyLoad = (Component: React.ComponentType, fallback = <Loading />) => {
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  );
};
