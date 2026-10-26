import { UserRound } from 'lucide-react';
import { useRef } from 'react';

type ProfilePictureProps = {
    imageUrl: string | null | undefined;
    setImageUrl?: (url: string) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
};

const sizeMap = {
    sm: 'h-6 w-6 sm:h-10 sm:w-10',
    md: 'h-12 w-12 sm:h-16 sm:w-16',
    lg: 'h-24 w-24 sm:h-30 sm:w-30',
};

export function ProfilePicture({
    imageUrl,
    setImageUrl,
    readonly = true,
    size = 'md',
}: ProfilePictureProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        if (!readonly && inputRef.current) inputRef.current.click();
    };

    const cropAndResizeImage = (src: string, callback: (dataUrl: string) => void) => {
        const img = new window.Image();
        img.onload = () => {
            const minSide = Math.min(img.width, img.height);
            const sx = (img.width - minSide) / 2;
            const sy = (img.height - minSide) / 2;
            const maxSize = 720;
            const targetSize = Math.min(minSide, maxSize);
            const canvas = document.createElement('canvas');
            canvas.width = targetSize;
            canvas.height = targetSize;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, targetSize, targetSize);
                callback(canvas.toDataURL('image/png'));
            }
        };
        img.src = src;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && setImageUrl) {
            if (!['image/jpeg', 'image/png'].includes(file.type)) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (typeof ev.target?.result === 'string') {
                    cropAndResizeImage(ev.target.result, setImageUrl);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div
            className={`relative inline-block flex-shrink-0 rounded-lg overflow-hidden bg-background shadow ${sizeMap[size]} ${!readonly ? 'cursor-pointer hover:opacity-80' : ''}`}
            onClick={handleClick}
            aria-label="profile picture"
        >
            {imageUrl ? (
                <img src={imageUrl} alt="profile picture" className="w-full h-full rounded-lg" />
            ) : (
                <div className="flex items-center justify-center w-full h-full">
                    <UserRound className="text-text-muted w-2/3 h-2/3" />
                </div>
            )}
            {!readonly && (
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    className="invisible"
                    onChange={handleChange}
                    tabIndex={-1}
                />
            )}
        </div>
    );
}
