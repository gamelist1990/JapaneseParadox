import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiItemEditorTransfer } from "./uiItemEditor";
export function uiItemEditorTransferMenu(player, targetPlayer, itemSlot) {
    const itemEditor = new ModalFormData();
    itemEditor.title("§4インベントリ：アイテム移動§4");
    itemEditor.toggle("アイテムを自分のインベントリにコピーする");
    let onlineList = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    itemEditor.dropdown(`\n§fプレイヤーを選択して下さい§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    itemEditor
        .show(player)
        .then((InvEditorUIResult) => {
        uiItemEditorTransfer(InvEditorUIResult, onlineList, player, targetPlayer, itemSlot);
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