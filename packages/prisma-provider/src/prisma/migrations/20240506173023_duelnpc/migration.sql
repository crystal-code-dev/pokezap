-- CreateEnum
CREATE TYPE "Types" AS ENUM ('FIRE', 'FAIRY', 'DARK', 'GHOST', 'PSYCHIC', 'FIGHTING', 'ROCK', 'FLYING', 'BUG', 'GRASS', 'WATER', 'GROUND', 'ELECTRIC', 'POISON', 'STEEL', 'NORMAL', 'ICE');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'EXPERT', 'INSANE');

-- AlterTable
ALTER TABLE "Pokemon" ADD COLUMN     "duelNpcId" INTEGER;

-- CreateTable
CREATE TABLE "DuelNpc" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "speciality" "Types" NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "location" "GameAreaName" NOT NULL,

    CONSTRAINT "DuelNpc_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Pokemon" ADD CONSTRAINT "Pokemon_duelNpcId_fkey" FOREIGN KEY ("duelNpcId") REFERENCES "DuelNpc"("id") ON DELETE SET NULL ON UPDATE CASCADE;
