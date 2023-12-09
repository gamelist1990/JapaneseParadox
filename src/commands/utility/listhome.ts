import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import { getPrefix, sendMsgToPlayer } from "../../util.js";
import { WorldExtended } from "../../classes/WorldExtended/World.js";
import ConfigInterface from "../../interfaces/Config.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";

function listHomeHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f: リストホーム`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6使用§4]§f：リストホーム[オプション］`,
        `§4[§6オプション§4]§f: ヘルプ`,
        `§4[§6説明§4]§f：保存されたホームロケーションのリストを表示する。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}listhome`,
        `        §4- §6保存されたホームロケーションのリストを表示する§f`,
        `    ${prefix}listhome help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}

/**
 * @name listhome
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function listhome(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを検証する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? ./commands/utility/listhome.js:26)");
    }

    const player = message.sender;

    // カスタム接頭辞のチェック
    const prefix = getPrefix(player);

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // 助けを求められたか
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.listhome) {
        return listHomeHelp(player, prefix, configuration.customcommands.listhome);
    }

    // 安全のために座標をハッシュ化する
    const salt = world.getDynamicProperty("crypt");

    // ホームロケーションメッセージを格納する配列を作成する
    const homeMessages: string[] = [];

    const tags = player.getTags();
    const tagsLength = tags.length;
    let counter = 0;
    for (let i = 0; i < tagsLength; i++) {
        if (tags[i].startsWith("1337")) {
            // それを検証するためにデコードする
            tags[i] = (world as WorldExtended).decryptString(tags[i], salt as string);
            // 無効な場合はスキップする
            if (tags[i].startsWith("LocationHome:") === false) {
                continue;
            }
            // 文字列を配列に分割する
            const coordinatesArray = tags[i].split(" ");
            const coordArrayLength = coordinatesArray.length;
            let home: string;
            let homex: number;
            let homey: number;
            let homez: number;
            let dimension: string;
            counter = ++counter;
            for (let j = 0; j < coordArrayLength; j++) {
                // 配列から位置を取得する
                if (coordinatesArray[j].includes("LocationHome:")) {
                    home = coordinatesArray[j].replace("LocationHome:", "");
                }
                if (coordinatesArray[j].includes("X:")) {
                    homex = parseInt(coordinatesArray[j].replace("X:", ""));
                }
                if (coordinatesArray[j].includes("Y:")) {
                    homey = parseInt(coordinatesArray[j].replace("Y:", ""));
                }
                if (coordinatesArray[j].includes("Z:")) {
                    homez = parseInt(coordinatesArray[j].replace("Z:", ""));
                }
                if (coordinatesArray[j].includes("Dimension:")) {
                    dimension = coordinatesArray[j].replace("Dimension:", "");
                }
                // 各ホームロケーションを処理するループの内側
                if (!homex || !homey || !homez || !dimension) {
                    continue;
                } else {
                    if (counter === 1) {
                        homeMessages.push(`§f§4[§6Paradox§4]§f ホームのリスト：`);
                    }
                    homeMessages.push(` §o§6|§f §4[§f${home}§4]§f §6=>§f ${homex} ${homey} ${homez} §6<=§f §4[§f${dimension}§4]§f`);
                }
            }
        }
        continue;
    }
    if (homeMessages.length > 0) {
        // sendMsgToPlayerを使用して、すべてのホームロケーションメッセージを一度に送信する。
        sendMsgToPlayer(player, homeMessages);
    } else {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 保存されている場所がありません。`);
    }
    return;
}
