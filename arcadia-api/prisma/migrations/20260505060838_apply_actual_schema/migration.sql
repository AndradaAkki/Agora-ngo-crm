/*
  Warnings:

  - The primary key for the `Contact` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `phone` on the `Contact` table. All the data in the column will be lost.
  - The primary key for the `Contract` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `steps` on the `Contract` table. All the data in the column will be lost.
  - The primary key for the `Firm` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `assignedCD` on the `Firm` table. All the data in the column will be lost.
  - You are about to drop the column `pausedUntil` on the `Firm` table. All the data in the column will be lost.
  - The primary key for the `History` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `author` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `desc` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `History` table. All the data in the column will be lost.
  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `eventId` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `details` to the `History` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `History` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_firmId_fkey";

-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_firmId_fkey";

-- DropForeignKey
ALTER TABLE "History" DROP CONSTRAINT "History_firmId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_firmId_fkey";

-- AlterTable
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_pkey",
DROP COLUMN "phone",
ADD COLUMN     "phoneNumber" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "firmId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Contact_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Contact_id_seq";

-- AlterTable
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_pkey",
DROP COLUMN "name",
DROP COLUMN "steps",
ADD COLUMN     "eventId" TEXT NOT NULL,
ADD COLUMN     "status" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "firmId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Contract_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Contract_id_seq";

-- AlterTable
ALTER TABLE "Firm" DROP CONSTRAINT "Firm_pkey",
DROP COLUMN "assignedCD",
DROP COLUMN "pausedUntil",
ADD COLUMN     "assignedCd" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" DROP DEFAULT,
ADD CONSTRAINT "Firm_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Firm_id_seq";

-- AlterTable
ALTER TABLE "History" DROP CONSTRAINT "History_pkey",
DROP COLUMN "author",
DROP COLUMN "date",
DROP COLUMN "desc",
DROP COLUMN "type",
ADD COLUMN     "details" TEXT NOT NULL,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "firmId" SET DATA TYPE TEXT,
ADD CONSTRAINT "History_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "History_id_seq";

-- DropTable
DROP TABLE "Task";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "displayName" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "details" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Firm" ADD CONSTRAINT "Firm_assignedCd_fkey" FOREIGN KEY ("assignedCd") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
