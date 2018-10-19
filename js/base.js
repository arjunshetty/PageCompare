function receiveMessage( event ){
	event.source.postMessage( 'data', event.origin );
}
function onLoadSpeedGage() {
	var t_loadEnd = performance.timing.loadEventEnd - performance.timing.navigationStart;

	if( t_loadEnd < 0 ){
		delayLoad();
		return;
	}

    //additions to capture resource timing info

    var resources = [];
 
		if (window.performance && window.performance.getEntriesByType !== undefined) {
               resources = window.performance.getEntriesByType("resource");
			} else if (window.performance && window.performance.webkitGetEntriesByType !== undefined) {
               resources = window.performance.webkitGetEntriesByType("resource");
            } else {
               return;
		}

       // For each "resource", display its *Size property values
		for (var i=0; i < resources.length; i++) {

    		if ("decodedBodySize" in resources[i]){
      			var decodeBodySize = resources[i].decodedBodySize;
     		}
  
    		if ("encodedBodySize" in resources[i]){
      			var encodedBodySize = resources[i].encodedBodySize;
     		}
  
    		if ("transferSize" in resources[i]){
      			var transferSize =  resources[i].transferSize;
    		}
 		}



	var t_domStart = performance.timing.domLoading - performance.timing.navigationStart;
	var t_domEnd = performance.timing.domComplete - performance.timing.navigationStart;
	var ttfb = performance.timing.responseStart - performance.timing.navigationStart;
	var connectTime = performance.timing.connectEnd - performance.timing.navigationStart;
	var fullyLoaded = performance.timing.loadEventEnd - performance.timing.navigationStart;
	var requestStart = performance.timing.requestStart - performance.timing.navigationStart;
	var winProtocol = location.protocol;
	window.speedGaugueObj = {
		"ttfb"			: ttfb,
		"t_domEnd"		: t_domEnd,
		"t_loadEnd"		: t_loadEnd,
		"t_domStart"	: t_domStart,
		"connectTime"	: connectTime,
		"fullyLoaded"	: fullyLoaded,
		"requestStart"  : requestStart,
		"transferSize"  : transferSize,
		"winProtocol"	: winProtocol
	};
	window.opener.postMessage( JSON.stringify( speedGaugueObj ), "*" );
}
function delayLoad(){
	setTimeout( onLoadSpeedGage, 500 );
}
window.addEventListener( 'message', receiveMessage, false);
if( window.opener ){
	$( document ).on( 'ready', delayLoad );
}
