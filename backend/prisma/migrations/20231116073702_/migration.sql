-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "intraLogin" TEXT NOT NULL,
    "nickname" TEXT,
    "TFA" BOOLEAN NOT NULL DEFAULT false,
    "hash" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channels" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "bannedUsers" TEXT[],
    "password" TEXT,

    CONSTRAINT "Channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Games" (
    "gameId" SERIAL NOT NULL,
    "result" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Games_pkey" PRIMARY KEY ("gameId")
);

-- CreateTable
CREATE TABLE "_Friends" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_BlockedUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_requests" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ChannelsToUser" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_admin" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_GamesToUser" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_intraLogin_key" ON "User"("intraLogin");

-- CreateIndex
CREATE UNIQUE INDEX "User_nickname_key" ON "User"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "_Friends_AB_unique" ON "_Friends"("A", "B");

-- CreateIndex
CREATE INDEX "_Friends_B_index" ON "_Friends"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BlockedUsers_AB_unique" ON "_BlockedUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_BlockedUsers_B_index" ON "_BlockedUsers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_requests_AB_unique" ON "_requests"("A", "B");

-- CreateIndex
CREATE INDEX "_requests_B_index" ON "_requests"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ChannelsToUser_AB_unique" ON "_ChannelsToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ChannelsToUser_B_index" ON "_ChannelsToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_admin_AB_unique" ON "_admin"("A", "B");

-- CreateIndex
CREATE INDEX "_admin_B_index" ON "_admin"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GamesToUser_AB_unique" ON "_GamesToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_GamesToUser_B_index" ON "_GamesToUser"("B");

-- AddForeignKey
ALTER TABLE "_Friends" ADD CONSTRAINT "_Friends_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Friends" ADD CONSTRAINT "_Friends_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlockedUsers" ADD CONSTRAINT "_BlockedUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlockedUsers" ADD CONSTRAINT "_BlockedUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_requests" ADD CONSTRAINT "_requests_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_requests" ADD CONSTRAINT "_requests_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelsToUser" ADD CONSTRAINT "_ChannelsToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelsToUser" ADD CONSTRAINT "_ChannelsToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_admin" ADD CONSTRAINT "_admin_A_fkey" FOREIGN KEY ("A") REFERENCES "Channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_admin" ADD CONSTRAINT "_admin_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GamesToUser" ADD CONSTRAINT "_GamesToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Games"("gameId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GamesToUser" ADD CONSTRAINT "_GamesToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
