const mqtt = require('mqtt');
const clients = ['client1', 'client2', 'client3']; // Add more client IDs as needed
const brokerUrl = 'mqtt://broker.emqx.io:1883'; // Or your broker's IP/hostname

// Store ping times
const pingMap = {};

const client = mqtt.connect(brokerUrl);

client.on('connect', () => {
    console.log('Ping server connected to broker.');

    // Subscribe to pong topics
    clients.forEach((id) => {
        const pongTopic = `${id}/pong`;
        client.subscribe(pongTopic, (err) => {
            if (!err) {
                console.log(`Subscribed to ${pongTopic}`);
            }
        });
    });

    // Start periodic ping
    setInterval(() => {
        const timestamp = Date.now();
        clients.forEach((id) => {
            const pingTopic = `${id}/ping`;
            pingMap[id] = timestamp; // Save send time
            client.publish(pingTopic, String(timestamp));
        });
    }, 5000); // Ping every 5 seconds
});

client.on('message', (topic, message) => {
    const [clientId, type] = topic.split('/');
    if (type === 'pong') {
        const sentTime = parseInt(message.toString(), 10);
        const now = Date.now();
        const rtt = now - sentTime;
        console.log(`[${clientId}] Ping: ${rtt} ms`);
    }
});

