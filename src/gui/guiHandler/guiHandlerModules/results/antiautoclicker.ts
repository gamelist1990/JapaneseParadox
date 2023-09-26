import { Player, Vector3 } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTIAUTOCLICKER } from "../../../modules/uiAntiAutoClicker";
import { ModalFormData } from "@minecraft/server-ui";

export function antiAutoClickerHandler(player: Player) {
    const autoClickerBoolean = dynamicPropertyRegistry.get("autoclicker_b") as boolean;
    const modulesantiautoclickerui = new ModalFormData();
    modulesantiautoclickerui.title("§4メニュー：Anti AutoClicker§4");
    modulesantiautoclickerui.toggle("不自然な攻撃を検知します", autoClickerBoolean);
    modulesantiautoclickerui
        .show(player)
        .then((antiautoclickerResult) => {
            uiANTIAUTOCLICKER(antiautoclickerResult, player);
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
