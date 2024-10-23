import {Request, Response} from "express";
import {getRepository} from "typeorm";
import {User} from "../entity/user.entity";
import {client} from "../index";
import bcryptjs from 'bcryptjs';
import producer from "../kafka/config"

export const Register = async (req: Request, res: Response) => {
    const {email, password, password_confirm, ...body} = req.body;
    
    if (password !== password_confirm) {
        return res.status(400).send({
            message: "Password's do not match!"
        })
    }

    const userByEmail = await getRepository(User).find({
        email,
      });
    if (userByEmail.length > 0) {
        return res.status(400).send({
            message: "Email already registered",
        });
    }

    console.log(""+process.env.BROKER+":"+process.env.BROKER_PORT);

    const value = JSON.stringify({
        ...body,
        email: email,
        password: await bcryptjs.hash(password, 10),
        is_ambassador: req.path === '/api/ambassador/register'
    });

    await producer.connect();

    await producer.send({
        topic: "users",
        messages: [{value}], 
    });

    const user = await getRepository(User).save({
        ...body,
        email: email,
        password: await bcryptjs.hash(password, 10),
        is_ambassador: req.path === '/api/ambassador/register'
    });

    delete user.password;

    res.send(user);
}

export const UpdatePassword = async (req: Request, res: Response) => {
    const user = req["user"];

    if (req.body.password !== req.body.password_confirm) {
        return res.status(400).send({
            message: "Password's do not match!"
        })
    }

    await getRepository(User).update(user.id, {
        password: await bcryptjs.hash(req.body.password, 10)
    });

    res.send(user);
}

export const UpdateInfo = async (req: Request, res: Response) => {
    const user = req["user"];

    const repository = getRepository(User);

    await repository.update(user.id, req.body);

    res.send(await repository.findOne(user.id));
}

export const Ambassadors = async (req: Request, res: Response) => {
    res.send(await getRepository(User).find({
        is_ambassador: true
    }));
}

export const Rankings = async (req: Request, res: Response) => {
    const result: string[] = await client.sendCommand(['ZREVRANGEBYSCORE', 'rankings', '+inf', '-inf', 'WITHSCORES']);
    let name;

    res.send(result.reduce((o, r) => {
        if (isNaN(parseInt(r))) {
            name = r;
            return o;
        } else {
            return {
                ...o,
                [name]: parseInt(r)
            };
        }
    }, {}));
}
