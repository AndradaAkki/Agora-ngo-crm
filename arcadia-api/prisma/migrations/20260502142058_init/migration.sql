-- CreateTable
CREATE TABLE "Firm" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'In Progress',
    "details" TEXT,
    "assignedCD" TEXT,
    "pausedUntil" TIMESTAMP(3),

    CONSTRAINT "Firm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "firmId" INTEGER NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "desc" TEXT NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "firmId" INTEGER NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "History" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firmId" INTEGER NOT NULL,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "firmId" INTEGER NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
