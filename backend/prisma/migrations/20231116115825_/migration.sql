/*
  Warnings:

  - You are about to drop the column `performance` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "performance",
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0;
