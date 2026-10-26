import { Card, CardProps } from '../../ui/card';

export interface AdjustmentRenderVars {
    value: number | null;
    comment: string | null;
    time: Date;
    staff_first: string;
    staff_last: string;
    staff_image: string | null;
    category_name: string;
    category_min: number;
    category_max: number;
    category_default: number;
}

export interface AdjustmentCardProps extends Omit<CardProps, 'children'> {
    data?: AdjustmentRenderVars;
    children?: React.ReactNode | ((vars: AdjustmentRenderVars) => React.ReactNode);
}

export function AdjustmentCard({ data, children, className, ...rest }: AdjustmentCardProps) {
    if (!data) {
        return (
            <Card className="p-4 animate-pulse" {...rest}>
                <div className="h-4 w-1/4 rounded mb-2 bg-text/20" />
                <div className="h-6 w-1/2 rounded mb-2 bg-trim/30" />
                <div className="h-4 w-3/4 rounded bg-text/20" />
            </Card>
        );
    }

    const renderedChildren = typeof children === 'function'
        ? children(data)
        : children;

    return (
        <Card className={className} {...rest}>
            {renderedChildren}
        </Card>
    );
}
