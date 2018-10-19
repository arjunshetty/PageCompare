// To get all these menus to work, there are a few differences between Firefox and Chrome Extensions
// The GetDocument function needs to be used.  One could potentionally determine if Firefox or Chrome was being used

chrome.contextMenus.create({
	id: 'speed',
	title: "Speed",
	contexts: ["all"]
});
chrome.contextMenus.create({
	id: 'PerformanceEvaluator',
    parentId: 'speed',
    title: "Performance Evaluator -diffUI",
    contexts: ["all"],
    onclick: function( info, tab ){
		window.setTimeout(
			function(){
				var win = window.open( chrome.extension.getURL( '../html/popup.html' ),'UrlValidator','width=810,height=650' );
				win.resizeTo( 810, 650 ).focus();
			}, 300
		);
    }
});
chrome.contextMenus.create({
    id: 'PerformanceEvaluatorOneClick',
    parentId: 'speed',
    title: "Performance Evaluator - current page",
    contexts: ["all"],
    onclick: function( info, tab ){
		window.setTimeout(
			function(){
				var win = window.open( chrome.extension.getURL( '../html/popup.html?_oneClick=' + tab.id + '&_option=0'), 'UrlValidator', 'width=810,height=650' );
				win.resizeTo( 810, 650 ).focus();
			}, 300
		);
    }
});
/*
chrome.contextMenus.create({
    id: 'PerformanceEvaluatorOneClickWithComparison',
    parentId: 'speed',
    title: "Performance Evaluator - current page with baseline comparison",
    contexts: ["all"],
    onclick: function( info, tab ){
		window.setTimeout(
			function(){
				var win = window.open( chrome.extension.getURL( '../html/popup.html?_oneClick=' + tab.id + '&_option=1'), 'UrlValidator', 'width=810,height=650' );
				win.resizeTo( 810, 650 ).focus();
			}, 300
		);
    }
});
*/
