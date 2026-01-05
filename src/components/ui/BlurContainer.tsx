
import React from 'react';
import { cn } from '@/lib/utils';

interface BlurContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  intensity?: 'light' | 'medium' | 'heavy';
  border?: boolean;
  hoverEffect?: boolean;
}

const BlurContainer = ({
  children,
  className,
  intensity = 'medium',
  border = true,
  hoverEffect = false,
  ...props
}: BlurContainerProps) => {
  const blurMap = {
    light: 'backdrop-blur-sm',
    medium: 'backdrop-blur-md',
    heavy: 'backdrop-blur-lg',
  };

  return (
    <div
      className={cn(
        'bg-white/10 rounded-xl shadow-md',
        blurMap[intensity],
        border && 'border border-white/20',
        hoverEffect && 'transition-all duration-300 hover:bg-white/20 hover:shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default BlurContainer;
