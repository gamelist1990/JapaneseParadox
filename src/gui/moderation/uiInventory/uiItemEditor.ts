import { EntityInventoryComponent, Player, world, ItemStack, Enchantment, ItemEnchantsComponent, ItemDurabilityComponent } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { sendMsgToPlayer } from "../../../util";
import { uiInvEditorMenu } from "./uiInvEditorMainMenu";
/**
 * Handles the result of a modal form used for transferring an item from the targeted player'インベントリを選択したプレイヤーに送る's inventory.
 *
 * @name uiItemEditorTransfer
 * @param {ModalFormResponse} InvEditorUIResult - The result of the inventory editor modal form.
 * @param {string[]} onlineList - The list of online player names.
 * @param {Player} player - The player who triggered the inventory management modal form.
 * @param targetPlayer - The player who has been targeted.
 * @param itemSlot  - the item slot number of the targeted player.
 */
export function uiItemEditorTransfer(InvEditorUIResult: ModalFormResponse, onlineList: string[], player: Player, targetPlayer: Player, itemSlot: number) {
    handleUIitemEditorTransfer(InvEditorUIResult, onlineList, player, targetPlayer, itemSlot).catch((error) => {
        console.error("Paradox Unhandled Rejection: ", error);
        // スタックトレース情報の抽出
        if (error instanceof Error) {
            const stackLines = error.stack.split("\n");
            if (stackLines.length > 1) {
                const sourceInfo = stackLines;
                console.error("Error originated from:", sourceInfo[0]);
            }
        }
    });

    async function handleUIitemEditorTransfer(InvEditorUIResult: ModalFormResponse, onlineList: string[], player: Player, targetPlayer: Player, itemSlot: number) {
        if (!InvEditorUIResult || InvEditorUIResult.canceled) {
            // キャンセルされたフォームまたは未定義の結果を処理する
            return;
        }
        const [transferToggle, value, duplicateToggle] = InvEditorUIResult.formValues;
        //メンバーは、アイテムを譲渡するときに使用します。
        let member: Player = undefined;
        const players = world.getPlayers();
        for (const pl of players) {
            if (pl.name.toLowerCase().includes(onlineList[value as number].toLowerCase().replace(/"|\\|@/g, ""))) {
                member = pl;
                break;
            }
        }
        if (transferToggle == true) {
            //メンバーは、アイテムが転送されるプレイヤーです。
            const targetPlayerinv = targetPlayer.getComponent("inventory") as EntityInventoryComponent;
            const memberPlayerinv = member.getComponent("inventory") as EntityInventoryComponent;
            let freeSlot: number;
            const maxSlots = 36; // Maximum number of slots in the player's inventory

            // インベントリーをループし、アイテムをitemArrayに追加する。
            for (let i = 0; i < maxSlots; i++) {
                const item = memberPlayerinv.container.getItem(i);
                if (!item?.typeId) {
                    freeSlot = i;
                    break;
                }
            }
            targetPlayerinv.container.moveItem(itemSlot, freeSlot, memberPlayerinv.container);
        }
        if (duplicateToggle == true) {
            //メンバーは、アイテムが転送されるプレイヤーです。
            const targetPlayerinv = targetPlayer.getComponent("inventory") as EntityInventoryComponent;
            const memberPlayerinv = member.getComponent("inventory") as EntityInventoryComponent;
            let freeSlot: number;
            const maxSlots = 36; // Maximum number of slots in the player's inventory

            // インベントリーをループし、アイテムをitemArrayに追加する。
            for (let i = 0; i < maxSlots; i++) {
                const item = memberPlayerinv.container.getItem(i);
                if (!item?.typeId) {
                    freeSlot = i;
                    break;
                }
            }
            const item = targetPlayerinv.container.getItem(itemSlot);
            memberPlayerinv.container.setItem(freeSlot, item);
        }
        // メインメニュー画面を再度表示する。
        uiInvEditorMenu(player, targetPlayer, itemSlot);
    }
}
/**
 * Handles the result of a modal form used for adding or removing enchantments to the selected item from the targeted player's inventory
 * @name uiItemEditorEnchantments
 * @param {ModalFormResponse} InvEditorUIResult - The result of the inventory editor modal form.
 * @param {Player} player - The player who triggered the inventory management modal form.
 * @param targetPlayer - The player who has been targeted.
 * @param itemSlot  - the item slot number of the targeted player.
 */
export function uiItemEditorEnchantments(InvEditorUIResult: ModalFormResponse, player: Player, targetPlayer: Player, itemSlot: number) {
    handleUIitemEditorEnchantments(InvEditorUIResult, player, targetPlayer, itemSlot).catch((error) => {
        console.error("Paradox Unhandled Rejection: ", error);
        // スタックトレース情報の抽出
        if (error instanceof Error) {
            const stackLines = error.stack.split("\n");
            if (stackLines.length > 1) {
                const sourceInfo = stackLines;
                console.error("Error originated from:", sourceInfo[0]);
            }
        }
    });

    async function handleUIitemEditorEnchantments(InvEditorUIResult: ModalFormResponse, player: Player, targetPlayer: Player, itemSlot: number) {
        const [enchantToggle, txtEnchant, txtEnchantValue, removeEnchantToggle, txtRemovEnchant] = InvEditorUIResult.formValues;

        const inv = targetPlayer.getComponent("inventory") as EntityInventoryComponent;
        const container = inv.container;
        const item = container.getItem(itemSlot);

        //エンチャントを加えるのか？
        if (enchantToggle == true) {
            if (item) {
                const enchantmentsComponent = item.getComponent("minecraft:enchantments") as ItemEnchantsComponent;
                const enchantmentList = enchantmentsComponent.enchantments;

                const addedCustomEnchantment = enchantmentList.addEnchantment(new Enchantment(txtEnchant.toString(), parseInt(txtEnchantValue.toString())));
                enchantmentsComponent.enchantments = enchantmentList;
                container.setItem(itemSlot, item);
                if (!addedCustomEnchantment) {
                    sendMsgToPlayer(player, "§fエンチャントできません: §7" + item.typeId + "§f 適用されるエンチャント: §7" + txtEnchant + "§f, §7" + txtEnchantValue);
                }
            }
        }
        if (removeEnchantToggle == true) {
            //エンチャントを取り除くのか？
            const enchantmentsComponent = item.getComponent("minecraft:enchantments") as ItemEnchantsComponent;
            const enchantmentList = enchantmentsComponent.enchantments;
            enchantmentList.removeEnchantment(txtRemovEnchant.toString());
            enchantmentsComponent.enchantments = enchantmentList;
            container.setItem(itemSlot, item);
        }
        // メインメニュー画面を再度表示する。
        uiInvEditorMenu(player, targetPlayer, itemSlot);
    }
}
/**
 * Handles the result of a modal form used for renaming or editing the lore the selected item from the targeted player's inventory
 * @name uiItemEditorName
 * @param {ModalFormResponse} InvEditorUIResult - The result of the inventory editor modal form.
 * @param {Player} player - The player who triggered the inventory management modal form.
 * @param targetPlayer - The player who has been targeted.
 * @param itemSlot  - the item slot number of the targeted player.
 */
export function uiItemEditorName(InvEditorUIResult: ModalFormResponse, player: Player, targetPlayer: Player, itemSlot: number) {
    handleUIitemEditorName(InvEditorUIResult, player, targetPlayer, itemSlot).catch((error) => {
        console.error("Paradox Unhandled Rejection: ", error);
        // スタックトレース情報の抽出
        if (error instanceof Error) {
            const stackLines = error.stack.split("\n");
            if (stackLines.length > 1) {
                const sourceInfo = stackLines;
                console.error("Error originated from:", sourceInfo[0]);
            }
        }
    });

    async function handleUIitemEditorName(InvEditorUIResult: ModalFormResponse, player: Player, targetPlayer: Player, itemSlot: number) {
        const [renameToggle, txtRename, loreToggle, txtLore] = InvEditorUIResult.formValues;

        const inv = targetPlayer.getComponent("inventory") as EntityInventoryComponent;
        const container = inv.container;
        const item = container.getItem(itemSlot);
        //アイテム名を変更するのか？
        if (renameToggle == true) {
            item.nameTag = txtRename.toString();
            container.setItem(itemSlot, item);
        }
        if (loreToggle == true) {
            const loreArray = txtLore.toString().split(",");
            item.setLore(loreArray);
            container.setItem(itemSlot, item);
        }

        // メインメニュー画面を再度表示する。
        uiInvEditorMenu(player, targetPlayer, itemSlot);
    }
}
/**
 * Handles the result of a modal form used for replacing or deleting the selected item from the targeted player's inventory
 * @name uiItemEditorReplace
 * @param {ModalFormResponse} InvEditorUIResult - The result of the inventory editor modal form.
 * @param {Player} player - The player who triggered the inventory management modal form.
 * @param targetPlayer - The player who has been targeted.
 * @param itemSlot  - the item slot number of the targeted player.
 */
export function uiItemEditorReplace(InvEditorUIResult: ModalFormResponse, player: Player, targetPlayer: Player, itemSlot: number) {
    handleUIitemEditorReplace(InvEditorUIResult, player, targetPlayer, itemSlot).catch((error) => {
        console.error("Paradox Unhandled Rejection: ", error);
        // スタックトレース情報の抽出
        if (error instanceof Error) {
            const stackLines = error.stack.split("\n");
            if (stackLines.length > 1) {
                const sourceInfo = stackLines;
                console.error("Error originated from:", sourceInfo[0]);
            }
        }
    });

    async function handleUIitemEditorReplace(InvEditorUIResult: ModalFormResponse, player: Player, targetPlayer: Player, itemSlot: number) {
        const [replaceToggle, txtReplace, deleteToggle] = InvEditorUIResult.formValues;

        const inv = targetPlayer.getComponent("inventory") as EntityInventoryComponent;
        const container = inv.container;
        //品物を交換するのか？
        if (replaceToggle === true) {
            const itemStack = new ItemStack("minecraft:" + txtReplace);
            container.setItem(itemSlot, itemStack);
        }
        if (deleteToggle == true) {
            container.setItem(itemSlot);
        }

        // メインメニュー画面を再度表示する。
        uiInvEditorMenu(player, targetPlayer, itemSlot);
    }
}
/**
 * Handles the result of a modal form used for repairing the selected item from the targeted player's inventory
 * @name uiItemEditorRepair
 * @param {ModalFormResponse} InvEditorUIResult - The result of the inventory editor modal form.
 * @param {Player} player - The player who triggered the inventory management modal form.
 * @param targetPlayer - The player who has been targeted.
 * @param itemSlot  - the item slot number of the targeted player.
 */
export function uiItemEditorRepair(InvEditorUIResult: ModalFormResponse, player: Player, targetPlayer: Player, itemSlot: number) {
    handleUIitemEditorRepair(InvEditorUIResult, player, targetPlayer, itemSlot).catch((error) => {
        console.error("Paradox Unhandled Rejection: ", error);
        // スタックトレース情報の抽出
        if (error instanceof Error) {
            const stackLines = error.stack.split("\n");
            if (stackLines.length > 1) {
                const sourceInfo = stackLines;
                console.error("Error originated from:", sourceInfo[0]);
            }
        }
    });

    async function handleUIitemEditorRepair(InvEditorUIResult: ModalFormResponse, player: Player, targetPlayer: Player, itemSlot: number) {
        const [repairToggle] = InvEditorUIResult.formValues;

        const inv = targetPlayer.getComponent("inventory") as EntityInventoryComponent;
        const container = inv.container;
        const item = container.getItem(itemSlot);
        //現在のダメージ値
        const durability = item.getComponent("minecraft:durability") as ItemDurabilityComponent;
        if (repairToggle == true) {
            durability.damage = 0;
            container.setItem(itemSlot, item);
        }

        // メインメニュー画面を再度表示する。
        uiInvEditorMenu(player, targetPlayer, itemSlot);
    }
}
