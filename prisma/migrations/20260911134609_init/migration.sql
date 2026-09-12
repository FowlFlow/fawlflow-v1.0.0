-- CreateEnum
CREATE TYPE "MaterialUnit" AS ENUM ('KG', 'TON');

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cage" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currentChickenCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "isSupplier" BOOLEAN NOT NULL DEFAULT false,
    "isBuyer" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMaterial" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameSi" TEXT NOT NULL,
    "unit" "MaterialUnit" NOT NULL DEFAULT 'KG',
    "defaultSellPricePerKg" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMaterialPurchase" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "enteredUnit" "MaterialUnit" NOT NULL,
    "enteredQuantity" DECIMAL(12,3) NOT NULL,
    "quantityKg" DECIMAL(12,3) NOT NULL,
    "totalCost" DECIMAL(12,2) NOT NULL,
    "unitCostPerKg" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawMaterialPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedType" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameSi" TEXT NOT NULL,
    "batchSizeKg" DECIMAL(12,3) NOT NULL,
    "defaultSellPricePerKg" DECIMAL(12,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedRecipeItem" (
    "id" TEXT NOT NULL,
    "feedTypeId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantityPerBatchKg" DECIMAL(12,3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedRecipeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedProductionBatch" (
    "id" TEXT NOT NULL,
    "feedTypeId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "scaleFactor" DECIMAL(8,4) NOT NULL,
    "quantityProducedKg" DECIMAL(12,3) NOT NULL,
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedProductionBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedProductionConsumption" (
    "id" TEXT NOT NULL,
    "productionId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "quantityKg" DECIMAL(12,3) NOT NULL,
    "unitCostPerKg" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedProductionConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedSale" (
    "id" TEXT NOT NULL,
    "feedTypeId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "quantityKg" DECIMAL(12,3) NOT NULL,
    "pricePerKg" DECIMAL(12,2) NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedUsage" (
    "id" TEXT NOT NULL,
    "feedTypeId" TEXT NOT NULL,
    "cageId" TEXT,
    "date" DATE NOT NULL,
    "quantityKg" DECIMAL(12,3) NOT NULL,
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMaterialSale" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "quantityKg" DECIMAL(12,3) NOT NULL,
    "unitCostPerKg" DECIMAL(12,2) NOT NULL,
    "pricePerKg" DECIMAL(12,2) NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawMaterialSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EggTurn" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EggTurn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EggCollection" (
    "id" TEXT NOT NULL,
    "cageId" TEXT NOT NULL,
    "turnId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "eggCount" INTEGER NOT NULL,
    "crackedCount" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EggCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EggBoxType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eggsPerBox" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EggBoxType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EggSale" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "boxTypeId" TEXT,
    "boxCount" INTEGER NOT NULL DEFAULT 0,
    "eggsPerBoxAtSale" INTEGER,
    "looseEggCount" INTEGER NOT NULL DEFAULT 0,
    "totalEggCount" INTEGER NOT NULL,
    "ratePerEgg" DECIMAL(12,2) NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EggSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "recoveryCodeHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Cage_farmId_idx" ON "Cage"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "Cage_farmId_name_key" ON "Cage"("farmId", "name");

-- CreateIndex
CREATE INDEX "Contact_isSupplier_idx" ON "Contact"("isSupplier");

-- CreateIndex
CREATE INDEX "Contact_isBuyer_idx" ON "Contact"("isBuyer");

-- CreateIndex
CREATE INDEX "RawMaterial_isActive_idx" ON "RawMaterial"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterial_nameEn_key" ON "RawMaterial"("nameEn");

-- CreateIndex
CREATE INDEX "RawMaterialPurchase_materialId_date_idx" ON "RawMaterialPurchase"("materialId", "date");

-- CreateIndex
CREATE INDEX "RawMaterialPurchase_supplierId_idx" ON "RawMaterialPurchase"("supplierId");

-- CreateIndex
CREATE INDEX "RawMaterialPurchase_date_idx" ON "RawMaterialPurchase"("date");

-- CreateIndex
CREATE INDEX "FeedType_isActive_idx" ON "FeedType"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "FeedType_nameEn_key" ON "FeedType"("nameEn");

-- CreateIndex
CREATE INDEX "FeedRecipeItem_feedTypeId_idx" ON "FeedRecipeItem"("feedTypeId");

-- CreateIndex
CREATE INDEX "FeedRecipeItem_materialId_idx" ON "FeedRecipeItem"("materialId");

-- CreateIndex
CREATE INDEX "FeedProductionBatch_feedTypeId_date_idx" ON "FeedProductionBatch"("feedTypeId", "date");

-- CreateIndex
CREATE INDEX "FeedProductionBatch_date_idx" ON "FeedProductionBatch"("date");

-- CreateIndex
CREATE INDEX "FeedProductionConsumption_productionId_idx" ON "FeedProductionConsumption"("productionId");

-- CreateIndex
CREATE INDEX "FeedProductionConsumption_materialId_date_idx" ON "FeedProductionConsumption"("materialId", "date");

-- CreateIndex
CREATE INDEX "FeedProductionConsumption_date_idx" ON "FeedProductionConsumption"("date");

-- CreateIndex
CREATE INDEX "FeedSale_feedTypeId_date_idx" ON "FeedSale"("feedTypeId", "date");

-- CreateIndex
CREATE INDEX "FeedSale_buyerId_idx" ON "FeedSale"("buyerId");

-- CreateIndex
CREATE INDEX "FeedSale_date_idx" ON "FeedSale"("date");

-- CreateIndex
CREATE INDEX "FeedUsage_feedTypeId_date_idx" ON "FeedUsage"("feedTypeId", "date");

-- CreateIndex
CREATE INDEX "FeedUsage_cageId_idx" ON "FeedUsage"("cageId");

-- CreateIndex
CREATE INDEX "FeedUsage_date_idx" ON "FeedUsage"("date");

-- CreateIndex
CREATE INDEX "RawMaterialSale_materialId_date_idx" ON "RawMaterialSale"("materialId", "date");

-- CreateIndex
CREATE INDEX "RawMaterialSale_buyerId_idx" ON "RawMaterialSale"("buyerId");

-- CreateIndex
CREATE INDEX "RawMaterialSale_date_idx" ON "RawMaterialSale"("date");

-- CreateIndex
CREATE UNIQUE INDEX "EggTurn_name_key" ON "EggTurn"("name");

-- CreateIndex
CREATE INDEX "EggCollection_cageId_date_idx" ON "EggCollection"("cageId", "date");

-- CreateIndex
CREATE INDEX "EggCollection_turnId_idx" ON "EggCollection"("turnId");

-- CreateIndex
CREATE INDEX "EggCollection_date_idx" ON "EggCollection"("date");

-- CreateIndex
CREATE UNIQUE INDEX "EggCollection_cageId_turnId_date_key" ON "EggCollection"("cageId", "turnId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "EggBoxType_name_key" ON "EggBoxType"("name");

-- CreateIndex
CREATE INDEX "EggSale_buyerId_idx" ON "EggSale"("buyerId");

-- CreateIndex
CREATE INDEX "EggSale_boxTypeId_idx" ON "EggSale"("boxTypeId");

-- CreateIndex
CREATE INDEX "EggSale_date_idx" ON "EggSale"("date");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Cage" ADD CONSTRAINT "Cage_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialPurchase" ADD CONSTRAINT "RawMaterialPurchase_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialPurchase" ADD CONSTRAINT "RawMaterialPurchase_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedRecipeItem" ADD CONSTRAINT "FeedRecipeItem_feedTypeId_fkey" FOREIGN KEY ("feedTypeId") REFERENCES "FeedType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedRecipeItem" ADD CONSTRAINT "FeedRecipeItem_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedProductionBatch" ADD CONSTRAINT "FeedProductionBatch_feedTypeId_fkey" FOREIGN KEY ("feedTypeId") REFERENCES "FeedType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedProductionConsumption" ADD CONSTRAINT "FeedProductionConsumption_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "FeedProductionBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedProductionConsumption" ADD CONSTRAINT "FeedProductionConsumption_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedSale" ADD CONSTRAINT "FeedSale_feedTypeId_fkey" FOREIGN KEY ("feedTypeId") REFERENCES "FeedType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedSale" ADD CONSTRAINT "FeedSale_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedUsage" ADD CONSTRAINT "FeedUsage_feedTypeId_fkey" FOREIGN KEY ("feedTypeId") REFERENCES "FeedType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedUsage" ADD CONSTRAINT "FeedUsage_cageId_fkey" FOREIGN KEY ("cageId") REFERENCES "Cage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialSale" ADD CONSTRAINT "RawMaterialSale_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialSale" ADD CONSTRAINT "RawMaterialSale_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EggCollection" ADD CONSTRAINT "EggCollection_cageId_fkey" FOREIGN KEY ("cageId") REFERENCES "Cage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EggCollection" ADD CONSTRAINT "EggCollection_turnId_fkey" FOREIGN KEY ("turnId") REFERENCES "EggTurn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EggSale" ADD CONSTRAINT "EggSale_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EggSale" ADD CONSTRAINT "EggSale_boxTypeId_fkey" FOREIGN KEY ("boxTypeId") REFERENCES "EggBoxType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
