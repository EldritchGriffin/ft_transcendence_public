import React, { useEffect, useState } from "react";
import { fetchChannels } from "../(handlers)/requestHandler";
import { Channel } from "../(interfaces)/channelInterface";

const ChannelsTab = (props: any) => {
  const [loading, setLoading] = useState(true);
  const filtered = props.channels?.filter((channel: Channel) =>
    channel.title.toLowerCase().includes(props.filter.toLowerCase())
  );
  const handleSelect = (channel: Channel) => {
    props.onChannelSelect(channel);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const channels = await fetchChannels();
        props.setChannels(channels);
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
        {filtered.map((channel: Channel, index: any) => (
          <button
            onClick={() => handleSelect(channel)}
            key={index}
            className="flex flex-row text-left justify-start items-center gap-2 w-full h-10 px-5 text-white hover:bg-cyan-600"
          >
            <span className="text-xl">{channel.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChannelsTab;
