"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { fetchUsernickname, postUserAvatar } from '../(handlers)/requestHandler';
import Image from 'next/image';

export default function EditNickname(props: any) {
  const router = useRouter();
  const [NickName, setNickName] = useState<any>(props.user_data?.intraLogin);
  const [updatenick, setupdatenick] = useState<any>(props.user_data?.nickname);
  const [new_file, setnew_file] = useState<any>(props.user_data?.avatarLink);
  const [image, setRes] = useState(true);
  const [name, setName] = useState(true);
  let imgflag = 0;
  let nickflag = 0;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const handleClickProgrammatically = () => {
    if (inputRef?.current) {
      inputRef?.current.click();
    }
  };
  const handleNickNameUpload = async (name: any) => {
    if (!name) return;
    try {
      setName(false);
      const res = await fetchUsernickname(name);
      setName(true);
    } catch (error: any) {
      toast.error(error.response.data.message);

      if (error.response.status === 401) window.location.replace("/");
    }
  };
  const handleInputChangek = (event: any) => {
    if (event?.key === "Enter") {
      handleInputChange(event);
    }
  };
  const handleInputChange = (event: any) => {
    setupdatenick(event?.target?.value);
  }
  const handleFileUpload =  (files:any) => {

    if (files && files.type !== "image/jpeg")
    {
      imgflag = 1;
      toast.error("image type error");
      return 1;
    } else if (files && files.size > 5 * 10 ** 6) {
      imgflag = 1;
      toast.error("image size error");
      return 1;
    }
    imgflag = 0;
    const data = new FormData();
    data.append("avatar", files);
    setRes(false);
    const handleAvatarUpload = async (setavatar: any) => {
      try {
        const res = await postUserAvatar(setavatar);
        setRes(true);
        setnew_file(res.avatarLink);
      } catch (error: any) {
        toast.error(error.response.data.message);

        if (error.response.status === 401) window.location.replace("/");
        setRes(true);
      }
    };
    handleAvatarUpload(data);
  };
  const updateNickname = () => {
    const nickname_state = document.getElementById("inpt_nickname");
    const validInput = /^[a-zA-Z0-9]*$/;
    if (
      !updatenick ||
      updatenick?.length < 3 ||
      updatenick?.length > 15 ||
      updatenick?.length === 0 ||
      !validInput?.test(updatenick) ||
      !/^[a-zA-Z]*$/.test(updatenick?.charAt(0))
    ) {
      if (nickname_state) nickname_state.style.borderColor = "red";
      nickflag = 1;
      toast.error("Invalid NickName");
    } else {
      nickflag = 0;
      if (nickname_state) nickname_state.style.borderColor = "white";
      handleNickNameUpload(updatenick);
      if (name && image) router.push("/user/me");
    }
  };
  return props.user_data ? (
    <div
      className="h-full w-full  bg-primary_blue flex flex-col items-center space-y-10 pt-20"
      style={{
        opacity: !name || !image ? 0.4 : 1,
      }}
    >
      <div className="h-fit w-fit flex flex-col items-center">
        <div className="h-fit w-fit border border-accent_red relative flex justify-center ">
          {new_file && (
            <Image
              priority={true}
              src={new_file}
              id="profile_pic"
              width={320}
              height={320}
              alt=""
              draggable={false}
              className=" h-44 w-44 border-4 border-red-400 "
            />
          )}
          <button
            className=" w-12 h-6 bg-accent_red font-bold text-white absolute bottom-[-10px]"
            onClick={handleClickProgrammatically}
          >
            {" "}
            Edit{" "}
          </button>
          <input
            name="image"
            onChange={(e) => {
              handleFileUpload(e.target.files?.[0]);
            }}
            type="file"
            placeholder="Edit"
            id="inpt"
            accept="/image/*"
            className="outline-none  h-10 w-10 bg-red-500 hidden green absolute bottom-[-10px] opacity-10 "
            ref={inputRef}
          />
        </div>
      </div>
      <span className="font-bold w-24 text-4xl h-12 items-center pr-32  text-white">
        {" "}
        {NickName}{" "}
      </span>
      <div className="h-fit w-fit flex flex-col items-center">
        <input
          type="text"
          id="inpt_nickname"
          className="outline-none bg-primary_blue border-b-2 border-white-500  text-lg font-bold text-white"
          placeholder="NickName"
          defaultValue={updatenick}
          onChange={handleInputChange}
          onKeyDown={handleInputChangek}
        />
      </div>
      <button
        className="bg-accent_red h-12 w-20 text-xl  text-white"
        onClick={updateNickname}
      >
        {" "}
        Save{" "}
      </button>
    </div>
  ) : null;
}
