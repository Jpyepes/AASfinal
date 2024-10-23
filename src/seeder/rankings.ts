import {createConnection, getRepository} from "typeorm";
import {createClient} from "redis";
import {User} from "../entity/user.entity";


createConnection().then(async () => {
    const client = createClient({
        url: 'redis://redis:6379'
    });

    await client.connect();

    const ambassadors = await getRepository(User).find({
        is_ambassador: true
    });


    for (let i = 0; i < ambassadors.length; i++) {
        const revenue = 100;

        await client.zAdd('rankings', {
            value: ambassadors[i].name,
            score: revenue
        });
    }

    process.exit();
});
