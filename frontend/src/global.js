// Aqui temos 2 variáveis e 1 função de uso global na aplicação. 
// É a URL do backend, a chave da nossa aplicação no localStorage e a função de validar o token do usuário no backend.

import axios from "axios"

export const baseApiUrl = 'http://localhost:3005'

export const userKey = "__weblogz_user"

// Verifica se o token é válido usando os dados do usuário no localStorage. Retorna 0 ou 1
export async function isValidToken(userData) {
    console.log("validando token...")
    if(userData) {
        const resp = await axios.post(`${baseApiUrl}/validateToken`, userData)
            .then(res => {
                if(res.data) { // Token validado.                    
                    return 1
                }
                else { // token invalido.
                    return 0
                }
            })
            .catch(e => { // No caso de algum erro ao acessar o backend.
                return 0
            })
        return resp // 0 ou 1
    }
    return 0
}

export default { baseApiUrl, userKey, isValidToken }