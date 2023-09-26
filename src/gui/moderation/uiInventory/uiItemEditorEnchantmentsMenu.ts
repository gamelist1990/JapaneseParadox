import { Player, Vector3 } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiItemEditorEnchantments } from "./uiItemEditor";
export function uiItemEditorEnchantmentsMenu(player: Player, targetPlayer: Player, itemSlot: number) {
    const itemEditor = new ModalFormData();
    itemEditor.title("§4インベントリ：エンチャントメニュー§4");
    itemEditor.toggle("エンチャントを追加", false);
    itemEditor.textField("エンチャ内容", "例：knockback");
    itemEditor.textField("エンチャ レベル", "例：3");
    itemEditor.toggle("エンチャ消去", false);
    itemEditor.textField("消すエンチャ内容", "例：knockback");
    itemEditor
        .show(player)
        .then((InvEditorUIResult) => {
            uiItemEditorEnchantments(InvEditorUIResult, player, targetPlayer, itemSlot);
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
