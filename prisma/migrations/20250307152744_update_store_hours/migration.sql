/*
  Warnings:

  - Added the required column `weekday` to the `StoreHours` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StoreHours" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "open_time" INTEGER,
    "close_time" INTEGER,
    "timezone" TEXT NOT NULL,
    "is_closed" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_StoreHours" ("close_time", "id", "open_time", "shop", "timezone") SELECT "close_time", "id", "open_time", "shop", "timezone" FROM "StoreHours";
DROP TABLE "StoreHours";
ALTER TABLE "new_StoreHours" RENAME TO "StoreHours";
CREATE UNIQUE INDEX "StoreHours_shop_key" ON "StoreHours"("shop");
CREATE UNIQUE INDEX "StoreHours_shop_weekday_key" ON "StoreHours"("shop", "weekday");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
