"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const checkname = (person: any) => {
  if (person.nickname) {
    if (person.nickname.length > 10) {
      return person.nickname.slice(0, 10) + "...";
    } else {
      return person.nickname;
    }
  } else {
    if (person.intraLogin.length > 10) {
      return person.intraLogin.slice(0, 10) + "...";
    } else {
      return person.intraLogin;
    }
  }
};

const Leadrboard = (props: any) => {
  const result = props.result;
  const router = useRouter();
  return (
    <div className="flex flex-col w-full sm:w-[464px]">
      <a className="text-white truncate ">LEADERBOARD</a>
      <div className="w-full sm:w-[464px] bg-primary_blue">
        <div className="overflow-y-auto custom-scrollbar  h-[380px] shadow-black py-5 px-5">
          <ul role="list" className="">
            {result.map((person: any) => (
              <li
                key={person.intraLogin}
                className="flex  justify-between sm:px-8  gap-x-11 py-5"
              >
                <div
                  className="flex  gap-x-4  cursor-pointer"
                  onClick={() => {
                    router.push(`/profile/${person.intraLogin}`);
                  }}
                >
                           {person &&  <Image
                    priority={true}
                    id="profile_pic"
                    width={320}
                    height={320}
                    alt=""
                    src={person.avatarLink}
                  draggable={false}

                              className=" h-12 w-12 sm:h-20 sm:w-20 flex-none bg-gray-50"
                  />}
                  <div className="min-w-0 flex items-center">
                    <p className="text-sm sm:text-xl  leading-6 text-white ">
                      {checkname(person)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col  sm:w-[150px] items-end justify-center ">
                  <p className="text-sm sm:text-xl leading-6 text-white ">
                    {person.score}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Leadrboard;
