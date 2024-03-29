import { Player, world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { uiOP } from "../../moderation/uiOp";
import ConfigInterface from "../../../interfaces/Config";
import { dynamicPropertyRegistry } from "../../../penrose/WorldInitializeAfterEvent/registry";

export function opHandler(player: Player, uniqueId: string, salt: string, hash: string) {
    // New window for op
    let opgui: ModalFormData | ActionFormData;
    let onlineList: string[] = [];
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    if (uniqueId === player.name) {
        opgui = new ModalFormData();
        opgui.title("§4OP§4");

        onlineList = Array.from(world.getPlayers(), (player) => player.name);
        opgui.dropdown(`\n§fSelect a player to give access to Paradox:§f\n\nPlayer's Online\n`, onlineList);
    } else if (!configuration.encryption.password) {
        opgui = new ActionFormData();
        opgui.title("§4OP§4");

        opgui.button("Grant OP Access", "textures/ui/op");
    } else if (configuration.encryption.password) {
        opgui = new ModalFormData();
        opgui.title("§4OP§4");

        opgui.textField("Enter Password:", "");
    }
    opgui
        .show(player)
        .then((opResult) => {
            uiOP(opResult, salt, hash, player, onlineList);
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
