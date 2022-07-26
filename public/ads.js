if(!window.alreadyIncluded) {/** Check if file is already loaded **/
    var t = 0;
    /******** Main Function That Will Generate All Ads *********/
    var divList = document.getElementsByClassName("adsbynetwork");
    for (var i = divList.length - 1; i >= 0; i--)
    {
        t++;
        var rf				=	document.referrer;
        var lh				=	window.location.host;
        var slot			=	divList[i].getAttribute("data-ad-slot");
        var client			=	divList[i].getAttribute("data-ad-client");
        var data_keyword	=	divList[i].getAttribute("data-keyword");
        var width			=	divList[i].offsetWidth;
        var height			=	divList[i].offsetHeight;
        var	meta			=	document.getElementsByTagName('meta');
        var description 	= 	"";
        var keywords 		= 	"";
    
        if ( data_keyword ) {
            st	=	data_keyword;
        } else {
            /*** GET TAGS ***/
        if ( document.getElementsByTagName("title").length > 0 ) {
            var title = document.getElementsByTagName("title")[0].innerHTML.replace(/ /g, ',');
        } else {
            var title = "";
        }
    
        for (var x=0,y=meta.length; x<y; x++) {
          if (meta[x].name == "description") { description = meta[x]; }
          if (meta[x].name == "keywords") { keywords = meta[x]; }
        }
    
        var st		=	title + "," + description + "," + keywords;
        var st		=	st.replace("(", "").replace(")", "");
    }
        let URL = "http://localhost:1000/ad/generate";
        divList[i].innerHTML = ( '<iframe id="ad_iframe_' + t + '" name="ad_iframe_' + t + '" width="'+ width +'" height="'+ height +'" frameborder="0" marginwidth="0" marginheight="0" vspace="0" hspace="0" allowtransparency="true" scrolling="no" src="' + URL + '?s=' + slot + '&c=' + client + '&st=' + st + '&rf=' + rf + '&lh=' + lh + '&ct=' + t + '"></iframe>' );
    }
    /******** End Main Function That Will Generate All Ads *********/
    window.alreadyIncluded = true;
    } /*** End check if file is already loaded ***/