import { ActionFormData } from "@minecraft/server-ui";
import { Player, EntityInventoryComponent } from "@minecraft/server";
import { uiItemEditorEnchantmentsMenu } from "./uiItemEditorEnchantmentsMenu";
import { uiItemEditorNameMenu } from "./uiInvEditorNameMenu";
import { uiItemEditorReplaceMenu } from "./uiInvEditorReplaceMenu";
import { uiItemEditorTransferMenu } from "./uiInvEditorTransferMenu";
import { uiInvEditorHelpMenu } from "./uiInvEditorHelpMenu";
import { inventoryHandler } from "../../guiHandler/guiHandlerModeration/results/inventoryui";
import { uiItemEditorStats } from "./uiItemEditorStats";
import { uiItemEditorRepairMenu } from "./uiInvEditorRepairItemMenu";
export function uiInvEditorMenu(player: Player, targetPlayer: Player, itemSlot: number) {
    const menu = new ActionFormData();
    menu.title("§4インベントリアイテムエディターメニュー§4");
    const inv = targetPlayer.getComponent("inventory") as EntityInventoryComponent;
    const container = inv.container;
    const item = container.getItem(itemSlot);
    menu.body("§r現在のプレイヤーのインベントリ：§6" + targetPlayer.name + "\n" + "§r選択したアイテム：§6" + item.typeId.replace("minecraft:", ""));
    menu.button("アイテムステータス");
    menu.button("エンチャント");
    menu.button("ネーミングとロア");
    menu.button("アイテムの置換または削除");
    menu.button("アイテムの転送");
    menu.button("アイテムの耐久性");
    menu.button("プレイヤーリストに戻る");
    menu.button("ヘルプメニュー");
    menu.show(player)
        .then((InvEditorMenuUIResult) => {
            if (InvEditorMenuUIResult.selection == 0) {
                //items stats
                uiItemEditorStats(player, targetPlayer, itemSlot);
            }
            if (InvEditorMenuUIResult.selection == 1) {
                //enchantments
                uiItemEditorEnchantmentsMenu(player, targetPlayer, itemSlot);
            }
            if (InvEditorMenuUIResult.selection == 2) {
                //Naming and Lore
                uiItemEditorNameMenu(player, targetPlayer, itemSlot);
            }
            if (InvEditorMenuUIResult.selection == 3) {
                //Replace Or Delete Item
                uiItemEditorReplaceMenu(player, targetPlayer, itemSlot);
            }
            if (InvEditorMenuUIResult.selection == 4) {
                //Delete or Transfer Item
                uiItemEditorTransferMenu(player, targetPlayer, itemSlot);
            }
            if (InvEditorMenuUIResult.selection == 5) {
                //Repair set item durability
                uiItemEditorRepairMenu(player, targetPlayer, itemSlot);
            }
            if (InvEditorMenuUIResult.selection == 6) {
                //Show the player the players list screen
                inventoryHandler(player);
            }
            if (InvEditorMenuUIResult.selection == 7) {
                //Show the player the help screen.
                uiInvEditorHelpMenu(player, targetPlayer, itemSlot);
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
