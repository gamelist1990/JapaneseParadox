import { ActionFormData } from "@minecraft/server-ui";
import { antiKnockBackHandler } from "./results/antiknockback";
import { antiFallHandler } from "./results/antifall";
import { antiFlyHandler } from "./results/antifly";
import { invalidSprintHandler } from "./results/invalidsprint";
import { speedAHandler } from "./results/speeda";
import { antiScaffoldAHandler } from "./results/antiscaffolda";
import { antiJesusAHandler } from "./results/antijesusa";
export function movementui(player) {
    const modulesmovementui = new ActionFormData();
    modulesmovementui.title("§4メニュー：移動系§4");
    modulesmovementui.button("ノックバック検知", "textures/items/diamond_chestplate");
    modulesmovementui.button("落下ダメ検知", "textures/items/diamond_boots");
    modulesmovementui.button("飛行検知", "textures/items/elytra");
    modulesmovementui.button("Sprint検知", "textures/items/diamond_boots");
    modulesmovementui.button("速さ検知", "textures/items/diamond_boots");
    modulesmovementui.button("Scaffold検知", "textures/blocks/scaffolding_top");
    modulesmovementui.button("水の上走ってるやつ検知", "textures/blocks/lava_placeholder");
    modulesmovementui
        .show(player)
        .then((movementResult) => {
        switch (movementResult.selection) {
            case 0:
                antiKnockBackHandler(player);
                break;
            case 1:
                antiFallHandler(player);
                break;
            case 2:
                antiFlyHandler(player);
                break;
            case 3:
                invalidSprintHandler(player);
                break;
            case 4:
                speedAHandler(player);
                break;
            case 5:
                antiScaffoldAHandler(player);
                break;
            case 6:
                antiJesusAHandler(player);
                break;
            default:
                break;
        }
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
