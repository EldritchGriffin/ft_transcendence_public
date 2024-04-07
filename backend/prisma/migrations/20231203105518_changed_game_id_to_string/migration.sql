/*
  Warnings:

  - The primary key for the `Games` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "_GamesToUser" DROP CONSTRAINT "_GamesToUser_A_fkey";

-- AlterTable
ALTER TABLE "Games" DROP CONSTRAINT "Games_pkey",
ALTER COLUMN "gameId" DROP DEFAULT,
ALTER COLUMN "gameId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Games_pkey" PRIMARY KEY ("gameId");
DROP SEQUENCE "Games_gameId_seq";

-- AlterTable
ALTER TABLE "_GamesToUser" ALTER COLUMN "A" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "_GamesToUser" ADD CONSTRAINT "_GamesToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Games"("gameId") ON DELETE CASCADE ON UPDATE CASCADE;
