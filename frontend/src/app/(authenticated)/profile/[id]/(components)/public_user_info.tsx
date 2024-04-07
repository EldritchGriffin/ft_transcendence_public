import { useSocket } from "@/app/(authenticated)/(contexts)/socketContext";
import { postacceptfriend, postaddfriend, postblockuser, postcancelfriend, postrejectfriend, postremovefriend, postunblockuser } from "@/app/(authenticated)/(handlers)/requestHandler";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Image from "next/image";

function isRequesting(data: any, users_name: string) {
  return data.some(function (requester: any) {
    return requester.intraLogin === users_name;
  });
}

const Publicuserinfo_block_unblock = (props: any) => {
  const user_data = props.users_data;
  const connected_user = props.connected_user;
  const [isBlocked, setisBlocked] = useState(
    isRequesting(connected_user?.blocked, user_data.intraLogin)
  );
  if (!isBlocked) {
    const send_block = async () => {
      try {
        const response = await postblockuser(user_data.intraLogin);
        setisBlocked(true);
        props.setstrictedadd(true);
      } catch (error:any) {
    toast.error(error.response.data.message);

        if (error.response.status === 401)
          window.location.replace("/");
          props.setstricted(true);
      }
    };
    const block_unblock_user = () => {
      send_block();
    };
    return (
      <button
        className=" border-red-400 w-[70px] h-[30px] bg-accent_red font-bold text-white"
        onClick={block_unblock_user}
      >
        {" "}
        Block{" "}
      </button>
    );
  } else {
    const send_unblock = async () => {
      try {
        const response = await postunblockuser(user_data.intraLogin);
        setisBlocked(false);
        props.setstrictedadd(false);

      } catch (error:any) {
    toast.error(error.response.data.message);

        if (error.response.status === 401)
          window.location.replace("/");
          props.setstricted(true);

      }
    };
    const block_unblock_user = () => {
      send_unblock();
    };
    return (
      <button
        className=" border-red-400 w-[70px] h-[30px] bg-accent_red font-bold text-white"
        onClick={block_unblock_user}
      >
        {" "}
        Unblock{" "}
      </button>
    );
  }
};

function knowstheuserrelationship(data:any, users_name:string) {
  var requesting_list = data.requesting;
  var friends_list = data.friends;
  var requested_list = data.requested;
  
  if ( requested_list.some((obj:any) => obj.intraLogin === users_name))
    return ("Accept");
  else if (friends_list.some((obj:any) => obj.intraLogin === users_name))
    return ("Remove");
  else if ( requesting_list.some((obj:any) => obj.intraLogin === users_name))
    return ("Cancel");
  else
    return ("Add");
}


