import { useAuth } from "../../Context/AuthContext";

const MiniProfile = () => {
  const { logout, currentUser, userSecondaryInfo } = useAuth();

  return (
    <div className="w-293px flex flex-row items-center space-x-4 justify-between pl-4 mt-5">
      <div className="flex flex-row space-x-4 justify-center items-center">
        <img
          src={
            currentUser.photoURL
              ? currentUser.photoURL
              : "https://i.pravatar.cc"
          }
          className="w-14 h-14 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <p className="font-medium text-sm">{userSecondaryInfo?.username}</p>
          <p className="text-gray-500 text-xs">Welcome to instagram</p>
        </div>
      </div>

      <button onClick={logout} className="text-blue-500 text-xs font-medium">
        Sign out
      </button>
    </div>
  );
};

export default MiniProfile;
