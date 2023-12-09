import { EntityItemComponent, EntityQueryOptions, Player, world } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
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
export function uiDESPAWNER(despawnerResult: ModalFormResponse, player: Player) {
    handleUIDespawner(despawnerResult, player).catch((error) => {
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
}

async function handleUIDespawner(despawnerResult: ModalFormResponse, player: Player) {
    if (!despawnerResult || despawnerResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [entityValue, DespawnAllToggle] = despawnerResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fあなたはパラドックス・オップされる必要がある。`);
    }

    // エンティティを見つけるか、要求があればすべてをデスポーンしてみる。
    const filter: EntityQueryOptions = {
        excludeTypes: ["player"],
    };
    const filteredEntities = world.getDimension("overworld").getEntities(filter);
    if (DespawnAllToggle === false) {
        // 特定団体
        let counter = 0;
        let requestedEntity: string = "";
        for (const entity of filteredEntities) {
            const filteredEntity = entity.typeId.replace("minecraft:", "");
            requestedEntity = (entityValue as string).replace("minecraft:", "");
            // エンティティが指定された場合は、ここでそれを処理する。
            if (filteredEntity === requestedEntity || filteredEntity === entityValue) {
                counter = ++counter;
                // このエンティティをデスポーンする
                entity.remove();
                continue;
                // すべてのエンティティが指定された場合、ここでこれを処理する。
            }
        }
        if (counter > 0) {
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Despawned:\n\n §o§6|§f §4[§f${requestedEntity}§4]§f §6Amount: §4x${counter}§f`);
        } else {
            sendMsgToPlayer(player, `§f§4[§6パラドックス§4]§f デスポーンする実体が見つからない！`);
        }
    }
    if (DespawnAllToggle === true) {
        const entityCount: { [key: string]: number } = {};
        for (const entity of filteredEntities) {
            let filteredEntity = entity.typeId.replace("minecraft:", "");
            if (filteredEntity === "item") {
                const itemContainer = entity.getComponent("item") as unknown as EntityItemComponent;
                const itemName = itemContainer.itemStack;
                if (itemName !== undefined) {
                    filteredEntity = itemName.typeId.replace("minecraft:", "");
                }
            }
            if (!entityCount[filteredEntity]) {
                entityCount[filteredEntity] = 1;
            } else {
                entityCount[filteredEntity]++;
            }
            // このエンティティをデスポーンする
            entity.remove();
        }
        let totalCounter = 0;
        let entityMessage = "";
        for (const entity in entityCount) {
            if (entityCount.hasOwnProperty(entity)) {
                const count = entityCount[entity];
                if (count > 0) {
                    entityMessage += ` §o§6|§f §4[§f${entity}§4]§f §6Amount: §4x${count}§f\n`;
                    totalCounter += count;
                }
            }
        }
        if (totalCounter > 0) {
            sendMsgToPlayer(player, `§f§4[§6パラドックス§4]§f デスポーンした：`);
            sendMsgToPlayer(player, entityMessage);
        } else {
            sendMsgToPlayer(player, `§f§4[§6パラドックス§4]§f デスポーンする実体が見つからない！`);
        }
    }
    return paradoxui;
}
