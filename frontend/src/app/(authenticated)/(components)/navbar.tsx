"use client";
import React, { Fragment, use, useEffect, useRef } from "react";
import { useState } from "react";
import {
  AiOutlineMenu,
  AiOutlineComment,
  AiOutlineIdcard,
  AiFillHome,
} from "react-icons/ai";
import Cookies from "js-cookie";
import { MdLogout } from "react-icons/md";
import { GiPingPongBat } from "react-icons/gi";
import { usePathname, useRouter } from "next/navigation";
import Model2Fa from "./Model2Fa";
import { toast } from "react-toastify";
import {
  fetchCurrentUser,
  handlTFA,
  fetchAllUsers,
} from "../(handlers)/requestHandler";
import Notif from "../test/notif";
import { User } from "../(interfaces)/userInterface";
import { notif_element } from "../(interfaces)/channelInterface";
import { useSocket } from "../(contexts)/socketContext";
import Lottie from "lottie-react";
import logo from "../../logo.json";
import { useUser } from "../(contexts)/userContext";
import Image from "next/image";

const Navbar_search_list = (props: any) => {
  const router = useRouter();
  const navigate_to_users_profile = (users_target_intra: string) => {
    var next_rout = "/profile/" + users_target_intra;
    props.setshowsearch(false);
    router.push(next_rout);
  };
  return (
    <div
      className="w-full h-fit flex items-center space-x-5 flex-row space-y-3 overflow-hidden border-2 "
      key={props.index}
      onClick={() => {
        navigate_to_users_profile(props.item.intraLogin);
      }}
    >
      {props.item.avatarLink ? (
        <Image
          src={props.item.avatarLink || ""}
          width={320}
          height={320}
          alt=""
          className="h-10 w-10 sm:h-[60px] sm:w-[60px] flex-none   "
          draggable={false}
          priority={true}
        />
      ) : null}

      <span className="h-fit w-fit  text-sm flex items-center  justify-center text-center text-white">
        {" "}
        {props.item.nickname}{" "}
      </span>
    </div>
  );
};

