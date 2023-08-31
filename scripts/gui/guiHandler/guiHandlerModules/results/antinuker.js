import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTINUKER } from "../../../modules/uiAntiNuker";
export function antiNukerAHandler(player) {
    const modulesantinukerui = new ModalFormData();
    const antiNukerABoolean = dynamicPropertyRegistry.get("antinukera_b");
    modulesantinukerui.title("§4範囲破壊§4");
    modulesantinukerui.toggle("次のアプデで対策されるらしいね～", antiNukerABoolean);
    modulesantinukerui
        .show(player)
        .then((antinukerResult) => {
        uiANTINUKER(antinukerResult, player);
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
