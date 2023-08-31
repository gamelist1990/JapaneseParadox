import { world, Player } from "@minecraft/server";
import { sendMsgToPlayer } from "../../util";
function deathcoordinates(event) {
    const { deadEntity } = event;
    if (!(deadEntity instanceof Player)) {
        return;
    }
    const { x, y, z } = deadEntity.location;
    sendMsgToPlayer(deadEntity, `§f§4[§6Paradox§4]§f 死んだ場所＝＞§l§3X§f: ${x.toFixed(0)}, §l§6Y§f: ${y.toFixed(0)}, §l§2Z§f: ${z.toFixed(0)}.`);
}
const DeathCoordinates = () => {
    world.afterEvents.entityDie.subscribe(deathcoordinates);
};
export { DeathCoordinates };
