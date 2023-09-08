import { world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
/**
 * Handles the result of a despawner modal form.
 *
 * @name uiDESPAWNER
 * @param {ModalFormResponse} despawnerResult - The result of the despawner modal form.
 * @param {Player} player - The player who triggered the modal form.
 */
export function uiDESPAWNER(despawnerResult, player) {
    handleUIDespawner(despawnerResult, player).catch((error) => {
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
async function handleUIDespawner(despawnerResult, player) {
    if (!despawnerResult || despawnerResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [entityValue, DespawnAllToggle] = despawnerResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);
    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者しか実行できません.`);
    }
    // try to find the entity or despawn them all if requested
    const filter = {
        excludeTypes: ["player"],
    };
    const filteredEntities = world.getDimension("overworld").getEntities(filter);
    if (DespawnAllToggle === false) {
        // Specified entity
        let counter = 0;
        let requestedEntity = "";
        for (const entity of filteredEntities) {
            const filteredEntity = entity.typeId.replace("minecraft:", "");
            requestedEntity = entityValue.replace("minecraft:", "");
            // If an entity was specified then handle it here
            if (filteredEntity === requestedEntity || filteredEntity === entityValue) {
                counter = ++counter;
                // Despawn this entity
                entity.triggerEvent("paradox:kick");
                continue;
                // If all entities were specified then handle this here
            }
        }
        if (counter > 0) {
            sendMsgToPlayer(player, ` §o§6|§f §4[§f${requestedEntity}§4]§f §6匹: §4x${counter}§f`);
        }
        else {
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 指定したモブが見つかりません!`);
        }
    }
    if (DespawnAllToggle === true) {
        const entityCount = {};
        for (const entity of filteredEntities) {
            let filteredEntity = entity.typeId.replace("minecraft:", "");
            if (filteredEntity === "item") {
                const itemContainer = entity.getComponent("item");
                const itemName = itemContainer.itemStack;
                if (itemName !== undefined) {
                    filteredEntity = itemName.typeId.replace("minecraft:", "");
                }
            }
            if (!entityCount[filteredEntity]) {
                entityCount[filteredEntity] = 1;
            }
            else {
                entityCount[filteredEntity]++;
            }
            // Despawn this entity
            entity.triggerEvent("paradox:kick");
        }
        let totalCounter = 0;
        let entityMessage = "";
        for (const entity in entityCount) {
            if (entityCount.hasOwnProperty(entity)) {
                const count = entityCount[entity];
                if (count > 0) {
                    entityMessage += ` §o§6|§f §4[§f${entity}§4]§f §6匹: §4x${count}§f\n`;
                    totalCounter += count;
                }
            }
        }
        if (totalCounter > 0) {
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f kill:`);
            sendMsgToPlayer(player, entityMessage);
        }
        else {
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f モブが見つかりません`);
        }
    }
    return paradoxui;
}
