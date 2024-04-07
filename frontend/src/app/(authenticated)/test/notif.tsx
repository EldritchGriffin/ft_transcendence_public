import React from "react";
import { AiFillNotification } from "react-icons/ai";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { fetchCurrentUser } from "../(handlers)/requestHandler";
import Cookies from "js-cookie";
import { Socket } from "socket.io-client/debug";
import { useRouter } from "next/navigation";
import { BiSolidNotification } from "react-icons/bi";
import Image from "next/image";
import { notif_element } from "../(interfaces)/channelInterface";
export default function Notif(props: any) {
  const router = useRouter();
  const user_data = props.data;
  const handleRemoveItem = (idToRemove: notif_element) => {
    const updatedArray = props.data.filter(
      (item: any) => item.id !== idToRemove.id
    );

    if (idToRemove.action.includes("gameInvite")) {
      const id = idToRemove.action.replace("gameInvite", "");
      router.push(`/game?id=${id}`);
    } else
      router.push(
        `/profile/${
          props.data.filter((item: any) => item.id === idToRemove.id)[0].sender
            .intraLogin
        }`
      );
    props.setData(updatedArray);
  };

  return (
    <div className="">
      <BiSolidNotification size={35} tabIndex={0} className="text-white" />
      <div className="flex flex-col">
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-primary_blue rounded-box overflow-y-auto custom-scrollbar h-[350px] w-[350px]"
        >
          <li>
            <button
              className="flex justify-center items-end"
              onClick={() => props.setData([])}
            >
              Clear
            </button>
            {user_data?.map((item: notif_element, index: number) => (
              <a
                key={index}
                onClick={() => {
                  handleRemoveItem(item);
                }}
              >
                <div className="w-[320px] bg-white rounded-full flex flex-row space-y-5 ">
                  <div className="flex w-full space-x-12 items-center">
                    <Image
                      priority={true}
                      src={item.sender.avatarLink}
                      id="profile_pic"
                      width={320}
                      height={320}
                      alt=""
                      draggable={false}
                      className="w-16 h-16 rounded-full  "
                    />
                    <div className="text-black">{item.sender.intraLogin} </div>
                    <div className="text-black">
                      {item.action.includes("gameInvite")
                        ? "Game invite"
                        : item.action}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </li>
        </ul>
      </div>
    </div>
  );
}
