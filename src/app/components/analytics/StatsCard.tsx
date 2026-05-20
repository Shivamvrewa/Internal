import { Card, CardContent } from '../ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '../ui/utils';

interface StatsCardProps {
  title: string;
  titleHi?: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
}

export function StatsCard({
  title,
  titleHi,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconBgColor = 'bg-blue-100 dark:bg-blue-900/30',
  iconColor = 'text-blue-600 dark:text-blue-400',
}: StatsCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            {titleHi && (
              <p className="text-xs text-gray-500 dark:text-gray-500">{titleHi}</p>
            )}
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {value}
            </p>
            {change && (
              <p
                className={cn(
                  'text-sm mt-2 flex items-center gap-1',
                  changeType === 'positive' && 'text-green-600 dark:text-green-400',
                  changeType === 'negative' && 'text-red-600 dark:text-red-400',
                  changeType === 'neutral' && 'text-gray-600 dark:text-gray-400'
                )}
              >
                {changeType === 'positive' && '↑'}
                {changeType === 'negative' && '↓'}
                {change}
              </p>
            )}
          </div>
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconBgColor)}>
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
