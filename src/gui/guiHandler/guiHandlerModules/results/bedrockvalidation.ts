import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiBEDROCKVALIDATION } from "../../../modules/uiBedrockValidation";
import ConfigInterface from "../../../../interfaces/Config";

export function bedrockValidationHandler(player: Player) {
    const modulesbedrockvalidateui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const bedrockValidateBoolean = configuration.modules.bedrockValidate.enabled;
    modulesbedrockvalidateui.title("§4Paradox Modules - Bedrock Validation§4");
    modulesbedrockvalidateui.toggle("Bedrock Validate - Checks for bedrock validations:", bedrockValidateBoolean);
    modulesbedrockvalidateui
        .show(player)
        .then((bedrockvalidationResult) => {
            uiBEDROCKVALIDATION(bedrockvalidationResult, player);
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
