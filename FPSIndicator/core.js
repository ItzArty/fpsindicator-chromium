const $n = ( name, appendTo, additionalProps, innerHTML ) => {

	const element = document.createElement( name );

	if( typeof appendTo == "object" ) appendTo.appendChild( element );
	if( typeof appendTo == "string" ) document.querySelector( appendTo ).appendChild( element );

	if( typeof additionalProps == "object" ) {

		for( const i in additionalProps ) {

			element.setAttribute( i, additionalProps[ i ] );

		}
		
	}

	if( innerHTML ) element.innerHTML = innerHTML;

	return element;

}

const formatMs = ( ms ) => {

	let seconds = 0;
	let minutes = 0;

	if( ms / 1000 >= 1 ) {

		let add = Math.floor( ms / 1000 );

		seconds += add;

		ms = ms - ( 1000 * add );

	}

	if( seconds / 60 >= 1 ) {

		let add = Math.floor( seconds / 60 );

		minutes += add;

		seconds = seconds - ( 60 * add );

	}

	if( minutes / 60 >= 1 ) {

		let add = Math.floor( minutes / 60 );

		hours += add;

		minutes = minutes - ( 60 * add );

	}

	let formatted = "";

	if( minutes > 0 ) {

		formatted += minutes + ":";

	}

	if( seconds > 0 ) {

		formatted += seconds + ":" + Math.round( ms );

	} else {

		formatted += ms.toFixed( 2 );

	}

	return formatted;

}

let enabled = false;
let details = false;
let frames = 0;
let fps = 0;
let fpsCaptures = 0;
let averageFps = 0;
let highestFPS = 0;
let lowestFPS = Infinity;
let FTCaptures = 0;
let averageFT = 0;
let highestFT = 0;
let lowestFT = Infinity;
const fpsHistory = [ ];

let elementCollection = { };

elementCollection.container = $n( "FPSIndicator", document.body );

chrome.storage.local.get( [ "positions" ], ( data ) => {

	if( typeof data.positions[ document.location.hostname ] == "object" ) {

		elementCollection.container.style.top = data.positions[ document.location.hostname ].y + "px";
		elementCollection.container.style.left = data.positions[ document.location.hostname ].x + "px";

	}

} );

elementCollection.dragOverlay = $n( "dragOverlay", elementCollection.container, { }, "<img src=\"" + chrome.runtime.getURL( "FPSIndicator/drag.png" ) + "\" />" );
elementCollection.overview = $n( "div", elementCollection.container, { class: "overview" } );
elementCollection.currentFPS = $n( "span", elementCollection.overview );
elementCollection.currentFPSText = $n( "ht", elementCollection.currentFPS, { }, "-" );
$n( "text", elementCollection.currentFPS, { }, "FPS" );

elementCollection.detailed = $n( "div", elementCollection.container, { class: "detailed" } );

elementCollection.FPSStats = $n( "stats", elementCollection.detailed );
elementCollection.FTStats = $n( "stats", elementCollection.detailed );

elementCollection.highestFPS = $n( "div", elementCollection.FPSStats );
elementCollection.highestFPSText = $n( "ht", elementCollection.highestFPS, { class: "fps" }, "-" );
$n( "text", elementCollection.highestFPS, { }, "H. FPS" );

elementCollection.averageFPS = $n( "div", elementCollection.FPSStats );
elementCollection.averageFPSText = $n( "ht", elementCollection.averageFPS, { class: "fps" }, "-" );
$n( "text", elementCollection.averageFPS, { }, "A. FPS" );

elementCollection.lowestFPS = $n( "div", elementCollection.FPSStats );
elementCollection.lowestFPSText = $n( "ht", elementCollection.lowestFPS, { class: "fps" }, "-" );
$n( "text", elementCollection.lowestFPS, { }, "L. FPS" );

elementCollection.lowestFT = $n( "div", elementCollection.FTStats );
elementCollection.lowestFTText = $n( "ht", elementCollection.lowestFT, { class: "ft" }, "-" );
$n( "text", elementCollection.lowestFT, { }, "L. FT" );

elementCollection.averageFT = $n( "div", elementCollection.FTStats );
elementCollection.averageFTText = $n( "ht", elementCollection.averageFT, { class: "ft" }, "-" );
$n( "text", elementCollection.averageFT, { }, "A. FT" );

elementCollection.highestFT = $n( "div", elementCollection.FTStats );
elementCollection.highestFTText = $n( "ht", elementCollection.highestFT, { class: "ft" }, "-" );
$n( "text", elementCollection.highestFT, { }, "H. FT" );

elementCollection.canvas = $n( "canvas", elementCollection.overview );

const canvas = elementCollection.canvas;
const context = canvas.getContext( "2d" );

