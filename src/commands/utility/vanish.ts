import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { MinecraftEffectTypes } from "../../node_modules/@minecraft/vanilla-data/lib/index.js";
import ConfigInterface from "../../interfaces/Config.js";

function vanishHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6 コマンド§4]§f: vanish`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6使用§4]§f: vanish [オプション].`,
        `§4[§6オプション§4]§f: ヘルプ`,
        `§4[§6解説§4]§f：オンラインプレイヤーを監視するためにプレイヤーを透明化する。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}vanish`,
        `        §4- §6他のプレイヤーから見えなくなる§f`,
        `    ${prefix}vanish help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}

/**
 * @name vanish
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function vanish(message: ChatSendAfterEvent, args: string[]) {
    handleVanish(message, args).catch((error) => {
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

async function handleVanish(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./utility/vanish.js:26)");
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
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.vanish) {
        return vanishHelp(player, prefix, configuration.customcommands.vanish);
    }

    const vanishBoolean = player.hasTag("vanish");

    if (vanishBoolean) {
        player.removeTag("vanish");
        player.triggerEvent("unvanish");
        // 効果を取り除く
        const effectsToRemove = [MinecraftEffectTypes.Invisibility, MinecraftEffectTypes.NightVision];

        for (const effectType of effectsToRemove) {
            player.removeEffect(effectType);
        }
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fもはやあなたは消えていない。`);
        sendMsg(`a[tag=paradoxOpped]`, `§f§4[§6Paradox§4]§f §7${player.name}§f is no longer in vanish.`);
    } else {
        player.addTag("vanish");
        player.triggerEvent("vanish");
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fあなたは今、消滅した！`);
        sendMsg(`a[tag=paradoxOpped]`, `§f§4[§6Paradox§4]§f §7${player.name}§f is now vanished!`);
    }
}
