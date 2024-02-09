import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsgToPlayer, sendMsg } from "../../util.js";
import ConfigInterface from "../../interfaces/Config.js";

function banHelp(player: Player, prefix: string, setting: boolean) {
    const commandStatus: string = setting ? "§6[§aENABLED§6]§f" : "§6[§4DISABLED§6]§f";

    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f: ban`,
        `§4[§6ステータス§4]§f: ${commandStatus}`,
        `§4[§6使用法§4]§f: ${prefix}ban [オプション]`,
        `§4[§6オプション§4]§f: ユーザー名, 理由, ヘルプ`,
        `§4[§6説明§4]§f: 指定したユーザーをBANし、必要に応じて理由を付けます。`,
        `§4[§6オプション§4]§f:`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示§4]§f`,
        `    -p, --player`,
        `       §4[§7BANするプレイヤーの名前.§4]§f`,
        `    -r, --reason`,
        `       §4[§7プレイヤーがBANされた理由（オプション）。§4]§f`,
        `                                                                      `,
        `§4[§6例§4]§f:`,
        `    ${prefix}ban ${player.name}`,
        `        §4- §6理由を指定せずに${player.name}をBAN§f`,
        `    ${prefix}ban ${player.name} -r Hacker!`,
        `        §4- §6理由"Hacker!"で${player.name}をBAN§f`,
        `    ${prefix}ban -player ${player.name} --reason Caught exploiting!`,
        `        §4- §6理由"Caught exploiting!"で${player.name}をBAN§f`,
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
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? ./commands/moderation/ban.js:31)");
    }

    const player = message.sender;

    // Get unique ID
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to use this command.`);
    }

    // Check for custom prefix
    const prefix = getPrefix(player);

    // Cache
    const length = args.length;
    let playerName = "";
    let reason = "";
    let gotPlayerName = false;
    let gotReason = false;
    for (let i = 0; i < length; i++) {
        const additionalArg = args[i].toLowerCase();

        // Handle additional arguments
        switch (additionalArg) {
            case "-h":
            case "--help":
                // Display help message
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
        // try to find the player requested
        let member;
        const players = world.getPlayers();
        for (const pl of players) {
            if (pl.name.toLowerCase().includes(playerName.toLowerCase().replace(/"|\\|@/g, ""))) {
                member = pl;
                break;
            }
        }
        // Check if player exists
        if (!member) {
            return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f そのプレーヤーが見つかりませんでした!`);
        }
        // make sure they dont ban themselves
        if (member === player) {
            return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f あなたは自分自身を禁止することはできません.`);
        }
        try {
            member.addTag("Reason:" + reason);
            member.addTag("By:" + player.name);
            member.addTag("isBanned");
        } catch (error) {
            return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 私はそのプレイヤーを禁止することができませんでした!エラー: ${error}`);
        }
        return sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f は §7${member.name}§f を禁止しました。理由: §7${reason}§f`);
    }
}

//Functions to get values right
function getPlayerName(args: string[]) {
    // Check if double quotes are present after -p or --player
    if (/(--player|-p),"([^"]*)"/.test(args.toString())) {
        // Use a regular expression to match the value after --player or -p with double quotes
        const match = /(--player|-p),"([^"]*)"/.exec(args.toString());
        // Check if a match is found and get the captured group
        const playerName = match ? match[2].replace(/,/g, "") : null;
        return playerName;
    } else if (/(--player|-p),([^,]+)/.test(args.toString())) {
        // No double quotes, use a regular expression without quotes
        const match = /(--player|-p),([^,]+)/.exec(args.toString());
        // Check if a match is found and get the captured group
        const playerName = match ? match[2] : null;
        return playerName;
    } else {
        // Handle cases without --player or -p,"...": extract player name and remove the part after -r if present
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
    // Check if double quotes are present after --reason or -r
    if (/(-r|--reason),"([^"]*)"/.test(args.toString())) {
        // Use a regular expression to match the value after --reason or -r with double quotes
        const match = /(-r|--reason),"([^"]*)"/.exec(args.toString());
        // Check if a match is found and get the captured group
        const reason = match ? match[2] : null;
        return reason;
    } else {
        // No double quotes, use a regular expression without quotes
        const match = /(--reason|-r)\s*"?([^"]*)"?/.exec(args.toString());
        // Check if a match is found and get the captured group
        const reason = match ? match[2] : null;
        return reason;
    }
}
