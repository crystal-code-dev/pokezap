/*
  Warnings:

  - You are about to drop the column `raidGameRoomId` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the `RaidGameRoom` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[raidId]` on the table `GameRoom` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_raidGameRoomId_fkey";

-- DropForeignKey
ALTER TABLE "RaidGameRoom" DROP CONSTRAINT "RaidGameRoom_raidId_fkey";

-- AlterTable
ALTER TABLE "GameRoom" ADD COLUMN     "raidId" INTEGER;

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "raidGameRoomId";

-- DropTable
DROP TABLE "RaidGameRoom";

-- CreateIndex
CREATE UNIQUE INDEX "GameRoom_raidId_key" ON "GameRoom"("raidId");

-- AddForeignKey
ALTER TABLE "GameRoom" ADD CONSTRAINT "GameRoom_raidId_fkey" FOREIGN KEY ("raidId") REFERENCES "Raid"("id") ON DELETE SET NULL ON UPDATE CASCADE;
