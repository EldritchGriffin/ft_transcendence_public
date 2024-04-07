"use client";
import React, { useState, useEffect, useRef } from "react";
import Lottie from "lottie-react";
import Achievements from "@/app/(authenticated)/achive/Achievements";

const Stats = (props: any) => {
  const win = props?.win;
  const place = props?.place;

  const x = win?.matchHistory;
  const tole = win?.matchHistory?.length;
  const sizeld = place?.length;

  const winrate = () => {
    let wine = 0;
    if (wine == null) return 0;
    for (let i = 0; i < tole; i++) {
      if (
        (x[i].player1 === win.intraLogin && x[i].result > 0) ||
        (x[i].player2 === win.intraLogin && x[i].result < 0)
      ) {
        wine++;
      }
    }
    return (wine / tole) * 100;
  };

  const test = winrate();
  const [stat, setStat] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStat((prevStat) => {
        if (prevStat < test) {
          return prevStat + 1;
        } else {
          clearInterval(interval);
          return prevStat;
        }
      });
    }, 20);
    return () => clearInterval(interval); 
  }, []);
  const circularProgressStyle = {
    background: `conic-gradient(#F25F5C ${stat * 3.6}deg, #ededed 0deg)`,
  };

  const place1 = () => {
    if (win) {
      for (let i = 0; i < sizeld; i++) {
        if (win.intraLogin === place[i].intraLogin) {
          return i + 1;
        }
      }
    }
    return 0;
  };
  const place2 = place1();

  return (
    <div className="flex flex-col w-full sm:w-[464px]">
      <a className="text-white truncate flex ">STATS/ACHIEVEMENTS</a>
      <div className="bg-primary_blue  flex flex-col w-full sm:w-[464px] h-[380px] container">
        <div className="w-full pt-7">
          <div className="">
               {win && <Achievements matchHistory={win.matchHistory} user_data={win}/>}
          </div>
        </div>
        <div className="circular-progress" style={circularProgressStyle}>
          <div className="flex flex-col progress-value ">
          <p className="flex text-2xl justify-center">{`${stat}%`} </p>
          <p className="text-md">WinRate:</p>
          </div>
        </div>
        <div className="text-xl w-full  text-white flex flex-row">
          <p className="pb-7 pl-[45px]  sm:pl-[54px]">Rank:</p>
          <p className="pl-[120px]">{place2 === 0 ? "None" : place2}</p>
        </div>
      </div>
    </div>
  );
};

export default Stats;
