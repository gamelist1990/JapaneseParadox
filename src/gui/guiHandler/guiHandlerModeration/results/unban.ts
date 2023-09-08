import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiUNBAN } from "../../../moderation/uiUnban";

export function unbanHandler(player: Player) {
    //show unban ui here
    const unbanui = new ModalFormData();
    unbanui.title("§4BAN解除§4");
    unbanui.textField(`ユーザー:`, `解除したいユーザーの名前を入力`);
    unbanui.toggle("BAN解除を取り消し【解除申請をしたプレイヤーの名前】", false);
    unbanui
        .show(player)
        .then((unbanResult) => {
            uiUNBAN(unbanResult, player);
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
