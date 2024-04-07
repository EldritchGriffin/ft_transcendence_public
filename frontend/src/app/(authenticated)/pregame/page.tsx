"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { User } from "../(interfaces)/userInterface";
import { fetchCurrentUser } from "../(handlers)/requestHandler";
import Image from "next/image";

const InviteToGameModal = (props: any) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const inviteUser = (expected: User) => {
    if (expected.status !== "online") {

      toast.error("User cannot be invited");
      return;
    }
    router.push(`/game?mode=${props.gameMode}&invite=${expected.intraLogin}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await fetchCurrentUser();
        setUser(user);
      } catch (error: any) {
        toast.error(error.response.data.message);
      }
    };
    fetchData();
    return () => {
      setUser(null);
    };
  }, []);
  if (!user) return null;
  return (
    <div className="flex justify-center items-center fixed inset-0  backdrop-blur-sm">
      <div className="bg-white rounded-lg flex flex-col w-[40rem] h-[40rem] gap-4 p-7">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-5xl text-black">Play a Game</h1>
          <button onClick={() => props.toggleModal()} className="text-3xl mb-4">
            &times;
          </button>
        </div>
        <span className="text-accent_red text-2xl">Invite a Friend</span>
        <div className="flex flex-col gap-4 mt-10 overflow-scroll custom-scrollbar">
          {user.friends?.map((friend, index) => {
            return (
              <div
                key={index}
                className="flex flex-row items-center justify-between bg-slate-100 p-5 rounded-lg"
              >
                <div className="flex flex-row items-center gap-10">
                  <Image
                    src={friend.avatarLink ? friend.avatarLink : "/user.png"}
                    alt="user image"
                    width={50}
                    height={50}
                    className="rounded-full w-auto"
                    priority={true}
                  />
                  <span className="text-2xl">{friend.nickname}</span>
                </div>
                <button
                  onClick={() => inviteUser(friend)}
                  className="bg-accent_red w-20 h-10 text-white"
                >
                  <span>Invite</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Pregame = () => {
  const [gameMode, setGameMode] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const router = useRouter();

  const toggleModal = () => {
    setShowModal(!showModal);
  };
  const handleGameMode = (mode: string) => {
    const active = document.getElementById(mode);
    const buttons = document.querySelectorAll("button");
    buttons.forEach((button) => {
      if (button.id !== "0" && button.id !== "1") {
        button.classList.remove("bg-accent_red", "text-white");
        button.classList.add("text-black");
      }
    });
    if (active) {
      active.classList.remove("bg-white", "text-white");
      active.classList.add("bg-accent_red");
      active.classList.add("text-white");
    }

    setGameMode(mode);
  };

  const handleRandomGame = () => {
    if (gameMode === "") {
      toast.error("Please choose a game mode");
    } else {
      router.push(`/game?mode=${gameMode}`);
    }
  };
  const handleInviteButton = () => {
    if (gameMode === "") {
      toast.error("Please choose a game mode");
    } else {
      toggleModal();
    }
  };
  return (
    <div className="h-screen flex justify-center items-center">
      <div className="bg-white rounded-lg flex flex-col w-[40rem] h-[40rem] gap-4 p-7">
        <h1 className="text-5xl text-black">Play a Game</h1>
        <span className="text-accent_red text-2xl">Choose a game mode</span>
        <div className="mt-auto flex flex-col gap-4">
          <button
            onClick={() => handleGameMode("easy")}
            id="easy"
            className="bg-white h-16 hover:bg-red-300 border-accent_red border-4 rounded-xl text-black"
          >
            <span className=" text-3xl">Easy</span>
          </button>
          <button
            onClick={() => handleGameMode("medium")}
            id="medium"
            className="bg-white h-16 hover:bg-red-300 border-accent_red border-4 rounded-xl text-black"
          >
            <span className=" text-3xl">Medium</span>
          </button>
          <button
            onClick={() => handleGameMode("hard")}
            id="hard"
            className="bg-white h-16 hover:bg-red-300 border-accent_red border-4 rounded-xl text-black"
          >
            <span className=" text-3xl">Hard</span>
          </button>
        </div>
        <div className="flex flex-row gap-4 items-center justify-center mt-auto">
          <button
            onClick={() => handleRandomGame()}
            id="0"
            className="bg-accent_red h-16 hover:bg-red-300 w-full text-white"
          >
            <span className=" text-3xl">Random game</span>
          </button>
          <button
            id="1"
            className="bg-accent_red h-16 hover:bg-red-300 w-full text-white"
            onClick={() => handleInviteButton()}
          >
            <span className=" text-3xl">Invite friend</span>
          </button>
        </div>
      </div>
      {showModal && (
        <InviteToGameModal toggleModal={toggleModal} gameMode={gameMode} />
      )}
    </div>
  );
};

export default Pregame;
