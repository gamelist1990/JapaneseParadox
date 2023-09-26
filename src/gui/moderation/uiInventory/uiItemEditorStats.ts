import { EntityInventoryComponent, Player, ItemEnchantsComponent, Enchantment, ItemDurabilityComponent, Vector3 } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { uiInvEditorMenu } from "./uiInvEditorMainMenu";
export function uiItemEditorStats(player: Player, targetPlayer: Player, itemSlot: number) {
    handleUIitemEditorStats(player, targetPlayer, itemSlot).catch((error) => {
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

    async function handleUIitemEditorStats(player: Player, targetPlayer: Player, itemSlot: number) {
        const inv = targetPlayer.getComponent("inventory") as EntityInventoryComponent;
        const container = inv.container;
        const item = container.getItem(itemSlot);
        //get the enchantment data.
        const enchantmentsComponent = item.getComponent("minecraft:enchantments") as ItemEnchantsComponent;
        const enchantmentList = enchantmentsComponent.enchantments;
        const enchantmentNames: string[] = [];
        const iterator = enchantmentList[Symbol.iterator]();
        let iteratorResult = iterator.next();
        while (!iteratorResult.done) {
            const enchantment: Enchantment = iteratorResult.value;
            enchantmentNames.push("§6" + enchantment.type.id + ": §5" + enchantment.level.toString());
            iteratorResult = iterator.next();
        }
        //format the array data so that is shows correctly in the UI
        const formattedEnchantments = enchantmentNames.join("\n");
        // Get the lore data for the item
        const currentItemLore = item.getLore();
        const formattedLore = currentItemLore.join("\n");
        const statsMenu = new ActionFormData();
        //Current Damage values
        const durability = item.getComponent("minecraft:durability") as ItemDurabilityComponent;
        const maxDurability = durability.maxDurability;
        let currentDamage = durability.damage;
        //Show the stats for the item.
        statsMenu.title("§4インベントリ：アイテムステータス§4");
        statsMenu.body(
            "現在のオンラインリスト: §6" +
                targetPlayer.name +
                "\n" +
                "§rアイテムを指定: §6" +
                item.typeId.replace("minecraft:", "") +
                "§r\n\n現在のエンチャント: \n" +
                formattedEnchantments +
                "\n\n§rアイテム説明欄: \n" +
                formattedLore +
                "\n\n耐久性: §6" +
                (currentDamage = maxDurability - currentDamage) +
                "/" +
                maxDurability
        );
        statsMenu.button("戻る");
        statsMenu.show(player).then((InvEditorMenuUIResult) => {
            if (InvEditorMenuUIResult.selection == 0) {
                //Return to the main menu
                uiInvEditorMenu(player, targetPlayer, itemSlot);
            }
        });
    }
}
