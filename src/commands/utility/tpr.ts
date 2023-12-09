import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import { getPrefix, sendMsgToPlayer, setTimer } from "../../util";
import { WorldExtended } from "../../classes/WorldExtended/World";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry";
import ConfigInterface from "../../interfaces/Config";

interface TeleportRequest {
    requester: Player;
    target: Player;
    expiresAt: number;
}

const teleportRequests: TeleportRequest[] = [];

// これにより、teleportRequests 配列から
// その内容を誤って変更することで、メモリリークを引き起こす。
export function getTeleportRequests(): TeleportRequest[] {
    return teleportRequests;
}

function tprHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `§n§o§4[§6コマンド§4]§f: tpr`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6使用§4]§f: tpr [オプション］`,
        `§4[§6オプション§4]§f: 名前、ヘルプ`,
        `§4[§6解説§4]§f：プレイヤーにTPのリクエストを送る。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}tpr ${player.name}`,
        `        §4- §6指定したプレイヤーにテレポート要請を出す§f`,
        `    ${prefix}tpr help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}

// これはリクエストの提出を処理する。
function teleportRequestHandler({ sender, message }: ChatSendAfterEvent, configuration: ConfigInterface) {
    const player = sender;
    const args = message.split(" ");
    if (args.length < 2) return;

    // メッセージからターゲット名を取り出す。
    const targetName = args[1].trim();

    // 要求されたプレーヤーを"@"記号を含めて探してみる。
    let target: Player | undefined;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(targetName.toLowerCase().replace(/"|\\|@/g, ""))) {
            target = pl;
            break;
        }
    }

    if (!target) {
        sendMsgToPlayer(player, "§f§4[§6Paradox§4]§f Target player not found.");
        return;
    }

    const requestIndex = teleportRequests.findIndex((r) => r.target === target);
    if (requestIndex !== -1) {
        const request = teleportRequests[requestIndex];
        if (Date.now() >= request.expiresAt) {
            teleportRequests.splice(requestIndex, 1);
        } else {
            sendMsgToPlayer(player, "§f§4[§6Paradox§4]§f That player already has a teleport request pending.");
            return;
        }
    }

    /**
     * 1000 milliseconds per second
     * 60 seconds per minute, or 60000 milliseconds per minute
     * 60 minutes per hour, or 3600000 milliseconds per hour
     * 24 hours per day, or 86400000 milliseconds per day
     */
    const { tprExpiration } = configuration.modules;
    const durationInMs = tprExpiration.seconds * 1000 + tprExpiration.minutes * 60000 + tprExpiration.hours * 3600000 + tprExpiration.days * 86400000;

    teleportRequests.push({
        requester: player,
        target,
        expiresAt: Date.now() + durationInMs, // Expires in the time specified in '継続時間'
    });

    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Teleport request sent to §7${target.name}§f. Waiting for approval...`);
    sendMsgToPlayer(target, `§f§4[§6Paradox§4]§f You have received a teleport request from §7${player.name}§f. Type '§7approved§f' or '§7denied§f' in chat to respond.`);
}

// 承認待ちのリクエストを処理します。
function teleportRequestApprovalHandler(object: ChatSendAfterEvent) {
    const { sender, message } = object;
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    let lowercaseMessage: string;
    let refChar: string[];
    let extractedPhrase: string;
    if (configuration.modules.chatranks.enabled) {
        lowercaseMessage = (world as WorldExtended).decryptString(message, sender.id).toLowerCase();
        // 復号化された文字列からレスポンスを取り出す
        refChar = lowercaseMessage.split("§r");
        extractedPhrase = refChar[1];
    } else {
        extractedPhrase = message;
    }
    const isApprovalRequest = extractedPhrase === "approved" || extractedPhrase === "approve";
    const isDenialRequest = extractedPhrase === "denied" || extractedPhrase === "deny";

    if (!isApprovalRequest && !isDenialRequest) {
        return;
    }

    const player = sender;

    object.sendToTargets = true;

    // ターゲットはリクエストしたプレーヤー、プレーヤーはリクエストに応答した同じターゲットである。
    const requestIndex = teleportRequests.findIndex((r) => r.target === player);
    // ターゲットは存在しない。
    if (requestIndex === -1) return;

    const request = teleportRequests[requestIndex];
    if (Date.now() >= request.expiresAt) {
        sendMsgToPlayer(request.requester, "§f§4[§6Paradox§4]§f Teleport request expired. Please try again.");
        sendMsgToPlayer(request.target, "§f§4[§6Paradox§4]§f Teleport request expired. Please try again.");
        teleportRequests.splice(requestIndex, 1);
        return;
    }

    if (isApprovalRequest) {
        setTimer(request.requester.id);
        request.requester.teleport(request.target.location, {
            dimension: request.target.dimension,
            rotation: { x: 0, y: 0 },
            facingLocation: { x: 0, y: 0, z: 0 },
            checkForBlocks: true,
            keepVelocity: false,
        });
        sendMsgToPlayer(request.requester, `§f§4[§6Paradox§4]§f Teleport request to §7${request.target.name}§f is approved.`);
    } else {
        sendMsgToPlayer(request.requester, `§f§4[§6Paradox§4]§f Teleport request to §7${request.target.name}§f is denied.`);
    }

    teleportRequests.splice(requestIndex, 1);
}

export function TeleportRequestHandler({ sender, message }: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを検証する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? ./commands/utility/tpr.js:71)");
    }

    const player = sender;

    // カスタム接頭辞のチェック
    const prefix = getPrefix(player);

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // 反論はあるか
    if (!args.length) {
        return tprHelp(player, prefix, configuration.customcommands.tpr);
    }

    // 助けを求められたか
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.tpr) {
        return tprHelp(player, prefix, configuration.customcommands.tpr);
    }

    // 提出されたリクエストはここで扱う
    if (message.startsWith(`${prefix}tpr`)) {
        const event = {
            sender,
            message,
        } as ChatSendAfterEvent;
        teleportRequestHandler(event, configuration);
    }

    // これは承認または拒否を送信する際のGUI用である。
    const validMessages = ["approved", "approve", "denied", "deny"];

    if (validMessages.some((msg) => msg === message)) {
        const event = {
            sender,
            message,
        } as ChatSendAfterEvent;
        teleportRequestApprovalHandler(event);
    }
}

// teleportRequestApprovalHandler にサブスクライブする。
const TpRequestListener = () => {
    // TPRが無効でない場合
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const validate = configuration.customcommands.tpr;
    if (validate) {
        world.afterEvents.chatSend.subscribe(teleportRequestApprovalHandler);
    }
};

export { TpRequestListener };
