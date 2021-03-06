import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { AiFillHome, AiOutlineHeart } from 'react-icons/ai';
import { BiSearch } from 'react-icons/bi';
import { BsPatchPlus } from 'react-icons/bs';
import { FaRegUserCircle } from 'react-icons/fa';
import { HiOutlinePaperAirplane } from 'react-icons/hi';
import { useRecoilState } from 'recoil';

import { modalState } from '../../atoms/modalAtom';
import { HTMLInputEvent } from '../../compiler/types';
import { db, storage } from '../../firebase';
import { alertSoon } from '../../functions';
import { useAuth } from '../Context/AuthContext';

const Header = () => {
  const [_, setOpen] = useRecoilState(modalState);
  const { currentUser, logout, userSecondaryInfo } = useAuth();
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const filePickerRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const [selectedFile, setSelectedFile] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [usernames, setUsernames] = useState([] as string[]);
  const searchRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (userSecondaryInfo?.photoURL) {
      setAvatar(userSecondaryInfo?.photoURL);
    }
  }, [userSecondaryInfo]);

  const addImageToProfile = (e:HTMLInputEvent) => {
    const reader = new FileReader();
    if (e.target?.files && e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }

    reader.onload = (readerEvent) => {
      if (readerEvent.target?.result) {
        setSelectedFile(readerEvent.target?.result as string);
      }
    };
  };

  const uploadPicture = async () => {
    if (loading) return;

    setLoading(true);
    setAvatar(selectedFile);
    const imageRef = ref(storage, `${currentUser.uid}/profile.png`);
    imageRef.bucket.replace('appspot.com', 'firebaseapp.com');
    await uploadString(imageRef, selectedFile, 'data_url')
      .then(async () => {
        const downloadImageURL = await getDownloadURL(imageRef);
        setAvatar(downloadImageURL);
      })
      .catch((e) => console.log(e));
    getDownloadURL(ref(storage, `${currentUser.uid}/profile.png`)).then(
      (url) => {
        const userDoc = doc(db, `users/${currentUser.uid}`);
        updateDoc(userDoc, { photoURL: url });
      },
    );
    setOpen(false);
    setLoading(false);
    setSelectedFile('');
  };

  const goToMainPage = () => {
    router.push(`${process.env.BASE_PATH}/`);
  };

  const goToUserPage = (username: string, isSearch = false) => {
    if (isSearch && searchRef.current?.value) {
      searchRef.current.value = '';
      setUsernames([]);
    }
    router.push(`${process.env.BASE_PATH}/${username}`);
  };

  const search = async (str: string) => {
    const end = str.replace(/.$/, (c) =>
      String.fromCharCode(c.charCodeAt(0) + 1),
    );
    const querySnapshot = await getDocs(
      query(
        collection(db, 'users'),
        where('username', '>=', str),
        where('username', '<', end),
      ),
    );

    const res = [] as string[];

    await querySnapshot?.docs.forEach((doc) => {
      res.push(doc?.data()?.username);
    });

    setUsernames(res);
  };

  return (
    <>
      <div className="relative w-full min-h-[50px] sm:min-h-[60px] border-none flex justify-center items-center">
        <div className="w-full lg:w-[1024px] md:w-[768px] sm:w-[640px] sm:rounded-[32px] sm:rounded-t-none bg-[rgb(254,254,255)] sm:bg-white sm:shadow-sm fixed z-50">
          <div
            className="min-h-[50px] sm:min-h-[60px] flex flex-row px-4 justify-between 
      items-center sm:py-[10px] max-w-[970px] lg:mx-auto"
          >
            <div className="relative inline-grid flex-shrink-0">
              <img
                onClick={goToMainPage}
                className="h-[29px] w-auto relative top-1 cursor-pointer"
                src={`${process.env.BASE_PATH}/instTextLogo.svg`}
              />
            </div>
            {/* Middle: search Input */}
            <div className="hidden sm:block sm:relative max-w-xs">
              <div className="absolute inset-y-0 pl-3 flex items-center">
                <BiSearch className="w-5 h-5 text-gray-300" />
              </div>

              <input
                ref={searchRef}
                onKeyUp={(e) => search(e.currentTarget.value)}
                className="block w-full pl-10 bg-gray-50 placeholder-gray-300 sm:text-sm border-none rounded-[32px] focus:ring-0"
                type="text"
                placeholder="Search"
              />
              {usernames.length > 0 ? (
                <div className="absolute top-[32px] w-full max-h-[300px] bg-gray-50 overflow-y-scroll rounded-[32px] shadow-lg">
                  <ul className="px-4 py-2">
                    {usernames.map((username: string, index: number) => {
                      return (
                        <li
                          key={index}
                          className="w-full h-full cursor-pointer font-light"
                          onClick={() => goToUserPage(username, true)}
                        >
                          {username}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <></>
              )}
            </div>
            {/* End : Buttons */}
            <div className="flex flex-row items-center justify-end space-x-3 sm:space-x-3 md:space-x-4 lg:space-x-6 relative">
              <AiFillHome
                onClick={goToMainPage}
                className="hidden sm:block navbtn"
              />
              <div className="relative">
                <HiOutlinePaperAirplane
                  onClick={alertSoon}
                  className="navbtn rotate-45 relative bottom-1 left-1"
                />
                <div className="hidden md:flex absolute -top-1.5 left-[16px] text-xs w-4 h-4 bg-red-500 rounded-full items-center justify-center animate-pulse text-white">
                  3
                </div>
              </div>
              <BsPatchPlus
                onClick={() => setOpen(true)}
                className="navbtn w-6 h-6"
              />
              <AiOutlineHeart className="hidden navbtn w-8 h-8" />
              <div
                className="cursor-pointer"
                onClick={() => setOpenProfileModal(!openProfileModal)}
              >
                {avatar ? (
                  <img
                    className="h-9 w-9 rounded-full object-cover"
                    src={avatar}
                  />
                ) : (
                  <FaRegUserCircle className="h-7 w-7" />
                )}
              </div>
              {openProfileModal ? (
                <div className="absolute top-[76px] right-0 bg-[rgb(254,254,255)] border-[1px] border-gray-200 rounded-[32px] shadow-md flex flex-col items-center justify-center min-h-[280px] min-w-[210px]">
                  {avatar || selectedFile ? (
                    <img
                      onClick={() => filePickerRef.current.click()}
                      className="h-28 w-28 object-cover rounded-full cursor-pointer mt-[12px]"
                      src={selectedFile || avatar}
                    />
                  ) : (
                    <FaRegUserCircle
                      onClick={() => filePickerRef.current.click()}
                      className="h-28 w-28 cursor-pointer"
                    />
                  )}
                  <input
                    ref={filePickerRef}
                    type="file"
                    className="absolute"
                    hidden
                    onChange={addImageToProfile as any}
                  />
                  {selectedFile ? (
                    <button
                      className="mt-5 mb-1 bg-gray-800 h-[28px] w-[112px] text-white text-sm rounded-[32px] font-light"
                      disabled={loading}
                      onClick={uploadPicture}
                    >
                      {loading ? 'Loading...' : 'Upload'}
                    </button>
                  ) : (
                    <button
                      className="text-sm mt-5 mb-1 w-[112px] bg-gray-800 text-white rounded-[32px] py-2 px-4"
                      onClick={() => filePickerRef.current.click()}
                    >
                      Click to change
                    </button>
                  )}
                  <button
                    className="text-sm text-gray-800 mt-2 font-medium"
                    onClick={() => goToUserPage(userSecondaryInfo.username)}
                  >
                    My profile
                  </button>
                  <button
                    onClick={logout}
                    className="text-sm text-blue-500 mt-2 font-medium"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
