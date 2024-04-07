import React, { useEffect, useState } from "react";
import { fetchUserDms } from "../(handlers)/requestHandler";
import { Channel } from "../(interfaces)/channelInterface";

const FriendsTab = (props: any) => {
  const friends: Channel[] = props.channels;
  const [loading, setLoading] = useState(true);
  const filtered = friends?.filter((friend: Channel) =>
    friend.title.toLowerCase().includes(props.filter.toLowerCase())
  );
  const handleSelect = (channel: Channel) => {
    props.onChannelSelect(channel);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const friends = await fetchUserDms();
        props.setChannels(friends);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => {
      props.setChannels([]);
    };
  }, []);
  if (loading) {
    return (
      <p className="flex text-white h-full justify-center items-center text-2xl">
        Loading...
      </p>
    );
  }
  return (
    <div className="h-full overflow-scroll custom-scrollbar">
      <div className="flex flex-col gap-2">
        {filtered.map((friend: Channel, index: number) => (
          <button
            onClick={() => handleSelect(friend)}
            key={index}
            className="flex flex-row justify-start items-center text-left gap-2 w-full h-10 px-5 text-white hover:bg-cyan-600"
          >
            <span className="text-xl">{friend.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FriendsTab;
