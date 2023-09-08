export const onJoinPrimaryData = [
    "cmds",
    "commandblocks",
    "encharmor",
    "detect_helmet",
    "detect_chest",
    "detect_leggings",
    "detect_boots",
    "xPos",
    "yPos",
    "zPos",
    "xPosFreeze",
    "yPosFreeze",
    "zPosFreeze",
    "realm",
    "ench_helmet",
    "ench_chest",
    "ench_legs",
    "ench_boots",
    "autoclickervl",
    "badpacketsvl",
    "killauravl",
    "flyvl",
    "illegalitemsvl",
    "cbevl",
    "gamemodevl",
    "spammervl",
    "namespoofvl",
    "speedvl",
    "crashervl",
    "reachvl",
    "invalidsprintvl",
    "armorvl",
    "antikbvl",
    "antifallvl",
    "nukervl",
    "scaffoldvl",
    "antiphasevl",
];
export const onJoinSecondaryData = [
    "scoreboard players operation @a commandblocks = paradox:config commandblocks",
    "scoreboard players operation @a cmds = paradox:config cmds",
    "scoreboard players operation @a encharmor = paradox:config encharmor",
    "event entity @s[tag=vanish] vanish",
    "ability @s[tag=flying] mayfly true",
    "ability @s[tag=isMuted] mute true",
];
