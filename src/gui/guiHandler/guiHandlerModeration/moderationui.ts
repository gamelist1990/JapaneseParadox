import { ActionFormData } from "@minecraft/server-ui";
import { Player } from "@minecraft/server";
import { banHandler } from "./results/ban";
import { unbanHandler } from "./results/unban";
import { rulesHandler } from "./results/rules";
import { chatui } from "./guiHandlerChat/chatui";
import { lockdownHandler } from "./results/lockdown";
import { punishHandler } from "./results/punish";
import { tpaHandler } from "./results/tpa";
import { kickHandler } from "./results/kick";
import { ecwipeHandler } from "./results/ecwipe";
import { freezeHandler } from "./results/freeze";
import { flyHandler } from "./results/fly";
import { vanishHandler } from "./results/vanish";
import { despawnHandler } from "./results/despawn";
import { autobanHandler } from "./results/autoban";
import { inventoryHandler } from "./results/inventoryui";

export function moderationui(player: Player) {
    //new window for Moderation
    const moderationui = new ActionFormData();
　　moderationui.title("§4管理者メニュー§4");
    moderationui.button("Ban", "textures/ui/hammer_l");
    moderationui.button("Ban解除", "textures/ui/check");
    moderationui.button("ルール", "textures/items/book_writable");
    moderationui.button("チャット", "textures/ui/newOffersIcon");
    moderationui.button("メンテナンス", "textures/ui/lock_color");
    moderationui.button("アイテム削除", "textures/ui/trash");
    moderationui.button("テレポート", "textures/blocks/portal_placeholder");
    moderationui.button("キック", "textures/items/gold_boots");
    moderationui.button("エンダーチェスト消去", "textures/blocks/ender_chest_front");
    moderationui.button("フリーズ", "textures/ui/frozen_effect");
    moderationui.button("飛行モード", "textures/ui/flyingascend");
    moderationui.button("透明", "textures/items/potion_bottle_invisibility");
    moderationui.button("モブをキル", "textures/ui/trash");
    moderationui.button("自動Ban", "textures/ui/hammer_l");
    moderationui.button("インベントリ", "textures/blocks/chest_front");
    moderationui
        .show(player)
        .then((ModUIresult) => {
            switch (ModUIresult.selection) {
                case 0:
                    banHandler(player);
                    break;
                case 1:
                    unbanHandler(player);
                    break;
                case 2:
                    rulesHandler(player);
                    break;
                case 3:
                    chatui(player);
                    break;
                case 4:
                    lockdownHandler(player);
                    break;
                case 5:
                    punishHandler(player);
                    break;
                case 6:
                    tpaHandler(player);
                    break;
                case 7:
                    kickHandler(player);
                    break;
                case 8:
                    ecwipeHandler(player);
                    break;
                case 9:
                    freezeHandler(player);
                    break;
                case 10:
                    flyHandler(player);
                    break;
                case 11:
                    vanishHandler(player);
                    break;
                case 12:
                    despawnHandler(player);
                    break;
                case 13:
                    autobanHandler(player);
                    break;
                case 14:
                    inventoryHandler(player);
                    break;
                default:
                    break;
            }
        })
        .catch((error) => {
            console.error("Paradox Unhandled Rejection: ", error);
            // Extract stack trace information
            if (error instanceof Error) {
                const stackLines = error.stack.split("\n");
                if (stackLines.length > 1) {
                    const sourceInfo = stackLines;
                    console.error("Error originated from:", sourceInfo[0]);
                }
            }
        });
}
