/*
  Warnings:

  - You are about to drop the `_GameRoomToPlayer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_GameRoomToPlayer" DROP CONSTRAINT "_GameRoomToPlayer_A_fkey";

-- DropForeignKey
ALTER TABLE "_GameRoomToPlayer" DROP CONSTRAINT "_GameRoomToPlayer_B_fkey";

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "defeatedUntil" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "gameRoomId" INTEGER,
ADD COLUMN     "travelBlockedUntil" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "_GameRoomToPlayer";

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_gameRoomId_fkey" FOREIGN KEY ("gameRoomId") REFERENCES "GameRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
