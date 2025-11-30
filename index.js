import {
    getAllMembers,
    getCurrentFronters,
    setPluralKitFronters,
} from "./utils.js";

const socket = new WebSocket("wss://api.apparyllis.com/v1/socket");
let currentFronters = [];

socket.addEventListener("open", () => {
    const data = {
        op: "authenticate",
        token: process.env.SIMPLYPLURAL_TOKEN,
    };
    socket.send(JSON.stringify(data));
});

socket.addEventListener("message", (event) => {
    if (event.data === "pong") {
        return;
    }
    try {
        const receivedData = JSON.parse(event.data);
        // console.log("Received JSON:", receivedData);

        if (
            receivedData.msg === "Successfully authenticated" ||
            (receivedData.msg === "update" &&
                receivedData.target === "frontHistory")
        ) {
            setCurrentFronters();
        }
    } catch (error) {
        console.error("Error parsing JSON:", error);
        console.log("Received data was:", event.data);
    }
});

const setCurrentFronters = async () => {
    const fronters = await getCurrentFronters();
    const allMembers = await getAllMembers();

    currentFronters = [];
    const currentFronterNames = [];
    for (let key in fronters) {
        const member = allMembers.find(
            (m) => m.id === fronters[key].content.member
        ).content;
        currentFronterNames.push(member.name);
        currentFronters.push(member.pkId);
    }

    console.log("setting fronters:", currentFronterNames.join(", "));
    setPluralKitFronters(currentFronters);
};

const pingServer = () => {
    socket.send("ping");
};

setInterval(pingServer, 10_000);
