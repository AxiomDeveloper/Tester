export const fileSystem = {
    "/": { type: "dir", contents: ["intercepts", "secure_nodes", "readme.txt"] },
    "/readme.txt": { type: "file", content: "MISSION: Read files in /intercepts. Use the 'mv' command to move them to the correct department inside /secure_nodes. \nCOMMANDS: \n- ls (list files)\n- cd [dir] (change directory)\n- cat [file] (read file)\n- mv [file] [path] (move file)" },
    "/intercepts": { type: "dir", contents: ["audio_77.log", "wire_transfer.dat", "suspect_alpha.doc"] },
    "/intercepts/audio_77.log": { type: "file", content: "TRANSCRIPT: 'The money is moving through the shell company tonight.'" },
    "/intercepts/wire_transfer.dat": { type: "file", content: "ROUTING: $4.2M -> Cayman Islands Account #9948" },
    "/intercepts/suspect_alpha.doc": { type: "file", content: "ALIAS: The Ghost. Last seen in sector 4. High flight risk." },
    "/secure_nodes": { type: "dir", contents: ["financial_crimes", "surveillance", "profiles"] },
    "/secure_nodes/financial_crimes": { type: "dir", contents: [] },
    "/secure_nodes/surveillance": { type: "dir", contents: [] },
    "/secure_nodes/profiles": { type: "dir", contents: [] }
};
