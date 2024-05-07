/*
  Warnings:

  - You are about to drop the column `duelNpcId` on the `Pokemon` table. All the data in the column will be lost.
  - Added the required column `gender` to the `DuelNpc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spriteUrl` to the `DuelNpc` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- DropForeignKey
ALTER TABLE "Pokemon" DROP CONSTRAINT "Pokemon_duelNpcId_fkey";

-- AlterTable
ALTER TABLE "DuelNpc" ADD COLUMN     "gender" "Gender" NOT NULL,
ADD COLUMN     "spriteUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Pokemon" DROP COLUMN "duelNpcId";

-- AlterTable
ALTER TABLE "RaidPokemon" ADD COLUMN     "duelNpcId" INTEGER;

-- AddForeignKey
ALTER TABLE "RaidPokemon" ADD CONSTRAINT "RaidPokemon_duelNpcId_fkey" FOREIGN KEY ("duelNpcId") REFERENCES "DuelNpc"("id") ON DELETE SET NULL ON UPDATE CASCADE;
