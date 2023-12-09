import { Player, world } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { WorldExtended } from "../../classes/WorldExtended/World.js";
import ConfigInterface from "../../interfaces/Config.js";

//Visual1インパクトが提供する機能
export function uiDEOP(opResult: ModalFormResponse, onlineList: string[], player: Player) {
    if (!opResult || opResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [value] = opResult.formValues;
    // 選手オブジェクトが必要
    let member: Player = undefined;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(onlineList[value as number].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }
    // メンバーからのハッシュ/ソルトのチェックとパスワードの検証
    const memberHash = member.getDynamicProperty("hash");
    const memberSalt = member.getDynamicProperty("salt");

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // オペレーターのIDまたは暗号化パスワードのいずれかをキーとして使用する。
    const key = configuration.encryption.password ? configuration.encryption.password : member.id;

    // ハッシュを生成する
    const memberEncode: string = (world as WorldExtended).hashWithSalt(memberSalt as string, key);

    if (memberEncode && memberHash !== undefined && memberHash === memberEncode) {
        member.setDynamicProperty("hash");
        member.setDynamicProperty("salt");
        dynamicPropertyRegistry.deleteProperty(member, member.id);
        member.removeTag("paradoxOpped");
        if (player.name !== member.name) {
            sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${member.name}§f Op権限が剝奪されました`);
        }
        sendMsgToPlayer(member, `§f§4[§6Paradox§4]§fあなたのOPステータスは取り消されました！`);
        return paradoxui(player);
    }
    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f §7${member.name}§f Op権限がなかった.`);
    return paradoxui(player);
}