export default function Navbar_compo() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [users_data, setusers_data] = useState<any>();
  const [showsearch, setshowsearch] = useState(false);
  const [navactive, setnavactive] = useState(3);
  const [navsearch, setnavsearch] = useState("");
  const searchRef = useRef(null);
  const [show2fa, setshow2fa] = useState(false);
  const currUser = useUser();
  const [twofa, settwofa] = useState(currUser.TFA);
  const checkpathname = usePathname();
  const socket = useSocket();
  const [data, setData] = useState<notif_element[]>([]);
  const [notif_counter, setnotif_counter] = useState(0);
  const openNav = () => {
    setShow(!show);
  };

  useEffect(() => {
    if (checkpathname === "/messages") {
      setnavactive(2);
    } else if (
      checkpathname === "/user/me" ||
      checkpathname.includes("profil")
    ) {
      setnavactive(3);
    } else if (checkpathname === "/pregame" || checkpathname === "/game") {
      setnavactive(4);
    }
  }, [checkpathname]);

  const handeldesaible2fa = async () => {
    try {
      const res = await handlTFA();
      toast.success("Two Factor Authentication Disabled");
      settwofa(false);
    } catch (error) {
      toast.error("Error Disabling Two Factor Authentication");
    }
  };

  const fetchserch = async () => {
    try {
      const res = await fetchAllUsers();
      setusers_data(res);
    } catch (error) {}
  };

  const handleLogoutClick = () => {
    Cookies.remove("token", { path: "/" });
    window.location.href = "/";
  };
  const handlenotifclick = (item: any) => {
    if (item.action === "Add") router.push("profile/" + item.intralogin);
  };

  useEffect(() => {
    fetchserch();

    socket.on("gameInvite", (invite) => {
      setnotif_counter(notif_counter + 1);
      setData((Data) => [
        ...Data,
        {
          id: notif_counter,
          action: invite.action,
          receiver: invite.receiver,
          sender: {
            avatarLink: invite.sender.avatarLink,
            intraLogin: invite.sender.intraLogin,
            nickname: invite.sender.nickname,
          },
        },
      ]);
      toast.success("Game Invitation");
    });
    socket.on("friendRequest", (_data: notif_element) => {
      if (_data.sender.intraLogin === currUser?.intraLogin) return;
      setnotif_counter(notif_counter + 1);
      setData((Data) => [
        ...Data,
        {
          id: notif_counter,
          action: "friendRequest",
          receiver: _data.receiver,
          sender: {
            avatarLink: _data.sender.avatarLink,
            intraLogin: _data.sender.intraLogin,
            nickname: _data.sender.nickname,
          },
        },
      ]);
      toast.success(`${_data.sender.intraLogin} Friend Requested`);
    });

    socket.on("friendRequestCancelled", (_data: notif_element) => {
      if (_data.sender.intraLogin === currUser?.intraLogin) return;
      setnotif_counter(notif_counter + 1);
      setData((Data) => [
        ...Data,
        {
          id: notif_counter,
          action: "RequestCancelled",
          receiver: _data.receiver,
          sender: {
            avatarLink: _data.sender.avatarLink,
            intraLogin: _data.sender.intraLogin,
            nickname: _data.sender.nickname,
          },
        },
      ]);
      toast.error(`${_data.sender.intraLogin} Cancelled Requested Friend`);
    });
    socket.on("friendRejected", (_data: notif_element) => {
      if (_data.sender.intraLogin === currUser?.intraLogin) return;
      setnotif_counter(notif_counter + 1);
      setData((Data) => [
        ...Data,
        {
          id: notif_counter,
          action: "friendRejected",
          receiver: _data.receiver,
          sender: {
            avatarLink: _data.sender.avatarLink,
            intraLogin: _data.sender.intraLogin,
            nickname: _data.sender.nickname,
          },
        },
      ]);
      toast.error(`${_data.sender.intraLogin} Rejected Requested Friend`);
    });
    socket.on("friendAccepted", (_data: notif_element) => {
      if (_data.sender.intraLogin === currUser?.intraLogin) return;
      setnotif_counter(notif_counter + 1);
      setData((Data) => [
        ...Data,
        {
          id: notif_counter,
          action: "friendAccepted",
          receiver: _data.receiver,
          sender: {
            avatarLink: _data.sender.avatarLink,
            intraLogin: _data.sender.intraLogin,
            nickname: _data.sender.nickname,
          },
        },
      ]);
      toast.success(`${_data.sender.intraLogin} Accepted Requested Friend`);
    });
    socket.on("friendRemoved", (_data: notif_element) => {
      if (_data.sender.intraLogin === currUser?.intraLogin) return;
      setnotif_counter(notif_counter + 1);
      setData((Data) => [
        ...Data,
        {
          id: notif_counter,
          action: "friendRemoved",
          receiver: _data.receiver,
          sender: {
            avatarLink: _data.sender.avatarLink,
            intraLogin: _data.sender.intraLogin,
            nickname: _data.sender.nickname,
          },
        },
      ]);
      toast.error(`${_data.sender.intraLogin} Removed From Friend`);
    });
    return () => {
      socket.off("friendRequest");
      socket.off("friendRequestCancelled");
      socket.off("friendRejected");
      socket.off("friendAccepted");
      socket.off("friendRemoved");
      socket.off("gameInvite");
    };
  }, [data]);

  const handlenavsearch = (event: any) => {
    setnavsearch(event.target.value);
  };
  const showsearchfield = () => {
    fetchserch();
    setshowsearch(true);
    setShow(false);
  };
  const hidesearchfield = () => {
    setshowsearch(false);
  };

  const handlecheck = () => {
    if (show2fa === false && twofa === false) {
      setshow2fa(true);
    } else if (show2fa === false && twofa === true) {
      handeldesaible2fa();
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !(searchRef.current as HTMLElement).contains(event.target as Node)
      ) {
        hidesearchfield();
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [searchRef]);

  if (checkpathname === "/twoFactorAuth") {
    return null;
  }

  return (
    <Fragment>
      <nav className=" fixed w-full h-16 z-10 shadow-xl bg-primary_blue ">
        <div className="flex justify-between items-center h-full w-full px-4 2xl:px-9">
          <div className="flex items-center space-x-4">
            <div className="relative flex md:gap-8 lg:gap-16 items-center space-x-4">
              <span className="oo flex items-center text-sm md:text-2xl font-bold select-none">
                <Lottie
                  animationData={logo}
                  loop={true}
                  style={{ width: 100, height: 100 }}
                />
                PongVerse
              </span>
              <div
                tabIndex={0}
                className="flex flex-col space-y-10 "
                ref={searchRef}
              >
                <input
                  type="text"
                  className="w-[120px] sm:w-auto outline-none bg-transparent text-white text-sm  border-b-2 border-white-500 placeholder-opacity-50 placeholder-white"
                  placeholder="Search"
                  onChange={handlenavsearch}
                  onFocus={showsearchfield}
                />
                {showsearch && users_data ? (
                  <div
                    tabIndex={0}
                    className="absolute  w-[300px]  h-[200px] bg-primary_blue space-y-3  pt-2 overflow-y-auto custom-scrollbar"
                  >
                    {users_data?.map((item: any, index: any) =>
                      item.intraLogin != currUser?.intraLogin &&
                      (item.intraLogin.includes(navsearch) || item.nickname.includes(navsearch)) ? (
                        <Navbar_search_list
                          item={item}
                          index={index}
                          key={index}
                          setshowsearch={setshowsearch}
                        />
                      ) : null
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="hidden  md:flex ">
            <div className="flex items-center lg:space-x-16 space-x-7">
              <div
                className="flex   p-2  duration-200 hover:-translate-y-0.5 cursor-pointer"
                style={{
                  borderBottom: navactive === 2 ? "2px solid white" : "none",
                  marginTop: navactive === 2 ? "15px" : "0",
                }}
                onClick={() => {
                  setnavactive(2);
                  router.push("/messages");
                }}
              >
                <AiOutlineComment size={25} className="text-white mr-4" />
                <a className="text-white text-sm lg:text-lg font-bold select-none">
                  Messages
                </a>
              </div>
              <div
                className="flex  p-2  duration-200 hover:-translate-y-0.5 cursor-pointer"
                style={{
                  borderBottom: navactive === 3 ? "2px solid white" : "none",
                  marginTop: navactive === 3 ? "15px" : "0",
                }}
                onClick={() => {
                  setnavactive(3);
                  router.push("/user/me");
                }}
              >
                <AiOutlineIdcard size={25} className="text-white mr-4" />
                <a className="text-white text-sm lg:text-lg font-bold select-none">
                  Profile
                </a>
              </div>
              <div
                className="flex  p-2  duration-200 hover:-translate-y-0.5 cursor-pointer"
                style={{
                  borderBottom: navactive === 4 ? "2px solid white" : "none",
                  marginTop: navactive === 4 ? "15px" : "0",
                }}
                onClick={() => {
                  setnavactive(4);
                  router.push("/pregame");
                }}
              >
                <GiPingPongBat size={25} className="text-white mr-4" />
                <a className="text-white text-sm lg:text-lg font-bold select-none ">
                  Game
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-row w-[300px] justify-end">
            <div className="hidden md:flex justify-end items-center space-x-4 cursor-pointer ">
              <div className="dropdown dropdown-end">
                <Notif
                  socket={socket}
                  handlenotifclick={handlenotifclick}
                  data={data}
                  setData={setData}
                  key={data?.length}
                />
              </div>
              <div className="hidden md:flex justify-end items-center space-x-4  cursor-pointer ">
                <div className="dropdown dropdown-end">
                  <AiOutlineMenu
                    size={35}
                    tabIndex={0}
                    className="text-white"
                  />
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[1] menu p-2 shadow bg-primary_blue rounded-box w-[350px]"
                  >
                    <li>
                      <a>
                        <div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              value=""
                              className="sr-only peer"
                              checked={twofa}
                              onChange={() => {
                                handlecheck();
                              }}
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300  rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all  peer-checked:bg-accent_red"></div>
                            <span className="ms-3 text-lg font-medium  text-white ">
                              Two Factor Authentication
                            </span>
                          </label>
                        </div>
                      </a>
                    </li>
                    <li>
                      <a>
                        <button
                          className="w-fit h-fit  text-2xl gap-3 font-bold text-white items-center flex"
                          onClick={handleLogoutClick}
                        >
                          <MdLogout size={50} className="oo" />
                          Log out
                        </button>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div
              onClick={openNav}
              className="text-white text-3xl cursor-pointer md:hidden"
            >
              <AiOutlineMenu size={35} />
            </div>
            <div
              className={
                show
                  ? "fixed top-16 left-0 md:hidden w-[65%] h-screen bg-primary_blue ease-in p-10 duration-500 z-50"
                  : "fixed left-[-100%] top-16 h-screen p-10 ease-in duration-500"
              }
            >
              <div className="dropdown dropdown-start flex  text-white items-center">
                <Notif
                  socket={socket}
                  handlenotifclick={handlenotifclick}
                  data={data}
                  setData={setData}
                  key={data?.length}
                />
                Notification
              </div>
              <div className="flex flex-col space-y-10 mt-10">
                <div
                  className="flex cursor-pointer"
                  onClick={() => {
                    setnavactive(2);
                    router.push("/messages");
                  }}
                >
                  <AiOutlineComment size={25} className="text-white mr-4" />
                  <a className="text-white text-sm lg:text-lg font-bold">
                    Messages
                  </a>
                </div>
                <div
                  className="flex cursor-pointer"
                  onClick={() => {
                    setnavactive(3);
                    router.push("/user/me");
                  }}
                >
                  <AiOutlineIdcard size={25} className="text-white mr-4" />
                  <a className="text-white text-sm lg:text-lg font-bold">
                    Profile
                  </a>
                </div>
                <div
                  className="flex cursor-pointer"
                  onClick={() => {
                    setnavactive(4);
                    router.push("/pregame");
                  }}
                >
                  <GiPingPongBat size={25} className="text-white mr-4" />
                  <a className="text-white text-sm lg:text-lg font-bold">
                    Game
                  </a>
                </div>
                <div className="flex">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="toggle"
                      checked={twofa}
                      onChange={() => {
                        handlecheck();
                      }}
                    />
                    <span className="ms-3 text-xs   text-white">
                      Two Factor Authentication
                    </span>
                  </label>
                </div>
              </div>
              <div className="flex items-center pt-10  space-x-4">
                <button
                  className="w-fit h-fit   text-2xl gap-3 font-bold text-white"
                  onClick={handleLogoutClick}
                >
                  <MdLogout size={50} className="oo" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {show2fa && (
        <Model2Fa
          OpenModel={show2fa}
          settwofa={settwofa}
          CloseModel={setshow2fa} 
        />
      )}
    </Fragment>
  );
}
