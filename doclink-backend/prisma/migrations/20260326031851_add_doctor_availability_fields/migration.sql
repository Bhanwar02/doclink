-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "availableDays" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "availableHoursEnd" TEXT NOT NULL DEFAULT '17:00',
ADD COLUMN     "availableHoursStart" TEXT NOT NULL DEFAULT '09:00';
