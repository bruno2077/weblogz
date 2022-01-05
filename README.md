# Weblogz
**Status do Projeto: Em construção.**

## Descrição
Weblogz é um blog multi autor com cadastro de usuários, artigos e categorias de artigos. No momento todas as funcionalidades estão prontas faltando apenas finalizar a parte visual (HTML/CSS/Bootstrap). O projeto está sendo desenvolvido com Node e Express no back-end e React.js no Front-end.

## Pré Requisitos
Pra instalar todas as dependências, lidar com o banco de dados e executar o servidor back-end é necessário ter o Node.js(v14.17.6), o npm(6.14.15) e o Postgresql (13.3) instalados na máquina as versões entre parêntesis foram as utilizadas no projeto. O servidor roda na porta 3005. Para instalar e rodar o front-end é necessário o Node.js e o npm. O front-end roda na porta 3000.

## Instalação
### Back-end
Instalada todas as dependências e utilizando o SGBD Postgresql, para rodar o servidor basta seguir os passos abaixo mas com outros SGBDs como MySQL algumas alterações devem ser necessárias.

Para rodar o servidor:
1- Crie um banco de dados no Postgresql
2- Preencha o arquivo env_file com uma senha qualquer em authSecret, o nome do banco de dados criado, e o usuário e senha para acessá-lo
3- Renomeie o arquivo env_file para .env
4- Pronto. No terminal dentro de /backend execute o comando *npm start* pra executar o servidor.

### Front-end
Com o Node.js e o npm instalados na máquina basta executar um 'npm install' no console/terminal que todas as dependências serão instaladas.

## Como usar
Inicialmente, no back-end devemos criar um usuário administrador diretamente no Postgresql pois pelo nosso servidor somente um usuário administrador tem permissão para criar um usuário administrador. O esquema do usuário é o seguinte:

<pre> Coluna    |           Tipo           | Nullable |            Valor padrão
-----------+--------------------------+-----------+----------+--------------------------
 id        | integer                  | not null | nextval('users_id_seq'::regclass)
 name      | character varying(255)   | not null |
 email     | character varying(255)   | not null |
 password  | character varying(255)   | not null |
 avatar    | character varying(1000)  |          |
 admin     | boolean                  | not null | false
 deletedAt | timestamp with time zone |          |</pre>

Criado um usuário administrador no back-end já podemos logar com ele no front-end e ter acesso a toda a aplicação. O usuário administrador pode criar outros usuários administradores ou não, alterar seu próprio usuário, excluir qualquer usuário inclusive a si próprio mas é recomendado sempre ter ao menos um usuário administrador caso contrário só pelo SGBD será possível criar um usuário administrador. Pela URL pública de cadastro só são criados usuários comuns.

Usuários administradores também tem acesso a página de administração de usuários, artigos e categorias de artigos, onde todos estes dados são listados. Administradores podem alterar, criar, e excluir qualquer usuário, artigo ou categoria de artigo mas uma categoria de artigo só pode ser removida se esta não contém nenhum artigo nela. Artigos podem ser modificados, excluídos ou despublicados mas a autoria do artigo é sempre do usuário que o criou. Um usuário também só pode ser removido se não tem nenhum artigo em seu nome.

Usuários não cadastrados tem acesso somente leitura a todos os artigos publicados. Usuários comuns cadastrados além de terem acesso a todos os artigos publicados têm também a página /perfil onde eles podem editar seu próprio cadastro e ver, editar e excluir os artigos de sua autoria publicados ou não. Os artigos são ou não publicados no momento da criação onde podem serem salvos como rascunho ou salvos como já publicado.


## Screenshots
<h4>Introdução</h4>
<a href="./screenshots/introduction.gif"><img alt="Introdução" width="400" src="./screenshots/introduction.gif"></a>

<h4>Perfil de usuário</h4>
<a href="./screenshots/profile.gif"><img alt="Perfil" width="400" src="./screenshots/profile.gif"></a>

<h4>CRUD de usuário</h4>
<a href="./screenshots/crud.gif"><img alt="CRUD de usuário" width="400" src="./screenshots/crud.gif"></a>

## Tecnologias
As seguintes ferramentas foram usadas na construção do projeto:
- VS Code
- Postman
- Node.js e npm
- Javascript, HTML e CSS
- Express
- SQL/Knex/Postgresql
- JSON Web Token
- React.js
- React Draft Wysiwyg
- React Router
- Bootstrap

## Autor
Desenvolvido por Bruno Borges Gontijo, entre em contato.

[<img src="https://img.shields.io/badge/linkedin-%230077B5.svg?&style=for-the-badge&logo=linkedin&logoColor=white" />](https://www.linkedin.com/in/bruno2077/) [<img src="https://img.shields.io/badge/Microsoft_Outlook-0078D4?style=for-the-badge&logo=microsoft-outlook&logoColor=white "/>](mailto:assembleia23@hotmail.com)

## Licença
MIT © [Bruno Borges Gontijo](https://bruno2077.github.io)