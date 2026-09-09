import { startApp } from "../duel-core/app.js";
import { designs } from "./designs.js";
await startApp("gett-oh", designs);
document.querySelector("#app").removeAttribute("aria-busy");
