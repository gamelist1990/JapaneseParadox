import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiGAMEMODES } from "../../../modules/uiGamemodes";
export function gamemodesHandler(player) {
    //GameModes UI
    const gamemodesui = new ModalFormData();
    const adventureGMBoolean = dynamicPropertyRegistry.get("adventuregm_b");
    const creativeGMBoolean = dynamicPropertyRegistry.get("creativegm_b");
    const survivalGMBoolean = dynamicPropertyRegistry.get("survivalgm_b");
    gamemodesui.title("§4ゲームモード§4");
    gamemodesui.toggle("＜＝アドベンチャー禁止", adventureGMBoolean);
    gamemodesui.toggle("＜＝クリエ禁止", creativeGMBoolean);
    gamemodesui.toggle("＜＝サバイバル禁止", survivalGMBoolean);
    gamemodesui
        .show(player)
        .then((gamemodeResult) => {
        uiGAMEMODES(gamemodeResult, player);
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
