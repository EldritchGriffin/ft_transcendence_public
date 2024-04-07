"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

function select_achievements(data:any, user_data:any)
{
  if (!data)
    return (null);
  const numberofwins = data.filter((match:any) => (match.player1 === user_data.intraLogin && match.result > 0)).length + data.filter((match:any) => (match.player2 === user_data.intraLogin && match.result < 0)).length;
  const achievements = 
    [{name: '/achievements/firstgame.jpg', flag: data.length > 0},
    {name: '/achievements/fivegames.jpg', flag: data.length >= 5},
    {name: '/achievements/teengames.jpg', flag: data.length >= 10},
    {name: '/achievements/firstwin.jpg', flag: (numberofwins > 0)},
    {name: '/achievements/fivewins.jpg', flag: (numberofwins >= 5)},
    {name: '/achievements/teenwins.jpg', flag: (numberofwins >= 10)},]
  ;
  return (achievements);
}

const Achievements = (props:any) => {
  const the_history_match = props.matchHistory;
  const [achivements, setachivements] = useState<any>(null);
  useEffect(() => {
   const achivement = select_achievements(the_history_match, props.user_data);
    setachivements(achivement);
  }, []);

  return (
    <div className="h-[50px] w-full sm:[464px] flex flex-row justify-center space-x-5 bg-primary_blue">
  {achivements?.map((item: any, index: any) => 
    item.flag ?  
     <div className="h-[50px] w-[50px] border-5" key={index}>
         {item.name &&  <Image
          priority={true}
          src={item.name}
          id="ggg"
          width={320}
          height={320}
          alt=""
         draggable={false}

          className=" h-[50px] w-[50px] "
        />}
  </div>
  :
     <div className="h-[50px] w-[50px] border-5" key={index}>
      <Image
          priority={true}
          src="/achievements/unlocked.jpg"
          id="ggg"
          width={320}
          height={320}
          alt=""
         draggable={false}

          className=" h-[50px] w-[50px] "
        />
  </div>
  )}
  </div>
  )
}
export default Achievements;

