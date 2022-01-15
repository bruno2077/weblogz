<div align="center">
    <img src="https://i.ibb.co/PzW2by6/logotry-light-v2.png" style="max-width: 400px;"alt="WEBLOGZ">
</div>

<div align="center">

  <a href="https://bruno2077.github.io/">
    <img alt="Made by Bruno2077" src="https://img.shields.io/badge/Feito%20por-Bruno2077-blueviolet">
  </a>

  <img alt="GitHub language count" src="https://img.shields.io/github/languages/count/bruno2077/weblogz.svg">

  <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/bruno2077/weblogz.svg">
  
  <img alt="Repository size" src="https://img.shields.io/github/repo-size/bruno2077/weblogz.svg">
  
  <a href="https://github.com/bruno2077/weblogz/commits/main">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/bruno2077/weblogz.svg">
  </a>

  <a href="https://github.com/bruno2077/weblogz/issues">
    <img alt="Repository issues" src="https://img.shields.io/github/issues/bruno2077/weblogz.svg">
  </a>

  <img alt="License MIT" src="https://img.shields.io/github/license/bruno2077/weblogz.svg">
</div>
<hr>

**Status do Projeto: Finalizado.**

## Descrição
Weblogz é um blog multi autor com cadastro de usuários, artigos e categorias de artigos. O projeto foi desenvolvido com Node, Express e PostgreSQL no back-end e React.js no Front-end.

## Comentários
Este foi um puta primeiro projeto de javascript/React.js, englobou tanto conhecimento front-end quanto back-end. Foram meses mas o projeto foi até o fim. Foram muitos conhecimentos adquiridos o projeto abrangeu cadastros, autenticação, permissões, rotas, componentização, e o mais importante a vivência de um projeto relativamente grande do início ao fim.

O objetivo inicialmente era fazer um CRUD de usuários para aprender React e frizar tudo que já tinha sido estudado acerca de Javascript back-end, HTML e CSS mas a coisa cresceu, o que era pra ser um CRUD virou um blog multi autor completo, uma aplicação completa. Foi uma aula de desenvolvimento web fazer o Weblogz, foi um só projeto mas dezenas e dezenas de desafios, e hoje todos concluídos.

## Pré Requisitos
Pra instalar todas as dependências, lidar com o banco de dados e executar o servidor back-end é necessário ter o Node.js(v14.17.6), o npm (6.14.15) e o Postgresql (13.3) instalados na máquina as versões entre parêntesis foram as utilizadas no projeto. O servidor back-end roda na porta 3005. Para instalar e rodar o front-end também é necessário o Node.js e o npm. O front-end roda na porta 3000.

## Instalação
O repositório pode ser baixado com o [zip](https://github.com/bruno2077/weblogz/archive/refs/heads/main.zip) do repositório, com o [Github desktop](https://desktop.github.com/) ou com o [Git](https://git-scm.com).

### Back-end
1. A primeira coisa a fazer é criar um novo banco de dados no Postgresql;
2. De dentro da pasta do repositório abra o arquivo *./backend/env_file* e preencha **authSecret** com uma senha qualquer. Preencha também os atributos de **db** com o nome do banco de dados criado, o usuário e senha. Salve e feche o arquivo.
3. Renomeie então o arquivo *env_file* para *.env*

Agora é só instalar e executar a aplicação. No terminal:
```bash
# abra o diretório do backend da aplicação
$ cd backend
# Instale as dependencias
$ npm i
# execute o backend na porta 3000
$ npm start
```

### Front-end
Abra outro terminal no diretório do repositório:
```bash
# abra o diretório do frontend da aplicação
$ cd frontend
# Instale as dependencias
$ npm i
# Execute o frontend na porta 3005
$ npm start
```

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

Supondo que o nome do banco de dados criado seja *weblogz* um usuário poderia ser criado no Postgresql com o comando:
```sql
INSERT INTO weblogz(name, email, password, admin) VALUES (super, super@y.br, 1234, true);
```

Criado um usuário administrador no back-end já podemos logar com ele no front-end e ter acesso a toda a aplicação. O usuário administrador pode criar "CRUDar" usuários, artigos e categorias de artigos, pode inclusive deletar a si próprio mas é recomendado sempre ter ao menos um usuário administrador caso contrário só pelo SGBD será possível criar um usuário administrador. Pela URL pública de cadastro de usuários só são criados usuários comuns.

Um usuário só pode ser removido se este não tiver nenhum artigo cadastrado (publicado ou não), é necessário remover os seus artigos para excluí-lo. Categorias de artigos também só podem ser excluídas se não tiver nenhum artigo cadastrado nela. Os artigos podem mudar de categoria mas não podem mudar de autor. 

Usuários não cadastrados tem acesso somente leitura a todos os artigos publicados. Qualquer usuário cadastrado pode criar um artigo, mas somente o autor de um artigo ou um usuário administrador podem editá-lo.


## Screenshots (clique para ver mais)


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