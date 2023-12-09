import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { WorldExtended } from "../../classes/WorldExtended/World.js";
import ConfigInterface from "../../interfaces/Config.js";

function opHelp(player: Player, prefix: string, configuration: ConfigInterface) {
    let commandStatus: string;
    if (!configuration.customcommands.op) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }

    const passwordDescription = configuration.encryption.password ? `§4- §6パスワードを使ってParadox-Op§fを獲得する` : `§4-§6自分にParadoxを捧げよ-Op§f`;
    const commandUsage = configuration.encryption.password ? `${prefix}op <password>` : `${prefix}op`;

    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f: op`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Usage§4]§f: ${prefix}op [optional]`,
        `§4[§6オプション§4]§f: ユーザー名、ヘルプ`,
        `§4[§6説明§4]§f：Paradox AntiCheat 機能の使用を許可する。`,
        `§4[§6例§4]§f：`,
        `    ${commandUsage}`,
        `        ${passwordDescription}`,
        `    ${prefix}op help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
        `    ${prefix}op <player>`,
        `        §4- §6他のプレイヤーにParadox・オプを与える§f`,
    ]);
}

/**
 * @name op
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function op(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを検証する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/moderation/op.js:30)");
    }

    const operator = message.sender;

    const prefix = getPrefix(operator);

    const operatorHash = operator.getDynamicProperty("hash");
    const operatorSalt = operator.getDynamicProperty("salt");

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (!operatorHash || !operatorSalt || (operatorHash !== (world as WorldExtended).hashWithSalt(operatorSalt as string, configuration.encryption.password || operator.id) && (world as WorldExtended).isValidUUID(operatorSalt as string))) {
        if (!configuration.encryption.password) {
            if (!operator.isOp()) {
                return sendMsgToPlayer(operator, `§f§4[§6Paradox§4]§fこのコマンドを使うにはオペレータである必要がある。`);
            }
        }
    }

    // argsがNULL、空、またはヘルプかどうかをチェックする。
    if (args[0]?.toLowerCase() === "help") {
        return opHelp(operator, prefix, configuration);
    }

    if (args.length >= 1 && operatorHash === (world as WorldExtended).hashWithSalt(operatorSalt as string, configuration.encryption.password || operator.id)) {
        // オペレーターが「Paradox・オプ」を他のプレーヤーに与えたい
        const targetPlayerName = args.join(" "); // Combine all arguments into a single string
        // 要求された選手を見つけよう
        let targetPlayer: Player;
        if (args.length) {
            const players = world.getPlayers();
            for (const pl of players) {
                if (pl.name.toLowerCase().includes(targetPlayerName.toLowerCase().replace(/"|\\|@/g, ""))) {
                    targetPlayer = pl;
                    break;
                }
            }
        }

        if (targetPlayer) {
            const targetHash = targetPlayer.getDynamicProperty("hash");

            if (targetHash === undefined) {
                const targetSalt = (world as WorldExtended).generateRandomUUID();
                targetPlayer.setDynamicProperty("salt", targetSalt);

                // オペレーターのIDまたは暗号化パスワードのいずれかをキーとして使用する。
                const targetKey = configuration.encryption.password ? configuration.encryption.password : targetPlayer.id;

                // ハッシュを生成する
                const newHash = (world as WorldExtended).hashWithSalt(targetSalt, targetKey);

                targetPlayer.setDynamicProperty("hash", newHash);

                dynamicPropertyRegistry.setProperty(targetPlayer, targetPlayer.id, targetPlayer.name);

                sendMsgToPlayer(operator, `§f§4[§6Paradox§4]§f You have granted Paradox-Op to §7${targetPlayer.name}§f.`);
                sendMsgToPlayer(targetPlayer, `§f§4[§6Paradox§4]§f あなたは今、操作している！`);
                sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${targetPlayer.name}§f is now Paradox-Opped.`);
                targetPlayer.addTag("paradoxOpped");
            } else {
                sendMsgToPlayer(operator, `§f§4[§6Paradox§4]§f §7${targetPlayer.name}§f is already Paradox-Opped.`);
            }
        } else {
            sendMsgToPlayer(operator, `§f§4[§6Paradox§4]§f Could not find player §7${targetPlayerName}§f.`);
        }
    } else if (args.length === 0 && !configuration.encryption.password) {
        // オペレータが自分のパスワードを変更したい
        const targetSalt = (world as WorldExtended).generateRandomUUID();

        // オペレーターのIDまたは暗号化パスワードのいずれかをキーとして使用する。
        const key = configuration.encryption.password ? configuration.encryption.password : operator.id;

        // ハッシュを生成する
        const newHash = (world as WorldExtended).hashWithSalt(targetSalt, key);

        operator.setDynamicProperty("hash", newHash);
        operator.setDynamicProperty("salt", targetSalt);
        operator.addTag("paradoxOpped");

        sendMsgToPlayer(operator, `§f§4[§6Paradox§4]§fあなたは今、Paradoxに縛られている！`);

        dynamicPropertyRegistry.setProperty(operator, operator.id, operator.name);

        return;
    } else if (args.length === 1 && configuration.encryption.password) {
        // パスワードを使用して Paradox-Op を取得できるようにする。
        if (configuration.encryption.password === args[0]) {
            const targetSalt = (world as WorldExtended).generateRandomUUID();

            // 提供されたパスワードを使ってハッシュを生成する
            const newHash = (world as WorldExtended).hashWithSalt(targetSalt, args[0]);

            operator.setDynamicProperty("hash", newHash);
            operator.setDynamicProperty("salt", targetSalt);
            operator.addTag("paradoxOpped");

            sendMsgToPlayer(operator, `§f§4[§6Paradox§4]§fあなたは今、パスワードを使ってParadox-Oppedされています。`);
            dynamicPropertyRegistry.setProperty(operator, operator.id, operator.name);
        } else {
            // パスワードの誤り
            sendMsgToPlayer(operator, `§f§4[§6Paradox§4]§fパスワードが間違っています。このコマンドを使用するには Operator である必要があります。`);
        }
    } else {
        return opHelp(operator, prefix, configuration);
    }
}
