import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiItemEditorTransfer } from "./uiItemEditor";
export function uiItemEditorTransferMenu(player: Player, targetPlayer: Player, itemSlot: number) {
    const itemEditor = new ModalFormData();
    itemEditor.title("§4アイテムエディター アイテムの置換§4");
    itemEditor.toggle("アイテムの置換");
    let onlineList: string[] = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    itemEditor.dropdown(`\n§fプレーヤーを選択してください:§f\n\nプレイヤーがオンライン\n`, onlineList);
    itemEditor.toggle("重複したアイテム", false);
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
