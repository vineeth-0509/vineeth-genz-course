import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "next-auth";
import Image from "next/image";
// import { getAuthSession } from "@/lib/auth"

type Props = {
  user: User;
};

const UserAvatar = ({ user }: Props) => {
  // const session = await getAuthSession();
  return (
    <Avatar>
      {user.image ? (
        <div className="relative w-full h-full aspect-square">
          <Image
            src={user?.image}
            alt="user Profile"
            referrerPolicy="no-referrer"
            width={96}
            height={96}
          />
        </div>
      ) : (
        <AvatarFallback>
          <span className="sr-only">{user?.name}</span>
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default UserAvatar;
