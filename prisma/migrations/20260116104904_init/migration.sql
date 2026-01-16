-- CreateTable
CREATE TABLE `Operation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `montant` DOUBLE NOT NULL,
    `type` BOOLEAN NOT NULL,
    `categorie` VARCHAR(191) NOT NULL,
    `compteId` INTEGER NOT NULL,
    `compteName` VARCHAR(191) NULL,
    `compteType` VARCHAR(191) NULL,
    `description1` VARCHAR(191) NOT NULL,
    `description2` VARCHAR(191) NULL,
    `operationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `solde` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Compte` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `typeCompte` VARCHAR(191) NOT NULL,
    `soldeInitial` DOUBLE NOT NULL,
    `soldeActuel` DOUBLE NOT NULL,
    `isDeleted` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpCommuneUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpCommune` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `montant` DOUBLE NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `operationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Operation` ADD CONSTRAINT `Operation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Operation` ADD CONSTRAINT `Operation_compteId_fkey` FOREIGN KEY (`compteId`) REFERENCES `Compte`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Compte` ADD CONSTRAINT `Compte_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpCommuneUser` ADD CONSTRAINT `OpCommuneUser_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpCommune` ADD CONSTRAINT `OpCommune_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
