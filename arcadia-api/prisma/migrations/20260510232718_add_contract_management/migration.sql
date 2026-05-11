-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_firmId_fkey";

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "completedSteps" TEXT[];

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
