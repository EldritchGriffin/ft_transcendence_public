"use client";
import React from "react";
import Notfound from "./Notfound.json";
import Lottie from "lottie-react";

const pagenotfound = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen ">
      <span className="text-5xl text-accent_red">Page not found</span>
      <Lottie
        animationData={Notfound}
        loop={true}
        style={{ width: 1000, height: 1000 }}
      />
    </div>
  );
};
export default pagenotfound;
