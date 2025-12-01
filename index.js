import {
    getAllMembers,
    getCurrentFronters,
    setPluralKitFronters,
} from "./utils.js";
import { styleText } from "node:util";

const socket = new WebSocket("wss://api.apparyllis.com/v1/socket");
let currentFronters = [];

// open the connection
socket.addEventListener("open", () => {
    const data = {
        op: "authenticate",
        token: process.env.SIMPLYPLURAL_TOKEN,
    };
    socket.send(JSON.stringify(data));
});

socket.addEventListener("message", (event) => {
    // don't bother with the "pong" messages from pinging
    if (event.data === "pong") {
        return;
    }
    try {
        const receivedData = JSON.parse(event.data);
        // console.log("Received JSON:", receivedData);

        // runs if authentication fails
        if (
            receivedData.msg ===
            "Authentication violation: Token is missing or invalid. Goodbye :)"
        ) {
            throw new Error(
                "simplyplural authentication failed. did you set your SIMPLYPLURAL_TOKEN?"
            );
        }

        // runs whenever the connection is made and when fronters change
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

socket.addEventListener("close", () => {
    console.error("error: simplyplural conection has been closed");
});

const setCurrentFronters = async () => {
    const fronters = await getCurrentFronters();
    const allMembers = await getAllMembers();

    // clear the current fronters
    currentFronters = [];
    const currentFronterNames = [];

    // find member data of current fronters, and add their pluralkit IDs to the array
    for (let key in fronters) {
        const member = allMembers.find(
            (m) => m.id === fronters[key].content.member
        ).content;
        if (!member.pkId) {
            console.warn(
                styleText(
                    ["yellow"],
                    `warning: could not find a associated pluralkit ID for member ${member.name}`
                )
            );
        } else {
            currentFronterNames.push(member.name);
            currentFronters.push(member.pkId);
        }
    }

    // sets the pluralkit fronters to the current fronters
    console.log("setting fronters:", currentFronterNames.join(", "));
    setPluralKitFronters(currentFronters);
};

// keeps the connection alive
const pingServer = () => {
    socket.send("ping");
};

setInterval(pingServer, 10_000);
