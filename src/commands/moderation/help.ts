import { ChatSendAfterEvent } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsgToPlayer } from "../../util.js";
import { nonstaffhelp } from "./nonstaffhelp.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * @name help
 * @param {ChatSendAfterEvent} message - Message object
 */
export function help(message: ChatSendAfterEvent) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/moderation/help.js:8)");
    }

    const player = message.sender;

    // Check for custom prefix
    const prefix = getPrefix(player);

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    // if not then show them non staff commands
    if (uniqueId !== player.name) {
        return nonstaffhelp(message);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // Make sure the help command wasn't 無効
    if (configuration.customcommands.help === false) {
        configuration.customcommands.help = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
    }

    const text無効 = "コマンドは§4無効化§fされています。";

    return sendMsgToPlayer(player, [
        `§l§o§6[§4Paradox AntiCheat コマンドヘルプ§6]§r§o`,
        ` `,
        `§l§o§6[§4モデレーションコマンド§6]§r§o`,
        `§6${prefix}help§f - このヘルプページを表示します。`,
        `§6${prefix}ban§f - ${configuration.customcommands.ban ? `指定したユーザーを禁止します。` : text無効}`,
        `§6${prefix}autoban§f - ${configuration.customcommands.autoban ? `違反が50以上のプレイヤーを自動的に禁止します。` : text無効}`,
        `§6${prefix}unban§f - ${configuration.customcommands.unban ? `禁止されている指定プレイヤーの参加を許可します（グローバル禁止は含まれません）。` : text無効}`,
        `§6${prefix}kick§f - ${configuration.customcommands.kick ? `指定したユーザーをキックします。` : text無効}`,
        `§6${prefix}mute§f - ${configuration.customcommands.mute ? `指定したユーザーをミュートします。` : text無効}`,
        `§6${prefix}unmute§f - ${configuration.customcommands.unmute ? `指定したユーザーのミュートを解除します。` : text無効}`,
        `§6${prefix}notify§f - ${configuration.customcommands.notify ? `チート通知を切り替えます。` : text無効}`,
        `§6${prefix}credits§f - クレジットを表示します、それだけです。`,
        `§6${prefix}op§f - ${configuration.customcommands.op ? `プレイヤーをParadox AntiCheat機能のOpにします。` : text無効}`,
        `§6${prefix}deop§f - ${configuration.customcommands.deop ? `プレイヤーのParadox AntiCheat機能のOpを取り消します。` : text無効}`,
        `§6${prefix}modules§f - ${configuration.customcommands.modules ? `Booleanまたは無効のモジュールをすべて表示します。` : text無効}`,
        `§6${prefix}prefix§f - コマンドのプレフィックスを変更します。最大は二文字です。`,
        `§6${prefix}prefix reset§f - コマンドのプレフィックスをリセットします。`,
        `§6${prefix}lockdown§f - ${configuration.customcommands.lockdown ? `メンテナンスのため、スタッフを除くプレイヤーをサーバーからキックします。` : text無効}`,
        `§6${prefix}punish§f - ${configuration.customcommands.punish ? `プレイヤーのインベントリとエンダーチェストからすべてのアイテムを削除します。` : text無効}`,
        `§6${prefix}tpa§f - ${configuration.customcommands.tpa ? `プレイヤーにテレポートするか、その逆を行います。` : text無効}`,
        `§6${prefix}despawn§f - ${configuration.customcommands.despawn ? `存在する場合、すべてまたは指定したエンティティをデスポーンします。` : text無効}`,
        ` `,

        `§l§o§6[§4オプション機能§6]§r§o`,
        `§6${prefix}allowgma§f - ${configuration.customcommands.allowgma ? `ゲームモード2（アドベンチャー）の使用を切り替えます。` : text無効}`,
        `§6${prefix}allowgmc§f - ${configuration.customcommands.allowgmc ? `ゲームモード1（クリエイティブ）の使用を切り替えます。` : text無効}`,
        `§6${prefix}allowgms§f - ${configuration.customcommands.allowgms ? `ゲームモード0（サバイバル）の使用を切り替えます。` : text無効}`,
        `§6${prefix}removecb§f - ${configuration.customcommands.removecommandblocks ? `コマンドブロックの反対を切り替えます（Boolean時にすべてクリアします）。` : text無効}`,
        `§6${prefix}bedrockvalidate§f - ${configuration.customcommands.bedrockvalidate ? `ベッドロックの検証を確認します。` : text無効}`,
        `§6${prefix}overridecbe§f - ${configuration.customcommands.overidecommandblocksenabled ? `commandblocksBooleanゲームルールを常にBooleanまたは無効にします。` : text無効}`,
        `§6${prefix}worldborder <value>§f - ${configuration.customcommands.worldborder ? `Overworld、Nether、Endのワールドボーダーを設定します。` : text無効}`,
        `§6${prefix}autoclicker§f - ${configuration.customcommands.autoclicker ? `Anti Autoclickerを切り替えます。` : text無効}`,
        `§6${prefix}jesusa§f - ${configuration.customcommands.jesusa ? `プレイヤーが水や溶岩の上を歩いているかどうかを確認します。` : text無効}`,
        `§6${prefix}enchantedarmor§f - ${configuration.customcommands.enchantedarmor ? `すべてのプレイヤーのAnti Enchanted Armorを切り替えます。` : text無効}`,
        `§6${prefix}antikillaura§f - ${configuration.customcommands.antikillaura ? `90度の角度外での攻撃を確認します。` : text無効}`,
        `§6${prefix}antikb§f - ${configuration.customcommands.antikb ? `すべてのプレイヤーのAnti Knockbackを切り替えます。` : text無効}`,
        `§6${prefix}badpackets1§f - ${configuration.customcommands.badpackets1 ? `各ブロードキャストのメッセージ長を確認します。` : text無効}`,
        `§6${prefix}spammera§f - ${configuration.customcommands.spammera ? `メッセージが移動中に送信されたかどうかを確認します。` : text無効}`,
        `§6${prefix}spammerb§f - ${configuration.customcommands.spammerb ? `メッセージが振り回されたときに送信されたかどうかを確認します。` : text無効}`,
        `§6${prefix}spammerc§f - ${configuration.customcommands.spammerc ? `メッセージがアイテムを使用中に送信されたかどうかを確認します。` : text無効}`,
        `§6${prefix}antispam§f - ${configuration.customcommands.antispam ? `2秒のクールダウンでチャットのスパムを確認します。` : text無効}`,
        `§6${prefix}namespoofa§f - ${configuration.customcommands.namespoofa ? `プレイヤーの名前が文字制限を超えているかどうかを確認します。` : text無効}`,
        `§6${prefix}namespoofb§f - ${configuration.customcommands.namespoofb ? `プレイヤーの名前に非ASCII文字があるかどうかを確認します。` : text無効}`,
        `§6${prefix}reacha§f - ${configuration.customcommands.reacha ? `プレイヤーがリーチを超えてブロックを配置するかどうかを確認します。` : text無効}`,
        `§6${prefix}reachb§f - ${configuration.customcommands.reachb ? `プレイヤーがリーチを超えて攻撃するかどうかを確認します。` : text無効}`,
        `§6${prefix}speeda§f - ${configuration.customcommands.speeda ? `プレイヤーがスピードハッキングをしているかどうかを確認します。` : text無効}`,
        `§6${prefix}flya§f - ${configuration.customcommands.flya ? `プレイヤーがサバイバルで飛んでいるかどうかを確認します。` : text無効}`,
        `§6${prefix}illegalitemsa§f - ${configuration.customcommands.illegalitemsa ? `プレイヤーがインベントリに違法なアイテムを持っているかどうかを確認します。` : text無効}`,
        `§6${prefix}illegalitemsb§f - ${configuration.customcommands.illegalitemsb ? `プレイヤーが違法なアイテムを配置するかどうかを確認します。` : text無効}`,
        `§6${prefix}illegalitemsc§f - ${configuration.customcommands.illegalitemsc ? `ワールドにドロップされた違法なアイテムを確認します。` : text無効}`,
        `§6${prefix}illegalenchant§f - ${configuration.customcommands.illegalenchant ? `アイテムに違法なエンチャントがあるかどうかを確認します。` : text無効}`,
        `§6${prefix}illegallores§f - ${configuration.customcommands.illegallores ? `アイテムに違法な説明があるかどうかを確認します。` : text無効}`,
        `§6${prefix}invalidsprinta§f - ${configuration.customcommands.invalidsprinta ? `盲目での違法なスプリントを確認します。` : text無効}`,
        `§6${prefix}stackban§f - ${configuration.customcommands.stackban ? `プレイヤーが64を超える違法なスタックを持っているかどうかを確認します。` : text無効}`,
        `§6${prefix}antiscaffolda§f - ${configuration.customcommands.antiscaffolda ? `プレイヤーが違法な足場を作っているかどうかを確認します。` : text無効}`,
        `§6${prefix}antinukera§f - ${configuration.customcommands.antinukera ? `プレイヤーがブロックを核攻撃しているかどうかを確認します。` : text無効}`,
        `§6${prefix}xraya§f - ${configuration.customcommands.xraya ? `プレイヤーが特定の鉱石を採掘したときと場所をスタッフに通知します。` : text無効}`,
        `§6${prefix}chatranks§f - ${configuration.customcommands.chatranks ? `チャットランクを切り替えます。` : text無効}`,
        `§6${prefix}antishulker§f - ${configuration.customcommands.antishulker ? `ワールドのシュルカーを切り替えます。` : text無効}`,
        `§6${prefix}ops§f - ${configuration.customcommands.ops ? `すべてのオンラインプレイヤーのOne Player Sleep（OPS）を切り替えます。` : text無効}`,
        `§6${prefix}salvage§f - ${configuration.customcommands.salvage ? `新しいサルベージシステムを切り替えます [実験的]。` : text無効}`,
        `§6${prefix}badpackets2§f - ${configuration.customcommands.badpackets2 ? `プレイヤーによる無効な選択スロットの確認を切り替えます。` : text無効}`,
        `§6${prefix}clearlag§f - ${configuration.customcommands.clearlag ? `タイマー付きでアイテムとエンティティをクリアします。` : text無効}`,
        `§6${prefix}antifalla§f - ${configuration.customcommands.antifalla ? `プレイヤーがサバイバルで落下ダメージを受けないかどうかを確認します。` : text無効}`,
        `§6${prefix}showrules§f - ${configuration.customcommands.showrules ? `プレイヤーが初めてロードしたときにルールを表示するかどうかを切り替えます。` : text無効}`,
        `§6${prefix}afk§f - ${configuration.customcommands.afk ? `${configuration.modules.afk.minutes}分間AFKのプレイヤーをキックします。` : text無効}`,
        `§6${prefix}antiphasea§f - ${configuration.customcommands.antiphasea ? `プレイヤーがブロックを通過しているかどうかを確認します。` : text無効}`,
        `§6${prefix}spawnprotection§f - ${configuration.customcommands.spawnprotection ? `建築/採掘を防ぐためのエリア保護をBooleanにします。` : text無効}`,
        ` `,

        `§l§o§6[§4ツール§6]§r§o`,
        `§6${prefix}give§f - ${configuration.customcommands.give ? `プレイヤーにアイテムを与えます。` : text無効}`,
        `§6${prefix}ecwipe§f - ${configuration.customcommands.ecwipe ? `プレイヤーのエンダーチェストをクリアします。` : text無効}`,
        `§6${prefix}fly§f - ${configuration.customcommands.fly ? `サバイバルでの飛行モードを切り替えます。` : text無効}`,
        `§6${prefix}freeze§f - ${configuration.customcommands.freeze ? `プレイヤーをフリーズさせ、動けなくします。` : text無効}`,
        `§6${prefix}stats§f - ${configuration.customcommands.stats ? `特定のプレイヤーのアンチチートログを表示します。` : text無効}`,
        `§6${prefix}fullreport§f - ${configuration.customcommands.fullreport ? `全員のアンチチートログを表示します。` : text無効}`,
        `§6${prefix}vanish§f - ${configuration.customcommands.vanish ? `バニッシュを切り替えます（容疑者の監視に使用）。` : text無効}`,
        `§6${prefix}chatranks§f - ${configuration.customcommands.chatranks ? `チャットランクを切り替えます。` : text無効}`,
        `§6${prefix}clearchat§f - ${configuration.customcommands.clearchat ? `チャットをクリアします。` : text無効}`,
        `§6${prefix}invsee§f - ${configuration.customcommands.invsee ? `ユーザー名のインベントリにあるすべてのアイテムをリストします。` : text無効}`,
        `§6${prefix}sethome§f - ${configuration.customcommands.sethome ? `現在の座標をホームとして保存します。` : text無効}`,
        `§6${prefix}gohome§f - ${configuration.customcommands.gohome ? `保存したホームの座標にテレポートします。` : text無効}`,
        `§6${prefix}listhome§f - ${configuration.customcommands.listhome ? `保存した場所のリストを表示します。` : text無効}`,
        `§6${prefix}delhome§f - ${configuration.customcommands.delhome ? `リストから保存した場所を削除します。` : text無効}`,
        `§6${prefix}hotbar§f - ${configuration.customcommands.hotbar ? `すべてのプレイヤーのホットバーメッセージを切り替えます。オプション：メッセージ` : text無効}`,
        `§6${prefix}paradoxui§f - ${configuration.customcommands.paradoxiu ? `メインメニューのGUIを表示します。` : text無効}`,
        `§6${prefix}tpr§f - ${configuration.customcommands.tpr ? `プレイヤーにテレポートするリクエストを送ります。` : text無効}`,
        `§6${prefix}biome§f - ${configuration.customcommands.biome ? `プレイヤーが向いている現在のバイオームを送信します。` : text無効}`,
        `§6${prefix}rank§f - ${configuration.customcommands.rank ? `指定したプレイヤーに一つ以上のランクを与えるか、それをリセットします。` : text無効}`,
        `§6${prefix}version§f - paradoxの現在インストールされているバージョンをチャットに表示します。`,
        `§6${prefix}channel create <channel> [password?]§f - ${configuration.customcommands.channel ? `新しいチャットチャンネルを作成します（パスワードはオプション）。` : text無効}`,
        `§6${prefix}channel delete <channel> [password?]§f - ${configuration.customcommands.channel ? `既存のチャットチャンネルを削除します（パスワードはオプション）。` : text無効}`,
        `§6${prefix}channel join <channel> [password?]§f - ${configuration.customcommands.channel ? `既存のチャットチャンネルに参加します（パスワードはオプション）。` : text無効}`,
        `§6${prefix}channel invite <channel> <player>§f - ${configuration.customcommands.channel ? `プレイヤーをあなたのチャットチャンネルに招待します。` : text無効}`,
        `§6${prefix}channel handover <channel> <player>§f - ${configuration.customcommands.channel ? `チャットチャンネルの所有権を譲渡します。` : text無効}`,
        `§6${prefix}channel leave§f - ${configuration.customcommands.channel ? `現在のチャットチャンネルを離れます。` : text無効}`,
        `§6${prefix}channel members§f - ${configuration.customcommands.channel ? `現在のチャットチャンネルのメンバーをリストします。` : text無効}`,
        `§6${prefix}pvp§f - ${configuration.customcommands.pvp ? `PvPモードをBooleanまたは無効にします。` : text無効}`,

        ` `,
        `§l§o§6[§4デバッグ§6]§r§o`,
        `§6${prefix}listitems§f - ${configuration.debug ? `ゲーム内のすべてのアイテムとその最大スタックを表示します。` : text無効}`,
        ` `,
        `§l§o§6[§4詳細情報はコマンドをヘルプと共に実行してください§6]§f`,
    ]);
}