context.strokeStyle = "#FFFFFF";
context.lineWidth = 2;

let prev = performance.now( );

const loop = ( ) => {

	let now = performance.now( );

	let delta = now - prev;

	FTCaptures++;

	averageFT = ( averageFT + delta ) / 2;

	if( delta < lowestFT ) lowestFT = delta;
	if( delta > highestFT ) highestFT = delta;

	frames++;

	if( enabled ) requestAnimationFrame( loop );

	prev = now;

}

loop( );

setInterval( ( ) => {

	fps = frames;

	elementCollection.currentFPSText.innerText = fps;

	fpsHistory.push( fps );

	if( fpsHistory.length > 60 ) fpsHistory.shift( );

	frames = 0;

	fpsCaptures++;

	averageFps = ( averageFps + fps ) / 2;

	elementCollection.averageFPSText.innerText = Math.round( averageFps );

	if( highestFPS < fps ) {

		highestFPS = fps;

		elementCollection.highestFPSText.innerText = highestFPS;

	}

	if( lowestFPS > fps ) {

		lowestFPS = fps;

		elementCollection.lowestFPSText.innerText = lowestFPS;

	}

	elementCollection.lowestFTText.innerText = formatMs( lowestFT );
	elementCollection.highestFTText.innerText = formatMs( highestFT );
	elementCollection.averageFTText.innerText = formatMs( averageFT );

	const fpsMax = Math.max( ...fpsHistory );
	const fpsMin = Math.min( ...fpsHistory );

	context.clearRect( 0, 0, canvas.width, canvas.height );
	context.beginPath( );

	fpsHistory.slice( ).reverse( ).forEach( ( hfps, index ) => {

		context.lineTo( ( canvas.width / 60 ) * ( index * 1.5 ), - ( ( hfps / fpsMax ) * canvas.height ) + canvas.height );

	} );

	context.stroke( );

}, 1000 );

const toggleIndicator = ( ) => {

	enabled = !enabled;

	prev = performance.now( );

	if( enabled ) {

		elementCollection.container.classList.add( "active" );

		loop( );

	} else {

		elementCollection.container.classList.remove( "active" );

	}

}

elementCollection.container.ondblclick = ( ) => {

	details = !details;

	if( details ) {

		elementCollection.detailed.classList.add( "active" );

	} else {

		elementCollection.detailed.classList.remove( "active" );

	}

}

let ctrlDown = false;
let shiftDown = false;

document.addEventListener( "keydown", ( e ) => {

	if( e.key == "Control" ) {

		ctrlDown = true;

		elementCollection.dragOverlay.classList.add( "active" );

	}

	if( e.key == "Shift" ) shiftDown = true;

	if( ctrlDown && shiftDown && e.which == 70 ) {

		toggleIndicator( );

	}

} );

document.addEventListener( "keyup", ( e ) => {

	if( e.key == "Control" ) {

		ctrlDown = false;

		elementCollection.dragOverlay.classList.remove( "active" );

	}

	if( e.key == "Shift" ) shiftDown = false;

} );

let dragX1 = 0;
let dragX2 = 0;
let dragY1 = 0;
let dragY2 = 0;

let dragFunction;

elementCollection.dragOverlay.onmousedown = ( e ) => {

	e.preventDefault( );

	dragX2 = e.clientX;
	dragY2 = e.clientY;

	dragFunction = ( e ) => {

		e.preventDefault( );

		dragX1 = dragX2 - e.clientX;
		dragY1 = dragY2 - e.clientY;

		dragX2 = e.clientX;
		dragY2 = e.clientY;

		let cY = elementCollection.container.offsetTop - dragY1;
		let cX = elementCollection.container.offsetLeft - dragX1;

		if( cY + elementCollection.container.scrollHeight < window.innerHeight && cY > 0 ) elementCollection.container.style.top = cY + "px";
		if( cX + elementCollection.container.scrollWidth < window.innerWidth && cX > 0 ) elementCollection.container.style.left = cX + "px";

	}

	document.addEventListener( "mousemove", ( e ) => dragFunction( e ) );

	document.addEventListener( "mouseup", ( e ) => {

		dragFunction = ( ) => { }

		chrome.storage.local.get( "positions", ( data ) => {

			if( typeof data.positions != "object" ) data.positions = { };

			data.positions[ document.location.hostname ] = {

				x: elementCollection.container.offsetLeft,
				y: elementCollection.container.offsetTop

			}

			chrome.storage.local.set( { positions: data.positions }, ( ) => {

				// Saved.

			} );

		} );

	} );

}

chrome.runtime.onMessage.addListener( ( request, sender, callback ) => {

	switch( request.message ) {

		case "toggle":

			toggleIndicator( );

			break;

	}

} );
