import React, { useEffect, useState } from "react";
import ChannelsTab from "./channelsTab";
import FriendsTab from "./friendsTab";
import CreateChannelModal from "./createChannelModal";
import JoinChannelModal from "./joinChannelModal";
import NewFriendModal from "./newFriendModal";
import { Socket } from "socket.io-client";
import { Channel } from "../(interfaces)/channelInterface";
import { User } from "../(interfaces)/userInterface";

const CreateChannel = (props: any) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const toggleCreateModal = () => {
    setShowCreateModal(!showCreateModal);
  };
  const toggleJoinModal = () => {
    setShowJoinModal(!showJoinModal);
  };
  return (
    <div className="flex">
      <button
        onClick={() => toggleCreateModal()}
        className=" bg-accent_red flex w-full h-12 justify-center items-center text-white hover:bg-red-300"
      >
        <span className="text-lg">Create</span>
      </button>
      <button
        onClick={() => toggleJoinModal()}
        className=" bg-accent_red flex w-full h-12 justify-center items-center text-white hover:bg-red-300"
      >
        <span className="text-lg">Join</span>
      </button>
      {showCreateModal ? (
        <CreateChannelModal
          toggleModal={toggleCreateModal}
          setChannels={props.setChannels}
        />
      ) : null}
      {showJoinModal ? (
        <JoinChannelModal
          toggleModal={toggleJoinModal}
          setChannels={props.setChannels}
        />
      ) : null}
    </div>
  );
};

const SelectNewFriend = (props: any) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const toggleModal = () => {
    setShowModal(!showModal);
  };
  return (
    <div>
      <button
        onClick={() => toggleModal()}
        className=" bg-accent_red flex w-full h-12 justify-center items-center text-white hover:bg-red-300"
      >
        <span className="text-lg">New Chat</span>
      </button>
      {showModal ? (
        <NewFriendModal
          toggleModal={toggleModal}
          user={props.user}
          setChannels={props.setChannels}
        />
      ) : null}
    </div>
  );
};

const ChatSelector = (props: any) => {
  const socket: Socket = props.socket;
  const selectedTab = props.selected;
  const setSelected = props.setSelected;
  const [filter, setFilter] = useState("");
  const handleSelect = (index: number) => {
    let selected;
    let unselected;

    if (selectedTab === index) return;
    if (index === 0) {
      selected = "friends";
      unselected = "channels";
      props.onChannelSelect(null);
      props.setChannels([]);
    } else {
      selected = "channels";
      unselected = "friends";
      props.onChannelSelect(null);
      props.setChannels([]);
    }

    document.getElementById(selected)?.classList.remove("text-white");
    document.getElementById(selected)?.classList.add("text-accent_red");
    document.getElementById(unselected)?.classList.remove("text-accent_red");
    document.getElementById(unselected)?.classList.add("text-white");
    setSelected(index);
  };
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    setFilter(searchTerm);
  };
  useEffect(() => {
    if (selectedTab !== 0) return;
    socket.on("startDM", (message: { joinedChannel: Channel }) => {
      props.setChannels((prev: Channel[]) => {
        return [...prev, message.joinedChannel];
      });
    });
    return () => {
      socket.off("startDM");
    };
  }, [props.channels, props.selected]);
  return (
    <div className="flex space-y-5 flex-col w-[500px] h-full bg-primary_blue">
      <div className="flex  w-full h-10 mt-2 justify-evenly">
        <button onClick={() => handleSelect(0)}>
          <span id="friends" className="text-accent_red text-2xl">
            Friends
          </span>
        </button>
        <button onClick={() => handleSelect(1)}>
          <span id="channels" className="text-white text-2xl">
            Channels
          </span>
        </button>
      </div>
      <div className="flex justify-center items-center flex-col">
        <input
          id="search"
          type="text"
          placeholder="Search"
          className="my-5 text-white text-lg bg-transparent border-b focus:outline-none"
          onChange={handleSearch}
        />
      </div>
      {selectedTab === 0 ? (
        <FriendsTab
          onChannelSelect={props.onChannelSelect}
          channels={props.channels}
          setChannels={props.setChannels}
          filter={filter}
        />
      ) : (
        <ChannelsTab
          onChannelSelect={props.onChannelSelect}
          channels={props.channels}
          setChannels={props.setChannels}
          filter={filter}
        />
      )}
      <div>
        {selectedTab === 0 ? (
          <SelectNewFriend user={props.user} setChannels={props.setChannels} />
        ) : (
          <CreateChannel setChannels={props.setChannels} />
        )}
      </div>
    </div>
  );
};

export default ChatSelector;