const Publicuserinfo_add_remove_cancel = ( props:any ) => {
  const socket = useSocket();
  const [reject_option, setreject_option] = useState(false);
  const [buttonstate, setbuttonstate] = useState<string>("Add");
  const user_data = props?.users_data;
  useEffect(()=>{
    setbuttonstate("add");
  }, [props.stricted]);
  useEffect(() => {
    var relationship = knowstheuserrelationship(props?.connected_user, props?.users_data?.intraLogin);
    if (relationship === "Accept")
      setreject_option(true);

    setbuttonstate(relationship);
    if (socket) {
      socket.on("friendRequestNotif", (user) => {
          setbuttonstate("Accept");
          setreject_option(true);
      });
      socket.on("friendRemovedNotif", (user) => {
          setbuttonstate("Add");
      });
      socket.on("friendAcceptedNotif", (user) => {
          setbuttonstate("Remove");
          setreject_option(false);
      });
      socket.on("friendRejectedNotif", (user) => {
          setbuttonstate("Add");
          setreject_option(false);
      });
      socket.on("friendRequestCancelledNotif", (user) => {
          setbuttonstate("Add");
      });
    }
    return () => {
      if (socket) {
        socket.off("friendRequestNotif");
        socket.off("friendRemovedNotif");
        socket.off("friendAcceptedNotif");
        socket.off("friendRejectedNotif");
        socket.off("friendRequestCancelledNotif");
      }
    }
  }, []);
  if (buttonstate === "Remove")
{
  const send_remove = async () => {
    try {
      const response = await postremovefriend(user_data.intraLogin);
      setbuttonstate("Add");
    } catch (error:any) {
      if (error.response.status === 401)
         window.location.replace("/");
      if (error?.response?.status === 403)
        toast.error("User Not Friend !");
      props.setstrictedadd(true);

    }
  }
  const remove_user = () => {
    send_remove();
  }
  return (
    <button
      className=" border-red-400 w-[70px] h-[30px] bg-accent_red font-bold text-white"
      onClick={remove_user}
    >
      {" "}
      {buttonstate}{" "}
    </button>
  );
}
else if(buttonstate === "Cancel")
{

  const send_cancel = async () => {
    try {
      const response = await postcancelfriend(user_data.intraLogin);
    setbuttonstate("Add");
    } catch (error:any) {
    toast.error(error.response.data.message);
      if (error.response.status === 401)
        window.location.replace("/");
      props.setstrictedadd(true);
    }
  }
  const cancel_user = () => {
    send_cancel();
  }
  return (
    <button
      className=" border-red-400 w-[70px] h-[30px] bg-accent_red font-bold text-white"
      onClick={cancel_user}
    >
      {" "}
      {buttonstate}{" "}
    </button>
  );
  }
else if(buttonstate === "Accept")
{
  const send_accept = async () => {
    try {
      const response = await postacceptfriend(user_data.intraLogin);
    setbuttonstate("Remove");
    setreject_option(false);
    } catch (error:any) {
    toast.error(error.response.data.message);

      if (error.response.status === 401)
        window.location.replace("/");
        props.setstrictedadd(true);
    }
  }
  const cancel_user = () => {
    send_accept();
  }
  const Reject_Invite = async () => {
    try {
      const response = await postrejectfriend(user_data.intraLogin);
      setreject_option(false);
      setbuttonstate("Add");
    } catch (error:any) {
    toast.error(error.response.data.message);
    setbuttonstate("Remove");
    setreject_option(false);
      if (error.response.status === 401)
      window.location.replace("/");
    props.setstrictedadd(true);
    }
  }
  return (
    <>
    <button
      className=" border-red-400 w-[70px] h-[30px] bg-accent_red font-bold text-white"
      onClick={cancel_user}
      >
      {" "}
      {buttonstate}{" "}
    </button>
    {reject_option ?
            <div className="">
          <button
              className=" border-red-400 w-[70px] h-[30px] bg-accent_red font-bold text-white"
              onClick={Reject_Invite}
            >
              {" "}
              Reject{" "}
            </button>
          </div>
          :
          null
          }
      </>
  );
  }
  else {
    const send_add = async () => {
      try {
        const response = await postaddfriend(user_data.intraLogin);
        setbuttonstate("Cancel");
      } catch (error:any) {
    toast.error(error.response.data.message);
        if (error.response.status === 401)
        window.location.replace("/");
      props.setstrictedadd(true);
      }
    }
    const add_user = () => {
      send_add();
    }
  return (
    <button
      className=" border-red-400 w-[70px] h-[30px] bg-accent_red font-bold text-white"
      onClick={add_user}
    >
      {" "}
      {buttonstate}{" "}
    </button>
  );
}
}
const getStatus = (status:any, pregame:any) => {
    if (status === "online") {
      return (      <span className="inline-flex items-center absolute bottom-[-8px] bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
      <span className="w-2 h-2 me-1 bg-green-500 rounded-full"></span>
              Online
    </span>);
    }
    else if (status === "offline") {
      return (      <span className="inline-flex items-center absolute bottom-[-8px] bg-slate-400 text-slate-50 text-xs font-medium px-2.5 py-0.5 rounded-full ">
      <span className="w-2 h-2 me-1 bg-white rounded-full"></span>
              Offline
    </span>);
    }
    else if (status === "ingame") {
      return ( <span className="inline-flex items-center absolute bottom-[-8px] bg-orange-600 text-orange-100 text-xs font-medium px-2.5 py-0.5 rounded-full ">
      <span className="w-2 h-2 me-1 bg-orange-400 rounded-full"></span>
              Ingame
    </span>);
    }
}


