import type { NextPage } from "next";
import Head from "next/head";
import Feed from "../components/Feed";
import Header from "../components/Header";
import Modal from "../components/Modal";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "../components/Context/AuthContext";

const Home: NextPage = () => {
  const router = useRouter();
  const { currentUser } = useAuth();

  console.log(currentUser.image)

  useEffect(() => {
    if (!currentUser) router.push("/auth/signin");
  }, [currentUser]);

  return (
    <div className="">
      {currentUser ? (
        <>
          <Head>
            <title>Instagram</title>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
          </Head>
          <div className="w-full min-h-[60px] border-none">
            <div className="w-full border-b-[1px] shadow-sm bg-white fixed z-50">
              <Header />
            </div>
          </div>
          <Feed />
          <Modal />
          <footer className=""></footer>
        </>
      ) : (
        <div className="w-full h-screen flex justify-center items-center">
          <h1 className="text-3xl">Redirecting...</h1>
        </div>
      )}
    </div>
  );
};

export default Home;
