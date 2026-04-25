/*
  Warnings:

  - You are about to drop the column `date` on the `HealthSeminar` table. All the data in the column will be lost.
  - Added the required column `eventDate` to the `HealthSeminar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventTime` to the `HealthSeminar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topicCategory` to the `HealthSeminar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HealthSeminar" DROP COLUMN "date",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "durationMinutes" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "eventDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "eventTime" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxAttendees" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "meetingLink" TEXT,
ADD COLUMN     "speakerName" TEXT,
ADD COLUMN     "speakerTitle" TEXT,
ADD COLUMN     "topicCategory" TEXT NOT NULL;
