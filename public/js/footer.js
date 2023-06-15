function footer() {
	const footer = document.createElement("footer")

	footer.innerHTML = `
			<p>Todos os direitos reservados © a Enzo Mateus e Ulisses Duo</p>
			<a href="#termos">Termos de Serviço</a>
			|
			<a href="#política">Política de Privacidade</a>
	`

	const body = document.querySelector("body")
	body.appendChild(footer)
}

footer()
