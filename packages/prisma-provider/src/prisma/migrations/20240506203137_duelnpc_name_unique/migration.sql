/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `DuelNpc` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DuelNpc_name_key" ON "DuelNpc"("name");
