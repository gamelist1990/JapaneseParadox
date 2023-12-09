import { Player, world } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiCHATRANKS(notifyResult: ModalFormResponse, onlineList: string[], predefinedrank: string[], player: Player) {
    if (!notifyResult || notifyResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [value, predefinedrankvalue, customrank, ChatRanksToggle] = notifyResult.formValues;
    let member: Player = undefined;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(onlineList[value as number].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }

    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f通知をBooleanにするには、Paradox-Oppedにする必要があります。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    const chatRanksBoolean = configuration.modules.chatranks.enabled;

    if (!customrank) {
        try {
            const memberscurrentags = member.getTags();
            let custom: string;
            memberscurrentags.forEach((t) => {
                if (t.startsWith("Rank:")) {
                    custom = t;
                }
            });
            if (member.hasTag(custom)) {
                member.removeTag(custom);
            }
        } catch (error) {
            //プレーヤーがタグを持っていない場合にスローされます。
            //sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 何かおかしい！ エラー: ${error}`)；
        }
        member.addTag("Rank:" + predefinedrank[predefinedrankvalue as number]);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f が §7${member.name}のランクを更新しました§f `);
        return paradoxui(player);
    }
    if (customrank) {
        try {
            const memberscurrentags = member.getTags();
            let custom: string;
            memberscurrentags.forEach((t) => {
                if (t.startsWith("Rank:")) {
                    custom = t;
                }
            });
            if (member.hasTag(custom)) {
                member.removeTag(custom);
            }
        } catch (error) {
            // これは、プレーヤーにマッチするタグがない場合にスローされる。
            //sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 何かおかしい！ エラー: ${error}`)；
        }
        member.addTag("Rank:" + customrank);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has updated §7${member.name}'s§f Rank.`);
        if (ChatRanksToggle === true && chatRanksBoolean === false) {
            // 許可する
            configuration.modules.chatranks.enabled = true;
            dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
            sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6ChatRanks§f!`);
        }
        if (ChatRanksToggle === false && chatRanksBoolean === true) {
            // 拒否する
            configuration.modules.chatranks.enabled = false;
            dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
            sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4ChatRanks§f!`);
        }
        return paradoxui(player);
    }
    return paradoxui;
}
