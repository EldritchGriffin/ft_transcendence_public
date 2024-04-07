"use client";

import React, { useEffect, useState } from "react";
import Mhistory from "./hs2";
import UserFriendList from "./UserFriendList";
import ProfileUserInfo from "./profile_user_info";
import UserBlockList from "./UserBlockList";
import Publicuserinfo from "./public_user_info";
import Leadrboard from "./board";
import Stats from "./stats";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Achievements from "@/app/(authenticated)/achive/Achievements";
import { fetchLeaderBoard, fetchUserPublic } from "@/app/(authenticated)/(handlers)/requestHandler";

const PublicProfilePage = (props: any) => {
  const router = useRouter();

  const [users_data, setusers_data] = useState<any>(null);
  const [loading, setloading] = useState(true);
  const [leader_board, setleader_board] = useState<any>([]);

  const fetchGetDataBack = async () => {
    try {
      const response = await fetchUserPublic(props.id);
      setusers_data(response);
    } catch (error:any) {
    toast.error(error.response.data.message);

      if (error.response.status === 401)
        window.location.replace("/");
      router.push('/not-found')
    } finally {
      setloading(false);
    }
  };
  const fetchGetLeaderBoard = async () => {
    try {
      const result = await fetchLeaderBoard();
      setleader_board(result);
    } catch (error:any) {
    toast.error(error.response.data.message);

      if (error.response.status === 401)
        window.location.replace("/");
    }
  };
  useEffect(() => {
    if(!users_data)
    {
      fetchGetDataBack();
      fetchGetLeaderBoard();
    }
  }, []);
  if (loading || !leader_board) {
    return <p>loading........</p>;
  }
  return (

    <div className="w-full  flex flex-row gap-6 flex-wrap justify-center items-center min-h-screen">
      <div className="w-full  sm:w-[468px] md:w-[468px] flex flex-col test:order-2 pt-5 space-y-5">
        <div className="w-full h-[400px] sm:w-[468px]  md:w-full shadow-xl ">
         {users_data &&  <Publicuserinfo
            users_data={users_data}
            connected_user={props.users_data}
          />}
        </div>
        <div className="w-full h-[400px] sm:w-full  md:w-full shadow-xl">
          {leader_board && <Leadrboard result={leader_board} />}
        </div>
      </div>
      <div className="w-full  h-[825px] sm:w-[468px] md:w-[468px] flex flex-col  test:order-1 pt-5 space-y-5">
        <div className="w-full  h-full sm:w-[468px]  md:w-full shadow-xl">
          {users_data && <Mhistory result={users_data} />}
        </div>
      </div>
      <div className="w-full  sm:w-[468px] test1:w-[940px] test:w-[468px] flex flex-col pt-5 test1:flex-row test1:gap-6 test:gap-0 test:flex-col space-y-5 test1:space-y-0 test:order-3 test:space-y-5">
        <div className="w-full h-[400px] sm:w-[468px]  md:w-full shadow-xl">
          {users_data &&   <UserFriendList users_data={users_data} />}
        </div>
        <div className="w-full h-[400px] sm:w-[468px]   md:w-full shadow-xl">
        {leader_board && <Stats win={users_data} place={leader_board} />}
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
