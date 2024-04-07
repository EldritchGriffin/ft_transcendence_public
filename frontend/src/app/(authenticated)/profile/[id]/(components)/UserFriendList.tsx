import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

const UserFriendList = (props: any) => {
  const router = useRouter();
  const user_data = props.users_data.friends;
  const [Blocksearch, setBlocksearch] = useState("");
  const handleblocksearch = (event: any) => {
    setBlocksearch(event.target.value.toLowerCase());
  };
  const navigate_to_users_profile = (users_target_intra: string) => {
    const next_rout = "/profile/" + users_target_intra;
    router.push(next_rout);
  };
  return (
    <div className="h-full    w-full  sm:h-[407px] sm:w-[464px] ">
      <span className="text-white truncate">FRIENDS</span>
      <div className=" h-full w-full sm:h-[380px]   sm:w-[464px]  bg-primary_blue flex flex-col items-center ">
        {!user_data?.length ? (
          <p className="h-full w-full flex justify-center items-center  text-white">
            {" "}
            No friends{" "}
          </p>
        ) : (
          <div className="w-full h-full flex flex-col items-center space-y-3  pb-3 bg-primary_blue">
            <div className="flex flex-col space-y-5 pt-4 items-center">
              <input
                type="text"
                className=" outline-none w-60 flex justify-center bg-transparent text-white  border-b-4 border-white-500 placeholder-opacity-50 placeholder-white"
                placeholder="Search"
                onChange={handleblocksearch}
              />
            </div>

            <div className="flex  flex-row flex-wrap overflow-y-auto  custom-scrollbar justify-between px-4 ">
              {user_data?.map((item: any, index: any) =>
                item.nickname.toLowerCase().includes(Blocksearch) ? (
                  <div
                    className="w-[128px] h-[128px] flex items-center flex-col   space-y-3 pt-4  overflow-hidden  cursor-pointer"
                    key={index}
                    onClick={() => {
                      navigate_to_users_profile(item.intraLogin);
                    }}
                  >
                             <Image
          priority={true}
          src={item.avatarLink}
          id="profile_pic"
          width={320}
          height={320}
          alt=""
         draggable={false}

                      className="h-12 w-12 sm:h-24 sm:w-24  flex-none "
        />
                    <span className="h-2 w-2 text-sm  flex items-end justify-center text-center  text-white">
                      {" "}
                      {item.nickname}{" "}
                    </span>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserFriendList;
