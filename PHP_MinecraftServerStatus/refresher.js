var httpObject = getHTTPObject();
var UrlListI = 0;
var UtlListAttay = new Array();

function getHTTPObject()
{
	if(window.activeXObject)
	{
		return new activeXObject('mircosoft.HTTPXML');
	}else if(window.XMLHttpRequest){
		return new XMLHttpRequest();
	}else{
		alert("Your webbrowser doesn't support AJAX. Try Firefox!");
	}
}

function setOutPut()
{
	if(httpObject.readyState == 4)
	{
		var txt = httpObject.responseText; 
		
		var turn = txt.match(/\[turnAjax\](.*?)\[\/turnAjax\]/);
		if(turn != null)
		{
			ajaxMove = 1;
		}else{
			ajaxMove = 0;
		}
		
		var exit = txt.match(/\[leaveAjax\](.*?)\[\/leaveAjax\]/);
		if(exit != null)
		{
			window.location.href = exit[1];
		}else{
			var destination = txt.match(/\[ajax\](.*?)\[\/ajax\]/);
			txt = txt.replace(/\[ajax\](.*?)\[\/ajax\]/,"")
			document.getElementById(destination[1]).innerHTML = txt;
			UrlListI += 1;
			phpUpdate(UtlListAttay[UrlListI]);
		}
	}
}

function phpUpdate(url)
{
	//alert(url);
	if(httpObject != null)
	{
		httpObject.open('GET',url,true);
		httpObject.send(null);
		httpObject.onreadystatechange = setOutPut;
	}
}

function phpUpdateMulti(urls)
{
	UrlListI = 0;
	UtlListAttay = urls.split("|");
	phpUpdate(UtlListAttay[0]);
}