import { world } from "@minecraft/server";
import { commandHandler } from "../../../commands/handler.js";
function beforeprefixcommand(msg) {
    const player = msg.sender;
    commandHandler(player, msg);
}
const BeforePrefixCommand = () => {
    world.beforeEvents.chatSend.subscribe(beforeprefixcommand);
};
export { BeforePrefixCommand };
