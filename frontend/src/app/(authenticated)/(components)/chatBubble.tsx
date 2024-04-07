import React from "react";
import { User } from "../(interfaces)/userInterface";
import { Message } from "../(interfaces)/messageInterface";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ChatBubble = (props: any) => {
  const user: User = props.user;
  const message: Message = props.message;
  const router = useRouter();
  const handleUsernameClick = () => {
    router.push(`/profile/${message.senderLogin}`);
  };

  if (message.senderLogin === user.intraLogin) {
    return (
      <div className=" ml-auto bg-slate-300 rounded-lg shadow-lg  m-4 p-4 max-w-md w-[60%]">
        <div className="flex w-full ">
          <p className="text-gray-800 text-xl break-all">{message.content}</p>
        </div>
      </div>
    );
  } else
    return (
      <div className="bg-white rounded-lg shadow-lg  mr-auto m-4 p-4 max-w-md w-[60%] ">
        <button
          onClick={() => handleUsernameClick()}
          className="flex gap-3 items-center"
        >
          <Image src={message.sender.avatarLink} alt="Profile Picture" width={64} height={64} className="rounded-full mb-2" draggable="false" />
          {/* <img
            src={message.sender.avatarLink}
            alt="Profile Picture"
            className="w-16 h-16 rounded-full mb-2"
            draggable="false"
          /> */}
          <span className="text-accent_red text-xl">{message.senderLogin}</span>
        </button>
        <div className="flex">
          <div className="ml-6">
            <p className="text-gray-800 text-xl break-all">{message.content}</p>
          </div>
        </div>
      </div>
    );
};

export default ChatBubble;
