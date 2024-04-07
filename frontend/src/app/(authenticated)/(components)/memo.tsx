"use client";

import { fetchCurrentUser } from "../(handlers)/requestHandler";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useState } from "react";
import { User } from "../(interfaces)/userInterface";
import Navbar_compo from "./navbar";
import { toast } from "react-toastify";
import { SocketContext } from "../(contexts)/socketContext";
import { Socket, io } from "socket.io-client";
import Cookies from "js-cookie";
import { userContext } from "../(contexts)/userContext";

export const Ft_memo = (props: any) => {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [valid, setValid] = useState<boolean>(false);
  const [currUser, setCurrUser] = useState<User | null>(null);
  const checkpathname = usePathname();

  const fetchuser = async () => {
    try {
      const res = await fetchCurrentUser();
      setCurrUser(res);
    } catch (error) {
      toast.error("could not fetch the user, redirect to login");
      router.push("/");
    }
  };

  useEffect(() => {
    fetchuser();
  }, [checkpathname]);
  useEffect(() => {
    if (!socket) {
      const token = Cookies.get("token");
      if (!token) {
        router.push("/");
      }
      setSocket(
        io(`http://${process.env.NEXT_PUBLIC_HOSTNAME}:3001/channels`, {
          extraHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      );
    }
    if (currUser) {
      if (!currUser.nickname) {
        router.push("/setupNickName");
      } else setValid(true);
    }
    return () => {};
  }, [currUser]);

  return valid ? (
    <>
      <userContext.Provider value={currUser}>
        <SocketContext.Provider value={socket}>
          <Navbar_compo /> {props.children}
        </SocketContext.Provider>
      </userContext.Provider>
    </>
  ) : null;
};
