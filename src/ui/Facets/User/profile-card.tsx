import { Card } from "../../ui/card";
import { ProfilePicture } from "./profile-picture";
import { useHeaderBumpCtx, useScreenSizeCtx } from "../../context/bearContext";
import { SIZE } from "../../constants";

type ProfileCardFullProps = {
    firstName: string;
    lastName: string;
    imageReadOnly?: boolean;
    profileImage?: File | string | null;
    setProfileImage?: (file: File | string | null) => void;
    children?: React.ReactNode;
};

/**
 * A profile card: the picture beside a fixed-height name row, with `children` under the name
 * (a role line, tags, an integration's slot). The card grows vertically with what's under the
 * name, never horizontally; the picture stays top-aligned beside the name.
 *
 * @example
 * ```tsx
 * <ProfileCardFull firstName="Ada" lastName="Lovelace">
 *   <span className="italic">client</span>
 * </ProfileCardFull>
 * ```
 */
export function ProfileCardFull({
    firstName,
    lastName,
    imageReadOnly = false,
    profileImage,
    setProfileImage,
    children,
}: ProfileCardFullProps) {
    const { size } = useScreenSizeCtx();
    const headerBump = useHeaderBumpCtx(true);

    let imageUrl: string | undefined;
    if (profileImage instanceof File) {
        imageUrl = URL.createObjectURL(profileImage);
    } else if (typeof profileImage === "string") {
        imageUrl = profileImage;
    }

    return (
        <Card
            className={`${size < SIZE.SM ? headerBump : ""} flex flex-row rounded-lg items-start sm:w-[26rem]`}
        >
            <div className="flex items-center justify-center p-2 self-start">
                <ProfilePicture
                    imageUrl={imageUrl}
                    size="md"
                    readonly={imageReadOnly}
                    setImageUrl={setProfileImage}
                />
            </div>
            <div className="flex flex-col w-full min-w-0 ml-2 mr-2 sm:ml-4 sm:mr-4 min-h-16 sm:min-h-20">
                <div className="h-8 sm:h-10 min-w-0 flex border-b border-trim items-end shrink-0">
                    <span className="text-sm text-text sm:text-lg font-semibold block whitespace-nowrap overflow-hidden text-ellipsis">
                        {firstName} {lastName}
                    </span>
                </div>
                <div className="flex flex-1 flex-col justify-center gap-1 py-1">
                    {children}
                </div>
            </div>
        </Card>
    );
}
