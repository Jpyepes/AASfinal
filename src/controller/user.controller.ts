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
        action: "create",
        user: {
            ...body,
            email: email,
            password: password,
            is_ambassador: req.path === '/api/ambassador/register'
        }
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

    await getRepository(User).update(user.email, {
        password: req.body.password,
    });

    const value = JSON.stringify({
        action: "update_password",
        user: {
            id: user.firebase_id,
            password: req.body.password,
        }
    });

    await producer.connect();

    await producer.send({
        topic: "users",
        messages: [{value}], 
    });

    res.send(user);
}

export const UpdateInfo = async (req: Request, res: Response) => {
    const user = req["user"];

    const repository = getRepository(User);

    await repository.update({
        email: user.email
    }, {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
    });

    const value = JSON.stringify({
        action: "update_info",
        user: {
            id: user.id,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
        }
    });

    await producer.connect();

    await producer.send({
        topic: "users",
        messages: [{value}], 
    });

    res.send(await repository.findOne({
        email: user.email
    }));
}

export const Ambassadors = async (req: Request, res: Response) => {
    res.send(await getRepository(User).find({
        is_ambassador: true
    }));
}
