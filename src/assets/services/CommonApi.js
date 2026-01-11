import axios from 'axios';

export const commonAPI = async (method, url, data, header) => {
    const config = {
        method,
        url,
        data,
        headers: header ? header : { "Content-Type": "application/json" }
    };

    return await axios(config)
        .then((res) => {
            return res;
        })
        .catch((err) => {
            return err;
        });
};
