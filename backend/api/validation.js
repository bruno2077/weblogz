// Arquivo pra fazer validações. Com essas 3 funções abaixo dá pra testar várias coisa como por exemplo se 2 senhas digitadas conferem, 
// se o campo de email foi preenchido, se um usuário já existe, etc.

module.exports = app => {
    // Passa um valor pra essa função, se ele existir está ok senão vai dar um erro, ou seja, um throw. msg é  
    // a mensagem caso aconteça um erro.
    function existsOrError(value, msg) {        
        if(!value) throw msg 
        
        if(Array.isArray(value) && value.length === 0 ) throw msg
                
        if(typeof value === 'string' && !value.trim() ) throw msg
    }

    function notExistsOrError(value, msg) {
        try {
            existsOrError(value, msg)
        } catch(msg) {
            return 
        }
        throw msg
    }
    
    function equalsOrError(valueA, valueB, msg) {
        if(valueA !== valueB) throw msg
    }
    

    return { existsOrError, notExistsOrError, equalsOrError}
}