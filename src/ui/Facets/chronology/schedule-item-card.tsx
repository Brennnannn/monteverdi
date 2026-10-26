import { ActivityCard, ActivityCardProps, ActivityRenderVars } from './activity-card';

export interface ScheduleItemRenderVars {
    name: string;
    description?: string;
    color: string;
    start: string;
    finish: string;
}

export interface ScheduleItemCardProps extends Omit<ActivityCardProps, 'children'> {
    start?: string;
    finish?: string;
    children?: React.ReactNode | ((vars: ScheduleItemRenderVars) => React.ReactNode);
}

export function ScheduleItemCard({ name, description, color, start, finish, children, className, ...rest }: ScheduleItemCardProps) {
    return (
        <ActivityCard name={name} description={description} color={color} className={className} {...rest}>
            {(actVars: ActivityRenderVars) => {
                const merged: ScheduleItemRenderVars = {
                    ...actVars,
                    start: start ?? '',
                    finish: finish ?? '',
                };
                const renderedChildren = typeof children === 'function' ? children(merged) : children;
                return <>{renderedChildren}</>;
            }}
        </ActivityCard>
    );
}
