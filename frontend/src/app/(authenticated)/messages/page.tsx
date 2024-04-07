"use client";
import React, { useEffect, useState } from "react";
import { Channel } from "../(interfaces)/channelInterface";
import { User } from "../(interfaces)/userInterface";
import ChatSelector from "../(components)/chatSelector";
import ChannelHeader from "../(components)/channelHeader";
import ChatBody from "../(components)/chatBody";
import { io } from "socket.io-client";
import Cookies from "js-cookie";
import { fetchCurrentUser } from "../(handlers)/requestHandler";
import { useSocket } from "../(contexts)/socketContext";

const ChatPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [channels, setChannels] = useState<Channel[] | null>(null);
  const [selected, setSelected] = useState(0);
  const socket = useSocket();
  const handleSelectChannel = (channel: Channel) => {
    setSelectedChannel(channel);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user: User = await fetchCurrentUser();
        setUser(user);
      } catch (error) {
      }
    };
    fetchData();
  }, []);
  if (!user || !socket)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  return (
    <div className="flex  h-screen justify-center items-center">
      <div className="flex   w-[1500px]  flex-row gap-5 h-[860px]">
        <ChatSelector
          onChannelSelect={handleSelectChannel}
          channels={channels}
          setChannels={setChannels}
          user={user}
          selected={selected}
          setSelected={setSelected}
          socket={socket}
        />
        <div className="flex-col w-full h-[860px]">
          {channels ? (
            <ChannelHeader
              channel={selectedChannel}
              setSelectedChannel={setSelectedChannel}
              setChannels={setChannels}
              channels={channels}
              user={user}
              socket={socket}
              selected={selected}
            />
          ) : null}
          <ChatBody user={user} socket={socket} channel={selectedChannel} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
