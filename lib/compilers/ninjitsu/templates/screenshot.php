// https://github.com/ariya/phantomjs/blob/master/examples/render_multi_url.js

var arrayOfUrls = <?php echo json_encode($screens); ?>;

RenderUrlsToFile = function(urls, callbackPerUrl, callbackFinal) {
    var getFilename, next, page, retrieve, urlIndex, webpage;
    urlIndex = 0;
    webpage = require("webpage");
    page = null;
    next = function(status, url, file) {
        page.close();
        callbackPerUrl(status, url, file);
        return retrieve();
    };
    retrieve = function() {
        var url;
        if (urls.length > 0) {
            url = urls.shift();
            urlIndex++;

            page = webpage.create();
            page.viewportSize = { width: 1024, height: 768 };
            page.clipRect = { top: 0, left: 0, width: 1024, height: 768 };
            page.settings.userAgent = "Phantom.js bot";

            return page.open(url.input, function(status) {
                var file = url.output;
                if (status === "success") {
                    return window.setTimeout((function() {
                        page.render(file);
                        return next(status, url, file);
                    }), 200);
                } else {
                    return next(status, url, file);
                }
            });
        } else {
            return callbackFinal();
        }
    };
    return retrieve();
};

RenderUrlsToFile(arrayOfUrls, (function(status, url, file) {
    if (status !== "success") {
        return console.log("Unable to render '" + url + "'");
    } else {
        return console.log("Rendered '" + url + "' at '" + file + "'");
    }
}), function() {
    return phantom.exit();
});