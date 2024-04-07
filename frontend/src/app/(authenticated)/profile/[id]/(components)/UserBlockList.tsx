import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchBlockedList, postunblockuser } from "@/app/(authenticated)/(handlers)/requestHandler";
import { toast } from "react-toastify";
import Image from "next/image";

const UserBlockList = (props: any) => {
  const router = useRouter();
  const [loading, setloading] = useState(true);

  const [user_data, setUser_data] = useState<any>([]);
  const [Blocksearch, setBlocksearch] = useState("");
  const handleblocksearch = (event: any) => {
    setBlocksearch(event.target.value.toLowerCase());
  };
  const fetchGetDataBack = async () => {
    try {
      const response = await fetchBlockedList();
      setUser_data(response);
    } catch (error:any) {
    toast.error(error.response.data.message);

      if (error.response.status === 401)
          window.location.replace("/");
    } finally {
      setloading(false);
    }
  };
  useEffect(() => {
    fetchGetDataBack();
  }, []);

  const send_unblock = async (item: any) => {
    try {
      const response = await postunblockuser(item.intraLogin);
      toast.success("User UnBlocked successfully");
    } catch (error:any) {
    toast.error(error.response.data.message);

      if (error.response.status === 401)
         window.location.replace("/");
    }
  };

  const handleRemoveItem = (idToRemove: any) => {
    const updatedArray = user_data.filter(
      (item: any) => item.intraLogin !== idToRemove
    );
    setUser_data(updatedArray);
  };

  const Unblock_user = (item: any) => {
    send_unblock(item);
    handleRemoveItem(item.intraLogin);
  };
  const navigate_to_users_profile = (users_target_intra: string) => {
    const next_rout = "/profile/" + users_target_intra;
    router.push(next_rout);
  };
  if (loading) {
    return <p>loading........</p>;
  }
  return (
    <div className="h-full    w-full  sm:h-[407px]    sm:w-[464px] ">
      <span className="text-white truncate">BLOCKED</span>
      <div className=" h-full w-full sm:h-[380px]   sm:w-[464px]  bg-primary_blue flex flex-col items-center ">
        {!user_data?.length ? (
          <p className="h-full w-full flex justify-center items-center   text-white">
            {" "}
            No blocked users{" "}
          </p>
        ) : (
          <div className="w-full h-full flex flex-col  space-y-3  pb-3 bg-primary_blue">
            <div className="flex space-y-5 pt-4 justify-center">
              <input
                type="text"
                className=" outline-none w-60  bg-transparent text-white  border-b-4 border-white-500 placeholder-opacity-50 placeholder-white "
                placeholder="Search"
                onChange={handleblocksearch}
              />
            </div>

            <div className="w-full flex flex-row flex-wrap  overflow-y-auto custom-scrollbar  pl-4 pr-4">
              {user_data?.map((item: any, index: any) =>
                item?.nickname?.toLowerCase().includes(Blocksearch) ? (
                  <div
                    className="w-full h-[128px]  flex justify-between items-center  flex-row  mr-4 pt-4   "
                    key={index}
                  >
                              <Image
          priority={true}
          src={item.avatarLink}
          id="profile_pic"
          width={320}
          height={320}
          alt=""
         draggable={false}

                      className="h-16  w-16 sm:h-[92px] sm:w-[100px] flex-none "
                      onClick={() => {
                        navigate_to_users_profile(item.intraLogin);
                      }}
        />
                    <span
                      className="h-2 w-2 text-sm items-center  flex ml-1 text-center  mr-4  text-white "
                      onClick={() => {
                        navigate_to_users_profile(item.intraLogin);
                      }}
                    >
                      {" "}
                      {item.nickname}{" "}
                    </span>
                    <button
                      className=" border-red-400 w-[70px] h-[30px] bg-accent_red font-bold text-white"
                      onClick={() => Unblock_user(item)}
                    >
                      {" "}
                      UnBlock{" "}
                    </button>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBlockList;
