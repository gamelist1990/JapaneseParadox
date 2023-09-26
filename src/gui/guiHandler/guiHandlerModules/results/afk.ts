import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import config from "../../../../data/config";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiAFK } from "../../../modules/uiAFK";

export function afkHandler(player: Player) {
    const modulesafkui = new ModalFormData();
    const currentAFKConifg = config.modules.afk.minutes;
    const afkBoolean = dynamicPropertyRegistry.get("afk_b") as boolean;
    modulesafkui.title("§4メニュー：AFK§4");
    modulesafkui.toggle("放置しているユーザーをキック" + currentAFKConifg + " 一分:", afkBoolean);
    modulesafkui
        .show(player)
        .then((afkResult) => {
            uiAFK(afkResult, player);
        })
        .catch((error) => {
            console.error("Paradox Unhandled Rejection: ", error);
            // Extract stack trace information
            if (error instanceof Error) {
                const stackLines = error.stack.split("\n");
                if (stackLines.length > 1) {
                    const sourceInfo = stackLines;
                    console.error("Error originated from:", sourceInfo[0]);
                }
            }
        });
}
