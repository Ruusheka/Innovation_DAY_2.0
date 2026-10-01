import { cn } from '@/lib/utils/cn';
import React from 'react';

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export function PageContainer({
  as: Component = 'div',
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <Component className={cn('page-container', className)} {...props}>
      {children}
    </Component>
  );
}
