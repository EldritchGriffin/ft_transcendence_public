"use client";
import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import OTPInput from "react-otp-input";
import { fetchCurrentUser } from "../(handlers)/requestHandler";

export default function TwoFactor() {
  const [otp, setOtp] = useState("");
  const router = useRouter();

  const backendUrl = `http://${process.env.NEXT_PUBLIC_HOSTNAME}:3001/auth/signinTFA`;
  const handleButtonClick = async () => {
    const requestData = {
      code: otp as string,
    };

    try {
      const res = await axios.post(backendUrl, requestData, {
        withCredentials: true,
      });

      if (res.status >= 200 && res.status < 300) {
        router.push("/user/me");
      }
    } catch (error) {
      toast.error("Invalid 2FA code");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden py-12">
      <div className="flex justify-center">
        <span className="relative  text-white text-[28px]">2FA Enabled</span>
      </div>
      <div className="relative bg-primary_blue bck2 px-16 pt-10  flex justify-around pb-9 shadow-xl mx-auto w-[280px] sm:w-[600px] xl:w-[952px]">
        <div className="flex  w-full flex-col space-y-28">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="text-xl text-white">
              <p>Enter 6-digit code from your 2FA application</p>
            </div>
          </div>
          <div>
            <div className="flex flex-col space-y-16 ">
              <div className="flex flex-row  items-center justify-center w-full ">
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  numInputs={6}
                  containerStyle={"gap-4 md:gap-8 xl:gap-10"}
                  inputStyle={
                    "h-16 w-[20px] sm:h-[43px] sm:w-[50px] flex flex-col items-center justify-center text-center  outline-none bg-primary_blue border-b-2 border-white  text-white inpute_code text-sm lg:text-2xl"
                  }
                  renderSeparator={<span>&nbsp;</span>}
                  renderInput={(props) => <input {...props} />}
                />
              </div>
              <div className="flex flex-col ">
                <div className="flex justify-center">
                  <button
                    className="flex flex-row items-center justify-center w-[110px] h-[48px] text-center outline-none py-5 bg-accent_red border-none text-white text-2xl shadow-sm"
                    onClick={handleButtonClick}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
