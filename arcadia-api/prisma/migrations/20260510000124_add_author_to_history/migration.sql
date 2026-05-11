-- DropForeignKey
ALTER TABLE "History" DROP CONSTRAINT "History_userId_fkey";

-- AlterTable
ALTER TABLE "History" ADD COLUMN     "author" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "firmId" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
