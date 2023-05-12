const toggle = document.querySelector(".toggle")

toggle.addEventListener("click", e => {
	document.querySelector("header nav ul").classList.toggle("active")
})
