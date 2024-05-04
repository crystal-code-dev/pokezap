/*
  Warnings:

  - You are about to drop the column `mode` on the `GameRoom` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "GameAreaName" AS ENUM ('FISHINGSPOT', 'RAIDROOM', 'ROUTE', 'DUELROOM');

-- AlterTable
ALTER TABLE "GameRoom" DROP COLUMN "mode",
ADD COLUMN     "gameArea" "GameAreaName" NOT NULL DEFAULT 'ROUTE';
