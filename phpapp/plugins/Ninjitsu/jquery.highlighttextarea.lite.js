/*!
 * jQuery highlightTextarea
 * Copyright 2014 Damien "Mistic" Sorel (http://www.strangeplanet.fr)
 * Licensed under MIT (http://opensource.org/licenses/MIT)
 * hijacked by tim so that it only works on { and }
 */

(function($){
    "use strict";

    // Highlighter CLASS DEFINITON
    // ===============================
    var Highlighter = function($el, options) {
        // global variables
        //this.settings = $.extend({}, Highlighter.DEFAULTS);
        this.scrollbarWidth = Utilities.getScrollbarWidth();
        this.active = false;

        // build HTML
        this.$el = $el;

        this.$el.wrap('<div class=highlightTextarea></div>');
        this.$main = this.$el.parent();

        this.$main.prepend('<div class=container><div class=highlighter></div></div>');
        this.$container = this.$main.children().first();
        this.$highlighter = this.$container.children();

        //this.setOptions(options);

        // set id
        //if (this.settings.id) {
        //    this.$main[0].id = this.settings.id;
        //}

        // run
        this.updateCss();
        this.bindEvents();
        this.highlight();
    };

    Highlighter.DEFAULTS = {
    	/*
        words: {},
        color: '#eee', // rgba(255,255,0,.2), //'#ffff00',
        */
        id: ''
    };

    // PUBLIC METHODS
    // ===============================
    /*
     * Refresh highlight
     */
    Highlighter.prototype.highlight = function() {
        var text = Utilities.htmlEntities(this.$el.val()),
            that = this;
        // regexp? can't on nested elements. indexOf: more accurate, pita. This way: fast
        text = text.replace(/\{/g,"<mark>{").replace(/\}/g,"}</mark>");
        text = text.replace(/\|/g,"<mark class='pipe'>|</mark>");
/*            
		do {
			var l = file.lastIndexOf("{"), r = file.indexOf("}", l),
				bs = file.substring(0,l), as = file.substring(r+1),
				s = file.substring(l,r+1);
			if (s.length) {
        

        $.each(this.settings.words, function(color, words) {
        	color = 'rgba(0,0,0,.2)';
            text = text.replace(
                new RegExp('('+ words.join('|') +')', that.regParam),
                '<mark style="background-color:'+ color +';">$1</mark>'
            );
        });
*/
        this.$highlighter.html(text);
        this.updateSizePosition();
    };

    /*
     * Change highlighted words
     * @param words {mixed}
    Highlighter.prototype.setWords = function(words) {
        this.setOptions({ words: words });
    };
     */

    /*
     * Enable highlight and events
     */
    Highlighter.prototype.enable = function() {
        this.bindEvents();
        this.highlight();
    };

    /*
     * Disable highlight and events
     */
    Highlighter.prototype.disable = function() {
        this.unbindEvents();
        this.$highlighter.empty();
    };

    /*
     * Remove the plugin
     */
    Highlighter.prototype.destroy = function() {
        this.disable();

        Utilities.cloneCss(this.$container, this.$el, [
            'background-image','background-color','background-position','background-repeat',
            'background-origin','background-clip','background-size','background-attachment'
        ]);

        this.$main.replaceWith(this.$el);

        this.$el.removeData('highlighter');
    };

    // PRIVATE METHODS
    // ===============================
    /*
     * Change options
     * @param options {object}
    Highlighter.prototype.setOptions = function(options) {
        if (typeof options != 'object' || $.isEmptyObject(options)) {
            return;
        }

        //$.extend(this.settings, options);
        //this.regParam = 'gim';

//       if (!$.isEmptyObject(this.settings.words)) {
//            this.settings.words = Utilities.cleanWords(this.settings.words, this.settings.color);
//        }
        if (this.active) {
        	this.highlight();
        }
    };
*/
    /*
     * Attach event listeners
     */
    Highlighter.prototype.bindEvents = function() {
        if (this.active) {
            return;
        }
        this.active = true;

        var that = this;

        // prevent positioning errors by always focusing the textarea
        this.$highlighter.on({
            'this.highlighter': function() {
                that.$el.focus();
            }
        });

        // add triggers to textarea
        this.$el.on({
            'input.highlighter': Utilities.throttle(function() {
                this.highlight();
            }, 100, this),

            'resize.highlighter': Utilities.throttle(function() {
                this.updateSizePosition(true);
            }, 50, this),

            'scroll.highlighter select.highlighter': Utilities.throttle(function() {
                this.updateSizePosition();
            }, 50, this)
        });

    };

    /*
     * Detach event listeners
     */
    Highlighter.prototype.unbindEvents = function() {
        if (!this.active) {
            return;
        }
        this.active = false;

        this.$highlighter.off('click.highlighter');
        this.$el.off('input.highlighter resize.highlighter scroll.highlighter' +
            ' keydown.highlighter keypress.highlighter keyup.highlighter' +
            ' select.highlighter blur.highlighter');
    };

    /*
     * Update CSS of wrapper and containers
     */
    Highlighter.prototype.updateCss = function() {
        // the main container has the same size and position than the original textarea
        Utilities.cloneCss(this.$el, this.$main, [
            'float','vertical-align'
        ]);
        this.$main.css({
            'width':    this.$el.outerWidth(true),
            'height': this.$el.outerHeight(true)
        });

        // the highlighter container is positionned at "real" top-left corner of the textarea and takes its background
        Utilities.cloneCss(this.$el, this.$container, [
            'background-image','background-color','background-position','background-repeat',
            'background-origin','background-clip','background-size','background-attachment',
            'padding-top','padding-right','padding-bottom','padding-left'
        ]);
        
        this.$container.css({
            'top':        Utilities.toPx(this.$el.css('margin-top')) + Utilities.toPx(this.$el.css('border-top-width')),
            'left':     Utilities.toPx(this.$el.css('margin-left')) + Utilities.toPx(this.$el.css('border-left-width')),
            'width':    this.$el.width(),
            'height': this.$el.height()
        });

        // the highlighter has the same size than the "inner" textarea and must have the same font properties
        Utilities.cloneCss(this.$el, this.$highlighter, [
            'font-size','font-family','font-style','font-weight','font-variant','font-stretch',
            'line-height','vertical-align','word-spacing','text-align','letter-spacing', 'text-rendering'
        ]);

        // now make the textarea transparent to see the highlighter through
        this.$el.css({
            'background': 'none'
        });

    };

    /*
     * Update size and position of the highlighter
     * @param forced {boolean} true to resize containers
     */
    Highlighter.prototype.updateSizePosition = function(forced) {
        // resize containers
        if (forced) {
            this.$main.css({
                'width':    this.$el.outerWidth(true),
                'height': this.$el.outerHeight(true)
            });
            this.$container.css({
                'width':    this.$el.width(),
                'height': this.$el.height()
            });
        }

        var padding = 0, width;

        // account for vertical scrollbar width
        if (this.$el.css('overflow') == 'scroll' ||
            this.$el.css('overflow-y') == 'scroll' ||
            (
                this.$el.css('overflow') != 'hidden' &&
                this.$el.css('overflow-y') != 'hidden' &&
                this.$el[0].clientHeight < this.$el[0].scrollHeight
            )
        ) {
            padding = this.scrollbarWidth;
        }

       // width = this.$el.get(0).offsetWidth; // ;
        width = this.$el.width()-padding;

        this.$highlighter.css({
            'width': width,
            'height': this.$el.height() + this.$el.scrollTop(),
            'top': -this.$el.scrollTop(),
            'left': -this.$el.scrollLeft()
        });
    };


    // Utilities CLASS DEFINITON
    // ===============================
    var Utilities = function(){};

    /*
     * Get the scrollbar with on this browser
     */
    Utilities.getScrollbarWidth = function() {
        var parent = $('<div style="width:50px;height:50px;overflow:auto"><div>&nbsp;</div></div>').appendTo('body'),
            child = parent.children(),
            width = child.innerWidth() - child.height(100).innerWidth();

        parent.remove();

        return width;
    };

    /*
     * Copy a list of CSS properties from one object to another
     * @param from {jQuery}
     * @param to {jQuery}
     * @param what {string[]}
     */
    Utilities.cloneCss = function(from, to, what) {
        for (var i=0, l=what.length; i<l; i++) {
            to.css(what[i], from.css(what[i]));
        }
    };

    /*
     * Convert a size value to pixels value
     * @param value {mixed}
     * @return {int}
     */
    Utilities.toPx = function(value) {
        if (value != value.replace('em', '')) {
            var el = $('<div style="font-size:1em;margin:0;padding:0;height:auto;line-height:1;border:0;">&nbsp;</div>').appendTo('body');
            value = Math.round(parseFloat(value.replace('em', '')) * el.height());
            el.remove();
            return value;
        }
        else if (value != value.replace('px', '')) {
            return parseInt(value.replace('px', ''));
        }
        else {
            return parseInt(value);
        }
    };

    /*
     * Converts HTMl entities
     * @param str {string}
     * @return {string}
     */
    Utilities.htmlEntities = function(str) {
        if (str) {
            return $('<div></div>').text(str).html();
        }
        else {
            return '';
        }
    };

    /*
     * Inserts a string in another string at given position
     * @param string {string}
     * @param index {int}
     * @param value {string}
     * @return {string}
     */
    Utilities.strInsert = function(string, index, value) {
        return string.slice(0, index) + value + string.slice(index);
    };

    /*
     * Apply throttling to a callback
     * @param callback {function}
     * @param delay {int} milliseconds
     * @param context {object|null}
     * @return {function}
     */
    Utilities.throttle = function(callback, delay, context) {
        var state = {
            pid: null,
            last: 0
        };

        return function() {
            var elapsed = new Date().getTime() - state.last,
                    args = arguments,
                    that = this;

            function exec() {
                state.last = new Date().getTime();

                if (context) {
                    return callback.apply(context, Array.prototype.slice.call(args));
                }
                else {
                    return callback.apply(that, Array.prototype.slice.call(args));
                }
            }

            if (elapsed > delay) {
                return exec();
            }
            else {
                clearTimeout(state.pid);
                state.pid = setTimeout(exec, delay - elapsed);
            }
        };
    };

    /*
     * Formats a list of words into a hash of arrays (Color => Words list)
     * @param words {mixed}
     * @param color {string} default color
     * @return {object[]}
    Utilities.cleanWords = function(words, color) {
        var out = {};

        if (!$.isArray(words)) {
            words = [words];
        }

        for (var i=0, l=words.length; i<l; i++) {
            var group = words[i];

            if ($.isPlainObject(group)) {

                if (!out[group.color]) {
                    out[group.color] = [];
                }
                if (!$.isArray(group.words)) {
                    group.words = [group.words];
                }

                for (var j=0, m=group.words.length; j<m; j++) {
                    out[group.color].push(Utilities.htmlEntities(group.words[j]));
                }
            }
            else {
                if (!out[color]) {
                    out[color] = [];
                }

                out[color].push(Utilities.htmlEntities(group));
            }
        }

        return out;
    };
     */



    // JQUERY PLUGIN DEFINITION
    // ===============================
    $.fn.highlightTextarea = function(option) {
        var args = arguments;

        return this.each(function() {
            var $this = $(this),
                data = $this.data('highlighter'),
                options = typeof option == 'object' && option;

            if (!data && option == 'destroy') {
                return;
            }
            if (!data) {
                data = new Highlighter($this, options);
                $this.data('highlighter', data);
            }
            if (typeof option == 'string') {
                data[option].apply(data, Array.prototype.slice.call(args, 1));
            }
        });
    };
}(jQuery));