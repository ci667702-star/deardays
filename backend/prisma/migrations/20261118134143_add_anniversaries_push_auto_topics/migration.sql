-- AlterTable
ALTER TABLE `daily_topics` ADD COLUMN `isAuto` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `anniversaries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `diaryRoomId` INTEGER NOT NULL,
    `creatorId` INTEGER NOT NULL,
    `title` VARCHAR(40) NOT NULL,
    `date` DATE NOT NULL,
    `yearly` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `anniversaries_diaryRoomId_date_idx`(`diaryRoomId`, `date`),
    INDEX `anniversaries_creatorId_idx`(`creatorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `push_subscriptions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `endpoint` VARCHAR(1000) NOT NULL,
    `endpointHash` CHAR(64) NOT NULL,
    `p256dh` VARCHAR(255) NOT NULL,
    `auth` VARCHAR(255) NOT NULL,
    `userAgent` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `push_subscriptions_endpointHash_key`(`endpointHash`),
    INDEX `push_subscriptions_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `anniversaries` ADD CONSTRAINT `anniversaries_diaryRoomId_fkey` FOREIGN KEY (`diaryRoomId`) REFERENCES `diary_rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anniversaries` ADD CONSTRAINT `anniversaries_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `push_subscriptions` ADD CONSTRAINT `push_subscriptions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
