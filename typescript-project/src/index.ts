
function init(){

	const table = document.getElementById("data-table");

	table.innerHTML += `
		<tr>
			<td>Document Hash Query:</td>
			<td>${document.location.hash}</td>
		</tr>
	`;

	/*table.innerHTML += `
		<tr>
			<td>Local storage test:</td>
			<td>${localStorage.getItem("ls-test")}</td>
		</tr>
	`;*/
}

init();
