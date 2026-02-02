import axios from "axios";
import FormData from "form-data";
import { STABILITY_API_KEY } from "./config";

export const generateImage = async (prompt: string): Promise<Uint8Array> => {
    try {
        const payload = {
            prompt: prompt,
            output_format: "webp"
        };

        const response = await axios.postForm(
            `https://api.stability.ai/v2beta/stable-image/generate/core`,
            axios.toFormData(payload, new FormData()),
            {
                validateStatus: undefined,
                responseType: "arraybuffer",
                headers: {
                    Authorization: `Bearer ${STABILITY_API_KEY}`,
                    Accept: "image/*"
                },
            },
        );

        if (response.status === 200) {
            return new Uint8Array(response.data);
        } else {
            throw new Error(`${response.status}: ${response.data.toString()}`);
        }
    } catch (error) {
        throw error;
    }
}
