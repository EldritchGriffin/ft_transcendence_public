"use client";
import React, { useEffect, useState } from "react";
import { Channel } from "../(interfaces)/channelInterface";
import { fetchChannelMessages } from "../(handlers)/requestHandler";
import ChatBubble from "./chatBubble";
import { User } from "../(interfaces)/userInterface";
import { toast } from "react-toastify";

const handleSendMessage = (socket: any, channel: Channel, user: User) => {
  const message = document.getElementById("message") as HTMLInputElement;
  if (!message) return;
  const messageText = message.value;
  if (!messageText) return;
  const messageData = {
    channelId: channel.id,
    content: messageText,
    senderLogin: user.intraLogin,
  };
  socket.emit("sendMessage", messageData, (payload: any) => {
    if (payload.error) {
      toast.error(payload.error);
    }
  });
  message.value = "";
};

const ChatBody = (props: any) => {
  const user = props.user;
  const channel: Channel = props.channel;
  const socket = props.socket;
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!channel) return;
    const fetchData = async () => {
      try {
        const messages = await fetchChannelMessages(channel.id.toString());
        setMessages(messages);
      } catch (error: any) {
        toast.error(error.response.data.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    socket.on("messageReceived", (message: any) => {
      if (message.channelId !== channel.id) return;
      setMessages((messages) => [...messages, message]);
    });
    return () => {
      socket.off("messageReceived");
      setMessages([]);
      setLoading(true);
    };
  }, [channel]);
  useEffect(() => {
    const field = document.getElementById("messages") as HTMLInputElement;
    if (field) field.scrollTop = field.scrollHeight;
  }, [messages]);
  if (!channel) {
    return (
      <div className="flex text-white h-[747px]  justify-center items-center text-5xl bg-primary_blue">
        Select a channel to start chatting!
      </div>
    );
  }
  if (loading || !messages || !user) {
    return (
      <div className="flex text-white h-[747px] justify-center items-center text-2xl bg-primary_blue">
        Loading...
      </div>
    );
  }
  return (
    <div className="flex h-[747px] flex-col bg-primary_blue">
      <div
        id="messages"
        className="h-full overflow-y-scroll overflow-x-hidden custom-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="flex text-white h-[747px] justify-center items-center text-2xl bg-primary_blue">
            No messages yet!
          </div>
        ) : (
          messages?.map((message: any, index: number) => (
            <ChatBubble key={index} user={user} message={message} />
          ))
        )}
      </div>
      <div className="w-full h-9 text-white">
        <input
          id="message"
          type="text"
          className=" border-b-2 bg-transparent w-full h-full px-4 text-white focus:outline-none text-xl placeholder:text-white placeholder:opacity-10"
          placeholder="Type a message..."
          autoComplete="off"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage(socket, channel, user);
          }}
        />
      </div>
    </div>
  );
};

export default ChatBody;
