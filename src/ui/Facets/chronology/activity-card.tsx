import { Card, CardProps } from '../../ui/card';
import { twMerge } from 'tailwind-merge';

export interface ActivityRenderVars {
    name: string;
    description?: string;
    color: string;
}

export interface ActivityCardProps extends Omit<CardProps, 'children' | 'color'> {
    name?: string;
    description?: string;
    color?: string | null;
    children?: React.ReactNode | ((vars: ActivityRenderVars) => React.ReactNode);
}

export function ActivityCard({ name, description, color, children, className, ...rest }: ActivityCardProps) {
    if (!name) {
        return (
            <Card className={twMerge("p-2 animate-pulse w-20", className)} {...rest}>
                <div className="h-2 w-1/3 rounded mb-2 bg-text/20" />
                <div className="h-4 w-2/3 rounded bg-trim/30" />
            </Card>
        );
    }

    const bg = color && color.length === 7 ? color + '20' : color || undefined;
    const borderColor = color || undefined;

    const vars: ActivityRenderVars = { name, description, color: color ?? '' };

    const renderedChildren = typeof children === 'function'
        ? children(vars)
        : children;

    return (
        <Card
            className={twMerge("p-2 border-b flex flex-row", className)}
            style={{ backgroundColor: bg, borderColor, color: color || undefined }}
            {...rest}
        >
            {renderedChildren}
        </Card>
    );
}
