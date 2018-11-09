(function() {
	"use strict";

	var options = {
		padding: 0,
		reset: true,
		radius: 'natural',
		position: 'center',
		trigger: window,
		snooze: 5000,
		width: 16,
		height: 20
	};

	var positions = {
		top: 90,
		bottom: -90,
		left: 180,
		right: 0,
		topRight: 45,
		topLeft: 135,
		bottomRight: -45,
		bottomLeft: -135
	};

	function css(el,property) {
		var value = getComputedStyle(el)[property];
		if (["width","height","top","left","borderLeft","borderRight","borderTop","borderBottom"].indexOf(property)!==-1) return parseInt(value,10);
		return value;
	}

	function addStyles() {
		if (document.getElementById("xeyes")) return;
		var rules = '.watchin {' +
				'	display: inline-block;' +
				'	padding-top: 16px;' +
				'	background:url(/img/derpface.svg) no-repeat top center;' +
				'	background-size: 100%;' +
				'	width: 48px;' +
				'	height: 60px;' +
				'}' +
				'.watchin .eyeball {' +
				'	width: ' + options.width + 'px;' +
				'	height: ' + options.height + 'px;' +
				'	border-radius: 50px 40px;' +
				'	background-color: rgba(255,255,255,.1);' +
				'	display: inline-block;' +
				'	border: 1px solid rgba(0,0,0,0.05);' +
				'	transition: borderColor .2s ease, background-color .2s ease;' +
				'	margin-right: 2px;' +
				'}' +
				'.watchin .eyeball.open {' +
				'	border-color: rgba(0,0,0,.25);' +
				'	background-color: rgba(255,255,255,.6);' +
				'	transition: borderColor 2s ease, background-color 1s ease;' +
				'}' +
				'.watchin .eyeball .iris {' +
				'	width: 4px;' +
				'	height: 4px;' +
				'	background: #000;' +
				'	border-radius: 4px;' +
				'	opacity: 0;' +
				'	transform: translate(-0.5px, -4px);' +
				'	transition: opacity .6s ease, transform .5s ease;' +
				'}' +
				'.watchin .eyeball.open .iris {' +
				'	transform: translate(0,0);' +
				'	opacity: 1;' +
				'	transition: all 0s linear;' +
				'}';
		var css = document.createElement("style");
		css.textContent = rules;
		css.type = "text/css";
		css.id = "xeyes";
		document.head.appendChild(css);
	}

	// function Lid(eye) {

	// 	this.h = eye.height;
	// 	this.open = true;
	// 	this.$eye = eye.$eye;

	// 	var $lid = document.createElement("div");
	// 	$lid.classList.add("lid","open");

	// 	$lid.style.position = "absolute";
	// 	$lid.style.opacity = 0;
	// 	$lid.style.backgroundColor = css(this.$eye,"borderColor");
	// 	$lid.style.borderRadius = css(this.$eye,"borderRadius");
	// 	$lid.style.border = "1px solid transparent";
	// 	$lid.style.height = 0 + 'px';
	// 	$lid.style.width = eye.width + 'px';
	// 	this.$eye.appendChild($lid);
	// 	this.$lid = $lid;
	// }
	// Lid.prototype.wake = function() {
	// 	this.$lid.style.height = 0 + 'px';
	// 	this.$lid.style.opacity = 0;
	// 	this.$lid.classList.add("open");
	// 	this.open = true;
	// }
	// Lid.prototype.snooze = function() {
	// 	this.$lid.style.height = this.h + 'px';
	// 	this.$lid.style.opacity = 1;
	// 	this.$lid.classList.remove("open");
	// 	this.open = false;
	// }

	function Iris($iris) {
		this.$iris = $iris;
		$iris.style.position = 'absolute';

		this.width  = $iris.offsetWidth;
		this.height = $iris.offsetHeight;

		this.resetOffset = function() {
			var rect = $iris.getBoundingClientRect();
			this.offset = {
				x: rect.left + document.body.scrollLeft + (this.width / 2) - css($iris, "left"),
				y: rect.top + document.body.scrollTop + (this.height / 2) - css($iris, "top")
			};
		};
	}

	function Eye($eye, $iris) {
		addStyles(); // only needs it if an eye exists ...

		this.$eye = $eye;

		$eye.style.position = 'relative';

		this.width  = css($eye, "width") - css($eye, "borderLeft") - css($eye, "borderRight");
		this.height = css($eye, "height") - css($eye, "borderTop") - css($eye, "borderBottom");

		this.iris   = new Iris($iris);
		this.open = true;
		// this.lid	= new Lid(this);

		this.pos = {
			x: (this.width - this.iris.width) / 2,
			y: (this.height - this.iris.height) / 2
		};

		$iris.style.left = this.pos.x + "px";
		$iris.style.top = this.pos.y + "px";

		this.padding = 0;
	}

	Eye.prototype.follow = function(mouse) {
		mouse.x = mouse.x - this.pos.x;
		mouse.y = mouse.y - this.pos.y;

		this.iris.resetOffset();

		if (!this.$eye.classList.contains("open")) this.$eye.classList.add("open");
		if (this.moving) clearTimeout(this.moving);
		this.moving = setTimeout(function (context) {
			context.$eye.classList.remove("open");
		}, options.snooze, this);

		var degree = Math.atan(( mouse.y - this.iris.offset.y) / ( mouse.x - this.iris.offset.x)),
		direction = (this.iris.offset.x > mouse.x) ? -1 : 1,
		newX = Math.cos(degree) * ((this.width - this.iris.width) / 2 - this.padding) * direction,
		newY = Math.sin(degree) * ((this.height - this.iris.height) / 2 - this.padding) * direction,
		radius = Math.sqrt(Math.pow(newX, 2) + Math.pow(newY, 2)),
		distance = Math.sqrt(Math.pow(mouse.y - this.iris.offset.y, 2) + Math.pow(mouse.x - this.iris.offset.x, 2));
		if (radius > distance) {
			this.iris.$iris.style.left = (mouse.x - this.iris.offset.x + this.pos.x) + "px";
			this.iris.$iris.style.top = (mouse.y - this.iris.offset.y + this.pos.y) + "px";
		} else {
			this.iris.$iris.style.left = this.pos.x + newX + "px";
			this.iris.$iris.style.top = this.pos.y + newY + "px";
		}
	};

	Eye.prototype.setPosition = function(position) {
		if (position.x !== undefined && position.y !== undefined) {
			this.iris.$iris.style.left = this.pos.x - position.x + "px";
			this.iris.$iris.style.top = this.pos.y - position.y + "px";
		} else if (typeof position === "number") {
			var deg = position * Math.PI / -180;
			this.iris.$iris.style.left = this.pos.x + Math.cos(deg) * (this.width / 2 - this.iris.width / 2 - this.padding) + "px";
			this.iris.$iris.style.top = this.pos.y + Math.sin(deg) * (this.height / 2 - this.iris.height / 2 - this.padding) + "px";
		} else if (position === "center") {
			this.iris.$iris.style.left = this.pos.x + "px";
			this.iris.$iris.style.top = this.pos.y + "px";
		} else if (positions[position] !== undefined) {
			var deg2 = positions[position] * Math.PI / -180;
			this.iris.$iris.style.left = this.pos.x + Math.cos(deg2) * (this.width / 2 - this.iris.width / 2 - this.padding) + "px";
			this.iris.$iris.style.top = this.pos.y + Math.sin(deg2) * (this.height / 2 - this.iris.height / 2 - this.padding) + "px";
		}
	};

	window.addEventListener("DOMContentLoaded", function () {
		[].forEach.call(document.querySelectorAll(".iris"), function (el) {
			var $iris = el,
				$eye = el.parentElement;
			var eye = new Eye($eye, $iris),
				iris = eye.iris;
			$eye.style.padding = options.padding;
			if (options.radius == 'circular' && eye.width > eye.height) {
				eye.width = eye.height;
			} else if (options.radius == 'circular') {
				eye.height = eye.width;
			}
			eye.setPosition(options.position);
			options.trigger.addEventListener("mousemove", function (event) {
				eye.follow({x: event.pageX, y: event.pageY});
			}, false);

			if (options.reset) {
				options.trigger.addEventListener("mouseleave", function(event) {
					eye.setPosition(options.position);
				});
			}

		});
	}, false);
})();