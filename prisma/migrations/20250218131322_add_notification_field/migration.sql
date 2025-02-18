-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('Comment', 'Like_Post', 'Like_Comment');

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "receiverID" INTEGER NOT NULL,
    "senderID" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "contentID" INTEGER NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_receiverID_fkey" FOREIGN KEY ("receiverID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
