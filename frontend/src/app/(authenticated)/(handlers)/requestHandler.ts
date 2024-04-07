import axios from "axios";

const api = axios.create({
  baseURL: `http://${process.env.NEXT_PUBLIC_HOSTNAME}:3001`,
  withCredentials: true,
});

export const fetchCurrentUser = async () => {
  const url = `/user/me`;

  try {
    const response = await api.get(url);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const fetchChannels = async () => {
  const url = `/channel/joinedChannels`;

  try {
    const response = await api.get(url);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const fetchUserDms = async () => {
  const url = `/channel/alldms/`;

  try {
    const response = await api.get(url);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const fetchChannelMessages = async (channelId: string) => {
  const url = `/messages/findall/${channelId}`;

  try {
    const response = await api.get(url);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const postNewChannel = async (channel: any) => {
  const url = `/channel/create`;

  try {
    const response = await api.post(url, channel);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const postLeaveChannel = async (channelId: any) => {
  const url = `/channel/leave`;

  try {
    const response = await api.post(url, { channel: channelId });

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const postJoinChannel = async (channel: any) => {
  const url = `/channel/join`;

  try {
    const response = await api.post(url, channel);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const fetchPublicChannels = async () => {
  const url = `/channel/allNonJoinedPublic`;

  try {
    const response = await api.get(url);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const fetchProtectedChannels = async () => {
  const url = `/channel/allNonJoinedProtected`;

  try {
    const response = await api.get(url);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const postNewDM = async (channel: any) => {
  const url = `/channel/newDM`;

  try {
    const response = await api.post(url, { user: channel });

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};
export const postChmod = async (channel: any) => {
  const url = `/channel/chmod`;

  try {
    const response = await api.post(url, channel);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};
export const postChangeTitle = async (channel: any) => {
  const url = `/channel/changeTitle`;

  try {
    const response = await api.post(url, channel);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const postNewAdmin = async (channel: any) => {
  const url = `/channel/newAdmin`;

  try {
    const response = await api.post(url, channel);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};
export const postKickUser = async (channel: any) => {
  const url = `/channel/kick`;

  try {
    const response = await api.post(url, channel);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const postBanUser = async (channel: any) => {
  const url = `/channel/ban`;

  try {
    const response = await api.post(url, channel);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const postUnbanUser = async (channel: any) => {
  const url = `/channel/unban`;

  try {
    const response = await api.post(url, channel);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const postMuteUser = async (channel: any) => {
  const url = `/channel/mute`;

  try {
    const response = await api.post(url, channel);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const fetchLeaderBoard = async () => {
  const url = `/leaderboard`;

  try {
    const response = await api.get(url);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const fetchAllUsers = async () => {
  const url = `/user/all`;

  try {
    const response = await api.get(url);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const postblockuser = async (channel: any) => {
  const url = `/user/blockuser/` + channel;

  try {
    const response = await api.post(url, channel);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};
export const postunblockuser = async (channel: any) => {
  const url = `/user/unblockuser/` + channel;

  try {
    const response = await api.post(url, channel);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};
export const postremovefriend = async (channel: any) => {
  const url = `/user/removefriend/` + channel;

  try {
    const response = await api.post(url, channel);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};
export const postcancelfriend = async (channel: any) => {
  const url = `/user/cancelfriend/` + channel;

  try {
    const response = await api.post(url, channel);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};
export const postacceptfriend = async (channel: any) => {
  const url = `/user/acceptfriend/` + channel;

  try {
    const response = await api.post(url, channel);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};
export const postaddfriend = async (channel: any) => {
  const url = `/user/addfriend/` + channel;

  try {
    const response = await api.post(url, channel);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};
export const postrejectfriend = async (channel: any) => {
  const url = `/user/rejectfriend/` + channel;

  try {
    const response = await api.post(url, channel);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const fetchBlockedList = async () => {
  const url = `/user/blocked`;

  try {
    const response = await api.get(url);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const fetchUserPublic = async (channelId: string) => {
  const url = `/user/${channelId}`;

  try {
    const response = await api.get(url);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};
export const fetchUsernickname = async (channelId: string) => {
  const url = `/user/updatenick/${channelId}`;

  try {
    const response = await api.post(url);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const postUserAvatar = async (channel: any) => {
  const url = `/user/updateavatar`;

  try {
    const response = await api.post(url, channel);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const handlTFA = async () => {
  const url = `/user/disable2fa`;

  try {
    const response = await api.get(url);
    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const getImage = async () => {
  const url = `/user/enable2fa`;

  try {
    const response = await api.get(url);
    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const validTfa = async (requestData: any) => {
  const url = `/user/validate2fa`;

  try {
    const response = await api.post(url, requestData);
    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};
export const postInviteUser = async (data: any) => {
  const url = `channel/invite`;

  try {
    const response = await api.post(url, data);
    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const postRemoveAdmin = async (channel: any) => {
  const url = `/channel/removeAdmin`;

  try {
    const response = await api.post(url, channel);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.data;
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};
