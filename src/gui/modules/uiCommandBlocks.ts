import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { ScoreManager } from "../../classes/ScoreManager.js";

/**
 * Handles the result of a modal form used for toggling command blocks mode.
 *
 * @name uiCOMMANDBLOCKS
 * @param {ModalFormResponse} commandblocksResult - The result of the command blocks mode toggle modal form.
 * @param {Player} player - The player who triggered the command blocks mode toggle modal form.
 */
export function uiCOMMANDBLOCKS(commandblocksResult: ModalFormResponse, player: Player) {
    handleUICommandBlocks(commandblocksResult, player).catch((error) => {
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

async function handleUICommandBlocks(commandblocksResult: ModalFormResponse, player: Player) {
    if (!commandblocksResult || commandblocksResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [CommandBlockOverrideToggle, RemoveCommandBlocksToggle] = commandblocksResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ダイナミック・プロパティ・ブール値の取得
    //現在のスコアを得る
    const cmdsscore = ScoreManager.getScore("cmds", player);
    const commandblocksscore = ScoreManager.getScore("commandblocks", player);
    let removecmdblocksBoolean;
    Boolean;
    let cmdoBoolean: boolean;
    if (cmdsscore <= 0) {
        cmdoBoolean = false;
    }
    if (cmdsscore >= 1) {
        cmdoBoolean = true;
    }
    if (commandblocksscore <= 0) {
        removecmdblocksBoolean = false;
    }
    if (commandblocksscore >= 1) {
        removecmdblocksBoolean = true;
    }

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fコマンドブロックを設定するには、Paradox・オップである必要があります。`);
    }
    if (CommandBlockOverrideToggle === true && cmdoBoolean === false) {
        // 許可する
        player.runCommand(`scoreboard players set paradox:config cmds 1`);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has set CommandBlocksEnabled as §6enabled§f!`);
    }
    if (CommandBlockOverrideToggle === false && cmdoBoolean === true) {
        // 拒否する
        player.runCommand(`scoreboard players set paradox:config cmds 2`);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has set CommandBlocksEnabled as §4disabled§f!`);
    }
    player.runCommand(`scoreboard players operation @a cmds = paradox:config cmds`);
    if (RemoveCommandBlocksToggle === true && removecmdblocksBoolean === false) {
        // 許可する
        player.runCommand(`scoreboard players set paradox:config commandblocks 1`);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6Anti Command Blocks§f!`);
    }
    if (RemoveCommandBlocksToggle === false && removecmdblocksBoolean === true) {
        // 拒否する
        player.runCommand(`scoreboard players set paradox:config commandblocks 0`);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4Anti Command Blocks§f!`);
    }
    player.runCommand(`scoreboard players operation @a commandblocks = paradox:config commandblocks`);
    //完了したら、プレイヤーにメインUIを表示する。
    return paradoxui(player);
}
