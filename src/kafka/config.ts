import { EachMessagePayload, Kafka } from "kafkajs"

const kafka = new Kafka({
    clientId: 'user-producer',
    brokers: [''],
    ssl: true,
    sasl: {
        mechanism: 'plain',
        username: '',
        password: '',
    }
});

export =  kafka.producer()