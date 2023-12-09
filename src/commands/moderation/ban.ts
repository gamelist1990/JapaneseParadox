import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsgToPlayer, sendMsg } from "../../util.js";
import ConfigInterface from "../../interfaces/Config.js";

function banHelp(player: Player, prefix: string, setting: boolean) {
    const commandStatus: string = setting ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";

    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f: 禁止`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Usage§4]§f: ${prefix}ban [options]`,
        `§4[§6オプション§4]§f: ユーザー名、理由、ヘルプ`,
        `§4[§6Description§4]§f：指定されたユーザを禁止し、オプションで理由を与える。`,
        `§4[§6オプション§4]§f：`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
        `    -p, --player`,
        `       §4[§7禁止するプレーヤーの名前§4]§f`,
        `    -r, --理由`,
        `       §4[§7 禁止された理由 §4]§f。`,
        `                                                                      `,
        `§4[§6例§4]§f：`,
        `    ${prefix}ban ${player.name}`,
        `        §4- §6理由を指定せずに${player.name}を禁止§f`,
        `    ${prefix}ban ${player.name} -r Hacker!`,
        `        §4- §6理由"Hacker!"で${player.name}を禁止§f`,
        `    ${prefix}ban -player ${player.name} --reason Caught exploiting!`,
        `        §4- §6理由"Caught exploiting!"で${player.name}を禁止§f`,
        `    ${prefix}ban -h`,
        `        §4- §6コマンドのヘルプを表示§f`,
    ]);
}

/**
 * @name ban
 * @param {ChatSendAfterEvent} message - Message object
 * @param {array} args - Additional arguments provided (optional).
 */
export function ban(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? ./commands/moderation/ban.js:31)");
    }

    const player = message.sender;

    // ユニークIDの取得
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fこのコマンドを使うには、Paradox-Oppedである必要がある。`);
    }

    // カスタム接頭辞のチェック
    const prefix = getPrefix(player);

    // キャッシュ
    const length = args.length;
    let playerName = "";
    let reason = "";
    let gotPlayerName = false;
    let gotReason = false;
    for (let i = 0; i < length; i++) {
        const additionalArg = args[i].toLowerCase();

        // 追加引数の処理
        switch (additionalArg) {
            case "-h":
            case "--help":
                // ヘルプメッセージを表示する
                return banHelp(player, prefix, configuration.customcommands.ban);
            case "-p":
            case "--player":
                playerName = getPlayerName(args);
                gotPlayerName = true;

                break;
            case "-r":
            case "--reason":
                reason = getReason(args);
                reason = reason.split(/-p|--player/)[0].trim();
                gotReason = true;
                break;
        }
    }
    if (gotPlayerName === true && gotReason === true) {
        reason = reason.replace(/,/g, " ");
        // リクエストされた選手を探す
        let member;
        const players = world.getPlayers();
        for (const pl of players) {
            if (pl.name.toLowerCase().includes(playerName.toLowerCase().replace(/"|\\|@/g, ""))) {
                member = pl;
                break;
            }
        }
        // 選手が存在するかチェックする
        if (!member) {
            return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f その選手は見つからなかった！`);
        }
        // 彼らが自分自身を追放しないようにする
        if (member === player) {
            return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 自分自身を禁止することはできない。`);
        }
        try {
            member.addTag("Reason:" + reason);
            member.addTag("By:" + player.name);
            member.addTag("isBanned");
        } catch (error) {
            return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f そのプレイヤーを禁止できませんでした！エラー：${error}`);
        }
        return sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§fが§7${member.name}§fを禁止しました。理由：§7${reason}§f`);
    }
}

//正しい値を得るための関数
function getPlayerName(args: string[]) {
    // pまたは--playerの後に二重引用符があるかチェックする。
    if (/(--player|-p),"([^"]*)"/.test(args.toString())) {
        // 正規表現を使用して、--playerまたは-pの後に二重引用符で囲んだ値をマッチさせる。
        const match = /(--player|-p),"([^"]*)"/.exec(args.toString());
        // マッチするかどうかをチェックし、キャプチャされたグループを取得する。
        const playerName = match ? match[2].replace(/,/g, "") : null;
        return playerName;
    } else if (/(--player|-p),([^,]+)/.test(args.toString())) {
        // 二重引用符は使用せず、引用符なしの正規表現を使用する。
        const match = /(--player|-p),([^,]+)/.exec(args.toString());
        // マッチするかどうかをチェックし、キャプチャされたグループを取得する。
        const playerName = match ? match[2] : null;
        return playerName;
    } else {
        // playerまたは-p,"... "がない場合の処理：選手名を抽出し、-rがある場合はその部分を削除する。
        const match = /(--player|-p),([^,]+)/.exec(args.toString());
        let playerName = match ? match[2] : null;
        const reasonIndex = args.indexOf("-r");
        if (reasonIndex !== -1) {
            playerName = playerName.split("-r")[0];
        }
        return playerName;
    }
}
function getReason(args: string[]) {
    // reasonまたは-rの後に二重引用符があるかチェックする。
    if (/(-r|--reason),"([^"]*)"/.test(args.toString())) {
        // 正規表現を使用して、--reason または -r の後に二重引用符で囲んだ値をマッチさせる。
        const match = /(-r|--reason),"([^"]*)"/.exec(args.toString());
        // マッチするかどうかをチェックし、キャプチャされたグループを取得する。
        const reason = match ? match[2] : null;
        return reason;
    } else {
        // 二重引用符は使用せず、引用符なしの正規表現を使用する。
        const match = /(--reason|-r)\s*"?([^"]*)"?/.exec(args.toString());
        // マッチするかどうかをチェックし、キャプチャされたグループを取得する。
        const reason = match ? match[2] : null;
        return reason;
    }
}
