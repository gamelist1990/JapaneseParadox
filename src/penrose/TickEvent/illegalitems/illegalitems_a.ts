import { world, ItemStack, Player, EntityInventoryComponent, system, ItemEnchantsComponent, EnchantmentList, Enchantment, PlayerLeaveAfterEvent } from "@minecraft/server";
import config from "../../../data/config.js";
import { illegalitems } from "../../../data/itemban.js";
import { kickablePlayers } from "../../../kickcheck.js";
import { sendMsg, sendMsgToPlayer } from "../../../util.js";
import { dynamicPropertyRegistry } from "../../WorldInitializeAfterEvent/registry.js";
import { StringTransformation } from "../../../classes/StringTransformation.js";

// Create a map of player objects and their enchantment presence
const enchantmentPresenceMap = new Map<string, Map<Enchantment, boolean>>();
// Create a map of player objects and their enchantment data
const enchantmentDataMap = new Map<string, Map<Enchantment, EnchantmentList>>();
// Create a map of player objects and their inventory slot value
const inventorySlotMap = new Map<string, Map<Enchantment, number>>();
// Create a map of player objects and their ItemStack data
const itemStackDataMap = new Map<string, Map<Enchantment, ItemStack>>();
// Create a map of player objects and their unverified ItemStack
const unverifiedItemMap = new Map<string, Map<number, ItemStack>>();
// Create a map to store the previous empty slots count for each player
const previousEmptySlotsCount = new Map<string, number>();

function rip(player: Player, inventory_item: ItemStack, enchData?: { id: string; level: number }, lore = false) {
    let reason: string;
    if (enchData) {
        const { id, level } = enchData;
        reason = `Illegal Item A (${inventory_item.typeId.replace("minecraft:", "")}: ${id}=${level})`;
    } else {
        reason = `Illegal Item A (${inventory_item.typeId.replace("minecraft:", "")}=${inventory_item.amount})`;
        if (lore) {
            reason += " (Lore)";
        }
    }

    try {
        player.addTag(`Reason:${reason}`);
        player.addTag("By:Paradox");
        player.addTag("isBanned");
    } catch (error) {
        kickablePlayers.add(player);
        player.triggerEvent("paradox:kick");
    }
}

function onPlayerLogout(event: PlayerLeaveAfterEvent): void {
    // Remove the player's data from the map when they log off
    enchantmentPresenceMap.delete(event.playerId);
    enchantmentDataMap.delete(event.playerId);
    inventorySlotMap.delete(event.playerId);
    itemStackDataMap.delete(event.playerId);
    unverifiedItemMap.delete(event.playerId);
    previousEmptySlotsCount.delete(event.playerId);
}

