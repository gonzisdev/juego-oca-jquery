// Una vez se carge el documento empezará la ejecución
$(document).ready(function () {
    // Añadimos un evento click al botón de play qpara poder iniciar el audio
	$("#play").click(function () {
		$("audio")[0].play();
	});

    // Añadimos la funcionalidad de poder parar el audio y lo reiniciamos a 0 ya que no existe el método .stop()
	$("#stop").click(function () {
		$("audio")[0].pause(); 
		$("audio")[0].currentTime = 0; 
	});

    // Ocultamos los controles del juego y la información sobre el juego al inicio
	$("#jugadores, #fichas, #lanzar, #reset, #tirada, #turno").hide();
	let jugadores = []; // Inicializamos el array de jugadores como un array vacío
	let turnoActual = 0; // Creamos el contador de turnos y lo iniciamos en 0

    // Una vez le demos click al botón de iniciar mostraremos los personajes y su selección y el botón de reset
	// Ocutamos el botón de iniciar
	$("#iniciar").click(function () {
		$("#jugadores, #reset").show();
		$("#iniciar").hide();
	});

    // Configuramos la partida según el número de jugadores que se seleccionen
	$("select").change(function () {
		let numJugadores = $(this).val(); // Sacamos el número de jugadores del select
		$("#fichas, #escoge").show(); // Mostramos las fichas y el mensaje para escoger fichas
		$("#tablero").css({
			opacity: 0.3, // Cambiamos la opacidad a la imagen del tablero para destacar la fichas durante la selección de personajes
		});
		
		for (let i = 0; i < numJugadores; i++) {
			jugadores.push({ numero: i + 1, ficha: "", casilla: 1 }); // Añadimos los jugadores a su array con su número, su ficha y casilla de inicio
		};
	});

    // Funcionalidad del botón de reseteo
	$("#reset").click(function () {
		$("#jugadores, #fichas, #lanzar, #reset, #tirada, #turno").hide(); // Oculta todo a su estado inicial
		$("#iniciar").show(); // Y mostramos el botón de iniciar
		$("select").val($("select option:first").val()); // Reseteamos el selector de número de jugadores

    // Quitamos la clase seleccionada de las imágenes de fichas que coinciden con la ficha del jugador
		jugadores.forEach(function (jugador) {
			$(`#fichas img[src='${jugador.ficha}']`).removeClass("seleccionada");
			// Eliminamos el texto de los elementos hermanos con clase ficha-numero de las imágenes de fichas,
    		// para quitar los números de las fichas de cada jugador
			$(`#fichas img[src='${jugador.ficha}']`)
				.siblings(".ficha-numero") 
				.text("");
		});

		jugadores = []; // Reiniciamos el array de jugadores
		turnoActual = 0; // Reiniciamos el contador de turnos

		// Limpiamos el div resultado y eliminamos la tabla 
		$("#resultado").html("");
		$("#tirada").text("Resultado de la tirada: ");
		$("#turno").text("Turno del jugador: ");

		// Reiniciamos la opacidad de la imagen del tablero
		$("#tablero").css({
			opacity: 1,
		});

		// Colocamos el contenedor de las fichas en su estado inicial y usamos .show() para volver a mostrar
		// las fichas que no fueron seleccionadas en la partida previa
		$(".ficha-container")
			.css({
				position: "relative",
				left: "",
				top: "",
			})
			.show();
	});

    // Funcionalidad de selección de jugadores
	$(".ficha").click(function () {
		let fichaSeleccionada = $(this).attr("src"); // Conseguimos el src de la ficha seleccionada
		let fichaYaSeleccionada = jugadores.some(
			(jugador) => jugador.ficha === fichaSeleccionada // Si un jugador ya tiene esa ficha signada es que es una ficha seleccionada
		);

        // Si una ficha ya ha sido escogida mostramos una alerta si se intenta escoger de nuevo y paramos la ejecución
		if (fichaYaSeleccionada) {
			alert("Esta ficha ya ha sido seleccionada. Por favor, elige otra ficha.");
			return;
		};

        // Asignamos las fichas en orden (se añaden al primer jugador que este sin ficha)
		for (let i = 0; i < jugadores.length; i++) {
			if (jugadores[i].ficha === "") {
				jugadores[i].ficha = fichaSeleccionada;
				$(this).siblings(".ficha-numero").text(`${jugadores[i].numero}`);
				$(this).addClass("seleccionada");
				break;
			};
		};

        // Comprobamos que todos tengan ficha
		let todosTienenFicha = jugadores.every((jugador) => jugador.ficha !== "");
		if (todosTienenFicha) {
			$("#lanzar, #tirada, #turno").show(); // Si todos tienen ficha, mostramos el botón de lanzar y la info de la partida
			$("#turno").text(`Turno del jugador: 1`); // Establecemos el texto del turno al primer jugador 
			colocarFichasEnSalida(); // Llamamos a esta función para colocar las fichas en la casilla de salida

            // Ocultamos las fichas no seleccionadas
			$(".ficha")
				.not(".seleccionada")
				.each(function () {
					$(this).parent().hide();
				});
			$("#jugadores, #escoge").hide(); // Ocultamos la selección de jugadores y el mensaje de escoger personajes
			$("#tablero").css({
				opacity: 1, // Restablecemos la opacidad del tablero
			});
		};
	});

    // Funcionalidad de lanzar el dado y mover ficha
	$("#lanzar").click(function () {
		let resultadoDado = Math.floor(Math.random() * 6) + 1; // Generamos un número aleatorio entre 1 y 6
		moverFicha(resultadoDado); // Llamamos al a función de mover ficha y le pasamos el resultado del dado

		// Actualizamos la información del turno y el resultado de la tirada
		$("#tirada").text(`Resultado de la tirada: ${resultadoDado}`);
		$("#turno").text(`Turno del jugador: ${jugadores[turnoActual].numero}`);
	});

    // Función para colocar las fichas en la casilla de salida
	function colocarFichasEnSalida() {
		const coordsSalida = [82, 580, 225, 714]; // Coordenadas del area 1 del mapa
		const centroX = (coordsSalida[0] + coordsSalida[2]) / 2; // Centro del eje X
		const centroY = (coordsSalida[1] + coordsSalida[3]) / 2; // Centro del eje Y

		const offsetFicha = 50; // Establecemos el offset con el tamaño de las fichas

		// Con el offset intentamos que las fichas no se solapen del todo unas a otras en la casilla de salida
		// ya que la casilla es bastante grande
		jugadores.forEach((jugador, index) => { 
			const nuevoX =
				centroX - (jugadores.length * offsetFicha) / 2 + offsetFicha * index;

			$(`#fichas img[src='${jugador.ficha}']`)
				.parent()
				.css({
					position: "absolute",
					left: `${nuevoX}px`,
					top: `${centroY}px`,
				});
		});

		$("#lanzar, #info").show(); // Mostramos los controles de lanzamiento y la información del juego
	};

    // Función para mover la ficha de un jugador
	function moverFicha(casillas) {
		let jugador = jugadores[turnoActual];
		jugador.casilla += casillas; // Actualizamos la casilla del jugador en el array de jugadores según el resultado del dado

		// Si el jugador llega a la casilla final mostramos los resultados llamando a la función para mostrarlos
		if (jugador.casilla >= 60) {
			jugador.casilla = 60;
			mostrarResultados();
			return;
		};

        // Obtenemos las coordenadas de la nueva casilla buscando por el id de su area correspondiente
		// en el mapa de la imagen y movemos la ficha
		const nuevaCasilla = $(`area[id="${jugador.casilla}"]`)
			.attr("coords")
			.split(",")
			.map(Number);
		const centroX = (nuevaCasilla[0] + nuevaCasilla[2]) / 2;
		const centroY = (nuevaCasilla[1] + nuevaCasilla[3]) / 2;

		$(`#fichas img[src='${jugador.ficha}']`)
			.parent()
			.css({
				left: `${centroX - 28}px`, // Centramos la ficha lo que podemos al centro de las casillas
				top: `${centroY - 27}px`,
			});

        // Pasamos el turno al siguiente jugador
		turnoActual = (turnoActual + 1) % jugadores.length;
		$("#turno").text(`Turno del jugador: ${jugadores[turnoActual].numero}`);
	};

    // Función para mostrar los resultados 
	function mostrarResultados() {
		let jugadoresOrdenados = [...jugadores].sort( // Con el spread operator y el método sort ordenamos de menos a más el ranking
			(a, b) => b.casilla - a.casilla
		);
		let resultadosHTML =
			"<table><tr><th>Posición</th><th>Jugador</th><th>Casilla</th></tr>"; // Inyectamos parte de la tabla

		jugadoresOrdenados.forEach((jugador, index) => { // Concatenamos el resto de la tabla con los resultados
			resultadosHTML += `<tr><td>${index + 1}</td><td>Jugador ${
				jugador.numero
			}</td><td>${jugador.casilla}</td></tr>`;
		});

		resultadosHTML += "</table>"; // Cerramos la tabla
		$("#resultado").html(
			resultadosHTML +
				`<p>¡Enhorabuena Jugador ${jugadoresOrdenados[0].numero}! ¡Has ganado!</p>` // Añadimos párrafo de felicitación al ganador
		);

		const casillaGanador = $(`area[id="60"]`) // Establecemos el centro de la casilla final
			.attr("coords")
			.split(",")
			.map(Number);
		const centroXGanador = (casillaGanador[0] + casillaGanador[2]) / 2;
		const centroYGanador = (casillaGanador[1] + casillaGanador[3]) / 2;

		$(`#fichas img[src='${jugadoresOrdenados[0].ficha}']`) // Colocamos al ganador en el centro de la casilla final
			.parent()
			.css({
				left: `${centroXGanador - 27}px`,
				top: `${centroYGanador - 25}px`,
			});
		$("#tablero").css({ // Le quitamos opacidad a la imagen del tablero para resaltar la tabla de resultados y el párrafo de felicitación
			opacity: 0.3,
		});

		$("#lanzar").hide(); // Ocultamos el botón de lanzar el dado
	};
});
