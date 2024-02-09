import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiSpawnProtection } from "../../../modules/uispawnProtections";
import ConfigInterface from "../../../../interfaces/Config";

export function spawnProtectionHandler(player: Player) {
    const modulesspui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const spawnProtectionBoolean = configuration.modules.spawnprotection.enabled;
    const spawnProtectionVector3 = configuration.modules.spawnprotection.vector3;
    const spawnProtectionRadius = configuration.modules.spawnprotection.radius;
    modulesspui.title("§4Paradox Modules - Spawn Protection§4");
    modulesspui.toggle("Enable Spawn Protection - ", spawnProtectionBoolean);
    modulesspui.textField("X Coordinate", "0", spawnProtectionVector3.x.toString());
    modulesspui.textField("Y Coordinate", "0", spawnProtectionVector3.y.toString());
    modulesspui.textField("Z Coordinate", "0", spawnProtectionVector3.z.toString());
    modulesspui.textField("Radius", "90", spawnProtectionRadius.toString());
    modulesspui
        .show(player)
        .then((spawnProtectionResult) => {
            uiSpawnProtection(spawnProtectionResult, player);
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
