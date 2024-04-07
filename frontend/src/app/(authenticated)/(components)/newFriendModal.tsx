import React, { useState } from "react";
import { User } from "../(interfaces)/userInterface";
import { Channel } from "../(interfaces)/channelInterface";
import { postNewDM } from "../(handlers)/requestHandler";
import { Bounce, toast } from "react-toastify";

const NewFriendModal = (props: any) => {
  const user: User = props.user;
  const friends = user.friends;
  const [filteredFriends, setFilteredFriends] = useState<User[]>(friends);

  const handleSearch = () => {
    const input = document.getElementById("FriendSearch") as HTMLInputElement;
    const value = input.value.toLowerCase();
    if (value === "") setFilteredFriends(friends);
    else
      setFilteredFriends(
        friends.filter((friend: User) =>
          friend.intraLogin.toLowerCase().includes(value)
        )
      );
  };

  const startChat = async (friend: User) => {

    try {
      const channel: Channel = await postNewDM(friend.intraLogin);
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
    props.toggleModal();
  };
  return (
    <div className="flex justify-center items-center fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="flex flex-col bg-white rounded-lg shadow-lg p-4">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-2xl mb-4">Chat with a friend</h1>
        </div>
        <div className="flex flex-row justify-between items-center mb-8">
          <input
            id="FriendSearch"
            className="w-80 h-7 rounded-md border-b-2 focus:outline-none"
            type="text"
            placeholder="Search"
            onChange={() => handleSearch()}
          />
        </div>
        <div className="w-80 h-80 flex flex-col gap-4 overflow-scroll custom-scrollbar">
          {filteredFriends.map((friend: User, index) => (
            <div
              key={index}
              className="flex flex-row justify-between items-center "
            >
              <h1 className="text-lg">{friend.intraLogin}</h1>
              <button
                onClick={() => startChat(friend)}
                className="bg-accent_red flex w-14 h-8 justify-center items-center text-white hover:bg-red-300"
              >
                <span className="text-sm">Chat</span>
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => props.toggleModal()}
          className="bg-accent_red flex w-full h-8 justify-center items-center text-white mt-4 hover:bg-red-300"
        >
          <span className="text-sm">Close</span>
        </button>
      </div>
    </div>
  );
};

export default NewFriendModal;
