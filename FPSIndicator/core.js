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

let enabled = false;
let details = false;
let frames = 0;
let fps = 0;
let fpsCaptures = 0;
let averageFps = 0;
let highestFPS = 0;
let lowestFPS = Infinity;
const fpsHistory = [ ];

let elementCollection = { };

elementCollection.container = $n( "FPSIndicator", document.body );
elementCollection.dragOverlay = $n( "dragOverlay", elementCollection.container, { }, "<img src=\"" + chrome.runtime.getURL( "FPSIndicator/drag.png" ) + "\" />" );
elementCollection.overview = $n( "div", elementCollection.container, { class: "overview" } );
elementCollection.currentFPS = $n( "span", elementCollection.overview );
elementCollection.currentFPSText = $n( "ht", elementCollection.currentFPS, { }, "-" );
$n( "text", elementCollection.currentFPS, { }, "FPS" );

elementCollection.detailed = $n( "div", elementCollection.container, { class: "detailed" } );

elementCollection.highestFPS = $n( "div", elementCollection.detailed );
elementCollection.highestFPSText = $n( "ht", elementCollection.highestFPS, { }, "-" );
$n( "text", elementCollection.highestFPS, { }, "HIGH" );

elementCollection.averageFPS = $n( "div", elementCollection.detailed );
elementCollection.averageFPSText = $n( "ht", elementCollection.averageFPS, { }, "-" );
$n( "text", elementCollection.averageFPS, { }, "AVG" );

elementCollection.lowestFPS = $n( "div", elementCollection.detailed );
elementCollection.lowestFPSText = $n( "ht", elementCollection.lowestFPS, { }, "-" );
$n( "text", elementCollection.lowestFPS, { }, "LOW" );

elementCollection.canvas = $n( "canvas", elementCollection.overview );

const canvas = elementCollection.canvas;
const context = canvas.getContext( "2d" );

context.strokeStyle = "#FFFFFF";
context.lineWidth = 2;

const loop = ( ) => {

	frames++;

	if( enabled ) requestAnimationFrame( loop );

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

		elementCollection.container.style.top = ( elementCollection.container.offsetTop - dragY1 ) + "px";
		elementCollection.container.style.left = ( elementCollection.container.offsetLeft - dragX1 ) + "px";

	}

	document.addEventListener( "mousemove", ( e ) => dragFunction( e ) );

	document.addEventListener( "mouseup", ( e ) => {

		dragFunction = ( ) => { };

	} );

}