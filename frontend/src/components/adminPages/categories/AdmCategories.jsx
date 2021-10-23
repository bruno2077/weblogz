// Página de administração das categorias

export default function Categories(props) {
    if(props.mainContent.get) // Garante que não carrega Main e Aside enquanto nas páginas administrativas.
        props.mainContent.set(false)

    
    return <div>Categorias em construção</div>
}