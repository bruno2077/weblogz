# Weblogz
**Status do Projeto: Em construção.**

## Descrição
Weblogz é um blog com cadastro de usuários, artigos e categorias de artigos. No momento apenas a primeira versão do backend está pronta, o frontend está sendo feito em Reactjs.

## Pré Requisitos
Pra instalar todas as dependências, lidar com o banco de dados e executar o servidor é necessário ter o Node.js(v14.17.6), o npm(6.14.15) e o Postgresql (13.3) instalados na máquina as versões entre parêntesis foram as utilizadas no projeto. Pra conseguir testar o servidor é necessário uma API Client como o Postman ou Insomnia. O servidor roda na porta 3005.

## Instalação
Instalada todas as dependências e utilizando o SGBD Postgresql, para rodar o servidor basta seguir os passos abaixo mas com outros SGBDs como MySQL algumas alterações devem ser necessárias.

Para rodar o servidor:
1- Crie um banco de dados no Postgresql
2- Preencha o arquivo env_file com uma senha qualquer em authSecret, o nome do banco de dados criado, e o usuário e senha para acessá-lo
3- Renomeie o arquivo env_file para .env
4- Pronto. No terminal dentro de /backend execute o comando *npm start* pra executar o servidor.

## Como usar
Inicialmente devemos criar um usuário administrador diretamente no Postgresql pois pelo nosso servidor somente um usuário administrador tem permissão para criar um usuário administrador. O esquema do usuário é o seguinte:

<pre> Coluna    |           Tipo           | Nullable |            Valor padrão
-----------+--------------------------+-----------+----------+--------------------------
 id        | integer                  | not null | nextval('users_id_seq'::regclass)
 name      | character varying(255)   | not null |
 email     | character varying(255)   | not null |
 password  | character varying(255)   | not null |
 avatar    | character varying(1000)  |          |
 admin     | boolean                  | not null | false
 deletedAt | timestamp with time zone |          |</pre>

### Criar um usuário comum
Utilizando uma API Client enviamos uma requisição POST na URL *localhost:3005/register* contendo name, email, password e confirmPassword no formato JSON. Mesmo que o campo admin seja passado e preenchido como true, o usuário será criado como comum.

### Logar como usuário comum ou administrador.
Enviamos uma requisição do tipo POST na url *localhost:3005/login* contendo email e password no formato JSON. Se a requisição for bem sucedida é retornado um payload para o frontend contendo o token de autenticação, pra acessar as URLs de usuário logado devemos copiar este token, criar um cabeçalho chamado Authorization e colocar como valor "bearer **token**" sem aspas. Por padrão o token expira em 7 horas. 

### Alterar o próprio usuário
Já com o cabeçalho Authorization criado e preenchido com um token válido enviamos uma requisição do tipo PUT na URL /home contendo pelo menos name, email, password e confirmPassword. O campo avatar é opcional. Aqui o campo admin é ignorado, um usuário comum não consegue se alterar para administrador.

### Consultar todos os usuários cadastrados e criar usuário pela área logada
Caso o usuário esteja logado como administrador ele tem acesso a URL */users* essa URL aceita as seguintes requisições:
- GET: Retorna todos os usuários na forma de um array de objetos no formato JSON.
- POST: Cria um usuário podendo inclusive ser um usuário administrador.

### Consultar, alterar e excluir um usuário
Caso o usuário esteja logado como administrador ele tem acesso a URL /users/:id, onde *:id* é o ID de um usuário cadastrado. Essa URL aceita as seguintes requisições:
- GET: Retorna o usuário no formato JSON.
- PUT: Altera o usuário inclusive podendo fazer ser administrador.
- DELETE: Faz um soft delete do usuário preenchendo a coluna *deletedAt* com a data da exclusão e assim sendo ignorado em todas as consultas. OBS: Na versão atual ainda não é possível recuperar um usuário deletado.

## Tecnologias
As seguintes ferramentas foram usadas na construção do projeto:
- VS Code
- Postman
- Javascript
- Node.js
- Express
- SQL/Knex/Postgresql
- JSON Web Token

## Autor
Feito por Bruno Borges Gontijo, entre em contato.

[<img src="https://img.shields.io/badge/linkedin-%230077B5.svg?&style=for-the-badge&logo=linkedin&logoColor=white" />](https://www.linkedin.com/in/bruno2077/) [<img src="https://img.shields.io/badge/Microsoft_Outlook-0078D4?style=for-the-badge&logo=microsoft-outlook&logoColor=white "/>](mailto:assembleia23@hotmail.com)

## Licença
MIT © [Bruno Borges Gontijo](https://bruno2077.github.io)

