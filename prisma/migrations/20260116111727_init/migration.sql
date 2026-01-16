/*
  Warnings:

  - You are about to drop the column `compteName` on the `Operation` table. All the data in the column will be lost.
  - You are about to drop the column `compteType` on the `Operation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Compte` ADD COLUMN `oldId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Operation` DROP COLUMN `compteName`,
    DROP COLUMN `compteType`,
    ADD COLUMN `oldId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `oldId` VARCHAR(191) NULL;
