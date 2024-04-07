"use client";
import Lottie from "lottie-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "./logo.json";

const Home = () => {
  const hostname: string = `http://${process.env.NEXT_PUBLIC_HOSTNAME}:3001/auth/signin`;

  const router = useRouter();
  return (
    <div className="flex gap-10 justify-center h-screen items-center">
      <div className="flex flex-col">
        <span className="text-[64px] text-accent_red">PongVerse</span>
        <span className="text-[19px] text-white">PaddleBattles</span>
        <div className="flex gap-5 mt-5">
          <form method="get" action={hostname}>
            <button className="w-[110px] h-[40px] text-white text-[14px] bg-accent_red">
              Start
            </button>
          </form>
        </div>
      </div>
      <Lottie
        animationData={logo}
        loop={true}
        style={{ width: 1000, height: 1000 }}
      />
    </div>
  );
};

export default Home;
