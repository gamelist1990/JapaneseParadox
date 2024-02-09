import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiEXPSALVAGESYSTEM } from "../../../modules/uiExpSalvageSystem";
import ConfigInterface from "../../../../interfaces/Config";

export function salvageHandler(player: Player) {
    //New Slavage System
    const modulesexpsavlagesystem = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const salvageBoolean = configuration.modules.salvage.enabled;
    modulesexpsavlagesystem.title("§4Paradox Modules - Salvage System§4");
    modulesexpsavlagesystem.toggle("Salvage System - Salvage all item's:", salvageBoolean);
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
