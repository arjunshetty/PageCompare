window.setTimeout(
	function(){
		var win = window.open(chrome.extension.getURL("../html/popup.html"),"UrlValidator","width=810,height=650");
		win.focus();
	}, 300
);
