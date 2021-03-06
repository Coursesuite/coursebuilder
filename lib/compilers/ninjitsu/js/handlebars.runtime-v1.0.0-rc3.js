var Handlebars = {};
(function (c) {
    c.VERSION = "1.0.0-rc.3";
    c.COMPILER_REVISION = 2;
    c.REVISION_CHANGES = {
        1: "<= 1.0.rc.2",
        2: ">= 1.0.0-rc.3"
    };
    c.helpers = {};
    c.partials = {};
    c.registerHelper = function (a, d, c) {
        c && (d.not = c);
        this.helpers[a] = d
    };
    c.registerPartial = function (a, d) {
        this.partials[a] = d
    };
    c.registerHelper("helperMissing", function (a) {
        if (2 !== arguments.length) throw Error("Could not find property '" + a + "'");
    });
    var f = Object.prototype.toString;
    c.registerHelper("blockHelperMissing", function (a, d) {
        var g = d.inverse || function () {},
            e = d.fn,
            p = f.call(a);
        "[object Function]" === p && (a = a.call(this));
        return !0 === a ? e(this) : !1 === a || null == a ? g(this) : "[object Array]" === p ? 0 < a.length ? c.helpers.each(a, d) : g(this) : e(a)
    });
    c.K = function () {};
    c.createFrame = Object.create || function (a) {
        c.K.prototype = a;
        a = new c.K;
        c.K.prototype = null;
        return a
    };
    c.logger = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        level: 3,
        methodMap: {
            "0": "debug",
            1: "info",
            2: "warn",
            3: "error"
        },
        log: function (a, d) {
            if (c.logger.level <= a) {
                var g = c.logger.methodMap[a];
                "undefined" !== typeof console && console[g] && console[g].call(console,
                    d)
            }
        }
    };
    c.log = function (a, d) {
        c.logger.log(a, d)
    };

	// TIM: added m.length which equates to length inside the each frame, e.g. {{@length}}
    c.registerHelper("each", function (a, d) {
        var g = d.fn,
            e = d.inverse,
            f = 0,
            b = "",
            m;
        d.data && (m = c.createFrame(d.data));
        if (a && "object" === typeof a)
            if (a instanceof Array)
                for (var q = a.length; f < q; f++) m && (m.index = f, m.length = a.length), b += g(a[f], {
                    data: m
                });
            else
                for (q in a) a.hasOwnProperty(q) && (m && (m.key = q), b += g(a[q], {
                    data: m
                }), f++);
        0 === f && (b = e(this));
        return b
    });
    c.registerHelper("if", function (a, d) {
        "[object Function]" === f.call(a) && (a = a.call(this));
        return !a || c.Utils.isEmpty(a) ? d.inverse(this) : d.fn(this)
    });
    c.registerHelper("unless", function (a, d) {
        var g = d.fn;
        d.fn = d.inverse;
        d.inverse = g;
        return c.helpers["if"].call(this, a, d)
    });
    c.registerHelper("with", function (a, d) {
        return d.fn(a)
    });
    c.registerHelper("log", function (a, d) {
        var g = d.data && null != d.data.level ? parseInt(d.data.level, 10) : 1;
        c.log(g, a)
    })
})(Handlebars);
var handlebars = function () {
    function c() {
        this.yy = {}
    }
    var f = {
        trace: function () {},
        yy: {},
        symbols_: {
            error: 2,
            root: 3,
            program: 4,
            EOF: 5,
            simpleInverse: 6,
            statements: 7,
            statement: 8,
            openInverse: 9,
            closeBlock: 10,
            openBlock: 11,
            mustache: 12,
            partial: 13,
            CONTENT: 14,
            COMMENT: 15,
            OPEN_BLOCK: 16,
            inMustache: 17,
            CLOSE: 18,
            OPEN_INVERSE: 19,
            OPEN_ENDBLOCK: 20,
            path: 21,
            OPEN: 22,
            OPEN_UNESCAPED: 23,
            OPEN_PARTIAL: 24,
            partialName: 25,
            params: 26,
            hash: 27,
            DATA: 28,
            param: 29,
            STRING: 30,
            INTEGER: 31,
            BOOLEAN: 32,
            hashSegments: 33,
            hashSegment: 34,
            ID: 35,
            EQUALS: 36,
            PARTIAL_NAME: 37,
            pathSegments: 38,
            SEP: 39,
            $accept: 0,
            $end: 1
        },
        terminals_: {
            2: "error",
            5: "EOF",
            14: "CONTENT",
            15: "COMMENT",
            16: "OPEN_BLOCK",
            18: "CLOSE",
            19: "OPEN_INVERSE",
            20: "OPEN_ENDBLOCK",
            22: "OPEN",
            23: "OPEN_UNESCAPED",
            24: "OPEN_PARTIAL",
            28: "DATA",
            30: "STRING",
            31: "INTEGER",
            32: "BOOLEAN",
            35: "ID",
            36: "EQUALS",
            37: "PARTIAL_NAME",
            39: "SEP"
        },
        productions_: [0, [3, 2],
            [4, 2],
            [4, 3],
            [4, 2],
            [4, 1],
            [4, 1],
            [4, 0],
            [7, 1],
            [7, 2],
            [8, 3],
            [8, 3],
            [8, 1],
            [8, 1],
            [8, 1],
            [8, 1],
            [11, 3],
            [9, 3],
            [10, 3],
            [12, 3],
            [12, 3],
            [13, 3],
            [13, 4],
            [6, 2],
            [17, 3],
            [17, 2],
            [17, 2],
            [17, 1],
            [17, 1],
            [26,
                2
            ],
            [26, 1],
            [29, 1],
            [29, 1],
            [29, 1],
            [29, 1],
            [29, 1],
            [27, 1],
            [33, 2],
            [33, 1],
            [34, 3],
            [34, 3],
            [34, 3],
            [34, 3],
            [34, 3],
            [25, 1],
            [21, 1],
            [38, 3],
            [38, 1]
        ],
        performAction: function (a, d, c, e, f, b) {
            a = b.length - 1;
            switch (f) {
            case 1:
                return b[a - 1];
            case 2:
                this.$ = new e.ProgramNode([], b[a]);
                break;
            case 3:
                this.$ = new e.ProgramNode(b[a - 2], b[a]);
                break;
            case 4:
                this.$ = new e.ProgramNode(b[a - 1], []);
                break;
            case 5:
                this.$ = new e.ProgramNode(b[a]);
                break;
            case 6:
                this.$ = new e.ProgramNode([], []);
                break;
            case 7:
                this.$ = new e.ProgramNode([]);
                break;
            case 8:
                this.$ = [b[a]];
                break;
            case 9:
                b[a - 1].push(b[a]);
                this.$ = b[a - 1];
                break;
            case 10:
                this.$ = new e.BlockNode(b[a - 2], b[a - 1].inverse, b[a - 1], b[a]);
                break;
            case 11:
                this.$ = new e.BlockNode(b[a - 2], b[a - 1], b[a - 1].inverse, b[a]);
                break;
            case 12:
                this.$ = b[a];
                break;
            case 13:
                this.$ = b[a];
                break;
            case 14:
                this.$ = new e.ContentNode(b[a]);
                break;
            case 15:
                this.$ = new e.CommentNode(b[a]);
                break;
            case 16:
                this.$ = new e.MustacheNode(b[a - 1][0], b[a - 1][1]);
                break;
            case 17:
                this.$ = new e.MustacheNode(b[a - 1][0], b[a - 1][1]);
                break;
            case 18:
                this.$ = b[a - 1];
                break;
            case 19:
                this.$ =
                    new e.MustacheNode(b[a - 1][0], b[a - 1][1]);
                break;
            case 20:
                this.$ = new e.MustacheNode(b[a - 1][0], b[a - 1][1], !0);
                break;
            case 21:
                this.$ = new e.PartialNode(b[a - 1]);
                break;
            case 22:
                this.$ = new e.PartialNode(b[a - 2], b[a - 1]);
                break;
            case 24:
                this.$ = [
                    [b[a - 2]].concat(b[a - 1]), b[a]
                ];
                break;
            case 25:
                this.$ = [
                    [b[a - 1]].concat(b[a]), null
                ];
                break;
            case 26:
                this.$ = [
                    [b[a - 1]], b[a]
                ];
                break;
            case 27:
                this.$ = [
                    [b[a]], null
                ];
                break;
            case 28:
                this.$ = [
                    [new e.DataNode(b[a])], null
                ];
                break;
            case 29:
                b[a - 1].push(b[a]);
                this.$ = b[a - 1];
                break;
            case 30:
                this.$ = [b[a]];
                break;
            case 31:
                this.$ = b[a];
                break;
            case 32:
                this.$ = new e.StringNode(b[a]);
                break;
            case 33:
                this.$ = new e.IntegerNode(b[a]);
                break;
            case 34:
                this.$ = new e.BooleanNode(b[a]);
                break;
            case 35:
                this.$ = new e.DataNode(b[a]);
                break;
            case 36:
                this.$ = new e.HashNode(b[a]);
                break;
            case 37:
                b[a - 1].push(b[a]);
                this.$ = b[a - 1];
                break;
            case 38:
                this.$ = [b[a]];
                break;
            case 39:
                this.$ = [b[a - 2], b[a]];
                break;
            case 40:
                this.$ = [b[a - 2], new e.StringNode(b[a])];
                break;
            case 41:
                this.$ = [b[a - 2], new e.IntegerNode(b[a])];
                break;
            case 42:
                this.$ = [b[a - 2], new e.BooleanNode(b[a])];
                break;
            case 43:
                this.$ = [b[a - 2], new e.DataNode(b[a])];
                break;
            case 44:
                this.$ = new e.PartialNameNode(b[a]);
                break;
            case 45:
                this.$ = new e.IdNode(b[a]);
                break;
            case 46:
                b[a - 2].push(b[a]);
                this.$ = b[a - 2];
                break;
            case 47:
                this.$ = [b[a]]
            }
        },
        table: [{
            3: 1,
            4: 2,
            5: [2, 7],
            6: 3,
            7: 4,
            8: 6,
            9: 7,
            11: 8,
            12: 9,
            13: 10,
            14: [1, 11],
            15: [1, 12],
            16: [1, 13],
            19: [1, 5],
            22: [1, 14],
            23: [1, 15],
            24: [1, 16]
        }, {
            1: [3]
        }, {
            5: [1, 17]
        }, {
            5: [2, 6],
            7: 18,
            8: 6,
            9: 7,
            11: 8,
            12: 9,
            13: 10,
            14: [1, 11],
            15: [1, 12],
            16: [1, 13],
            19: [1, 19],
            20: [2, 6],
            22: [1, 14],
            23: [1, 15],
            24: [1, 16]
        }, {
            5: [2, 5],
            6: 20,
            8: 21,
            9: 7,
            11: 8,
            12: 9,
            13: 10,
            14: [1, 11],
            15: [1, 12],
            16: [1, 13],
            19: [1, 5],
            20: [2, 5],
            22: [1, 14],
            23: [1, 15],
            24: [1, 16]
        }, {
            17: 23,
            18: [1, 22],
            21: 24,
            28: [1, 25],
            35: [1, 27],
            38: 26
        }, {
            5: [2, 8],
            14: [2, 8],
            15: [2, 8],
            16: [2, 8],
            19: [2, 8],
            20: [2, 8],
            22: [2, 8],
            23: [2, 8],
            24: [2, 8]
        }, {
            4: 28,
            6: 3,
            7: 4,
            8: 6,
            9: 7,
            11: 8,
            12: 9,
            13: 10,
            14: [1, 11],
            15: [1, 12],
            16: [1, 13],
            19: [1, 5],
            20: [2, 7],
            22: [1, 14],
            23: [1, 15],
            24: [1, 16]
        }, {
            4: 29,
            6: 3,
            7: 4,
            8: 6,
            9: 7,
            11: 8,
            12: 9,
            13: 10,
            14: [1, 11],
            15: [1, 12],
            16: [1, 13],
            19: [1, 5],
            20: [2, 7],
            22: [1, 14],
            23: [1, 15],
            24: [1, 16]
        }, {
            5: [2, 12],
            14: [2, 12],
            15: [2, 12],
            16: [2, 12],
            19: [2, 12],
            20: [2, 12],
            22: [2, 12],
            23: [2, 12],
            24: [2, 12]
        }, {
            5: [2, 13],
            14: [2, 13],
            15: [2, 13],
            16: [2, 13],
            19: [2, 13],
            20: [2, 13],
            22: [2, 13],
            23: [2, 13],
            24: [2, 13]
        }, {
            5: [2, 14],
            14: [2, 14],
            15: [2, 14],
            16: [2, 14],
            19: [2, 14],
            20: [2, 14],
            22: [2, 14],
            23: [2, 14],
            24: [2, 14]
        }, {
            5: [2, 15],
            14: [2, 15],
            15: [2, 15],
            16: [2, 15],
            19: [2, 15],
            20: [2, 15],
            22: [2, 15],
            23: [2, 15],
            24: [2, 15]
        }, {
            17: 30,
            21: 24,
            28: [1, 25],
            35: [1, 27],
            38: 26
        }, {
            17: 31,
            21: 24,
            28: [1, 25],
            35: [1, 27],
            38: 26
        }, {
            17: 32,
            21: 24,
            28: [1, 25],
            35: [1, 27],
            38: 26
        }, {
            25: 33,
            37: [1, 34]
        }, {
            1: [2, 1]
        }, {
            5: [2, 2],
            8: 21,
            9: 7,
            11: 8,
            12: 9,
            13: 10,
            14: [1, 11],
            15: [1, 12],
            16: [1, 13],
            19: [1, 19],
            20: [2, 2],
            22: [1, 14],
            23: [1, 15],
            24: [1, 16]
        }, {
            17: 23,
            21: 24,
            28: [1, 25],
            35: [1, 27],
            38: 26
        }, {
            5: [2, 4],
            7: 35,
            8: 6,
            9: 7,
            11: 8,
            12: 9,
            13: 10,
            14: [1, 11],
            15: [1, 12],
            16: [1, 13],
            19: [1, 19],
            20: [2, 4],
            22: [1, 14],
            23: [1, 15],
            24: [1, 16]
        }, {
            5: [2, 9],
            14: [2, 9],
            15: [2, 9],
            16: [2, 9],
            19: [2, 9],
            20: [2, 9],
            22: [2, 9],
            23: [2, 9],
            24: [2, 9]
        }, {
            5: [2, 23],
            14: [2, 23],
            15: [2, 23],
            16: [2, 23],
            19: [2, 23],
            20: [2, 23],
            22: [2, 23],
            23: [2, 23],
            24: [2, 23]
        }, {
            18: [1, 36]
        }, {
            18: [2, 27],
            21: 41,
            26: 37,
            27: 38,
            28: [1, 45],
            29: 39,
            30: [1, 42],
            31: [1, 43],
            32: [1, 44],
            33: 40,
            34: 46,
            35: [1, 47],
            38: 26
        }, {
            18: [2, 28]
        }, {
            18: [2, 45],
            28: [2, 45],
            30: [2, 45],
            31: [2, 45],
            32: [2, 45],
            35: [2, 45],
            39: [1, 48]
        }, {
            18: [2, 47],
            28: [2, 47],
            30: [2, 47],
            31: [2, 47],
            32: [2, 47],
            35: [2, 47],
            39: [2, 47]
        }, {
            10: 49,
            20: [1, 50]
        }, {
            10: 51,
            20: [1, 50]
        }, {
            18: [1, 52]
        }, {
            18: [1, 53]
        }, {
            18: [1, 54]
        }, {
            18: [1, 55],
            21: 56,
            35: [1, 27],
            38: 26
        }, {
            18: [2, 44],
            35: [2, 44]
        }, {
            5: [2, 3],
            8: 21,
            9: 7,
            11: 8,
            12: 9,
            13: 10,
            14: [1, 11],
            15: [1, 12],
            16: [1, 13],
            19: [1, 19],
            20: [2, 3],
            22: [1, 14],
            23: [1, 15],
            24: [1, 16]
        }, {
            14: [2, 17],
            15: [2, 17],
            16: [2, 17],
            19: [2, 17],
            20: [2, 17],
            22: [2, 17],
            23: [2, 17],
            24: [2, 17]
        }, {
            18: [2, 25],
            21: 41,
            27: 57,
            28: [1, 45],
            29: 58,
            30: [1, 42],
            31: [1, 43],
            32: [1, 44],
            33: 40,
            34: 46,
            35: [1, 47],
            38: 26
        }, {
            18: [2, 26]
        }, {
            18: [2, 30],
            28: [2, 30],
            30: [2, 30],
            31: [2, 30],
            32: [2, 30],
            35: [2, 30]
        }, {
            18: [2, 36],
            34: 59,
            35: [1, 60]
        }, {
            18: [2, 31],
            28: [2, 31],
            30: [2, 31],
            31: [2, 31],
            32: [2, 31],
            35: [2, 31]
        }, {
            18: [2, 32],
            28: [2, 32],
            30: [2, 32],
            31: [2, 32],
            32: [2, 32],
            35: [2, 32]
        }, {
            18: [2, 33],
            28: [2, 33],
            30: [2, 33],
            31: [2, 33],
            32: [2, 33],
            35: [2, 33]
        }, {
            18: [2, 34],
            28: [2, 34],
            30: [2, 34],
            31: [2, 34],
            32: [2, 34],
            35: [2, 34]
        }, {
            18: [2, 35],
            28: [2, 35],
            30: [2, 35],
            31: [2, 35],
            32: [2, 35],
            35: [2,
                35
            ]
        }, {
            18: [2, 38],
            35: [2, 38]
        }, {
            18: [2, 47],
            28: [2, 47],
            30: [2, 47],
            31: [2, 47],
            32: [2, 47],
            35: [2, 47],
            36: [1, 61],
            39: [2, 47]
        }, {
            35: [1, 62]
        }, {
            5: [2, 10],
            14: [2, 10],
            15: [2, 10],
            16: [2, 10],
            19: [2, 10],
            20: [2, 10],
            22: [2, 10],
            23: [2, 10],
            24: [2, 10]
        }, {
            21: 63,
            35: [1, 27],
            38: 26
        }, {
            5: [2, 11],
            14: [2, 11],
            15: [2, 11],
            16: [2, 11],
            19: [2, 11],
            20: [2, 11],
            22: [2, 11],
            23: [2, 11],
            24: [2, 11]
        }, {
            14: [2, 16],
            15: [2, 16],
            16: [2, 16],
            19: [2, 16],
            20: [2, 16],
            22: [2, 16],
            23: [2, 16],
            24: [2, 16]
        }, {
            5: [2, 19],
            14: [2, 19],
            15: [2, 19],
            16: [2, 19],
            19: [2, 19],
            20: [2, 19],
            22: [2, 19],
            23: [2, 19],
            24: [2, 19]
        }, {
            5: [2,
                20
            ],
            14: [2, 20],
            15: [2, 20],
            16: [2, 20],
            19: [2, 20],
            20: [2, 20],
            22: [2, 20],
            23: [2, 20],
            24: [2, 20]
        }, {
            5: [2, 21],
            14: [2, 21],
            15: [2, 21],
            16: [2, 21],
            19: [2, 21],
            20: [2, 21],
            22: [2, 21],
            23: [2, 21],
            24: [2, 21]
        }, {
            18: [1, 64]
        }, {
            18: [2, 24]
        }, {
            18: [2, 29],
            28: [2, 29],
            30: [2, 29],
            31: [2, 29],
            32: [2, 29],
            35: [2, 29]
        }, {
            18: [2, 37],
            35: [2, 37]
        }, {
            36: [1, 61]
        }, {
            21: 65,
            28: [1, 69],
            30: [1, 66],
            31: [1, 67],
            32: [1, 68],
            35: [1, 27],
            38: 26
        }, {
            18: [2, 46],
            28: [2, 46],
            30: [2, 46],
            31: [2, 46],
            32: [2, 46],
            35: [2, 46],
            39: [2, 46]
        }, {
            18: [1, 70]
        }, {
            5: [2, 22],
            14: [2, 22],
            15: [2, 22],
            16: [2, 22],
            19: [2, 22],
            20: [2, 22],
            22: [2, 22],
            23: [2, 22],
            24: [2, 22]
        }, {
            18: [2, 39],
            35: [2, 39]
        }, {
            18: [2, 40],
            35: [2, 40]
        }, {
            18: [2, 41],
            35: [2, 41]
        }, {
            18: [2, 42],
            35: [2, 42]
        }, {
            18: [2, 43],
            35: [2, 43]
        }, {
            5: [2, 18],
            14: [2, 18],
            15: [2, 18],
            16: [2, 18],
            19: [2, 18],
            20: [2, 18],
            22: [2, 18],
            23: [2, 18],
            24: [2, 18]
        }],
        defaultActions: {
            17: [2, 1],
            25: [2, 28],
            38: [2, 26],
            57: [2, 24]
        },
        parseError: function (a) {
            throw Error(a);
        },
        parse: function (a) {
            var d = [0],
                c = [null],
                e = [],
                f = this.table,
                b = "",
                m = 0,
                q = 0,
                t = 0;
            this.lexer.setInput(a);
            this.lexer.yy = this.yy;
            this.yy.lexer = this.lexer;
            this.yy.parser = this;
            "undefined" ==
                typeof this.lexer.yylloc && (this.lexer.yylloc = {});
            a = this.lexer.yylloc;
            e.push(a);
            var v = this.lexer.options && this.lexer.options.ranges;
            "function" === typeof this.yy.parseError && (this.parseError = this.yy.parseError);
            for (var j, n, h, k, r = {}, s, l;;) {
                h = d[d.length - 1];
                if (this.defaultActions[h]) k = this.defaultActions[h];
                else {
                    if (null === j || "undefined" == typeof j) j = void 0, j = this.lexer.lex() || 1, "number" !== typeof j && (j = this.symbols_[j] || j);
                    k = f[h] && f[h][j]
                } if ("undefined" === typeof k || !k.length || !k[0]) {
                    var u = "";
                    if (!t) {
                        l = [];
                        for (s in f[h]) this.terminals_[s] && 2 < s && l.push("'" + this.terminals_[s] + "'");
                        u = this.lexer.showPosition ? "Parse error on line " + (m + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + l.join(", ") + ", got '" + (this.terminals_[j] || j) + "'" : "Parse error on line " + (m + 1) + ": Unexpected " + (1 == j ? "end of input" : "'" + (this.terminals_[j] || j) + "'");
                        this.parseError(u, {
                            text: this.lexer.match,
                            token: this.terminals_[j] || j,
                            line: this.lexer.yylineno,
                            loc: a,
                            expected: l
                        })
                    }
                }
                if (k[0] instanceof Array && 1 < k.length) throw Error("Parse Error: multiple actions possible at state: " +
                    h + ", token: " + j);
                switch (k[0]) {
                case 1:
                    d.push(j);
                    c.push(this.lexer.yytext);
                    e.push(this.lexer.yylloc);
                    d.push(k[1]);
                    j = null;
                    n ? (j = n, n = null) : (q = this.lexer.yyleng, b = this.lexer.yytext, m = this.lexer.yylineno, a = this.lexer.yylloc, 0 < t && t--);
                    break;
                case 2:
                    l = this.productions_[k[1]][1];
                    r.$ = c[c.length - l];
                    r._$ = {
                        first_line: e[e.length - (l || 1)].first_line,
                        last_line: e[e.length - 1].last_line,
                        first_column: e[e.length - (l || 1)].first_column,
                        last_column: e[e.length - 1].last_column
                    };
                    v && (r._$.range = [e[e.length - (l || 1)].range[0], e[e.length -
                        1].range[1]]);
                    h = this.performAction.call(r, b, q, m, this.yy, k[1], c, e);
                    if ("undefined" !== typeof h) return h;
                    l && (d = d.slice(0, -2 * l), c = c.slice(0, -1 * l), e = e.slice(0, -1 * l));
                    d.push(this.productions_[k[1]][0]);
                    c.push(r.$);
                    e.push(r._$);
                    k = f[d[d.length - 2]][d[d.length - 1]];
                    d.push(k);
                    break;
                case 3:
                    return !0
                }
            }
            return !0
        },
        lexer: {
            EOF: 1,
            parseError: function (a, d) {
                if (this.yy.parser) this.yy.parser.parseError(a, d);
                else throw Error(a);
            },
            setInput: function (a) {
                this._input = a;
                this._more = this._less = this.done = !1;
                this.yylineno = this.yyleng =
                    0;
                this.yytext = this.matched = this.match = "";
                this.conditionStack = ["INITIAL"];
                this.yylloc = {
                    first_line: 1,
                    first_column: 0,
                    last_line: 1,
                    last_column: 0
                };
                this.options.ranges && (this.yylloc.range = [0, 0]);
                this.offset = 0;
                return this
            },
            input: function () {
                var a = this._input[0];
                this.yytext += a;
                this.yyleng++;
                this.offset++;
                this.match += a;
                this.matched += a;
                a.match(/(?:\r\n?|\n).*/g) ? (this.yylineno++, this.yylloc.last_line++) : this.yylloc.last_column++;
                this.options.ranges && this.yylloc.range[1]++;
                this._input = this._input.slice(1);
                return a
            },
            unput: function (a) {
                var d = a.length,
                    c = a.split(/(?:\r\n?|\n)/g);
                this._input = a + this._input;
                this.yytext = this.yytext.substr(0, this.yytext.length - d - 1);
                this.offset -= d;
                a = this.match.split(/(?:\r\n?|\n)/g);
                this.match = this.match.substr(0, this.match.length - 1);
                this.matched = this.matched.substr(0, this.matched.length - 1);
                c.length - 1 && (this.yylineno -= c.length - 1);
                var e = this.yylloc.range;
                this.yylloc = {
                    first_line: this.yylloc.first_line,
                    last_line: this.yylineno + 1,
                    first_column: this.yylloc.first_column,
                    last_column: c ? (c.length ===
                        a.length ? this.yylloc.first_column : 0) + a[a.length - c.length].length - c[0].length : this.yylloc.first_column - d
                };
                this.options.ranges && (this.yylloc.range = [e[0], e[0] + this.yyleng - d]);
                return this
            },
            more: function () {
                this._more = !0;
                return this
            },
            less: function (a) {
                this.unput(this.match.slice(a))
            },
            pastInput: function () {
                var a = this.matched.substr(0, this.matched.length - this.match.length);
                return (20 < a.length ? "..." : "") + a.substr(-20).replace(/\n/g, "")
            },
            upcomingInput: function () {
                var a = this.match;
                20 > a.length && (a += this._input.substr(0,
                    20 - a.length));
                return (a.substr(0, 20) + (20 < a.length ? "..." : "")).replace(/\n/g, "")
            },
            showPosition: function () {
                var a = this.pastInput(),
                    d = Array(a.length + 1).join("-");
                return a + this.upcomingInput() + "\n" + d + "^"
            },
            next: function () {
                if (this.done) return this.EOF;
                this._input || (this.done = !0);
                var a, d, c;
                this._more || (this.match = this.yytext = "");
                for (var e = this._currentRules(), f = 0; f < e.length; f++)
                    if ((d = this._input.match(this.rules[e[f]])) && (!a || d[0].length > a[0].length))
                        if (a = d, c = f, !this.options.flex) break;
                if (a) {
                    if (d = a[0].match(/(?:\r\n?|\n).*/g)) this.yylineno +=
                        d.length;
                    this.yylloc = {
                        first_line: this.yylloc.last_line,
                        last_line: this.yylineno + 1,
                        first_column: this.yylloc.last_column,
                        last_column: d ? d[d.length - 1].length - d[d.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + a[0].length
                    };
                    this.yytext += a[0];
                    this.match += a[0];
                    this.matches = a;
                    this.yyleng = this.yytext.length;
                    this.options.ranges && (this.yylloc.range = [this.offset, this.offset += this.yyleng]);
                    this._more = !1;
                    this._input = this._input.slice(a[0].length);
                    this.matched += a[0];
                    a = this.performAction.call(this, this.yy,
                        this, e[c], this.conditionStack[this.conditionStack.length - 1]);
                    this.done && this._input && (this.done = !1);
                    if (a) return a
                } else return "" === this._input ? this.EOF : this.parseError("Lexical error on line " + (this.yylineno + 1) + ". Unrecognized text.\n" + this.showPosition(), {
                    text: "",
                    token: null,
                    line: this.yylineno
                })
            },
            lex: function () {
                var a = this.next();
                return "undefined" !== typeof a ? a : this.lex()
            },
            begin: function (a) {
                this.conditionStack.push(a)
            },
            popState: function () {
                return this.conditionStack.pop()
            },
            _currentRules: function () {
                return this.conditions[this.conditionStack[this.conditionStack.length -
                    1]].rules
            },
            topState: function () {
                return this.conditionStack[this.conditionStack.length - 2]
            },
            pushState: function (a) {
                this.begin(a)
            },
            options: {},
            performAction: function (a, d, c) {
                switch (c) {
                case 0:
                    "\\" !== d.yytext.slice(-1) && this.begin("mu");
                    "\\" === d.yytext.slice(-1) && (d.yytext = d.yytext.substr(0, d.yyleng - 1), this.begin("emu"));
                    if (d.yytext) return 14;
                    break;
                case 1:
                    return 14;
                case 2:
                    return "\\" !== d.yytext.slice(-1) && this.popState(), "\\" === d.yytext.slice(-1) && (d.yytext = d.yytext.substr(0, d.yyleng - 1)), 14;
                case 3:
                    return d.yytext =
                        d.yytext.substr(0, d.yyleng - 4), this.popState(), 15;
                case 4:
                    return this.begin("par"), 24;
                case 5:
                    return 16;
                case 6:
                    return 20;
                case 7:
                    return 19;
                case 8:
                    return 19;
                case 9:
                    return 23;
                case 10:
                    return 23;
                case 11:
                    this.popState();
                    this.begin("com");
                    break;
                case 12:
                    return d.yytext = d.yytext.substr(3, d.yyleng - 5), this.popState(), 15;
                case 13:
                    return 22;
                case 14:
                    return 36;
                case 15:
                    return 35;
                case 16:
                    return 35;
                case 17:
                    return 39;
                case 19:
                    return this.popState(), 18;
                case 20:
                    return this.popState(), 18;
                case 21:
                    return d.yytext = d.yytext.substr(1,
                        d.yyleng - 2).replace(/\\"/g, '"'), 30;
                case 22:
                    return d.yytext = d.yytext.substr(1, d.yyleng - 2).replace(/\\'/g, "'"), 30;
                case 23:
                    return d.yytext = d.yytext.substr(1), 28;
                case 24:
                    return 32;
                case 25:
                    return 32;
                case 26:
                    return 31;
                case 27:
                    return 35;
                case 28:
                    return d.yytext = d.yytext.substr(1, d.yyleng - 2), 35;
                case 29:
                    return "INVALID";
                case 31:
                    return this.popState(), 37;
                case 32:
                    return 5
                }
            },
            rules: [/^(?:[^\x00]*?(?=(\{\{)))/, /^(?:[^\x00]+)/, /^(?:[^\x00]{2,}?(?=(\{\{|$)))/, /^(?:[\s\S]*?--\}\})/, /^(?:\{\{>)/, /^(?:\{\{#)/, /^(?:\{\{\/)/,
                /^(?:\{\{\^)/, /^(?:\{\{\s*else\b)/, /^(?:\{\{\{)/, /^(?:\{\{&)/, /^(?:\{\{!--)/, /^(?:\{\{![\s\S]*?\}\})/, /^(?:\{\{)/, /^(?:=)/, /^(?:\.(?=[} ]))/, /^(?:\.\.)/, /^(?:[\/.])/, /^(?:\s+)/, /^(?:\}\}\})/, /^(?:\}\})/, /^(?:"(\\["]|[^"])*")/, /^(?:'(\\[']|[^'])*')/, /^(?:@[a-zA-Z]+)/, /^(?:true(?=[}\s]))/, /^(?:false(?=[}\s]))/, /^(?:[0-9]+(?=[}\s]))/, /^(?:[a-zA-Z0-9_$-]+(?=[=}\s\/.]))/, /^(?:\[[^\]]*\])/, /^(?:.)/, /^(?:\s+)/, /^(?:[a-zA-Z0-9_$-/]+)/, /^(?:$)/
            ],
            conditions: {
                mu: {
                    rules: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
                        19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 32
                    ],
                    inclusive: !1
                },
                emu: {
                    rules: [2],
                    inclusive: !1
                },
                com: {
                    rules: [3],
                    inclusive: !1
                },
                par: {
                    rules: [30, 31],
                    inclusive: !1
                },
                INITIAL: {
                    rules: [0, 1, 32],
                    inclusive: !0
                }
            }
        }
    };
    c.prototype = f;
    f.Parser = c;
    return new c
}();
Handlebars.Parser = handlebars;
Handlebars.parse = function (c) {
    if (c.constructor === Handlebars.AST.ProgramNode) return c;
    Handlebars.Parser.yy = Handlebars.AST;
    return Handlebars.Parser.parse(c)
};
Handlebars.print = function (c) {
    return (new Handlebars.PrintVisitor).accept(c)
};
(function () {
    Handlebars.AST = {};
    Handlebars.AST.ProgramNode = function (c, f) {
        this.type = "program";
        this.statements = c;
        f && (this.inverse = new Handlebars.AST.ProgramNode(f))
    };
    Handlebars.AST.MustacheNode = function (c, f, a) {
        this.type = "mustache";
        this.escaped = !a;
        this.hash = f;
        a = this.id = c[0];
        c = this.params = c.slice(1);
        this.isHelper = (this.eligibleHelper = a.isSimple) && (c.length || f)
    };
    Handlebars.AST.PartialNode = function (c, f) {
        this.type = "partial";
        this.partialName = c;
        this.context = f
    };
    Handlebars.AST.BlockNode = function (c, f, a, d) {
        var g =
            c.id;
        if (g.original !== d.original) throw new Handlebars.Exception(g.original + " doesn't match " + d.original);
        this.type = "block";
        this.mustache = c;
        this.program = f;
        if ((this.inverse = a) && !this.program) this.isInverse = !0
    };
    Handlebars.AST.ContentNode = function (c) {
        this.type = "content";
        this.string = c
    };
    Handlebars.AST.HashNode = function (c) {
        this.type = "hash";
        this.pairs = c
    };
    Handlebars.AST.IdNode = function (c) {
        this.type = "ID";
        this.original = c.join(".");
        for (var f = [], a = 0, d = 0, g = c.length; d < g; d++) {
            var e = c[d];
            if (".." === e || "." === e || "this" ===
                e) {
                if (0 < f.length) throw new Handlebars.Exception("Invalid path: " + this.original);
                ".." === e ? a++ : this.isScoped = !0
            } else f.push(e)
        }
        this.parts = f;
        this.string = f.join(".");
        this.depth = a;
        this.isSimple = 1 === c.length && !this.isScoped && 0 === a;
        this.stringModeValue = this.string
    };
    Handlebars.AST.PartialNameNode = function (c) {
        this.type = "PARTIAL_NAME";
        this.name = c
    };
    Handlebars.AST.DataNode = function (c) {
        this.type = "DATA";
        this.id = c
    };
    Handlebars.AST.StringNode = function (c) {
        this.type = "STRING";
        this.stringModeValue = this.string = c
    };
    Handlebars.AST.IntegerNode =
        function (c) {
            this.type = "INTEGER";
            this.integer = c;
            this.stringModeValue = Number(c)
    };
    Handlebars.AST.BooleanNode = function (c) {
        this.type = "BOOLEAN";
        this.bool = c;
        this.stringModeValue = "true" === c
    };
    Handlebars.AST.CommentNode = function (c) {
        this.type = "comment";
        this.comment = c
    }
})();
var errorProps = "description fileName lineNumber message name number stack".split(" ");
Handlebars.Exception = function (c) {
    for (var f = Error.prototype.constructor.apply(this, arguments), a = 0; a < errorProps.length; a++) this[errorProps[a]] = f[errorProps[a]]
};
Handlebars.Exception.prototype = Error();
Handlebars.SafeString = function (c) {
    this.string = c
};
Handlebars.SafeString.prototype.toString = function () {
    return this.string.toString()
};
(function () {
    var c = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#x27;",
            "`": "&#x60;"
        },
        f = /[&<>"'`]/g,
        a = /[&<>"'`]/,
        d = function (a) {
            return c[a] || "&amp;"
        };
    Handlebars.Utils = {
        escapeExpression: function (c) {
            return c instanceof Handlebars.SafeString ? c.toString() : null == c || !1 === c ? "" : !a.test(c) ? c : c.replace(f, d)
        },
        isEmpty: function (a) {
            return !a && 0 !== a ? !0 : "[object Array]" === Object.prototype.toString.call(a) && 0 === a.length ? !0 : !1
        }
    }
})();
Handlebars.Compiler = function () {};
Handlebars.JavaScriptCompiler = function () {};
(function (c, f) {
    c.prototype = {
        compiler: c,
        disassemble: function () {
            for (var b = this.opcodes, a, c = [], d, e, f = 0, g = b.length; f < g; f++)
                if (a = b[f], "DECLARE" === a.opcode) c.push("DECLARE " + a.name + "=" + a.value);
                else {
                    d = [];
                    for (var h = 0; h < a.args.length; h++) e = a.args[h], "string" === typeof e && (e = '"' + e.replace("\n", "\\n") + '"'), d.push(e);
                    c.push(a.opcode + " " + d.join(" "))
                }
            return c.join("\n")
        },
        equals: function (b) {
            var a = this.opcodes.length;
            if (b.opcodes.length !== a) return !1;
            for (var c = 0; c < a; c++) {
                var d = this.opcodes[c],
                    e = b.opcodes[c];
                if (d.opcode !==
                    e.opcode || d.args.length !== e.args.length) return !1;
                for (var f = 0; f < d.args.length; f++)
                    if (d.args[f] !== e.args[f]) return !1
            }
            return !0
        },
        guid: 0,
        compile: function (b, a) {
            this.children = [];
            this.depths = {
                list: []
            };
            this.options = a;
            var c = this.options.knownHelpers;
            this.options.knownHelpers = {
                helperMissing: !0,
                blockHelperMissing: !0,
                each: !0,
                "if": !0,
                unless: !0,
                "with": !0,
                log: !0
            };
            if (c)
                for (var d in c) this.options.knownHelpers[d] = c[d];
            return this.program(b)
        },
        accept: function (b) {
            return this[b.type](b)
        },
        program: function (b) {
            b = b.statements;
            var a;
            this.opcodes = [];
            for (var c = 0, d = b.length; c < d; c++) a = b[c], this[a.type](a);
            this.isSimple = 1 === d;
            this.depths.list = this.depths.list.sort(function (b, a) {
                return b - a
            });
            return this
        },
        compileProgram: function (b) {
            b = (new this.compiler).compile(b, this.options);
            var a = this.guid++,
                c;
            this.usePartial = this.usePartial || b.usePartial;
            this.children[a] = b;
            for (var d = 0, e = b.depths.list.length; d < e; d++) c = b.depths.list[d], 2 > c || this.addDepth(c - 1);
            return a
        },
        block: function (b) {
            var a = b.mustache,
                c = b.program;
            b = b.inverse;
            c && (c = this.compileProgram(c));
            b && (b = this.compileProgram(b));
            var d = this.classifyMustache(a);
            "helper" === d ? this.helperMustache(a, c, b) : "simple" === d ? (this.simpleMustache(a), this.opcode("pushProgram", c), this.opcode("pushProgram", b), this.opcode("emptyHash"), this.opcode("blockValue")) : (this.ambiguousMustache(a, c, b), this.opcode("pushProgram", c), this.opcode("pushProgram", b), this.opcode("emptyHash"), this.opcode("ambiguousBlockValue"));
            this.opcode("append")
        },
        hash: function (b) {
            b = b.pairs;
            var a, c;
            this.opcode("pushHash");
            for (var d = 0, e = b.length; d <
                e; d++) a = b[d], c = a[1], this.options.stringParams ? this.opcode("pushStringParam", c.stringModeValue, c.type) : this.accept(c), this.opcode("assignToHash", a[0]);
            this.opcode("popHash")
        },
        partial: function (b) {
            var a = b.partialName;
            this.usePartial = !0;
            b.context ? this.ID(b.context) : this.opcode("push", "depth0");
            this.opcode("invokePartial", a.name);
            this.opcode("append")
        },
        content: function (b) {
            this.opcode("appendContent", b.string)
        },
        mustache: function (b) {
            var a = this.options,
                c = this.classifyMustache(b);
            "simple" === c ? this.simpleMustache(b) :
                "helper" === c ? this.helperMustache(b) : this.ambiguousMustache(b);
            b.escaped && !a.noEscape ? this.opcode("appendEscaped") : this.opcode("append")
        },
        ambiguousMustache: function (b, a, c) {
            b = b.id;
            var d = b.parts[0],
                e = null != a || null != c;
            this.opcode("getContext", b.depth);
            this.opcode("pushProgram", a);
            this.opcode("pushProgram", c);
            this.opcode("invokeAmbiguous", d, e)
        },
        simpleMustache: function (b) {
            b = b.id;
            "DATA" === b.type ? this.DATA(b) : b.parts.length ? this.ID(b) : (this.addDepth(b.depth), this.opcode("getContext", b.depth), this.opcode("pushContext"));
            this.opcode("resolvePossibleLambda")
        },
        helperMustache: function (b, a, c) {
            a = this.setupFullMustacheParams(b, a, c);
            b = b.id.parts[0];
            if (this.options.knownHelpers[b]) this.opcode("invokeKnownHelper", a.length, b);
            else {
                if (this.knownHelpersOnly) throw Error("You specified knownHelpersOnly, but used the unknown helper " + b);
                this.opcode("invokeHelper", a.length, b)
            }
        },
        ID: function (b) {
            this.addDepth(b.depth);
            this.opcode("getContext", b.depth);
            b.parts[0] ? this.opcode("lookupOnContext", b.parts[0]) : this.opcode("pushContext");
            for (var a =
                1, c = b.parts.length; a < c; a++) this.opcode("lookup", b.parts[a])
        },
        DATA: function (b) {
            this.options.data = !0;
            this.opcode("lookupData", b.id)
        },
        STRING: function (b) {
            this.opcode("pushString", b.string)
        },
        INTEGER: function (b) {
            this.opcode("pushLiteral", b.integer)
        },
        BOOLEAN: function (b) {
            this.opcode("pushLiteral", b.bool)
        },
        comment: function () {},
        opcode: function (b) {
            this.opcodes.push({
                opcode: b,
                args: [].slice.call(arguments, 1)
            })
        },
        declare: function (b, a) {
            this.opcodes.push({
                opcode: "DECLARE",
                name: b,
                value: a
            })
        },
        addDepth: function (b) {
            if (isNaN(b)) throw Error("EWOT");
            0 !== b && !this.depths[b] && (this.depths[b] = !0, this.depths.list.push(b))
        },
        classifyMustache: function (b) {
            var a = b.isHelper,
                c = b.eligibleHelper,
                d = this.options;
            c && !a && (d.knownHelpers[b.id.parts[0]] ? a = !0 : d.knownHelpersOnly && (c = !1));
            return a ? "helper" : c ? "ambiguous" : "simple"
        },
        pushParams: function (b) {
            for (var a = b.length, c; a--;)
                if (c = b[a], this.options.stringParams) c.depth && this.addDepth(c.depth), this.opcode("getContext", c.depth || 0), this.opcode("pushStringParam", c.stringModeValue, c.type);
                else this[c.type](c)
        },
        setupMustacheParams: function (b) {
            var a =
                b.params;
            this.pushParams(a);
            b.hash ? this.hash(b.hash) : this.opcode("emptyHash");
            return a
        },
        setupFullMustacheParams: function (b, a, c) {
            var d = b.params;
            this.pushParams(d);
            this.opcode("pushProgram", a);
            this.opcode("pushProgram", c);
            b.hash ? this.hash(b.hash) : this.opcode("emptyHash");
            return d
        }
    };
    var a = function (b) {
        this.value = b
    };
    f.prototype = {
        nameLookup: function (b, a) {
            return /^[0-9]+$/.test(a) ? b + "[" + a + "]" : f.isValidJavaScriptVariableName(a) ? b + "." + a : b + "['" + a + "']"
        },
        appendToBuffer: function (b) {
            return this.environment.isSimple ?
                "return " + b + ";" : {
                    appendToBuffer: !0,
                    content: b,
                    toString: function () {
                        return "buffer += " + b + ";"
                    }
                }
        },
        initializeBuffer: function () {
            return this.quotedString("")
        },
        namespace: "Handlebars",
        compile: function (b, a, c, d) {
            this.environment = b;
            this.options = a || {};
            Handlebars.log(Handlebars.logger.DEBUG, this.environment.disassemble() + "\n\n");
            this.name = this.environment.name;
            this.isChild = !!c;
            this.context = c || {
                programs: [],
                environments: [],
                aliases: {}
            };
            this.preamble();
            this.stackSlot = 0;
            this.stackVars = [];
            this.registers = {
                list: []
            };
            this.compileStack = [];
            this.inlineStack = [];
            this.compileChildren(b, a);
            b = b.opcodes;
            this.i = 0;
            for (p = b.length; this.i < p; this.i++) a = b[this.i], "DECLARE" === a.opcode ? this[a.name] = a.value : this[a.opcode].apply(this, a.args);
            return this.createFunctionContext(d)
        },
        nextOpcode: function () {
            return this.environment.opcodes[this.i + 1]
        },
        eat: function () {
            this.i += 1
        },
        preamble: function () {
            var b = [];
            if (this.isChild) b.push("");
            else {
                var a = this.namespace,
                    c = "helpers = helpers || " + a + ".helpers;";
                this.environment.usePartial && (c = c + " partials = partials || " +
                    a + ".partials;");
                this.options.data && (c += " data = data || {};");
                b.push(c)
            }
            this.environment.isSimple ? b.push("") : b.push(", buffer = " + this.initializeBuffer());
            this.lastContext = 0;
            this.source = b
        },
        createFunctionContext: function (b) {
            var a = this.stackVars.concat(this.registers.list);
            0 < a.length && (this.source[1] = this.source[1] + ", " + a.join(", "));
            if (!this.isChild)
                for (var c in this.context.aliases) this.source[1] = this.source[1] + ", " + c + "=" + this.context.aliases[c];
            this.source[1] && (this.source[1] = "var " + this.source[1].substring(2) +
                ";");
            this.isChild || (this.source[1] += "\n" + this.context.programs.join("\n") + "\n");
            this.environment.isSimple || this.source.push("return buffer;");
            a = this.isChild ? ["depth0", "data"] : ["Handlebars", "depth0", "helpers", "partials", "data"];
            c = 0;
            for (var d = this.environment.depths.list.length; c < d; c++) a.push("depth" + this.environment.depths.list[c]);
            c = this.mergeSource();
            this.isChild || (d = Handlebars.COMPILER_REVISION, c = "this.compilerInfo = [" + d + ",'" + Handlebars.REVISION_CHANGES[d] + "'];\n" + c);
            if (b) return a.push(c), Function.apply(this,
                a);
            b = "function " + (this.name || "") + "(" + a.join(",") + ") {\n  " + c + "}";
            Handlebars.log(Handlebars.logger.DEBUG, b + "\n\n");
            return b
        },
        mergeSource: function () {
            for (var b = "", a, c = 0, d = this.source.length; c < d; c++) {
                var e = this.source[c];
                e.appendToBuffer ? a = a ? a + "\n    + " + e.content : e.content : (a && (b += "buffer += " + a + ";\n  ", a = void 0), b += e + "\n  ")
            }
            return b
        },
        blockValue: function () {
            this.context.aliases.blockHelperMissing = "helpers.blockHelperMissing";
            var b = ["depth0"];
            this.setupParams(0, b);
            this.replaceStack(function (a) {
                b.splice(1,
                    0, a);
                return "blockHelperMissing.call(" + b.join(", ") + ")"
            })
        },
        ambiguousBlockValue: function () {
            this.context.aliases.blockHelperMissing = "helpers.blockHelperMissing";
            var b = ["depth0"];
            this.setupParams(0, b);
            var a = this.topStack();
            b.splice(1, 0, a);
            b[b.length - 1] = "options";
            this.source.push("if (!" + this.lastHelper + ") { " + a + " = blockHelperMissing.call(" + b.join(", ") + "); }")
        },
        appendContent: function (b) {
            this.source.push(this.appendToBuffer(this.quotedString(b)))
        },
        append: function () {
            this.flushInline();
            var b = this.popStack();
            this.source.push("if(" + b + " || " + b + " === 0) { " + this.appendToBuffer(b) + " }");
            this.environment.isSimple && this.source.push("else { " + this.appendToBuffer("''") + " }")
        },
        appendEscaped: function () {
            this.context.aliases.escapeExpression = "this.escapeExpression";
            this.source.push(this.appendToBuffer("escapeExpression(" + this.popStack() + ")"))
        },
        getContext: function (b) {
            this.lastContext !== b && (this.lastContext = b)
        },
        lookupOnContext: function (b) {
            this.push(this.nameLookup("depth" + this.lastContext, b, "context"))
        },
        pushContext: function () {
            this.pushStackLiteral("depth" +
                this.lastContext)
        },
        resolvePossibleLambda: function () {
            this.context.aliases.functionType = '"function"';
            this.replaceStack(function (b) {
                return "typeof " + b + " === functionType ? " + b + ".apply(depth0) : " + b
            })
        },
        lookup: function (b) {
            this.replaceStack(function (a) {
                return a + " == null || " + a + " === false ? " + a + " : " + this.nameLookup(a, b, "context")
            })
        },
        lookupData: function (b) {
            this.push(this.nameLookup("data", b, "data"))
        },
        pushStringParam: function (b, a) {
            this.pushStackLiteral("depth" + this.lastContext);
            this.pushString(a);
            "string" ===
                typeof b ? this.pushString(b) : this.pushStackLiteral(b)
        },
        emptyHash: function () {
            this.pushStackLiteral("{}");
            this.options.stringParams && this.register("hashTypes", "{}")
        },
        pushHash: function () {
            this.hash = {
                values: [],
                types: []
            }
        },
        popHash: function () {
            var b = this.hash;
            this.hash = void 0;
            this.options.stringParams && this.register("hashTypes", "{" + b.types.join(",") + "}");
            this.push("{\n    " + b.values.join(",\n    ") + "\n  }")
        },
        pushString: function (b) {
            this.pushStackLiteral(this.quotedString(b))
        },
        push: function (b) {
            this.inlineStack.push(b);
            return b
        },
        pushLiteral: function (b) {
            this.pushStackLiteral(b)
        },
        pushProgram: function (b) {
            null != b ? this.pushStackLiteral(this.programExpression(b)) : this.pushStackLiteral(null)
        },
        invokeHelper: function (b, a) {
            this.context.aliases.helperMissing = "helpers.helperMissing";
            var c = this.lastHelper = this.setupHelper(b, a, !0);
            this.push(c.name);
            this.replaceStack(function (b) {
                return b + " ? " + b + ".call(" + c.callParams + ") : helperMissing.call(" + c.helperMissingParams + ")"
            })
        },
        invokeKnownHelper: function (b, a) {
            var c = this.setupHelper(b,
                a);
            this.push(c.name + ".call(" + c.callParams + ")")
        },
        invokeAmbiguous: function (b, a) {
            this.context.aliases.functionType = '"function"';
            this.pushStackLiteral("{}");
            var c = this.setupHelper(0, b, a),
                d = this.lastHelper = this.nameLookup("helpers", b, "helper"),
                e = this.nameLookup("depth" + this.lastContext, b, "context"),
                f = this.nextStack();
            this.source.push("if (" + f + " = " + d + ") { " + f + " = " + f + ".call(" + c.callParams + "); }");
            this.source.push("else { " + f + " = " + e + "; " + f + " = typeof " + f + " === functionType ? " + f + ".apply(depth0) : " + f +
                "; }")
        },
        invokePartial: function (b) {
            b = [this.nameLookup("partials", b, "partial"), "'" + b + "'", this.popStack(), "helpers", "partials"];
            this.options.data && b.push("data");
            this.context.aliases.self = "this";
            this.push("self.invokePartial(" + b.join(", ") + ")")
        },
        assignToHash: function (b) {
            var a = this.popStack(),
                c;
            this.options.stringParams && (c = this.popStack(), this.popStack());
            var d = this.hash;
            c && d.types.push("'" + b + "': " + c);
            d.values.push("'" + b + "': (" + a + ")")
        },
        compiler: f,
        compileChildren: function (b, a) {
            for (var c = b.children, d,
                e, f = 0, g = c.length; f < g; f++) {
                d = c[f];
                e = new this.compiler;
                var h = this.matchExistingProgram(d);
                null == h ? (this.context.programs.push(""), h = this.context.programs.length, d.index = h, d.name = "program" + h, this.context.programs[h] = e.compile(d, a, this.context), this.context.environments[h] = d) : (d.index = h, d.name = "program" + h)
            }
        },
        matchExistingProgram: function (b) {
            for (var a = 0, c = this.context.environments.length; a < c; a++) {
                var d = this.context.environments[a];
                if (d && d.equals(b)) return a
            }
        },
        programExpression: function (a) {
            this.context.aliases.self =
                "this";
            if (null == a) return "self.noop";
            var c = this.environment.children[a];
            a = c.depths.list;
            for (var d = [c.index, c.name, "data"], e = 0, f = a.length; e < f; e++) c = a[e], 1 === c ? d.push("depth0") : d.push("depth" + (c - 1));
            if (0 === a.length) return "self.program(" + d.join(", ") + ")";
            d.shift();
            return "self.programWithDepth(" + d.join(", ") + ")"
        },
        register: function (a, c) {
            this.useRegister(a);
            this.source.push(a + " = " + c + ";")
        },
        useRegister: function (a) {
            this.registers[a] || (this.registers[a] = !0, this.registers.list.push(a))
        },
        pushStackLiteral: function (b) {
            return this.push(new a(b))
        },
        pushStack: function (a) {
            this.flushInline();
            var c = this.incrStack();
            a && this.source.push(c + " = " + a + ";");
            this.compileStack.push(c);
            return c
        },
        replaceStack: function (b) {
            var c = "",
                d = this.isInline(),
                e;
            d ? (e = this.popStack(!0), e instanceof a ? e = e.value : (c = this.stackSlot ? this.topStackName() : this.incrStack(), c = "(" + this.push(c) + " = " + e + "),", e = this.topStack())) : e = this.topStack();
            b = b.call(this, e);
            d ? ((this.inlineStack.length || this.compileStack.length) && this.popStack(), this.push("(" + c + b + ")")) : (/^stack/.test(e) || (e = this.nextStack()),
                this.source.push(e + " = (" + c + b + ");"));
            return e
        },
        nextStack: function () {
            return this.pushStack()
        },
        incrStack: function () {
            this.stackSlot++;
            this.stackSlot > this.stackVars.length && this.stackVars.push("stack" + this.stackSlot);
            return this.topStackName()
        },
        topStackName: function () {
            return "stack" + this.stackSlot
        },
        flushInline: function () {
            var b = this.inlineStack;
            if (b.length) {
                this.inlineStack = [];
                for (var c = 0, d = b.length; c < d; c++) {
                    var e = b[c];
                    e instanceof a ? this.compileStack.push(e) : this.pushStack(e)
                }
            }
        },
        isInline: function () {
            return this.inlineStack.length
        },
        popStack: function (b) {
            var c = this.isInline(),
                d = (c ? this.inlineStack : this.compileStack).pop();
            if (!b && d instanceof a) return d.value;
            c || this.stackSlot--;
            return d
        },
        topStack: function (b) {
            var c = this.isInline() ? this.inlineStack : this.compileStack,
                c = c[c.length - 1];
            return !b && c instanceof a ? c.value : c
        },
        quotedString: function (a) {
            return '"' + a.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r") + '"'
        },
        setupHelper: function (a, c, d) {
            var e = [];
            this.setupParams(a, e, d);
            a = this.nameLookup("helpers",
                c, "helper");
            return {
                params: e,
                name: a,
                callParams: ["depth0"].concat(e).join(", "),
                helperMissingParams: d && ["depth0", this.quotedString(c)].concat(e).join(", ")
            }
        },
        setupParams: function (a, c, d) {
            var e = [],
                f = [],
                g = [],
                n, h;
            e.push("hash:" + this.popStack());
            n = this.popStack();
            if ((h = this.popStack()) || n) h || (this.context.aliases.self = "this", h = "self.noop"), n || (this.context.aliases.self = "this", n = "self.noop"), e.push("inverse:" + n), e.push("fn:" + h);
            for (h = 0; h < a; h++) n = this.popStack(), c.push(n), this.options.stringParams && (g.push(this.popStack()),
                f.push(this.popStack()));
            this.options.stringParams && (e.push("contexts:[" + f.join(",") + "]"), e.push("types:[" + g.join(",") + "]"), e.push("hashTypes:hashTypes"));
            this.options.data && e.push("data:data");
            e = "{" + e.join(",") + "}";
            d ? (this.register("options", e), c.push("options")) : c.push(e);
            return c.join(", ")
        }
    };
    for (var d = "break else new var case finally return void catch for switch while continue function this with default if throw delete in try do instanceof typeof abstract enum int short boolean export interface static byte extends long super char final native synchronized class float package throws const goto private transient debugger implements protected volatile double import public let yield".split(" "),
        g = f.RESERVED_WORDS = {}, e = 0, p = d.length; e < p; e++) g[d[e]] = !0;
    f.isValidJavaScriptVariableName = function (a) {
        return !f.RESERVED_WORDS[a] && /^[a-zA-Z_$][0-9a-zA-Z_$]+$/.test(a) ? !0 : !1
    }
})(Handlebars.Compiler, Handlebars.JavaScriptCompiler);
Handlebars.precompile = function (c, f) {
    if (!c || "string" !== typeof c && c.constructor !== Handlebars.AST.ProgramNode) throw new Handlebars.Exception("You must pass a string or Handlebars AST to Handlebars.compile. You passed " + c);
    f = f || {};
    "data" in f || (f.data = !0);
    var a = Handlebars.parse(c),
        a = (new Handlebars.Compiler).compile(a, f);
    return (new Handlebars.JavaScriptCompiler).compile(a, f)
};
Handlebars.compile = function (c, f) {
    if (!c || "string" !== typeof c && c.constructor !== Handlebars.AST.ProgramNode) throw new Handlebars.Exception("You must pass a string or Handlebars AST to Handlebars.compile. You passed " + c);
    f = f || {};
    "data" in f || (f.data = !0);
    var a;
    return function (d, g) {
        if (!a) {
            var e = Handlebars.parse(c),
                e = (new Handlebars.Compiler).compile(e, f),
                e = (new Handlebars.JavaScriptCompiler).compile(e, f, void 0, !0);
            a = Handlebars.template(e)
        }
        return a.call(this, d, g)
    }
};
Handlebars.VM = {
    template: function (c) {
        var f = {
            escapeExpression: Handlebars.Utils.escapeExpression,
            invokePartial: Handlebars.VM.invokePartial,
            programs: [],
            program: function (a, c, f) {
                var e = this.programs[a];
                if (f) return Handlebars.VM.program(c, f);
                e || (e = this.programs[a] = Handlebars.VM.program(c));
                return e
            },
            programWithDepth: Handlebars.VM.programWithDepth,
            noop: Handlebars.VM.noop,
            compilerInfo: null
        };
        return function (a, d) {
            d = d || {};
            var g = c.call(f, Handlebars, a, d.helpers, d.partials, d.data),
                e = f.compilerInfo || [],
                p = e[0] || 1,
                b = Handlebars.COMPILER_REVISION;
            if (p !== b) {
                if (p < b) throw "Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version (" + Handlebars.REVISION_CHANGES[b] + ") or downgrade your runtime to an older version (" + Handlebars.REVISION_CHANGES[p] + ").";
                throw "Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version (" + e[1] + ").";
            }
            return g
        }
    },
    programWithDepth: function (c,
        f, a) {
        var d = Array.prototype.slice.call(arguments, 2);
        return function (a, e) {
            e = e || {};
            return c.apply(this, [a, e.data || f].concat(d))
        }
    },
    program: function (c, f) {
        return function (a, d) {
            d = d || {};
            return c(a, d.data || f)
        }
    },
    noop: function () {
        return ""
    },
    invokePartial: function (c, f, a, d, g, e) {
        d = {
            helpers: d,
            partials: g,
            data: e
        };
        if (void 0 === c) throw new Handlebars.Exception("The partial " + f + " could not be found");
        if (c instanceof Function) return c(a, d);
        if (Handlebars.compile) return g[f] = Handlebars.compile(c, {
            data: void 0 !== e
        }), g[f](a,
            d);
        throw new Handlebars.Exception("The partial " + f + " could not be compiled when running in runtime-only mode");
    }
};
Handlebars.template = Handlebars.VM.template;