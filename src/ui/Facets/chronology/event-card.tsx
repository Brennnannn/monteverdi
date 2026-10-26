import { format, parseISO } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import { ActivityCard, ActivityCardProps, ActivityRenderVars } from './activity-card';

export type EventRenderVars = {
    name: string;
    description?: string;
    color: string;
    start?: string;
    finish?: string;
    is_graded: boolean;
}

export interface EventCardProps extends Omit<ActivityCardProps, 'children'> {
    start?: string;
    finish?: string;
    is_graded?: boolean;
    children?: React.ReactNode | ((vars: EventRenderVars) => React.ReactNode);
}

export function EventCard({ name, description, color, start, finish, is_graded = false, children, className, ...rest }: EventCardProps) {
    return (
        <ActivityCard name={name} description={description} color={color} className={twMerge("border-b rounded-md shadow-md", className)} {...rest}>
            {(actVars: ActivityRenderVars) => {
                const merged: EventRenderVars = { ...actVars, start, finish, is_graded };

                if (typeof children === 'function') return children(merged);

                return children ?? (
                    <div className="flex flex-col justify-between">
                        <h2 className="text-lg font-medium">{merged.name}</h2>
                        <div className="text-sm">
                            {merged.start ? format(parseISO(merged.start), 'h:mm a') : ''} - {merged.finish ? format(parseISO(merged.finish), 'h:mm a') : 'now'}
                        </div>
                    </div>
                );
            }}
        </ActivityCard>
    );
}
