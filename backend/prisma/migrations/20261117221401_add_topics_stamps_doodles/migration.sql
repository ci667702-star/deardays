-- AlterTable
ALTER TABLE `diaries` ADD COLUMN `doodleUrl` VARCHAR(255) NULL,
    ADD COLUMN `topicId` INTEGER NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `isAdmin` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `stamps` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `diaryId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `kind` VARCHAR(16) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `stamps_userId_idx`(`userId`),
    UNIQUE INDEX `stamps_diaryId_userId_kind_key`(`diaryId`, `userId`, `kind`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_topics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL,
    `content` VARCHAR(200) NOT NULL,
    `createdById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `daily_topics_date_key`(`date`),
    INDEX `daily_topics_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `diaries_topicId_idx` ON `diaries`(`topicId`);

-- AddForeignKey
ALTER TABLE `diaries` ADD CONSTRAINT `diaries_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `daily_topics`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stamps` ADD CONSTRAINT `stamps_diaryId_fkey` FOREIGN KEY (`diaryId`) REFERENCES `diaries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stamps` ADD CONSTRAINT `stamps_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_topics` ADD CONSTRAINT `daily_topics_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
