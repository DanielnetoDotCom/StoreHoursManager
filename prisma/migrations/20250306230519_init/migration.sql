-- CreateTable
CREATE TABLE "StoreHours" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "open_time" INTEGER NOT NULL,
    "close_time" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreHours_shop_key" ON "StoreHours"("shop");
