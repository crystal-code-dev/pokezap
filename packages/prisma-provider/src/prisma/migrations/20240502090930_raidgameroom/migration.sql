/*
  Warnings:

  - You are about to drop the column `raidId` on the `GameRoom` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "GameRoom" DROP CONSTRAINT "GameRoom_raidId_fkey";

-- DropIndex
DROP INDEX "GameRoom_raidId_key";

-- AlterTable
ALTER TABLE "GameRoom" DROP COLUMN "raidId";

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "raidGameRoomId" INTEGER;

-- CreateTable
CREATE TABLE "RaidGameRoom" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "raidId" INTEGER,
    "isInProgress" BOOLEAN NOT NULL DEFAULT false,
    "isFinished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RaidGameRoom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RaidGameRoom_phone_key" ON "RaidGameRoom"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "RaidGameRoom_raidId_key" ON "RaidGameRoom"("raidId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_raidGameRoomId_fkey" FOREIGN KEY ("raidGameRoomId") REFERENCES "RaidGameRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaidGameRoom" ADD CONSTRAINT "RaidGameRoom_raidId_fkey" FOREIGN KEY ("raidId") REFERENCES "Raid"("id") ON DELETE SET NULL ON UPDATE CASCADE;
