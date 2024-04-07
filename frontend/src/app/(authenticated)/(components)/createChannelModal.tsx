import React, { useState } from "react";
import { Channel } from "../(interfaces)/channelInterface";
import { postNewChannel } from "../(handlers)/requestHandler";
import { verifyName, verifyPasswords } from "../(handlers)/inputHandlers";
import { toast } from "react-toastify";

const CreateChannelModal = (props: any) => {
  const [name, setName] = useState("");
  const [access, setAccess] = useState("Public");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const createChannel = async () => {
    try {
      verifyName(name);
    } catch (error) {
      toast.error("Invalid Name");
      return;
    }
    if (access === "2") {
      try {
        verifyPasswords(password, confirmPassword);
      } catch (error) {
        toast.error("Invalid Password");
        return;
      }
    }
    const newChannel = {
      title: name,
      description: "doesn't really matter",
      access: access,
      password: access === "2" ? password : undefined,
    };
    const channel = await postNewChannel(newChannel);
    props.setChannels((channels: Channel[]) => [...channels, channel]);
    props.toggleModal();
  };

  return (
    <div className="flex justify-center items-center fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="flex flex-col bg-white rounded-lg shadow-lg p-4">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-xl">Create a new channel</h1>
          <button onClick={() => props.toggleModal()} className="text-xl">
            &times;
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-sm mt-4">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-b-2 bg-transparent w-full h-full px-4 text-black focus:outline-none"
          />
          <select
            value={access}
            onChange={(e) => setAccess(e.target.value)}
            className="m-4 focus:outline-none"
          >
            <option value="0">Public</option>
            <option value="1">Private</option>
            <option value="2">Protected</option>
          </select>
          {access === "2" && (
            <div className="flex flex-col gap-3">
              <span className="text-sm mt-4">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-b-2 bg-transparent w-full h-full px-4 mb-4 text-black focus:outline-none"
              />
              <span className="text-sm mt-4">Confirm Password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-b-2 bg-transparent w-full h-full px-4 mb-4 text-black focus:outline-none"
              />
            </div>
          )}
        </div>
        <div className="flex flex-row justify-end gap-3">
          <button
            onClick={() => props.toggleModal()}
            className="bg-accent_red flex w-full h-8 justify-center items-center text-white hover:bg-red-300"
          >
            <span className="text-sm">Cancel</span>
          </button>
          <button
            onClick={() => createChannel()}
            className="bg-accent_red flex w-full h-8 justify-center items-center text-white hover:bg-red-300"
          >
            <span className="text-sm">Create</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChannelModal;
