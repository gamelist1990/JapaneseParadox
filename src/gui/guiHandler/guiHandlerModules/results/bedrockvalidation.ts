import { Player, Vector3 } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiBEDROCKVALIDATION } from "../../../modules/uiBedrockValidation";

export function bedrockValidationHandler(player: Player) {
    const modulesbedrockvalidateui = new ModalFormData();
    const bedrockValidateBoolean = dynamicPropertyRegistry.get("bedrockvalidate_b") as boolean;
    modulesbedrockvalidateui.title("§4メニュー：Bedrock Validation§4");
    modulesbedrockvalidateui.toggle("岩盤が無事かをチェックします", bedrockValidateBoolean);
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
