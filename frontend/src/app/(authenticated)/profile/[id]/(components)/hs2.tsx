"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Mhistory = ({ result }: any) => {
  const history: any = result?.matchHistory;
  const router = useRouter();
  return (
    <div className="bck flex flex-col w-full  h-[825px] sm:w-[464px] ">
      <a className="text-white truncate ">MATCH HISTORY</a>
      <div className="w-full h-full sm:h-[820px]  sm:w-[464px] bg-primary_blue">
        {!history?.length ? (
          <p className="h-full w-full flex justify-center items-center  text-white">
            {" "}
            No MATCH HISTORY{" "}
          </p>
        ) : (
          <div className="flex flex-col overflow-y-auto custom-scrollbar h-[800px] shadow-black">
            {history &&
              history.map((h: any, i: number) => (
                <div
                  key={i}
                  className="flex flex-row justify-between items-center py-5 pl-[24px] pr-[24px] sm:px-4 sm:m-5"
                >
                  <div
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => {
                      router.push(`/profile/${h.player1}`);
                    }}
                  >
                    <Image
                      src={
                        h.player1 === h.players[0].intraLogin
                          ? h.players[0].avatarLink
                          : h.players[1].avatarLink
                      }
                      alt=""
                      width={100}
                      height={100}
                      className="cursor-pointer"
                      draggable={false}
                    />
                    <p className="text-xs sm:text-lg  text-white">
                      {h.player1 === h.players[0].intraLogin
                        ? h.players[0].nickname
                        : h.players[1].nickname}
                    </p>
                  </div>
                  <p className="text-xs  sm:text-lg test1:text-3xl px-2 pb-5 text-white">
                    {h.result > 0 ? "WON" : "LOST"}
                  </p>
                  <div
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => {
                      router.push(`/profile/${h.player2}`);
                    }}
                  >
                    <Image
                      src={
                        h.player2 === h.players[1].intraLogin
                          ? h.players[1].avatarLink
                          : h.players[0].avatarLink
                      }
                      alt=""
                      width={100}
                      height={100}
                      className="cursor-pointer"
                      draggable={false}
                    />
                    <p className="text-xs sm:text-lg  text-white">
                      {h.player2 === h.players[1].intraLogin
                        ? h.players[1].nickname
                        : h.players[0].nickname}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mhistory;
