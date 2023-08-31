import config from "../../data/config.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsgToPlayer } from "../../util.js";
import { nonstaffhelp } from "./nonstaffhelp.js";
/**
 * @name help
 * @param {ChatSendAfterEvent} message - Message object
 */
export function help(message) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/moderation/help.js:8)");
    }
    const player = message.sender;
    // Check for custom prefix
    const prefix = getPrefix(player);
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);
    // Make sure the user has permissions to run the command
    // if not then show them non staff commands
    if (uniqueId !== player.name) {
        return nonstaffhelp(message);
    }
    // Make sure the help command wasn't disabled
    if (config.customcommands.help === false) {
        config.customcommands.help = true;
    }
    const textDisabled = "Command §4DISABLED§f.";
    return sendMsgToPlayer(player, [
        `§l§o§6[§4Paradoxコマンドヘルプ！§6]§r§o`,
        ` `,
        `§l§o§6[§4管理者用§6]§r§o`,
        `§6${prefix}help§f - ヘルプページを表示します.`,
        `§6${prefix}ban§f - ${config.customcommands.ban ? `指定したユーザーをBANします` : textDisabled}`,
        `§6${prefix}autoban§f - ${config.customcommands.autoban ? `Autobanで設定した検知回数を超えるとBANしますデフォルト1000` : textDisabled}`,
        `§6${prefix}unban§f - ${config.customcommands.unban ? `BAN解除できます(!unban BAN解除したいプレイヤーの名前又はuuid)` : textDisabled}`,
        `§6${prefix}kick§f - ${config.customcommands.kick ? `指定したユーザーをキックします` : textDisabled}`,
        `§6${prefix}mute§f - ${config.customcommands.mute ? `指定したユーザーをミュートします` : textDisabled}`,
        `§6${prefix}unmute§f - ${config.customcommands.unmute ? `指定したユーザーのミュートを解除します` : textDisabled}`,
        `§6${prefix}notify§f - ${config.customcommands.notify ? `検知した内容を表示できるようにします` : textDisabled}`,
        `§6${prefix}credits§f - Paradoxの開発者の名前等`,
        `§6${prefix}op§f - ${config.customcommands.op ? `管理者権限を取得します` : textDisabled}`,
        `§6${prefix}deop§f - ${config.customcommands.deop ? `管理者権限を取り消します` : textDisabled}`,
        `§6${prefix}modules§f - ${config.customcommands.modules ? `アンチチート機能一覧を表示します` : textDisabled}`,
        `§6${prefix}prefix§f - !などを？とかに変更できますデフォルトは！です`,
        `§6${prefix}prefix reset§f - デフォルトの！に戻します`,
        `§6${prefix}lockdown§f - ${config.customcommands.lockdown ? `管理者以外のプレイヤーをキックしてメンテナンス中にできます` : textDisabled}`,
        `§6${prefix}punish§f - ${config.customcommands.punish ? `指定したユーザーのインベントリとエンダーチェストを消去できます` : textDisabled}`,
        `§6${prefix}tpa§f - ${config.customcommands.tpa ? `指定したユーザーにTPします` : textDisabled}`,
        `§6${prefix}despawn§f - ${config.customcommands.despawn ? `指定したモブをkillします` : textDisabled}`,
        ` `,
        `§l§o§6[§4アンチチート機能§6]§r§o`,
        `§6${prefix}allowgma§f - ${config.customcommands.allowgma ? `アドベンチャーを禁止します` : textDisabled}`,
        `§6${prefix}allowgmc§f - ${config.customcommands.allowgmc ? `クリエイティブを禁止します` : textDisabled}`,
        `§6${prefix}allowgms§f - ${config.customcommands.allowgms ? `サバイバルを禁止します` : textDisabled}`,
        `§6${prefix}removecb§f - ${config.customcommands.removecommandblocks ? `有効にするとワールドに存在するコマンドブロックを全て消します.` : textDisabled}`,
        `§6${prefix}bedrockvalidate§f - ${config.customcommands.bedrockvalidate ? `岩盤の確認を行う（機能はよくわからん）` : textDisabled}`,
        `§6${prefix}overridecbe§f - ${config.customcommands.overidecommandblocksenabled ? `commandblocksenabled gamerule を常に有効または無効にします。` : textDisabled}`,
        `§6${prefix}worldborder <value>§f - ${config.customcommands.worldborder ? `オーバーワールド、ネザー、エンドのワールド境界を設定します。` : textDisabled}`,
        `§6${prefix}autoclicker§f - ${config.customcommands.autoclicker ? `オートクリッカーを禁止します` : textDisabled}`,
        `§6${prefix}jesusa§f - ${config.customcommands.jesusa ? `プレイヤーが水や溶岩の上を歩いているかどうかをチェックします（現Horionは検知できなかった）.` : textDisabled}`,
        `§6${prefix}enchantedarmor§f - ${config.customcommands.enchantedarmor ? `エンチャ付きの装備からエンチャを消す` : textDisabled}`,
        `§6${prefix}antikillaura§f - ${config.customcommands.antikillaura ? `90度の角度の外側からの攻撃をチェックするかどうかを切り替える。` : textDisabled}`,
        `§6${prefix}antikb§f - ${config.customcommands.antikb ? `Anti Knockbackをチェックする` : textDisabled}`,
        `§6${prefix}badpackets1§f - ${config.customcommands.badpackets1 ? `各ブロードキャストのメッセージ長をチェックする。` : textDisabled}`,
        `§6${prefix}spammera§f - ${config.customcommands.spammera ? `移動中にメッセージが送信されたかどうかをチェックする。` : textDisabled}`,
        `§6${prefix}spammerb§f - ${config.customcommands.spammerb ? `泳いでいる時にメッセージが送信されたかどうかをチェックする。` : textDisabled}`,
        `§6${prefix}spammerc§f - ${config.customcommands.spammerc ? `アイテム使用中にメッセージが送信されたかどうかをチェックする。` : textDisabled}`,
        `§6${prefix}antispam§f - ${config.customcommands.antispam ? `2秒のクールダウンでチャットのスパムをチェックする。` : textDisabled}`,
        `§6${prefix}crashera§f - ${config.customcommands.crashera ? `Horion crasherを対策する` : textDisabled}`,
        `§6${prefix}namespoofa§f - ${config.customcommands.namespoofa ? `プレーヤーの名前が文字数の制限を超えていないかチェックする。` : textDisabled}`,
        `§6${prefix}namespoofb§f - ${config.customcommands.namespoofb ? `プレイヤーの名前にASCII以外の文字が含まれていないかチェックする。` : textDisabled}`,
        `§6${prefix}reacha§f - ${config.customcommands.reacha ? `プレイヤーの手の届かないところにブロックがあるかどうかをチェックする。` : textDisabled}`,
        `§6${prefix}reachb§f - ${config.customcommands.reachb ? `プレイヤーの攻撃が届かないかチェックする。` : textDisabled}`,
        `§6${prefix}noslowa§f - ${config.customcommands.noslowa ? `プレイヤーがスピードハックをしているかどうかをチェックする。` : textDisabled}`,
        `§6${prefix}flya§f - ${config.customcommands.flya ? `プレイヤーがサバイバルの状態で飛行をしているかどうかをチェックする。` : textDisabled}`,
        `§6${prefix}illegalitemsa§f - ${config.customcommands.illegalitemsa ? `インベントリに不正なアイテムがあるかどうかをチェックする。` : textDisabled}`,
        `§6${prefix}illegalitemsb§f - ${config.customcommands.illegalitemsb ? `プレイヤーが不正なアイテムを置いていないかチェックする。` : textDisabled}`,
        `§6${prefix}illegalitemsc§f - ${config.customcommands.illegalitemsc ? `ワールドに違法な落とし物がないかチェックする。` : textDisabled}`,
        `§6${prefix}illegalenchant§f - ${config.customcommands.illegalenchant ? `アイテムに違法なエンチャントが施されていないかチェックする。` : textDisabled}`,
        `§6${prefix}illegallores§f - ${config.customcommands.illegallores ? `アイテムに不正な名前がないかチェックする。` : textDisabled}`,
        `§6${prefix}invalidsprinta§f - ${config.customcommands.invalidsprinta ? `盲目による不正なスプリントをチェックする` : textDisabled}`,
        `§6${prefix}stackban§f - ${config.customcommands.stackban ? `プレイヤーが64以上の不正なスタックを持っているかどうかをチェックする。` : textDisabled}`,
        `§6${prefix}antiscaffolda§f - ${config.customcommands.antiscaffolda ? `選手に違法な足場がないかチェックする。(Horionだと検知されにくい)` : textDisabled}`,
        `§6${prefix}antinukera§f - ${config.customcommands.antinukera ? `選手がブロックを範囲破壊していないかチェックする` : textDisabled}`,
        `§6${prefix}xraya§f - ${config.customcommands.xraya ? `プレイヤーが特定の鉱石を採掘したときと場所を管理者に通知する。` : textDisabled}`,
        `§6${prefix}chatranks§f - ${config.customcommands.chatranks ? `チャットのランクを切り替える` : textDisabled}`,
        `§6${prefix}antishulker§f - ${config.customcommands.antishulker ? `ワールドのシュルカーを全滅させる` : textDisabled}`,
        `§6${prefix}ops§f - ${config.customcommands.ops ? `オンラインのプレイヤーが一人でも寝ると朝になります(銃アドオンを入れた状態だと不安定)` : textDisabled}`,
        `§6${prefix}salvage§f - ${config.customcommands.salvage ? `新しいサルベージシステム[実験的]を切り替える` : textDisabled}`,
        `§6${prefix}badpackets2§f - ${config.customcommands.badpackets2 ? `プレーヤーが選択したスロットが無効かどうかのチェックを切り替える。` : textDisabled}`,
        `§6${prefix}clearlag§f - ${config.customcommands.clearlag ? `タイマーでアイテムやエンティティをクリアする。` : textDisabled}`,
        `§6${prefix}antifalla§f - ${config.customcommands.antifalla ? `サバイバルで落下ダメージを受けないかどうかのチェックを切り替える。` : textDisabled}`,
        `§6${prefix}showrules§f - ${config.customcommands.showrules ? `プレイヤーが初めてロードしたときにルールを表示するかどうかを切り替えます。` : textDisabled}`,
        `§6${prefix}afk§f - ${config.customcommands.afk ? `放置しているプレイヤーをキックする ${config.modules.afk.minutes} 分` : textDisabled}`,
        ` `,
        `§l§o§6[§4管理者用ツール§6]§r§o`,
        `§6${prefix}give§f - ${config.customcommands.give ? `Giveコマンドが使えます` : textDisabled}`,
        `§6${prefix}ecwipe§f - ${config.customcommands.ecwipe ? `指定したプレイヤーのエンダーチェストを消去` : textDisabled}`,
        `§6${prefix}fly§f - ${config.customcommands.fly ? `サバイバルの状態で飛べるようにします` : textDisabled}`,
        `§6${prefix}freeze§f - ${config.customcommands.freeze ? `チーターを!freezeでy245に隔離して問題を起こせないようにします` : textDisabled}`,
        `§6${prefix}stats§f - ${config.customcommands.stats ? `特定のプレイヤーのステータスを見る。` : textDisabled}`,
        `§6${prefix}list§f - ${config.customcommands.fullreport ? `現在ワールドに居る全員のステータスを確認` : textDisabled}`,
        `§6${prefix}van§f - ${config.customcommands.vanish ? `透明化できます（スペクターで良い）` : textDisabled}`,
        `§6${prefix}chatranks§f - ${config.customcommands.chatranks ? `チャットランクを付けれます` : textDisabled}`,
        `§6${prefix}clearchat§f - ${config.customcommands.clearchat ? `チャットを綺麗にします` : textDisabled}`,
        `§6${prefix}invsee§f - ${config.customcommands.invsee ? `プレイヤーのインベントリにあるすべてのアイテムを一覧表示します。` : textDisabled}`,
        `§6${prefix}tps§f - ${config.customcommands.sethome ? `現在の座標を保存する` : textDisabled}`,
        `§6${prefix}tpg§f - ${config.customcommands.gohome ? `保存した座標にテレポートする。` : textDisabled}`,
        `§6${prefix}tpl§f - ${config.customcommands.listhome ? `保存した場所のリストを表示します。` : textDisabled}`,
        `§6${prefix}tpd§f - ${config.customcommands.delhome ? `リストから保存場所を削除する。` : textDisabled}`,
        `§6${prefix}hotbar§f - ${config.customcommands.hotbar ? `すべてのプレーヤーのホットバーメッセージを切り替えます。例：おさかな～` : textDisabled}`,
        `§6${prefix}ui§f - ${config.customcommands.paradoxiu ? `メニューを表示します` : textDisabled}`,
        `§6${prefix}tpr§f - ${config.customcommands.tpr ? `指定したプレイヤーにTPリクエストを送信できます` : textDisabled}`,
        `§6${prefix}map§f - ${config.customcommands.biome ? `自分が今いるバイオームを確認できます` : textDisabled}`,
        `§6${prefix}tag§f - ${config.customcommands.tag ? `タグを付けれます` : textDisabled}`,
        `§6${prefix}version§f - Paradoxのバージョンを表示できますが日本語版はこう君が編集している為バージョンが少しずれます`,
        `§6${prefix}ch cr <名前> [パスワード]§f - ${config.customcommands.channel ? `新しいチャットチャンネルを作成する` : textDisabled}`,
        `§6${prefix}ch de <名前> [パスワード]§f - ${config.customcommands.channel ? `既存のチャットチャンネルを削除する！` : textDisabled}`,
        `§6${prefix}ch join <名前> [パスワード]§f - ${config.customcommands.channel ? `既存のチャットチャンネルに参加する！` : textDisabled}`,
        `§6${prefix}ch in <名前> <プレイヤー>§f - ${config.customcommands.channel ? `プレイヤーをチャットチャンネルに招待する！` : textDisabled}`,
        `§6${prefix}ch ha <名前> <プレイヤー>§f - ${config.customcommands.channel ? `チャットチャンネルの所有権を譲渡する！` : textDisabled}`,
        `§6${prefix}ch le§f - ${config.customcommands.channel ? `現在のチャットチャンネルから退出する！` : textDisabled}`,
        `§6${prefix}ch me§f - ${config.customcommands.channel ? `現在のチャットチャンネルのメンバーを一覧表示します！` : textDisabled}`,
        ` `,
        `§l§o§6[§4テスト用§6]§r§o`,
        `§6${prefix}listitems§f - ${config.debug ? `Prints every item in the game and their max stack.` : textDisabled}`,
        ` `,
        `§l§o§6[§4詳細については、helpを付けてコマンドを実行してください。§6]§f`,
    ]);
}
