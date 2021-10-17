// Página de administração dos artigos

export default function Articles(props) {
    if(props.mainContent.get) // Garante que não carrega Main e Aside enquanto nas páginas administrativas.
        props.mainContent.set(false)
    return <div>Artigos em construção</div>
}