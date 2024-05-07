-- AlterTable
ALTER TABLE "DuelNpc" ADD COLUMN     "isDefeated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isInBattle" BOOLEAN NOT NULL DEFAULT false;
