-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "GameAreaName" ADD VALUE 'DIVINGSPOT';
ALTER TYPE "GameAreaName" ADD VALUE 'ROCKTUNNEL';
ALTER TYPE "GameAreaName" ADD VALUE 'POWERPLANT';
ALTER TYPE "GameAreaName" ADD VALUE 'CINNABARCAVE';
ALTER TYPE "GameAreaName" ADD VALUE 'LAVENDERCAVE';
ALTER TYPE "GameAreaName" ADD VALUE 'CELADONFOREST';
ALTER TYPE "GameAreaName" ADD VALUE 'MTMOON';
ALTER TYPE "GameAreaName" ADD VALUE 'VIRIDIANDOJO';
