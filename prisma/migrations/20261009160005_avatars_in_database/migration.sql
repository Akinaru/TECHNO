-- CreateTable
CREATE TABLE `Avatar` (
    `userId` VARCHAR(191) NOT NULL,
    `data` MEDIUMBLOB NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ArtistSeen_updatedAt_idx` ON `ArtistSeen`(`updatedAt`);

-- AddForeignKey
ALTER TABLE `Avatar` ADD CONSTRAINT `Avatar_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Avatar files stored on the container filesystem are wiped on every redeploy:
-- drop the dangling references so users fall back to their initial.
UPDATE `User` SET `image` = NULL WHERE `image` LIKE '/uploads/%';
