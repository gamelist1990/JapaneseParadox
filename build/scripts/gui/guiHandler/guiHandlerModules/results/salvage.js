import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiEXPSALVAGESYSTEM } from "../../../modules/uiExpSalvageSystem";
export function salvageHandler(player) {
    //New Slavage System
    const modulesexpsavlagesystem = new ModalFormData();
    const salvageBoolean = dynamicPropertyRegistry.get("salvage_b");
    modulesexpsavlagesystem.title("§4メニュー：Salvage System§4");
    modulesexpsavlagesystem.toggle("良く分からないやつ", salvageBoolean);
    modulesexpsavlagesystem
        .show(player)
        .then((salvagesystemResult) => {
        uiEXPSALVAGESYSTEM(salvagesystemResult, player);
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
