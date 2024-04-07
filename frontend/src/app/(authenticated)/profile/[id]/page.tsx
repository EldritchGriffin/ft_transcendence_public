"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import { toast } from "react-toastify";
import { fetchCurrentUser } from "../../(handlers)/requestHandler";
import PublicProfilePage from "./(components)/public_profile";

const PublicProfile = (params: any) => {
  const router = useRouter();
  const [users_data, setusers_data] = useState<any>(null);
  const [loading, setloading] = useState(true);

  const fetchGetDataBack = async () => {
    try {
    const result = await fetchCurrentUser();
    setusers_data(result);
  } catch (error:any) {
    toast.error(error.response.data.message);
    if (error.response.status === 401)
       window.location.replace("/");
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    if (users_data && users_data.intraLogin == params?.params?.id) {
      router.push("/user/me");
    }
    if(!users_data)
      fetchGetDataBack();
  }, [users_data]);
  
  if (loading) {
    return <div className="flex justify-center items-center"> Loading . . . .  </div>;
  }
    return (
      <div className="flex h-auto min-h-screen flex-col  justify-center items-center space-y-10  bg-bg_gray">
        {users_data &&  <PublicProfilePage id={params.params.id} users_data={users_data} />}
    </div>
  );
};

export default PublicProfile;
