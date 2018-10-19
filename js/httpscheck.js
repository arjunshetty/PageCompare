// unique url to detect tab id
var http_url1, HSTS_response_holder;
// helper objects
var inspectWinObjHTTPS, inspectWinObjHTTP, inspectTabId, SpeeGagueHTTPSObj, SpeeGagueHTTPObj, headersReceived, beforeRequest;
// set focus on textbox
$( '#http_url1_submit_text' ).focus();
// capture keypress and submit form on enter/return
$( '#http_url1_submit_text,#http_url2_submit_text' ).keypress(
	function( e ){
		if( e.which === 13 ){
			pre_init();
		}
	}
);


// capture click on button and submit form
$( '#url_submit' ).click( pre_init );
// validate url
function pre_init(){
	http_url1 = $( '#http_url1_submit_text' ).val();
	var http_url2 = $( '#http_url2_submit_text' ).val();
	if( valid_url( http_url1 ) ){
		accessible_url( http_url2 );
	} else {
		show_error( 'Ooops! HTTPS URL didn\'t validate .. you know what to do ;)' );
	}
}
// show error
function show_error( error_text ){
	$( '#invalidUrl' ).html( error_text ).addClass( 'oops' );
	window.setTimeout(
		function(){
			$( '#invalidUrl' ).removeClass( 'oops' );
		}, 5000
	);
}
// capture click to enable reload/re-test
$( '#reset_form' ).click(
	function(){
		window.resizeTo( 810, 650 );
		if( window.location.search.substring( 1 ) ){
			window.location = window.location.origin + '\\' + window.location.pathname;
		} else {
			window.location.reload();
		}
	}
);
// check if URL is accessible
function accessible_url( http_url2 ){
	$.ajax(
		{
			url : http_url1,
			success : proceed_validation,
			error :	stop_validation
		}
	);
	function proceed_validation( data, textStatus, request ){
		$( '#base_page' ).hide();
		$( '#report_page' ).show();
		init( http_url2 );
	}
	function stop_validation(){
		show_error( 'HTTPS URL not reachable' );
	}
}
// open main window (/requested URL)
function init( http_url2 ){
	speed_measurements( http_url2 );
	https_check();
}
// method to check if submitted url is valid
function valid_url( url ){
	if( url.trim().length < 10 ){
		return false;
	}
	var a = document.createElement( 'a' );
	a.href = url;
	if( ( a.protocol === 'https:' ) || ( a.protocol === 'http:' ) || !/^(?:[a-zA-Z]{1,}\.)?[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test( a.hostname ) ){
		return true;
	}
	return false;
}

// check web requests
var before_headers = function( details ) {
	details.responseHeaders.forEach( function( responseObj ){
    });


};

var before_request = function( details ){
	if( typeof inspectTabId === 'undefined' && ( details.url === http_url1 || details.url === http_url1 + '/' ) ){
		inspectTabId = details.tabId;
	}
	if( inspectTabId === details.tabId ){
		var parser = document.createElement( 'a' );
		parser.href = details.url;
		if( parser.protocol=='https:' || parser.protocol=='http:' ){
			switch( before_request.counter ){
				case 0:
					before_request.first_log_url = parser.href;
					break;
				case 1:
					before_request.second_log_url = parser.href;
					break;
				case 2:
					if( before_request.first_log_url === before_request.second_log_url &&
						before_request.second_log_url === parser.href ){
						terminate();
						return;
					}
			}
			if( parser.protocol=='http:' ){
				before_request.s_string = before_request.s_string.replace( before_request.p_string, before_request.f_string );
				https_passed = false;
			} else {
				before_request.s_string = before_request.s_string.replace( before_request.f_string, before_request.p_string );
			}
			$( '#network_log_table tr:last' ).after( '<tr><td>'+(++before_request.counter)+') </td><td class="nw_status_icon">'+before_request.s_string+'</td><td title="' + parser.href + '">' + parser.href + '</td></tr>' );
		}
		if( !https_passed ){
			$( '#https_check_div' ).html( '<div class="https_status_div"> <img src="../images/HTTPSFailed.png" height="100px" /><br><p>HTTPS Validation Failed</p></div>' );
		}
	}
};
var https_passed;
function https_check(){
	before_request.counter = 0;
	before_request.first_log_url = '';
	before_request.second_log_url = '';
	before_request.f_string = 'failed';
	before_request.p_string = 'passed';
	before_request.s_string = '<img src="../images/' + before_request.f_string + '.png" width="10px" />';
	https_passed = true;
	$( '#https_check_div' ).html( '<div class="https_status_div"> <img src="../images/HTTPSPassed.jpg" height="100px" /><br><p>HTTPS Requests Validated</p></div>' );
	chrome.webRequest.onHeadersReceived.addListener(
		before_headers,
		{
			urls: [ http_url1 ]
		},
		[ 'responseHeaders' ]
	);
	chrome.webRequest.onBeforeRequest.addListener(
		before_request,
		{
			urls: [ "<all_urls>" ]
		}
	);
	inspectWinObjHTTPS = window.open( http_url1, "ebay-HTTPSValidator","width=400,height=650,left=810" );
}
// display speed metrics
function speed_measurements( http_url2 ){
	function receiveMessage( event ){
		if( typeof SpeeGagueHTTPSObj === "undefined" ){
			SpeeGagueHTTPSObj = JSON.parse( event.data );
			show_https_stats();
			if( valid_url( http_url2 ) ){
				compare_with_http( http_url2 );
			} else {
				comparison_na();
			}
			if( $( '#show_curl' )[ 0 ].checked ){
				//show_services_log( 0 );
			}
		} else if( typeof SpeeGagueHTTPObj === "undefined" ) {
			SpeeGagueHTTPObj = JSON.parse( event.data );
			show_http_stats();
		}
	}
	window.addEventListener( 'message', receiveMessage, false );
}


// show https metrics
function show_https_stats(){
	inspectWinObjHTTPS.close();
	$( '#speed_data_table tr:last' ).after( '<tr><td></td><th>Feature</th></tr>' );
	$( '#speed_data_table tr:last' ).after( '<tr><td class="speed_lable">TCP Connect time</td><td>'+SpeeGagueHTTPSObj.connectTime+'ms</td></tr>' );
	//$( '#speed_data_table tr:last' ).after( '<tr><td class="speed_lable">Request Start</td><td>'+SpeeGagueHTTPSObj.requestStart+'ms</td></tr>' );
	$( '#speed_data_table tr:last' ).after( '<tr><td class="speed_lable">Time to first byte</td><td>'+SpeeGagueHTTPSObj.ttfb+'ms</td></tr>' );
	$( '#speed_data_table tr:last' ).after( '<tr><td class="speed_lable">DOM Start</td><td>'+SpeeGagueHTTPSObj.t_domStart+'ms</td></tr>' );
	$( '#speed_data_table tr:last' ).after( '<tr><td class="speed_lable">DOM Complete</td><td>'+SpeeGagueHTTPSObj.t_domEnd+'ms</td></tr>' );
	$( '#speed_data_table tr:last' ).after( '<tr><td class="speed_lable">Load Complete</td><td>'+SpeeGagueHTTPSObj.t_loadEnd+'ms</td></tr>' );
	$( '#speed_data_table tr:last' ).after( '<tr><td class="speed_lable">Transfer Size </td><td>'+SpeeGagueHTTPSObj.transferSize+'bytes</td></tr>' );

	
	


//	update_protocol( SpeeGagueHTTPSObj.winProtocol );

}
// show http metrics and comparison
function show_http_stats(){
	inspectWinObjHTTP.close();
	var ttfb		= SpeeGagueHTTPSObj.ttfb - SpeeGagueHTTPObj.ttfb,
		t_domEnd	= SpeeGagueHTTPSObj.t_domEnd - SpeeGagueHTTPObj.t_domEnd,
		t_loadEnd	= SpeeGagueHTTPSObj.t_loadEnd - SpeeGagueHTTPObj.t_loadEnd,
		t_domStart	= SpeeGagueHTTPSObj.t_domStart - SpeeGagueHTTPObj.t_domStart,
		connectTime	= SpeeGagueHTTPSObj.connectTime - SpeeGagueHTTPObj.connectTime;
		transferSize = SpeeGagueHTTPSObj.transferSize - SpeeGagueHTTPObj.transferSize;


	ttfb		= ttfb > 0 ? [ ttfb, 'degradation_red' ] : [ ttfb * -1, 'degradation_green' ];
	t_domEnd	= t_domEnd > 0 ? [ t_domEnd, 'degradation_red' ] : [ t_domEnd * -1, 'degradation_green' ];
	t_loadEnd	= t_loadEnd > 0 ? [ t_loadEnd, 'degradation_red' ] : [ t_loadEnd * -1, 'degradation_green' ];
	t_domStart	= t_domStart > 0 ? [ t_domStart, 'degradation_red' ] : [ t_domStart * -1, 'degradation_green' ];
	connectTime	= connectTime > 0 ? [ connectTime, 'degradation_red' ] : [ connectTime * -1, 'degradation_green' ];
	transferSize = transferSize > 0 ? [ transferSize, 'degradation_red' ] : [ transferSize * -1, 'degradation_green' ];
	$( '#HTTP_comparison_table tr:last' ).after( '<tr><td></td><th>Baseline</th><th class="degradation_comp">Comparison</th></tr>' );
	$( '#HTTP_comparison_table tr:last' ).after( '<tr><td class="speed_lable">TCP Connect time</td><td>' + SpeeGagueHTTPObj.connectTime + 'ms</td><td class="degradation_comp '+ connectTime[ 1 ] +'">' + connectTime[ 0 ] + 'ms</td></tr>' );
	$( '#HTTP_comparison_table tr:last' ).after( '<tr><td class="speed_lable">Time to first byte</td><td>' + SpeeGagueHTTPObj.ttfb + 'ms</td><td class="degradation_comp '+ ttfb[ 1 ] +'">' + ttfb[ 0 ] + 'ms</td></tr>' );
	$( '#HTTP_comparison_table tr:last' ).after( '<tr><td class="speed_lable">DOM Start</td><td>' + SpeeGagueHTTPObj.t_domStart + 'ms</td><td class="degradation_comp '+ t_domStart[ 1 ] +'">' + t_domStart[ 0 ] + 'ms</td></tr>' );
	$( '#HTTP_comparison_table tr:last' ).after( '<tr><td class="speed_lable">DOM Complete</td><td>' + SpeeGagueHTTPObj.t_domEnd + 'ms</td><td class="degradation_comp '+ t_domEnd[ 1 ] +'">' + t_domEnd[ 0 ] + 'ms</td></tr>' );
	$( '#HTTP_comparison_table tr:last' ).after( '<tr><td class="speed_lable">Load Complete</td><td>' + SpeeGagueHTTPObj.t_loadEnd + 'ms</td><td class="degradation_comp '+ t_loadEnd[ 1 ] +'">' + t_loadEnd[ 0 ] + 'ms</td></tr>' );
	$( '#HTTP_comparison_table tr:last' ).after( '<tr><td class="speed_lable">Transfer Size </td><td>'+SpeeGagueHTTPObj.transferSize+'bytes</td><td class="degradation_comp '+ transferSize[ 1 ] +'">' + transferSize[ 0 ] + 'bytes</td></tr>' );

	enable_refresh();
}
// show refresh button
function enable_refresh(){
	chrome.webRequest.onHeadersReceived.removeListener( before_headers );
	chrome.webRequest.onBeforeRequest.removeListener( before_request );
	$( '#reset_form' ).addClass( 'oops' );
}
// open http URL for comparison
function compare_with_http( http_url2 ){
	inspectWinObjHTTP = window.open( http_url2, "Url-Validator","width=400,height=650,left=810" );
	$.ajax(
		{
			url: http_url2,
			error: comparison_na
		}
	);
}
// terminate execution when page is not reachable
function terminate(){
	inspectWinObjHTTPS.close();
	alert( 'Something went wrong, please try again.' );
	$( '#reset_form' ).click();
}
// ignore comparison when not applicable
function comparison_na(){
	if( typeof inspectWinObjHTTP !== "undefined" ){
		inspectWinObjHTTP.close();
	}
	$( '#HTTP_comparison_div' ).html( '<div class="HTTP_comparison_div"> <img src="../images/na.png" height="140" width="140" /><br><p></p></div>' );
	enable_refresh();
}
function check_one_click(){
	var get_url_parameter = decodeURIComponent( window.location.search.substring( 1 ) );
	if( get_url_parameter != '' ) {
		get_url_parameter = get_url_parameter.split( '=' );
		if( get_url_parameter[ 0 ] == '_oneClick' ) {
			chrome.tabs.get( get_url_parameter[ 1 ].split( '&' )[ 0 ] * 1, submit_opener_url );
			function submit_opener_url( openerTab ){
				$( '#http_url1_submit_text' ).val( openerTab.url );
				var _option = get_url_parameter[ 2 ];
				if( _option == '1' || _option == '3' ){
					var href_url = document.createElement( 'a' );
					href_url.href = openerTab.url;
					href_url.protocol = 'http:';
					$( '#http_url2_submit_text' ).val( href_url.href );
				}
				if( _option == '2' || _option == '3' ){
					$( '#show_curl' ).prop( 'checked', true );
				}
				pre_init();
			}
		}
	}
}
$( window ).on( 'load', check_one_click );
