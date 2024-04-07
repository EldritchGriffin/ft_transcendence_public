"use client";
import PixiComponent from "./game";

export default function game(props: any) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-darkblue">
      <PixiComponent />
    </div>
  );
}