const Publicuserinfo = (props: any) => {
  const [status, setStatus] = useState(props.users_data.status);
  const [pregame, setpregame] = useState(false);
  const user_data = props.users_data;
  const socket = useSocket();
  const [strictedadd, setstrictedadd] = useState(false);
  const [stricted, setstricted] = useState(props.connected_user.blockedOf?.filter(
    (item: any) => item.intraLogin === user_data.intraLogin
    ).length);
    
    const online = (user:string) => {
      if(user === user_data.intraLogin)
      setStatus("online");
    };
    
    const offline = (user:string) => {
      if(user === user_data.intraLogin)
      setStatus("offline");
    };
  useEffect(() => {
    if (socket) {
      socket.on("online", (user) => online(user));
      socket.on("offline", (user) => offline(user));
      socket.on("offgame", (user) => {
        if(user === user_data.intraLogin)
        {
          socket.on("online", (user) => online(user));
          socket.on("offline", (user) => offline(user));
        }
      });
      socket.on("ingame", (user) => {
        if(user === user_data.intraLogin)
        {
          socket.off("online")
          socket.off("offline")
          setStatus("ingame");
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("online");
        socket.off("offline");
        socket.off("offgame");
        socket.off("ingame");
      }
    }
  }, []);



  return (
    <div className="flex flex-col w-full sm:w-[464px]">
      <a className="text-white truncate ">PROFILE</a>
      <div className=" w-full h-[380px]  sm:w-[464px]    bg-primary_blue flex flex-col items-center space-y-5 pt-8 pb-8">
      <div className="h-fit w-fit border border-accent_red relative flex justify-center">
        { (user_data && user_data?.avatarLink) ? <Image
          src={user_data?.avatarLink || ''}
          width={320}
          height={320}
          alt=""
          className="h-32 w-32 sm:h-[174px] sm:w-[174px] border-4 br border-5"
          draggable={false}
          priority={true}
        /> : null}
          {getStatus(status, pregame)}
    </div>
        <span className="h-full w-full text-4xl sm:w-[140px]  sm:h-[41px] text-center text-white">
          {" "}
          {user_data?.intraLogin || ''}{" "}
        </span>
        <span className="h-full w-full text-2xl sm:w-[104] sm:h-[27px] text-center text-white">
          {" "}
          {user_data?.nickname || ''}{" "}
        </span>
        <div className="w-[full] h-[full] flex flex-row justify-center space-x-6">
          {user_data &&
          <> 
          <div className="w-fit h-fit flex flex-row space-x-6">
            {
            ( strictedadd || stricted) ? 
              <button
              className=" border-red-400 w-[70px] h-[30px] bg-accent_red font-bold text-white opacity-40 " 
            >
              {" "}
              Add{" "}
            </button>
              :
              <Publicuserinfo_add_remove_cancel
              users_data={user_data}
              connected_user={props.connected_user}
              setstrictedadd={setstrictedadd}
              stricted={stricted}
              />
            }
          </div>
          <div className="w-fit h-fit">
          {
            stricted ? 
            <button
            className=" border-red-400 w-[70px] h-[30px] bg-accent_red font-bold text-white opacity-40"
            >
              {" "}
              Block{" "}
            </button>
              :
              <Publicuserinfo_block_unblock
              users_data={user_data}
              connected_user={props.connected_user}
              setstrictedadd={setstrictedadd}
              setstricted={setstricted}
            />
          }

          </div></>}
        </div>
      </div>
    </div>
  );
};

export default Publicuserinfo;
