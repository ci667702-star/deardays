-- AlterTable
ALTER TABLE `diaries` ADD COLUMN `mood` VARCHAR(16) NULL,
    ADD COLUMN `weather` VARCHAR(16) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `passwordChangedAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recipientId` INTEGER NOT NULL,
    `actorId` INTEGER NULL,
    `diaryRoomId` INTEGER NOT NULL,
    `type` VARCHAR(32) NOT NULL,
    `diaryId` INTEGER NULL,
    `letterId` INTEGER NULL,
    `preview` VARCHAR(120) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_recipientId_isRead_createdAt_idx`(`recipientId`, `isRead`, `createdAt`),
    INDEX `notifications_actorId_idx`(`actorId`),
    INDEX `notifications_diaryRoomId_idx`(`diaryRoomId`),
    INDEX `notifications_diaryId_idx`(`diaryId`),
    INDEX `notifications_letterId_idx`(`letterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `letters` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `diaryRoomId` INTEGER NOT NULL,
    `senderId` INTEGER NOT NULL,
    `recipientId` INTEGER NOT NULL,
    `title` VARCHAR(60) NOT NULL,
    `content` TEXT NOT NULL,
    `openAt` DATE NOT NULL,
    `openedAt` DATETIME(3) NULL,
    `arrivalNotified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `letters_diaryRoomId_idx`(`diaryRoomId`),
    INDEX `letters_senderId_idx`(`senderId`),
    INDEX `letters_recipientId_openAt_idx`(`recipientId`, `openAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_recipientId_fkey` FOREIGN KEY (`recipientId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_diaryRoomId_fkey` FOREIGN KEY (`diaryRoomId`) REFERENCES `diary_rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_diaryId_fkey` FOREIGN KEY (`diaryId`) REFERENCES `diaries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `letters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `letters` ADD CONSTRAINT `letters_diaryRoomId_fkey` FOREIGN KEY (`diaryRoomId`) REFERENCES `diary_rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `letters` ADD CONSTRAINT `letters_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `letters` ADD CONSTRAINT `letters_recipientId_fkey` FOREIGN KEY (`recipientId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
