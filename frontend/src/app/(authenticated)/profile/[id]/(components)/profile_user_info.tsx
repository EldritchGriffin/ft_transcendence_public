import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { useSocket } from "@/app/(authenticated)/(contexts)/socketContext";
import Image from "next/image";


const ProfileUserInfo = (props: any) => {
  const user_data = props.users_data;
  const router = useRouter();
  const socket = useSocket();

  const updateNickname = () => {
    const next_rout = "/editProfile";
    router.push(next_rout);
  }





  return (
    <div className="flex flex-col w-full sm:w-[464px]">
      <span className="text-white truncate ">PROFILE</span>
      <div className=" w-full h-[380px] sm:w-[464px]  bg-primary_blue flex flex-col items-center space-y-5 pt-8 pb-8">
     { user_data?.avatarLink && (
               <Image
                src={user_data?.avatarLink}
                priority={true}
                id="profile_pic"
                width={320}
                height={320}
                alt=""
               draggable={false}
      
                className="h-32 w-32 sm:h-[174px] sm:w-[174px] border-4 br "
              />
        )}
     { user_data?.intraLogin && (

        <span className="h-full  w-full text-4xl sm:w-fit sm:h-[41px] text-center  text-white">
          {" "}
          {user_data?.intraLogin}{" "}
        </span>
     )}
     { user_data?.nickname && (

        <span className="h-full w-full text-2xl sm:w-[104] sm:h-[27px]  text-center text-white">
          {" "}
          {user_data?.nickname}{" "}
        </span>
     )}
        <button
          className=" border-red-400 w-[70px] h-[30px] bg-accent_red font-bold text-white"
          onClick={updateNickname}
        >
          {" "}
          Edit{" "}
        </button>
      </div>
    </div>
  );
};

export default ProfileUserInfo;
