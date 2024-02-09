import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiWORLDBORDER } from "../../../modules/uiWorldborder";
import ConfigInterface from "../../../../interfaces/Config";

export function worldBorderHandler(player: Player) {
    const modulesworldborderui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const overWorldBorderBoolean = configuration.modules.worldBorder.enabled;
    const overworldBorderNumber = configuration.modules.worldBorder.overworld;
    const netherworldBorderNumber = configuration.modules.worldBorder.nether;
    const endworldBorderNumber = configuration.modules.worldBorder.end;
    modulesworldborderui.title("§4Paradox Modules - World Border§4");
    modulesworldborderui.textField("Over World Border - Value in blocks:", "1000", String(overworldBorderNumber));
    modulesworldborderui.textField("Nether World Border - Values in blocks. Set to 0 if it needs to be disabled:", "0", String(netherworldBorderNumber));
    modulesworldborderui.textField("End World Border - Values in blocks. Set to 0 if it needs to be disabled:", "0", String(endworldBorderNumber));
    modulesworldborderui.toggle("Enable World Border:", overWorldBorderBoolean);
    modulesworldborderui
        .show(player)
        .then((spamResult) => {
            uiWORLDBORDER(spamResult, player);
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
