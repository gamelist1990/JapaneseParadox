import { world, ItemStack, Enchantment } from "@minecraft/server";
import { sendMsgToPlayer } from "../../../util";
import { uiInvEditorMenu } from "./uiInvEditorMainMenu";
/**
 * Handles the result of a modal form used for transferring an item from the targeted player's inventory to the selected player's inventory.
 *
 * @name uiItemEditorTransfer
 * @param {ModalFormResponse} InvEditorUIResult - The result of the inventory editor modal form.
 * @param {string[]} onlineList - The list of online player names.
 * @param {Player} player - The player who triggered the inventory management modal form.
 * @param targetPlayer - The player who has been targeted.
 * @param itemSlot  - the item slot number of the targeted player.
 */
export function uiItemEditorTransfer(InvEditorUIResult, onlineList, player, targetPlayer, itemSlot) {
    handleUIitemEditorTransfer(InvEditorUIResult, onlineList, player, targetPlayer, itemSlot).catch((error) => {
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
    async function handleUIitemEditorTransfer(InvEditorUIResult, onlineList, player, targetPlayer, itemSlot) {
        if (!InvEditorUIResult || InvEditorUIResult.canceled) {
            // Handle canceled form or undefined result
            return;
        }
        const [transferToggle, value, duplicateToggle] = InvEditorUIResult.formValues;
        //Member is used when transferring an Item.
        let member = undefined;
        const players = world.getPlayers();
        for (const pl of players) {
            if (pl.name.toLowerCase().includes(onlineList[value].toLowerCase().replace(/"|\\|@/g, ""))) {
                member = pl;
                break;
            }
        }
        if (transferToggle == true) {
            //Member is the player the item is being transferred to
            const targetPlayerinv = targetPlayer.getComponent("inventory");
            const memberPlayerinv = member.getComponent("inventory");
            let freeSlot;
            const maxSlots = 36; // Maximum number of slots in the player's inventory
            // Loop through the inventory and add items to the itemArray
            for (let i = 0; i < maxSlots; i++) {
                const item = memberPlayerinv.container.getItem(i);
                if (item?.typeId) {
                }
                else {
                    freeSlot = i;
                    break;
                }
            }
            targetPlayerinv.container.moveItem(itemSlot, freeSlot, memberPlayerinv.container);
        }
        if (duplicateToggle == true) {
            //Member is the player the item is being transferred to
            const targetPlayerinv = targetPlayer.getComponent("inventory");
            const memberPlayerinv = member.getComponent("inventory");
            let freeSlot;
            const maxSlots = 36; // Maximum number of slots in the player's inventory
            // Loop through the inventory and add items to the itemArray
            for (let i = 0; i < maxSlots; i++) {
                const item = memberPlayerinv.container.getItem(i);
                if (item?.typeId) {
                }
                else {
                    freeSlot = i;
                    break;
                }
            }
            const item = targetPlayerinv.container.getItem(itemSlot);
            memberPlayerinv.container.setItem(freeSlot, item);
        }
        // Present the Main Menu screen again.
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
export function uiItemEditorEnchantments(InvEditorUIResult, player, targetPlayer, itemSlot) {
    handleUIitemEditorEnchantments(InvEditorUIResult, player, targetPlayer, itemSlot).catch((error) => {
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
    async function handleUIitemEditorEnchantments(InvEditorUIResult, player, targetPlayer, itemSlot) {
        const [enchantToggle, txtEnchant, txtEnchantValue, removeEnchantToggle, txtRemovEnchant] = InvEditorUIResult.formValues;
        const inv = targetPlayer.getComponent("inventory");
        const container = inv.container;
        const item = container.getItem(itemSlot);
        //Are we adding enchantments?
        if (enchantToggle == true) {
            if (item) {
                const enchantmentsComponent = item.getComponent("minecraft:enchantments");
                const enchantmentList = enchantmentsComponent.enchantments;
                const addedCustomEnchantment = enchantmentList.addEnchantment(new Enchantment(txtEnchant.toString(), parseInt(txtEnchantValue.toString())));
                enchantmentsComponent.enchantments = enchantmentList;
                container.setItem(itemSlot, item);
                if (!addedCustomEnchantment) {
                    sendMsgToPlayer(player, "エンチャを適応できません: " + item.typeId + " エンチャ=>: " + txtEnchant + ", " + txtEnchantValue);
                }
            }
        }
        if (removeEnchantToggle == true) {
            //Are we removing enchantments?
            const enchantmentsComponent = item.getComponent("minecraft:enchantments");
            const enchantmentList = enchantmentsComponent.enchantments;
            enchantmentList.removeEnchantment(txtRemovEnchant.toString());
            enchantmentsComponent.enchantments = enchantmentList;
            container.setItem(itemSlot, item);
        }
        // Present the Main Menu screen again.
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
export function uiItemEditorName(InvEditorUIResult, player, targetPlayer, itemSlot) {
    handleUIitemEditorName(InvEditorUIResult, player, targetPlayer, itemSlot).catch((error) => {
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
    async function handleUIitemEditorName(InvEditorUIResult, player, targetPlayer, itemSlot) {
        const [renameToggle, txtRename, loreToggle, txtLore] = InvEditorUIResult.formValues;
        const inv = targetPlayer.getComponent("inventory");
        const container = inv.container;
        const item = container.getItem(itemSlot);
        //Are we renaming the item?
        if (renameToggle == true) {
            item.nameTag = txtRename.toString();
            container.setItem(itemSlot, item);
        }
        if (loreToggle == true) {
            const loreArray = txtLore.toString().split(",");
            item.setLore(loreArray);
            container.setItem(itemSlot, item);
        }
        // Present the Main Menu screen again.
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
export function uiItemEditorReplace(InvEditorUIResult, player, targetPlayer, itemSlot) {
    handleUIitemEditorReplace(InvEditorUIResult, player, targetPlayer, itemSlot).catch((error) => {
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
    async function handleUIitemEditorReplace(InvEditorUIResult, player, targetPlayer, itemSlot) {
        const [replaceToggle, txtReplace, deleteToggle] = InvEditorUIResult.formValues;
        const inv = targetPlayer.getComponent("inventory");
        const container = inv.container;
        //Are we replacing the item?
        if (replaceToggle === true) {
            const itemStack = new ItemStack("minecraft:" + txtReplace);
            container.setItem(itemSlot, itemStack);
        }
        if (deleteToggle == true) {
            container.setItem(itemSlot);
        }
        // Present the Main Menu screen again.
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
export function uiItemEditorRepair(InvEditorUIResult, player, targetPlayer, itemSlot) {
    handleUIitemEditorRepair(InvEditorUIResult, player, targetPlayer, itemSlot).catch((error) => {
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
    async function handleUIitemEditorRepair(InvEditorUIResult, player, targetPlayer, itemSlot) {
        const [repairToggle] = InvEditorUIResult.formValues;
        const inv = targetPlayer.getComponent("inventory");
        const container = inv.container;
        const item = container.getItem(itemSlot);
        //Current Damage values
        const durability = item.getComponent("minecraft:durability");
        if (repairToggle == true) {
            durability.damage = 0;
            container.setItem(itemSlot, item);
        }
        // Present the Main Menu screen again.
        uiInvEditorMenu(player, targetPlayer, itemSlot);
    }
}
