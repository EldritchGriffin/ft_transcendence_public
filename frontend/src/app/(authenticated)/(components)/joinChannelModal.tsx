import React, { useEffect, useState } from "react";
import { Channel } from "../(interfaces)/channelInterface";
import { fetchProtectedChannels } from "../(handlers)/requestHandler";
import { fetchPublicChannels } from "../(handlers)/requestHandler";
import { postJoinChannel } from "../(handlers)/requestHandler";
import { Bounce, toast } from "react-toastify";
import { exit } from "process";

const EnterPasswordModal = (props: any) => {
  const [password, setPassword] = useState<string>("");

  const handlePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleJoin = () => {
    props.joinChannel(props.selectedChannel, password);
    props.togglePasswordModal();
    props.toggleModal();
  };

  return (
    <div className="flex justify-center items-center fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="flex flex-col bg-white rounded-lg shadow-lg p-4">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-xl mb-4">Enter password</h1>
          <button
            onClick={() => props.togglePasswordModal()}
            className="text-xl mb-4"
          >
            &times;
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <input
            className="border-b-2 border-gray-300 rounded-md p-2 focus:outline-none"
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePassword}
          ></input>
          <button
            className="bg-accent_red w-full text-white hover:bg-red-400 h-10"
            onClick={handleJoin}
          >
            <span>Join</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ListProtectedChannels = (props: any) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  const togglePasswordModal = (channel: Channel) => {
    setSelectedChannel(channel);
    setPasswordModal(!passwordModal);
  };
  const joinChannel = async (channel: Channel, password: string) => {
    const data = {
      channel: channel.id.toString(),
      password: password,
    };
    try {
      const newChannel = await postJoinChannel(data);
    } catch (error) {
      toast.error("Invalid password");
    }
    props.toggleModal();
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const channels = await fetchProtectedChannels();
        setChannels(channels);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => {
      setChannels([]);
      setLoading(true);
    };
  }, []);
  if (loading)
    return (
      <div className="flex justify-center items-center text-lg">Loading...</div>
    );
  if (channels.length === 0)
    return (
      <div className="flex justify-center items-center text-lg h-full">
        No channels
      </div>
    );
  return (
    <div className="flex flex-col gap-3 h-96 w-80 overflow-scroll custom-scrollbar">
      {channels.map((channel: Channel, index: number) => (
        <div key={index} className="flex flex-row justify-between items-center">
          <span>{channel.title}</span>
          <button
            onClick={() => togglePasswordModal(channel)}
            className="bg-accent_red w-14 h-7 text-white"
          >
            <span>Join</span>
          </button>
          {passwordModal ? (
            <EnterPasswordModal
              toggleModal={props.toggleModal}
              togglePasswordModal={togglePasswordModal}
              setChannels={props.setChannels}
              joinChannel={joinChannel}
              selectedChannel={selectedChannel}
            ></EnterPasswordModal>
          ) : null}
        </div>
      ))}
    </div>
  );
};

const ListPublicChannels = (props: any) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);

  const joinChannel = async (channel: Channel) => {
    try {
      const newChannel = await postJoinChannel({
        channel: channel.id.toString(),
      });
      props.toggleModal();
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const channels = await fetchPublicChannels();
        setChannels(channels);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => {
      setChannels([]);
      setLoading(true);
    };
  }, []);
  if (loading)
    return (
      <div className="flex justify-center items-center text-lg h-full">
        Loading...
      </div>
    );
  if (channels.length === 0)
    return (
      <div className="flex justify-center items-center text-lg h-full">
        No channels
      </div>
    );
  return (
    <div className="flex flex-col gap-3 h-96 w-80 overflow-scroll custom-scrollbar">
      {channels.map((channel: Channel, index: number) => (
        <div key={index} className="flex flex-row justify-between items-center">
          <span>{channel.title}</span>
          <button
            onClick={() => joinChannel(channel)}
            className="bg-accent_red w-14 h-7 text-white"
          >
            <span>Join</span>
          </button>
        </div>
      ))}
    </div>
  );
};
const JoinChannelModal = (props: any) => {
  const [selected, setSelected] = useState<string>("public");

  const handleSelected = (state: string) => {
    setSelected(state);
  };

  const renderList = () => {
    if (selected === "public") {
      return (
        <ListPublicChannels
          toggleModal={props.toggleModal}
          setChannels={props.setChannels}
        ></ListPublicChannels>
      );
    } else {
      return (
        <ListProtectedChannels
          toggleModal={props.toggleModal}
          setChannels={props.setChannels}
        ></ListProtectedChannels>
      );
    }
  };

  return (
    <div className="flex justify-center items-center fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="flex flex-col bg-white rounded-lg shadow-lg p-4">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-xl">Join a channel</h1>
          <button onClick={() => props.toggleModal()} className="text-xl">
            &times;
          </button>
        </div>
        <div className="flex flex-col gap-3 h-96 w-80">
          <div className="flex flex-row justify-around mt-4 gap-3">
            <button
              className="bg-accent_red w-full text-white hover:bg-red-400 h-10"
              onClick={() => handleSelected("public")}
            >
              <span>Public</span>
            </button>
            <button
              className="bg-accent_red w-full hover:bg-red-400 text-white h-10"
              onClick={() => handleSelected("protected")}
            >
              <span>Protected</span>
            </button>
          </div>
          {renderList()}
        </div>
      </div>
    </div>
  );
};

export default JoinChannelModal;
