import { createContext, useContext } from "react";
import { User } from "../(interfaces)/userInterface";

export const userContext = createContext<User | null>(null);

export const useUser = () => {
  const user = useContext(userContext);
  if (!user) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return user;
};
