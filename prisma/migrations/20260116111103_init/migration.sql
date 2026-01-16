/*
  Warnings:

  - You are about to drop the `OpCommune` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OpCommuneUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `OpCommune` DROP FOREIGN KEY `OpCommune_userId_fkey`;

-- DropForeignKey
ALTER TABLE `OpCommuneUser` DROP FOREIGN KEY `OpCommuneUser_userId_fkey`;

-- DropTable
DROP TABLE `OpCommune`;

-- DropTable
DROP TABLE `OpCommuneUser`;
