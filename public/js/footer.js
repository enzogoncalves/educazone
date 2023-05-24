function footer() {
	const footer = document.createElement('footer')

	footer.innerHTML = `
		<ul class="footer-list">
			<a href="#">Perguntas Frequentes</a>
			<a href="#">Professores</a>
			<a href="#">Atendimento ao cliente</a>
			<a href="#">Acessar Dashboard</a>
		</ul>
		<div>
			<p>Todos os direitos reservados © a Enzo Mateus e Ulisses Duo</p>
			<a href="#termos">Termos de Serviço</a>
			|
			<a href="#política">Política de Privacidade</a>
		</div>
	`

	const body = document.querySelector('body')
	body.appendChild(footer)
}

footer()