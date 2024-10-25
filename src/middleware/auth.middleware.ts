import {Request, Response} from "express";
import axios from "axios";

export const AuthMiddleware = async (req: Request, res: Response, next: Function) => {
        const apiUrl = 'http://host.docker.internal:8081/validate/token';
        const cookies = req.cookies;
        const reqPath = req.path;

        try {
            // Realizar la petición a la API externa con las cookies en los encabezados
            const response = await axios.post(apiUrl, {
              path : reqPath
            }, {
              headers: {
                'Content-Type': 'application/json',
                'Cookie': serializeCookies(cookies), // Pasar las cookies
              },
            });
            if(response.status==401){
                console.error('no se autentico');
            }
            req["user"] = response.data; // Responder con los datos obtenidos
            next();
          } catch (error) {
            console.error('Error al hacer la petición:', error);
            res.status(500).send('Error en la petición externa');
          }
}

function serializeCookies(cookies) {
    return Object.keys(cookies)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(cookies[key])}`)
      .join('; ');
  }
