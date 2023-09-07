import { world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import config from "../../../data/config";
import { uiOP } from "../../moderation/uiOp";
export function opHandler(player, uniqueId, salt, hash) {
    // New window for op
    let opgui;
    let onlineList = [];
    if (uniqueId === player.name) {
        opgui = new ModalFormData();
        opgui.title("§4管理者§4");
                onlineList = Array.from(world.getPlayers(), (player) => player.name);
                opgui.dropdown(`\n§f管理者にするプレイヤーを選択§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    }
    else if (!config.encryption.password) {
        opgui = new ActionFormData();
        opgui.title("§4管理者§4");
    opgui.button("OP権限取得", "textures/ui/op");
    }
    else if (config.encryption.password) {
        opgui = new ModalFormData();
        opgui.title("§4管理者§4");
                opgui.textField("パスワードを入力してください:", "");
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
