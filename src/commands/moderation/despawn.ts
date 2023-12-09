import { ChatSendAfterEvent, EntityItemComponent, EntityQueryOptions, Player, world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsgToPlayer } from "../../util.js";
import ConfigInterface from "../../interfaces/Config.js";

function despawnHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `§6コマンド§4]§f: デスポーン`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6使用§4]§f: デスポーン [オプション].`,
        `§4[§6オプション§4]§f: エンティティ、すべて、ヘルプ`,
        `§4[§6解説§4]§f．すべての、あるいは指定された実体が存在する場合、それらを消滅させる。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}despawn all`,
        `        §4- §6すべてのエンティティをデスポーンする§f`,
        `    ${prefix}despawn iron_golem`,
        `        §4- §6すべての「iron_golem」エンティティをデスポーンする§f`,
        `    ${prefix}despawn creeper`,
        `        §4- §6すべての「クリーパー」エンティティをデスポーンする§f`,
        `    ${prefix}despawn help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}

/**
 * @name despawn
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function despawn(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? ./commands/moderation/despawn.js:31)");
    }

    const player = message.sender;

    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fこのコマンドを使うには、Paradox-Oppedである必要がある。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // カスタム接頭辞のチェック
    const prefix = getPrefix(player);

    // 助けを求められたか
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.despawn) {
        return despawnHelp(player, prefix, configuration.customcommands.despawn);
    }

    // 反論はあるか
    if (!args.length) {
        return despawnHelp(player, prefix, configuration.customcommands.despawn);
    }

    // エンティティを見つけるか、要求があればすべてをデスポーンしてみる。
    const filter: EntityQueryOptions = {
        excludeTypes: ["player"],
    };
    const filteredEntities = world.getDimension("overworld").getEntities(filter);
    // 特定団体
    if (args[0] !== "all" && args.length > 0) {
        let counter = 0;
        let requestedEntity: string = "";
        for (const entity of filteredEntities) {
            const filteredEntity = entity.typeId.replace("minecraft:", "");
            requestedEntity = args[0].replace("minecraft:", "");
            // エンティティが指定された場合は、ここでそれを処理する。
            if (filteredEntity === requestedEntity || filteredEntity === args[0]) {
                counter = ++counter;
                // このエンティティをデスポーンする
                entity.remove();
                continue;
                // すべてのエンティティが指定された場合、ここでこれを処理する。
            }
        }
        if (counter > 0) {
            return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f デスポーン:\n\n §o§6|§f §4[§f${requestedEntity}§4]§f §6数量: §4x${counter}§f`);
        } else {
            return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f デスポーンする実体が見つからない！`);
        }
    }
    // すべての団体
    if (args[0] === "all") {
        const entityCount: { [key: string]: number } = {};
        for (const entity of filteredEntities) {
            let filteredEntity = entity.typeId.replace("minecraft:", "");
            if (filteredEntity === "item") {
                const itemContainer = entity.getComponent("item") as EntityItemComponent;
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
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f デスポーンした：`);
            return sendMsgToPlayer(player, entityMessage);
        } else {
            return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f デスポーンする実体が見つからない！`);
        }
    }
}
