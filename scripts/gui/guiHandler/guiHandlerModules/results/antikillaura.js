import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTIKILLAURA } from "../../../modules/uiAntiKillaura";
export function antiKillAuraHandler(player) {
    const modulesantikillaura = new ModalFormData();
    const antiKillAuraBoolean = dynamicPropertyRegistry.get("antikillaura_b");
    modulesantikillaura.title("§4killaura§4");
                        modulesantikillaura.toggle("90°後ろから攻撃されたら一発で隔離されるw", antiKillAuraBoolean);
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
