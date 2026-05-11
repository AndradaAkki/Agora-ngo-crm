-- CreateTable
CREATE TABLE "FirmEventStatus" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Not Started',
    "firmId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "FirmEventStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FirmEventStatus_firmId_eventId_key" ON "FirmEventStatus"("firmId", "eventId");

-- AddForeignKey
ALTER TABLE "FirmEventStatus" ADD CONSTRAINT "FirmEventStatus_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FirmEventStatus" ADD CONSTRAINT "FirmEventStatus_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
