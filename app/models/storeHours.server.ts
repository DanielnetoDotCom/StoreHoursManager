import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getStoreHours(shop: string) {
    let storeHours = await prisma.storeHours.findUnique({
        where: { shop },
    });

    // Default store hours if none exist
    if (!storeHours) {
        storeHours = await prisma.storeHours.create({
            data: {
                shop,
                open_time: 9, // Default open at 9 AM
                close_time: 17, // Default close at 5 PM
                timezone: "America/New_York",
            },
        });
    }

    return storeHours;
}

export async function updateStoreHours(shop: string, open_time: number, close_time: number, timezone: string) {
    return await prisma.storeHours.upsert({
        where: { shop },
        update: { open_time, close_time, timezone },
        create: { shop, open_time, close_time, timezone },
    });
}
