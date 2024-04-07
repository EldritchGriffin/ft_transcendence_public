import type { Metadata } from "next";
import { Lilita_One } from "next/font/google";
import Navbar_compo from "./(components)/navbar";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../globals.css";
import { Ft_memo } from "./(components)/memo";

const Font = Lilita_One({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "PongVerse",
  description: "Made by abelahce absela hchahid ysakine aelyakou",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div  className={Font.className + " bg-bg_gray"}>
        <Ft_memo children={children}/>
      </div>
  );
}
 