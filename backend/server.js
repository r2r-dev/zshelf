const { execSync } = require("child_process");
const net = require("net");
const getList = require("./list");
const getInfo = require("./info");
const getMeta = require("./metadata");
const download = require("./download");

const socketLocation = "/tmp/zshelf_socket";
execSync("rm -f " + socketLocation);

const server = net.createServer();
server.listen(socketLocation, () => {
    console.log('[SERVER] Ready');

    setInterval(() => {
        // Exit when zshelf dies
        const zshelfPid = execSync("pidof zshelf");
        if (zshelfPid.length === 0) {
            process.exit(0);
        }
    }, 10000);
});

server.on("connection", (client) => {
    console.log('got connection!');
    client.on("data", (data) => {
        try {
            console.log(data.toString());
            const raw = data.toString().split("\n");
            const cmd = raw[0];
            const arg = raw.splice(1);
            switch (cmd) {
                case "LIST": getList(arg, client); break;
                case "INFO": getInfo(arg, client); break;
                case "META": getMeta(arg, client); break;
                case "DOWN": download(arg, client); break;
            }
        } catch (err) {
            client.write("ERR: " + err + "\n", client.end);
        }
    });
});

server.on("error", (err) => console.log("ERR: " + err));
server.on("close", () => process.exit(0));
