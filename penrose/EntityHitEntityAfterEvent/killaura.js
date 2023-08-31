import { world, Player, system } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../WorldInitializeAfterEvent/registry";
import { flag } from "../../util";
import { MinecraftEffectTypes } from "../../node_modules/@minecraft/vanilla-data/lib/index";
function isAttackingFromOutsideView(player1, player2) {
    if (!player1 || !player2) {
        return false; // Invalid player objects
    }
    // Calculate the distance between the two players
    const distance = Math.sqrt(Math.pow(player2.location.x - player1.location.x, 2) + Math.pow(player2.location.y - player1.location.y, 2) + Math.pow(player2.location.z - player1.location.z, 2));
    // Check if the distance is greater than or equal to 2 blocks
    if (distance >= 2) {
        // Get the view direction vector of player1
        const player1ViewDir = player1.getViewDirection();
        // Calculate the vector from player1 to player2
        const player1ToPlayer2 = {
            x: player2.location.x - player1.location.x,
            y: player2.location.y - player1.location.y,
            z: player2.location.z - player1.location.z,
        };
        // Calculate the dot product
        const dotProduct2 = player1ViewDir.x * player1ToPlayer2.x + player1ViewDir.y * player1ToPlayer2.y + player1ViewDir.z * player1ToPlayer2.z;
        // Calculate the magnitude of the vector
        const player1ToPlayer2Magnitude = Math.sqrt(player1ToPlayer2.x * player1ToPlayer2.x + player1ToPlayer2.y * player1ToPlayer2.y + player1ToPlayer2.z * player1ToPlayer2.z);
        // Normalize the dot product
        const normalizedDotProduct2 = dotProduct2 / (player1ToPlayer2Magnitude * Math.sqrt(player1ViewDir.x * player1ViewDir.x + player1ViewDir.y * player1ViewDir.y + player1ViewDir.z * player1ViewDir.z));
        // Convert dot product to angle in degrees
        const angle2 = Math.acos(normalizedDotProduct2) * (180 / Math.PI);
        // Check if angle2 is greater than 90 degrees
        return angle2 > 90;
    }
    return false;
}
function killaura(obj) {
    // Get Dynamic Property
    const antiKillAuraBoolean = dynamicPropertyRegistry.get("antikillaura_b");
    // Unsubscribe if disabled in-game
    if (antiKillAuraBoolean === false) {
        world.afterEvents.entityHitEntity.unsubscribe(killaura);
        return;
    }
    // Properties from class
    const { damagingEntity, hitEntity } = obj;
    // If not a player entity then ignore
    if (!(hitEntity instanceof Player) || !(damagingEntity instanceof Player)) {
        return;
    }
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(damagingEntity?.id);
    // Skip if they have permission
    if (uniqueId === damagingEntity.name) {
        return;
    }
    const angleBoolean = isAttackingFromOutsideView(damagingEntity, hitEntity);
    if (angleBoolean) {
        // Entity is facing hitEntity at an angle greater than 90 degrees
        flag(damagingEntity, "KillAura", "A", "Combat", null, null, null, null, false);
        // Blindness
        damagingEntity.addEffect(MinecraftEffectTypes.Blindness, 1000000, { amplifier: 255, showParticles: true });
        // Mining Fatigue
        damagingEntity.addEffect(MinecraftEffectTypes.MiningFatigue, 1000000, { amplifier: 255, showParticles: true });
        // Weakness
        damagingEntity.addEffect(MinecraftEffectTypes.Weakness, 1000000, { amplifier: 255, showParticles: true });
        // Slowness
        damagingEntity.addEffect(MinecraftEffectTypes.Slowness, 1000000, { amplifier: 255, showParticles: true });
        const boolean = damagingEntity.hasTag("paradoxFreeze");
        const hasAuraFreeze = damagingEntity.hasTag("freezeAura");
        if (!boolean) {
            damagingEntity.addTag("paradoxFreeze");
        }
        if (!hasAuraFreeze) {
            damagingEntity.addTag("freezeAura");
        }
    }
}
function freeze(id) {
    const antiKillAuraBoolean = dynamicPropertyRegistry.get("antikillaura_b");
    if (antiKillAuraBoolean === false) {
        system.clearRun(id);
        return;
    }
    const filter = {
        tags: ["freezeAura"],
        excludeTags: ["freezeNukerA"],
    };
    const players = world.getPlayers(filter);
    for (const player of players) {
        if (!player) {
            return;
        }
        const tagBoolean = player.hasTag("paradoxFreeze");
        if (!tagBoolean) {
            player.removeTag("freezeAura");
            return;
        }
        player.onScreenDisplay.setTitle("§f§4[§6Paradox§4]§f違法な動きを検知したためフリーズさせました", { subtitle: "§f検知内容＝＞ §4[§6AntiKillAura§4]§f", fadeInDuration: 0, fadeOutDuration: 0, stayDuration: 60 });
    }
}
export const KillAura = () => {
    world.afterEvents.entityHitEntity.subscribe(killaura);
    const id = system.runInterval(() => {
        freeze(id);
    }, 20);
};
