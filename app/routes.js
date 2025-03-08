import { flatRoutes } from "@remix-run/fs-routes";
import { startUpdatingTime } from "../scripts/updateTime.js"; // ✅ Import time updater

console.log('---- app/routes.js loaded');
export default flatRoutes();
startUpdatingTime();
