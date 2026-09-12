-- CreateTable
CREATE TABLE "EggPrice" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "pricePerEgg" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EggPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EggPrice_date_key" ON "EggPrice"("date");
