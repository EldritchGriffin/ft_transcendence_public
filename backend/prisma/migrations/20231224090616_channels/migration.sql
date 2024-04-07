/*
  Warnings:

  - Added the required column `type` to the `Channels` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "channelType" AS ENUM ('DM', 'Channel');

-- CreateEnum
CREATE TYPE "accessType" AS ENUM ('Private', 'Protected', 'Public');

-- AlterTable
ALTER TABLE "Channels" ADD COLUMN     "access" "accessType" NOT NULL DEFAULT 'Private',
ADD COLUMN     "type" "channelType" NOT NULL;

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "channelId" INTEGER NOT NULL,
    "senderLogin" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderLogin_fkey" FOREIGN KEY ("senderLogin") REFERENCES "User"("intraLogin") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
