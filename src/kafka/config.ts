import { EachMessagePayload, Kafka } from "kafkajs"

const kafka = new Kafka({
    clientId: '',
    brokers: [''],
    ssl: true,
    sasl: {
        mechanism: '',
        username:'',
        password:'',
    }
});

export =  kafka.producer()