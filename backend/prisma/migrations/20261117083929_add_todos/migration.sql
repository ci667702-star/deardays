-- CreateTable
CREATE TABLE `todos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `diaryRoomId` INTEGER NOT NULL,
    `creatorId` INTEGER NOT NULL,
    `assigneeId` INTEGER NULL,
    `completedById` INTEGER NULL,
    `content` VARCHAR(200) NOT NULL,
    `isDone` BOOLEAN NOT NULL DEFAULT false,
    `dueDate` DATE NULL,
    `doneAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `todos_diaryRoomId_isDone_idx`(`diaryRoomId`, `isDone`),
    INDEX `todos_creatorId_idx`(`creatorId`),
    INDEX `todos_assigneeId_idx`(`assigneeId`),
    INDEX `todos_completedById_idx`(`completedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `todos` ADD CONSTRAINT `todos_diaryRoomId_fkey` FOREIGN KEY (`diaryRoomId`) REFERENCES `diary_rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `todos` ADD CONSTRAINT `todos_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `todos` ADD CONSTRAINT `todos_assigneeId_fkey` FOREIGN KEY (`assigneeId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `todos` ADD CONSTRAINT `todos_completedById_fkey` FOREIGN KEY (`completedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
