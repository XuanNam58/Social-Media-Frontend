import { IoMdNotificationsOutline } from "react-icons/io";

const NotificationIcon = ({ notificationCount }) => {
  const showBadge = notificationCount > 0;

  return (
    <div className="relative w-fit">
      <IoMdNotificationsOutline className="text-2xl mr-5" />
      {showBadge && (
        <span className="absolute top-0 right-[12px] min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1 border border-white">
          {notificationCount > 99 ? "99+" : notificationCount}
        </span>
      )}
    </div>
  );
};

export default NotificationIcon;
