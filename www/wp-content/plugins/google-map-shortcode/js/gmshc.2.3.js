/**
 * Google Map Shortcode 
 * Version: 2.3
 * Author: Alain Gonzalez
 * Plugin URI: http://web-argument.com/google-map-shortcode-wordpress-plugin/
*/
     
var gmshc = {};

(function(){
	
gmshc.Config = {
	
	markers : {},	
	zoom : 10,	
	type : "ROADMAP",
	circle : false,
	interval : 4000,
	afterTilesLoadedCallback : null,
	focusPoint : null,
	focusType : "open", //center
	animateMarkers : true,
	afterCircle : null
			
};

gmshc.Map = function(settings){
	
	this.settings = gmshc.Merge(settings,gmshc.config);
	this.mapID = this.settings.mapID;		
	this.markers = this.settings.markers;
	this.mapContainer = document.getElementById(settings.mapContainer);	
	this.map = null;
	this.markersObj = [];
	this.infowindowObj = [];
	this.intervalId = null;
	this.openItem = 0;
	this.openWindow = null;
	this.pointsNumber = this.markers.length;
	this.userInfoWindowOpen = false;
	this.disableMap = false;
	this.statusCallback = null;
	this.center = settings.center.split(','); 
};

gmshc.MapProto = {

    init : function() {

		var firstLat = this.markers[0].lat;
		var firstLong = this.markers[0].lng;
		
		var lat = this.center[0]; 
	  var lng = this.center[1];
		
		var firstLatLng = new google.maps.LatLng(lat, lng);
		
		//var firstLatLng = new google.maps.LatLng(firstLat, firstLong);
			
		this.map = new google.maps.Map(this.mapContainer, {
		  zoom: this.settings.zoom,
		  //center: firstLatLng,
		  mapTypeId: google.maps.MapTypeId[this.settings.type]
		});
		
		var map = this.map;
		var avgLat = 0;
		var avgLng = 0;
		
		for (var i = 0; i < this.pointsNumber; i++){		
	   
			var location = this.markers[i];
			var animate = (this.settings.animateMarkers)? google.maps.Animation.DROP : null;	 
			var marker = new google.maps.Marker({
												  position: new google.maps.LatLng(location.lat, location.lng),
												  map: map,
												  icon: new google.maps.MarkerImage(location.icon),
												  animation: animate,
												  title:location.address
												 });
			  
			  marker.cat = location.cat;
			  marker.id = i;
			  this.markersObj.push(marker);
	
			  var infowindow = new google.maps.InfoWindow({
														  maxWidth:340,
														  content: location.info
														  });
			  this.infowindowObj.push(marker);	
																												
			  var closure_1 = this.Bind(this.OpenInfoWindow(infowindow, marker));		
			  google.maps.event.addListener(marker, 'click', closure_1);
			  
			  var closure_3 = this.Bind(this.MarkerMouseOverHandler(marker));
			  google.maps.event.addListener(marker, 'mouseover', closure_3);
			  
			  var closure_5 = this.Bind(this.MarkerMouseOutHandler(marker));
			  google.maps.event.addListener(marker, 'mouseout', closure_5);
			  
			  var closure_6 = this.Bind(this.MapMouseOverHandler());
			  google.maps.event.addListener(map,'mouseover',closure_6);
			  
			  var closure_7 = this.Bind(this.MapMouseOutHandler());
			  google.maps.event.addListener(map,'mouseout',closure_7);		  		  
			  
			  // Sum up all lat/lng to calculate center all points.
			  avgLat += Number(location.lat);
			  avgLng += Number(location.lng);
		}  
	
		// Center map.
		
		this.map.setCenter(new google.maps.LatLng(lat, lng));
		
		//this.map.setCenter(new google.maps.LatLng(
			//avgLat / this.pointsNumber, avgLng / this.pointsNumber));
		
		if(this.settings.circle)  this.Play();
		if(this.settings.focusPoint != null) {
			if (this.settings.focusType == "center") this.Center(this.settings.focusPoint);			
			else this.Open(this.settings.focusPoint);		
		}
		
	},
	
	OpenInfoWindow : function(infoWindow, marker) {
		  return function() {
			this.StopAllAnimations();		  
			if (this.openWindow != null) {
				this.openWindow.close();
				this.userInfoWindowOpen = false;
			}	
			this.openWindow = infoWindow;		  		
			infoWindow.open(this.map, marker);
			var closure_4 = this.Bind(this.CloseInfoWindow(infoWindow));
			google.maps.event.addListener(infoWindow, 'closeclick', closure_4);
			this.userInfoWindowOpen = true;
			this.UpdateStatus('OPEN',marker.id);
		};
	},
	
	CloseInfoWindow : function(infoWindow) {
	  return function() {
		 this.UpdateStatus('CLOSED');	
		 this.userInfoWindowOpen = false;
		 if (this.settings.focusType == "center"){
		 	this.disableMap = false;
	  	 }
	  }
	},
	
	Rotate : function(){
		var visibles = this.Visibles();
		if (!visibles) {
			return;
		}
		if (this.disableMap) return;
		if (this.openItem >= this.markersObj.length || this.openItem < 0 ) this.openItem = 0;		
		if (this.markersObj[this.openItem].getVisible()){
            this.Focus(this.openItem);
			this.openItem ++;							
		} else {
			this.openItem ++;
			this.Rotate();
		}
			
		return;
	},
	
	Focus :function(point){
		if (typeof point == "undefined") {
			this.openItem = point;	
		} else {
			this.openItem = point;
		}
		if (this.settings.focusType == "center"){
			if (this.userInfoWindowOpen) return;
			this.Center(point);
		} else {
			google.maps.event.trigger(this.markersObj[point],'click');
		}			
	},
	
	Visibles : function(){
		for (var i = 0; i < this.markersObj.length; i++){
			if (this.markersObj[i].getVisible()) return true;	    
		} 
	},
	
	ToggleAnimation : function(marker,type) {
		marker.setAnimation(google.maps.Animation[type]);
	},
	
	StopAllAnimations : function(){
		for (var i = 0; i < this.markersObj.length; i++){
			this.markersObj[i].setAnimation(null);		
		} 	
	},
	
	Play : function(){
		if (!this.settings.circle) this.settings.circle = true;		
		if ( this.pointsNumber > 1 ) {
			this.UpdateStatus('PLAY');	
			var closure_2 = this.Bind(this.Rotate);
			this.intervalId = setInterval(closure_2, this.settings.interval);
		} else {
			this.Open(0);
		}
	},
	
	Stop : function(){
		if (this.settings.circle) this.settings.circle = false;
		this.StopAllAnimations();
		clearInterval(this.intervalId);
		this.UpdateStatus('STOPED');
	},
	
	Open : function(point){
		if (this.disableMap) return;
		if (this.markersObj[point].getVisible()){
			google.maps.event.trigger(this.markersObj[point],'click');
			this.UpdateStatus('OPEN',point);
		}
	},
	
	Center : function(point){
		//if (this.disableMap) return;
		this.UpdateStatus('CENTER',point);
		if (this.markersObj[point].getVisible()) {
				if(this.openWindow != null) this.openWindow.close();
				var location = this.markers[point];
				this.map.setCenter(new google.maps.LatLng(location.lat, location.lng));
				if (this.settings.animateMarkers) {
					this.StopAllAnimations();
					this.ToggleAnimation(this.markersObj[point],"BOUNCE");
				}			
		}
	},
	
	ShowMarkers : function(cat,display){
		if(this.openWindow != null) this.openWindow.close();
		for (var i = 0; i < this.pointsNumber; i++){
			var catList = this.markersObj[i].cat;
			var catArray = catList.split(",");
			for (var j = 0; j < catArray.length; j++){
				if (Number(catArray[j]) == cat) 
					this.markersObj[i].setVisible(display);
			}
		}
	},
	
	MarkerMouseOverHandler : function(marker) {
	  return function() {
		  if (marker.getAnimation() != null) {
			marker.setAnimation(null);
			this.UpdateStatus('MARKER-MOUSEOVER');
		  }
	  }
	},
	
	MarkerMouseOutHandler : function(marker) {
	  return function() {
		this.UpdateStatus('MARKER-MOUSEOUT');
	  }
	},
	
	
	MapMouseOverHandler : function(){
		return function(){	
			this.disableMap = true;
			this.UpdateStatus('MAP-MOUSEOVER');
		}
	},
	
	MapMouseOutHandler : function(){
		return function(){	
			this.disableMap = false;
			this.UpdateStatus('MAP-MOUSEOUT');
		}
	},
	
	Bind : function( Method ){
		var _this = this; 
		return(
			 function(){
			 return( Method.apply( _this, arguments ) );
			 }
		);
	},
	
	UpdateStatus : function(st){
		
		var id = arguments[1];		
		if (this.statusCallback != null){			
			this.statusCallback(this.mapID,st,id);
		}
		
	}
};


gmshc.Merge = function(r, s, ov) {
	var z;

	for (z in s) {

		if (typeof s[z] == "object") {
			if (!r.hasOwnProperty(z)) { 
				r[z] = {};				
			}
			r[z] = SSO.Merge(r[z], s[z], true);
		}

		if ((!r.hasOwnProperty(z)) || (r.hasOwnProperty(z) && ov)) {
			r[z] = s[z];
		}
	}
	return r;
};

gmshc.addLoadEvent = function(func) {
	var oldonload = window.onload;
	if (typeof window.onload != 'function') {
		window.onload = func;
		}
		else {
		window.onload = function() {
		oldonload();
		func();
		}
	}
};

gmshc.Map.prototype = gmshc.MapProto;

})();