function illegalitemsa(id: number) {
    // Get Dynamic Property
    const illegalItemsABoolean = dynamicPropertyRegistry.get("illegalitemsa_b");
    const illegalEnchantmentBoolean = dynamicPropertyRegistry.get("illegalenchantment_b");
    const stackBanBoolean = dynamicPropertyRegistry.get("stackban_b");
    const antiShulkerBoolean = dynamicPropertyRegistry.get("antishulker_b");
    const illegalLoresBoolean = dynamicPropertyRegistry.get("illegallores_b");
    const salvageBoolean = dynamicPropertyRegistry.get("salvage_b");

    // Unsubscribe if disabled in-game
    if (illegalItemsABoolean === false) {
        const allPlayers = world.getPlayers({ tags: ["illegalitemsA"] });
        for (const player of allPlayers) {
            player.removeTag("illegalitemsA");
        }
        resetMaps(); // Clear the maps
        world.afterEvents.playerLeave.unsubscribe(onPlayerLogout);
        system.clearRun(id);
        return;
    }

    // Retrieve all players with the "illegalitemsA" tag from the "world" object
    const allPlayers = world.getPlayers();

    // Iterate through each player
    for (const player of allPlayers) {
        // Get the player's unique ID from the "dynamicPropertyRegistry" object
        const uniqueId = dynamicPropertyRegistry.get(player?.id);

        // If the player has permission (i.e., their unique ID matches their name), skip to the next player
        if (uniqueId === player.name) {
            continue;
        }

        // Get the player's inventory
        const playerInventory = player.getComponent("minecraft:inventory") as EntityInventoryComponent;
        const playerContainer = playerInventory.container;
        // Cache the player's inventory size
        const playerContainerSize = playerContainer.size;

        // Get the current empty slots count
        const currentEmptySlotsCount = playerContainer.emptySlotsCount;

        // Check if the empty slots count has changed
        if (currentEmptySlotsCount !== previousEmptySlotsCount.get(player.id)) {
            // Update the previous empty slots count for the player
            previousEmptySlotsCount.set(player.id, currentEmptySlotsCount);

            // Iterate through each slot in the player's container
            for (let i = 0; i < playerContainerSize; i++) {
                // Get the item in the current slot
                const playerItemStack = playerContainer.getItem(i);
                const itemStackId = playerItemStack?.typeId;
                if (!itemStackId) {
                    continue;
                }

                // Anti Shulker Boxes
                if (antiShulkerBoolean && itemStackId.includes("shulker")) {
                    playerContainer.setItem(i);
                    sendMsg("@a[tag=notify]", `§f§4[§6Paradox§4]§f Removed ${itemStackId.replace("minecraft:", "")} from ${player.name}.`);
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Shulker Boxes are not allowed!`);
                    continue;
                }

                // Illegal Stacks
                const currentStack = playerItemStack.amount;
                const maxStack = playerItemStack.maxAmount;
                if (stackBanBoolean && currentStack > maxStack) {
                    playerContainer.setItem(i);
                    sendMsg("@a[tag=notify]", `§f§4[§6Paradox§4]§f Removed ${itemStackId.replace("minecraft:", "")} x ${currentStack} from ${player.name}.`);
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Illegal Stacks are not allowed!`);
                    rip(player, playerItemStack);
                    break;
                }

                // If the item is in the "illegalitems" object, remove it from the player's inventory and run the "rip" function on it
                if (illegalitems.has(itemStackId)) {
                    playerContainer.setItem(i);
                    sendMsg("@a[tag=notify]", `§f§4[§6Paradox§4]§f Removed ${itemStackId.replace("minecraft:", "")} from ${player.name}.`);
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Illegal Items are not allowed!`);
                    rip(player, playerItemStack);
                    break;
                }

                // Illegal Lores
                if (illegalLoresBoolean && !config.modules.illegalLores.exclude.includes(String(playerItemStack.getLore()))) {
                    playerContainer.setItem(i);
                    sendMsg("@a[tag=notify]", `§f§4[§6Paradox§4]§f Removed ${itemStackId.replace("minecraft:", "")} with lore from ${player.name}.`);
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Item with illegal lores are not allowed!`);
                    rip(player, playerItemStack, null, true);
                    break;
                }

                // Illegal Enchantments
                if (illegalEnchantmentBoolean) {
                    const enchantmentComponent = playerItemStack.getComponent("minecraft:enchantments") as ItemEnchantsComponent;
                    const enchantmentData = enchantmentComponent.enchantments;

                    // Update the enchantment presence and data maps for each enchantment type
                    const iterator = enchantmentData[Symbol.iterator]();
                    let iteratorResult = iterator.next();
                    while (!iteratorResult.done) {
                        const enchantment: Enchantment = iteratorResult.value;
                        enchantmentPresenceMap.get(player.id).set(enchantment, true);
                        enchantmentDataMap.get(player.id).set(enchantment, enchantmentData);
                        inventorySlotMap.get(player.id).set(enchantment, i);
                        itemStackDataMap.get(player.id).set(enchantment, playerItemStack);
                        iteratorResult = iterator.next();
                    }
                }

                // Salvage System
                if (salvageBoolean) {
                    const uniqueItems = ["minecraft:potion", "minecraft:splash_potion", "minecraft:lingering_potion", "minecraft:skull", "minecraft:planks", "minecraft:banner"];

                    if (!uniqueItems.includes(itemStackId)) {
                        const verifiedItemName = playerItemStack.nameTag;
                        if (!verifiedItemName) {
                            unverifiedItemMap.set(player.id, new Map<number, ItemStack>());
                        }
                        const playerMap = unverifiedItemMap.get(player.id);
                        playerMap.set(i, playerItemStack);
                    }
                }
            }

            // Iterate through the enchantment presence map to perform any necessary operations
            if (illegalEnchantmentBoolean) {
                let isPresent = false;
                for (const [enchantment, present] of enchantmentPresenceMap.get(player.id)) {
                    if (present) {
                        // Do something with the present enchantment and its data
                        const itemStackData = itemStackDataMap.get(player.id).get(enchantment);
                        const enchantmentData = enchantmentDataMap.get(player.id).get(enchantment);
                        const getEnchantment = enchantmentData.getEnchantment(enchantment.type);
                        const currentLevel = getEnchantment.level;
                        const maxLevel = getEnchantment.type.maxLevel;
                        // Create new ItemStack to validate enchantments
                        const newItemStack = new ItemStack(itemStackData.typeId);
                        // Get the new enchantment component from the new ItemStack
                        const newEnchantmentComponent = newItemStack.getComponent("minecraft:enchantments") as ItemEnchantsComponent;
                        // Get the new enchantment data from the new ItemStack component
                        const newEnchantmentData = newEnchantmentComponent.enchantments;
                        // Verify if enchantment type is allowed on the item
                        const canAddEnchantBoolean = newEnchantmentData.canAddEnchantment(getEnchantment);
                        // Flag for illegal enchantments
                        if (currentLevel > maxLevel || currentLevel < 0 || !canAddEnchantBoolean) {
                            const itemSlot = inventorySlotMap.get(player.id).get(enchantment);
                            const enchData = {
                                id: getEnchantment.type.id,
                                level: currentLevel,
                            };
                            const itemStackId = playerContainer.getItem(itemSlot);
                            playerContainer.setItem(itemSlot);
                            sendMsg("@a[tag=notify]", `§f§4[§6Paradox§4]§f Removed ${itemStackId.typeId.replace("minecraft:", "")} with Illegal Enchantments from ${player.name}.`);
                            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Item with illegal Enchantments are not allowed!`);
                            enchantmentPresenceMap.clear();
                            enchantmentDataMap.clear();
                            inventorySlotMap.clear();
                            unverifiedItemMap.clear(); // Clear this map since we won't get that far to prevent memory leaks
                            itemStackDataMap.clear();
                            rip(player, itemStackId, enchData);
                            break;
                        }
                        isPresent = true;
                    }
                }
                // Clear these populated maps if Salvage System is disabled to prevent memory leaks
                if (isPresent && !salvageBoolean) {
                    enchantmentPresenceMap.clear();
                    enchantmentDataMap.clear();
                    inventorySlotMap.clear();
                    itemStackDataMap.clear();
                }
            }

            // Salvage System
            if (salvageBoolean) {
                let salvagedList = false;
                // Iterate over the unverifiedItemMap
                for (const [slot, itemStackData] of unverifiedItemMap.get(player.id)) {
                    // Create a new name tag for the item
                    const newNameTag = StringTransformation.titleCase(itemStackData.typeId.replace("minecraft:", ""));
                    // Create a new ItemStack with the same type as the original item
                    const applyCustomProperties = new ItemStack(itemStackData.typeId);
                    // Get the original enchantment component from the item
                    const originalEnchantmentComponent = itemStackData.getComponent("minecraft:enchantments") as ItemEnchantsComponent;
                    // Get the original enchantment data from the component
                    const originalEnchantmentData = originalEnchantmentComponent.enchantments;
                    // Get the new enchantment component from the new ItemStack
                    const newEnchantmentComponent = applyCustomProperties.getComponent("minecraft:enchantments") as ItemEnchantsComponent;
                    // Get the new enchantment data from the new ItemStack component
                    const newEnchantmentData = newEnchantmentComponent.enchantments;

                    // Iterate over the original enchantment data
                    const iterator = originalEnchantmentData[Symbol.iterator]();
                    let iteratorResult = iterator.next();
                    while (!iteratorResult.done) {
                        // Get the enchantment from the iterator
                        const enchantment: Enchantment = iteratorResult.value;
                        // Check if the enchantment is legal
                        if (!illegalEnchantmentBoolean) {
                            // Get the enchantment from the original enchantment data
                            const getEnchantment = originalEnchantmentData.getEnchantment(enchantment.type);
                            // Check if the new ItemStack can have the enchantment added
                            const canAddEnchantBoolean = newEnchantmentData.canAddEnchantment(getEnchantment);
                            // If it can, add the enchantment to the new enchantment data
                            if (canAddEnchantBoolean) {
                                newEnchantmentData.addEnchantment(enchantment);
                                // Sets enchantment list to enchantment of new instance
                                newEnchantmentComponent.enchantments = newEnchantmentData;
                            }
                        } else {
                            // Add the enchantment to the new enchantment data
                            newEnchantmentData.addEnchantment(enchantment);
                            // Sets enchantment list to enchantment of new instance
                            newEnchantmentComponent.enchantments = newEnchantmentData;
                        }
                        // Get the next item from the iterator
                        iteratorResult = iterator.next();
                        salvagedList = true;
                    }

                    // Set the name tag and lore of the new ItemStack
                    applyCustomProperties.nameTag = newNameTag;
                    applyCustomProperties.setLore(itemStackData.getLore());
                    // Set the new ItemStack in the player's container in the specified slot
                    playerContainer.setItem(slot, applyCustomProperties);
                }
                // Clear these populated maps to prevent memory leaks
                if (salvagedList) {
                    unverifiedItemMap.clear();
                    enchantmentPresenceMap.clear();
                    enchantmentDataMap.clear();
                    inventorySlotMap.clear();
                    itemStackDataMap.clear();
                }
            }
        }
    }
}

function resetMaps() {
    enchantmentPresenceMap.clear();
    enchantmentDataMap.clear();
    inventorySlotMap.clear();
    itemStackDataMap.clear();
    unverifiedItemMap.clear();
    previousEmptySlotsCount.clear();
}

/**
 * We store the identifier in a variable
 * to cancel the execution of this scheduled run
 * if needed to do so.
 */
export function IllegalItemsA() {
    world.afterEvents.playerLeave.subscribe(onPlayerLogout);
    const illegalItemsAId = system.runInterval(() => {
        illegalitemsa(illegalItemsAId);
    }, 20);
}
