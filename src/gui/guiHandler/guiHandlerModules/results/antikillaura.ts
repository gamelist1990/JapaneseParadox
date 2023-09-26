import { Player, Vector3 } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTIKILLAURA } from "../../../modules/uiAntiKillaura";

export function antiKillAuraHandler(player: Player) {
    const modulesantikillaura = new ModalFormData();
    const antiKillAuraBoolean = dynamicPropertyRegistry.get("antikillaura_b") as boolean;
    modulesantikillaura.title("§4メニュー：Anti KillAura§4");
    modulesantikillaura.toggle("360°から攻撃されたら100%検知されます", antiKillAuraBoolean);
    modulesantikillaura
        .show(player)
        .then((antikillauraResult) => {
            uiANTIKILLAURA(antikillauraResult, player);
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
