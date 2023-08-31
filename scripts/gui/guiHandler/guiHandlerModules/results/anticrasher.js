import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTICRASHER } from "../../../modules/uiAntiCrasher";
export function antiCrasherHandler(player) {
    const modulesanticrasherui = new ModalFormData();
    const crasherABoolean = dynamicPropertyRegistry.get("crashera_b");
    modulesanticrasherui.title("§4DDOS§4");
    modulesanticrasherui.toggle("これも次のアプデで修正されるらしい", crasherABoolean);
    modulesanticrasherui
        .show(player)
        .then((anticrasherResult) => {
        uiANTICRASHER(anticrasherResult, player);
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
